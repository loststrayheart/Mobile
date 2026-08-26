 import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import { db } from "../../FirebaseConfig";
import { addDoc, collection } from "firebase/firestore";

const Register = ({ navigation }) => {

    const [form, setForm] = useState({
        name: '',
        id: '',
        role: 'วิศวกรรมศาสตร์กำแพงแสน',
        year: 'ปี 1',
        image: null,
        password: '',
        confirmedPassword: '',
        error: ''
    });

    // Cloudinary config
    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dzqixe7tz/image/upload";
    const UPLOAD_PRESET = "uclwdhv5";

    const pickImage = async () => {

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert("คุณไม่ได้รับอนุญาตการเข้าถึงคลังภาพ");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5
        });

        if (!result.canceled) {
            setForm(prev => ({
                ...prev,
                image: result.assets[0].uri
            }));
        }
    };

    const uploadToCloudinary = async (uri) => {

        const data = new FormData();

        data.append("file", {
            uri: uri,
            type: "image/jpeg",
            name: "profile.jpg"
        });

        data.append("upload_preset", UPLOAD_PRESET);

        try {

            const response = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: data
            });

            const result = await response.json();

            return result.secure_url;

        } catch (error) {

            console.log("Upload error:", error);

            return null;

        }
    };

    const handleRegister = async () => {

        if (!form.name || !form.id || !form.role || !form.year || !form.password || !form.confirmedPassword) {
            setForm(prev => ({ ...prev, error: "กรุณากรอกข้อมูลให้ครบถ้วน" }));
            return;
        }

        if (form.password.length < 6) {
            setForm(prev => ({ ...prev, error: "รหัสผ่านต้องมากกว่า 6 ตัว" }));
            return;
        }

        if (form.password !== form.confirmedPassword) {
            setForm(prev => ({ ...prev, error: "รหัสผ่านไม่ตรงกัน" }));
            return;
        }

        try {

            setForm(prev => ({ ...prev, error: "" }));

            let imageUrl = null;

            // upload รูปก่อน
            if (form.image) {
                imageUrl = await uploadToCloudinary(form.image);
            }

            const docRef = await addDoc(collection(db, "Users"), {
                name: form.name,
                studentId: form.id,
                role: form.role,
                year: form.year,
                password: form.password,
                profilePicture: imageUrl, // บันทึกรูป
                createdAt: new Date().toISOString()
            });

            console.log("บันทึกสำเร็จ ID:", docRef.id);

            Alert.alert("สำเร็จ", "บันทึกข้อมูลนิสิตเรียบร้อยแล้ว");

            navigation.navigate('Login');

        } catch (error) {

            console.error(error);

            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");

        }

    };

    return (
        <View style={styles.container}>

            <Text style={styles.label}>Register</Text>

            <View style={styles.card}>

                <TextInput
                    style={styles.input}
                    placeholder='ชื่อ-นามสกุล'
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                />

                <TextInput
                    style={styles.input}
                    placeholder="รหัสนิสิต"
                    value={form.id}
                    onChangeText={(text) => setForm({ ...form, id: text })}
                />

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={form.role}
                        onValueChange={(value) =>
                            setForm(prev => ({ ...prev, role: value }))
                        }
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="วิศวกรรมศาสตร์กำแพงแสน" value="วิศวกรรมศาสตร์กำแพงแสน" />
                        <Picker.Item label="ศิลปะศาสตร์และวิทยาศาสตร์" value="ศิลปะศาสตร์และวิทยาศาสตร์" />
                        <Picker.Item label="เกษตรกำแพงแสน" value="เกษตรกำแพงแสน" />
                        <Picker.Item label="ศึกษาศาสตร์และพัฒนศาสตร์" value="ศึกษาศาสตร์และพัฒนศาสตร์" />
                        <Picker.Item label="สัตวแพทย์" value="สัตวแพทย์" />
                        <Picker.Item label="อุตสหกรรมศาสตร์" value="อุตสหกรรมศาสตร์" />
                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={form.year}
                        onValueChange={(value) =>
                            setForm(prev => ({ ...prev, year: value }))
                        }
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="ปี 1" value="ปี 1" />
                        <Picker.Item label="ปี 2" value="ปี 2" />
                        <Picker.Item label="ปี 3" value="ปี 3" />
                        <Picker.Item label="ปี 4" value="ปี 4" />
                    </Picker>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="รหัสผ่าน"
                    secureTextEntry
                    value={form.password}
                    onChangeText={(text) => setForm({ ...form, password: text })}
                />

                <TextInput
                    style={styles.input}
                    placeholder="ยืนยันรหัสผ่าน"
                    secureTextEntry
                    value={form.confirmedPassword}
                    onChangeText={(text) => setForm({ ...form, confirmedPassword: text })}
                />

                <TouchableOpacity onPress={pickImage} style={styles.imgPicker}>
                    {form.image ? (
                        <Image source={{ uri: form.image }} style={styles.avatar} />
                    ) : (
                        <Text>กดเพื่อเลือกรูป...</Text>
                    )}
                </TouchableOpacity>

                {form.error ? (
                    <Text style={{ color: 'red', marginBottom: 5 }}>{form.error}</Text>
                ) : null}

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>ยืนยันข้อมูล</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text>Already have an account? Log in</Text>
                </TouchableOpacity>

            </View>

        </View>
    );
};

export default Register;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#006664',
        justifyContent: 'center',
        alignItems: 'center'
    },

    label: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white'
    },

    card: {
        width: 350,
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 20,
        alignItems: 'center'
    },

    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        marginBottom: 10
    },

    pickerContainer: {
        width: "100%",
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#fff',
        marginBottom: 10,
        height: 50,
        justifyContent: "center"
    },

    picker: {
        width: "100%",
        height: Platform.OS === "ios" ? 50 : 50,
        transform: Platform.OS === "ios" ? [{ scaleY: 0.85 }] : []
    },

    pickerItem: {
        fontSize: 14
    },

    imgPicker: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 75,
        borderWidth: 1
    },

    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: 75
    },

    button: {
        width: 200,
        height: 50,
        borderRadius: 30,
        backgroundColor: '#006664',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },

    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    }

});