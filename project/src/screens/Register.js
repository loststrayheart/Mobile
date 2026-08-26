import React, { useReducer, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useState } from 'react';
import { Picker } from "@react-native-picker/picker"
import * as ImagePicker from 'expo-image-picker'
import { db } from "../../FirebaseConfig";
import { addDoc,query,collection,getDoc,updateDoc,deleteDoc,doc,where } from "firebase/firestore";



const Register = ({ navigation}) => {

    

    const [form, setForm] = useState({
        name: '', id: '', role: 'Engineer', year: '1', image: null, password: '', confirmedPassword: ''
    })
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert("คุณไม่ได้รับอณุญาตการเข้าถึงคลังภาพ")
            return
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        })

        if (!result.canceled) {
            setForm(prev => ({
                ...prev,
                image: result.assets[0].uri
            }))
        }
    }

    

    const handleRegister = async () => {

    // 1. Validation ตรวจสอบข้อมูล (เหมือนเดิม)
    if (!form.name || !form.id || !form.role || !form.year  || !form.password || !form.confirmedPassword) {
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
        // ล้าง error ก่อนเริ่มบันทึก
        setForm(prev => ({ ...prev, error: "" }));

        // 2. ส่งข้อมูลไปที่ Firestore
        // "Users" คือชื่อตาราง (Collection) ใน Firebase
        const docRef = await addDoc(collection(db, "Users"), {
            name: form.name,
            studentId: form.id,
            role: form.role,
            year: form.year,
            // image: form.image, // หมายเหตุ: ตอนนี้เก็บเป็น local path
            password: form.password, // ในการใช้งานจริงควรใช้ Firebase Auth
            createdAt: new Date().toISOString()
        });

        console.log("บันทึกสำเร็จด้วย ID: ", docRef.id);
        Alert.alert("สำเร็จ", "บันทึกข้อมูลนิสิตเรียบร้อยแล้ว");

        // 3. ไปหน้า Profile พร้อมส่งข้อมูลไปด้วย
        navigation.navigate('Login');

    } catch (error) {
        console.error("Error adding document: ", error);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่");
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
                        onValueChange={(itemValue) =>
                            setForm(prev => ({
                                ...prev,
                                role: itemValue
                            }))
                        }
                        mode="dropdown"
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
                        onValueChange={(itemValue) =>
                            setForm(prev => ({
                                ...prev,
                                year: itemValue
                            }))
                        }
                        mode="dropdown"
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
                    value={form.password}
                    onChangeText={(text) => setForm({ ...form, password: text })}
                    secureTextEntry={true}
                />
                <TextInput
                    style={styles.input}
                    placeholder="ยืนยันรหัสผ่าน"
                    value={form.confirmedPassword}
                    onChangeText={(text) => setForm({ ...form, confirmedPassword: text })}
                    secureTextEntry={true}
                />
                <TouchableOpacity onPress={pickImage} style={styles.imgPicker}>
                    {form.image ? (<Image source={{ uri: form.image }} style={styles.avatar} />) : (
                        <Text style={{ fontSize: 14, marginLeft: 20 }}>กดเพื่อเลือกรูป...</Text>
                    )}
                </TouchableOpacity>
                {form.error ? <Text style={{ color: 'red', marginBottom: 5 }}>{form.error}</Text> : null}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}>
                    <Text style={styles.buttonText}>ยืนยันข้อมูล</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text>Already have an account? Log in</Text>
                </TouchableOpacity>
                
            </View>
        </View>
    );
    
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#006664',
        justifyContent: 'center',
    },
    label: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 20,
        marginLeft: 160,
        color : 'white'
    },
    input: {
        width: 250,
        height: 50,
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 10,
        marginLeft: 20
    },
    pickerContainer: {
        width: 250,
        height: 50,
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 10,
        marginLeft: 20
    },
    imgPicker: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignContent: 'center',
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 65,
        marginLeft: 20,
        borderWidth: 1
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 65,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    button: {
        width: 200,
        height: 50,
        borderRadius: 60,
        backgroundColor: '#006664',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15
    },
    card: {
        width: 400,
        height: 650,
        backgroundColor: 'white',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
        marginBottom: 70
    }
});



export default Register
