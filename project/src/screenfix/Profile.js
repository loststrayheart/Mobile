import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import { db } from "../../FirebaseConfig";
import { query, collection, getDocs, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { PlannerContext } from "../context/PlannerContext";
import { CommonActions } from '@react-navigation/native';

const Profile = ({ navigation }) => {

    const { userID, setUserID } = useContext(PlannerContext);

    const [docId, setDocId] = useState(null);
    const [image, setImage] = useState(null);

    const [form, setForm] = useState({
        name: '',
        year: '',
        role: ''
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchUserData = async () => {

            try {

                const q = query(
                    collection(db, "Users"),
                    where("studentId", "==", userID)
                );

                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {

                    const document = querySnapshot.docs[0];
                    const docData = document.data();

                    setDocId(document.id);

                    setForm({
                        name: docData.name,
                        year: docData.year,
                        role: docData.role
                    });

                    setImage(docData.profilePicture); // ดึงรูป

                }

            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }

        };

        fetchUserData();

    }, [userID]);


    const handleSave = async () => {

        try {

            if (!docId) return;

            const userRef = doc(db, "Users", docId);

            await updateDoc(userRef, {
                name: form.name,
                year: form.year,
                role: form.role
            });

            Alert.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อย");

        } catch (error) {
            console.error("Error updating:", error);
            Alert.alert("Error", "ไม่สามารถบันทึกข้อมูลได้");
        }

    };


    const handleLogout = () => {

        setUserID(null);

        setForm({
            name: '',
            year: '',
            role: ''
        });

        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
            })
        );

    };


    const handleClearData = async () => {

        Alert.alert(
            "ยืนยัน",
            "ต้องการลบข้อมูลทั้งหมดหรือไม่",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ลบทั้งหมด",
                    style: "destructive",
                    onPress: async () => {

                        try {

                            // ลบ Activities, NextClass (study plan), Checklists, UpComingExam
                            const cols = ["Activities", "NextClass", "Checklists", "UpComingExam"];
                            for (const col of cols) {
                                const q = query(collection(db, col), where("userid", "==", userID));
                                const snap = await getDocs(q);
                                for (const documentItem of snap.docs) {
                                    await deleteDoc(doc(db, col, documentItem.id));
                                }
                            }

                            // ล้างชื่อในโปรไฟล์
                            if (docId) {
                                await updateDoc(doc(db, "Users", docId), { name: "" });
                                setForm(prev => ({ ...prev, name: "" }));
                            }

                            Alert.alert("สำเร็จ", "ลบข้อมูลทั้งหมดแล้ว");

                        } catch (error) {

                            console.log(error);
                            Alert.alert("Error", "ไม่สามารถลบข้อมูลได้");

                        }

                    }
                }
            ]
        );

    };


    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }


    return (

        <View style={styles.container}>

            <Text style={styles.title}>Profile</Text>

            {/* รูปโปรไฟล์ */}
            <Image
                source={{ uri: image }}
                style={styles.avatar}
            />

            <View style={styles.card}>

                <View style={styles.infoContainer}>

                    <View style={styles.row}>
                        <Text style={styles.label}>ชื่อ</Text>

                        <TextInput
                            style={styles.input}
                            value={form.name}
                            onChangeText={(text) =>
                                setForm({ ...form, name: text })
                            }
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>รหัสนิสิต</Text>
                        <Text style={styles.value}>{userID}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>คณะ</Text>

                        <TextInput
                            style={styles.input}
                            value={form.role}
                            onChangeText={(text) =>
                                setForm({ ...form, role: text })
                            }
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>ชั้นปี</Text>

                        <TextInput
                            style={styles.input}
                            value={form.year}
                            onChangeText={(text) =>
                                setForm({ ...form, year: text })
                            }
                        />
                    </View>

                </View>

            </View>


            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
            >
                <Text style={styles.buttonText}>บันทึกข้อมูล</Text>
            </TouchableOpacity>


            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.buttonText}>ออกจากระบบ</Text>
            </TouchableOpacity>


            <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearData}
            >
                <Text style={styles.buttonText}>ล้างข้อมูลทั้งหมด</Text>
            </TouchableOpacity>

        </View>

    );

};


const styles = StyleSheet.create({

    container:{
        flex:1,
        backgroundColor:'#006664',
        alignItems:'center',
        justifyContent:'center'
    },

    title:{
        fontSize:28,
        fontWeight:'bold',
        marginBottom:15,
        color:'white'
    },

    avatar:{
        width:120,
        height:120,
        borderRadius:60,
        marginBottom:15,
        borderWidth:3,
        borderColor:'white'
    },

    card:{
        width:'85%',
        backgroundColor:'white',
        borderRadius:25,
        padding:25,
        elevation:8
    },

    infoContainer:{
        width:'100%',
        marginTop:10
    },

    row:{
        marginBottom:15
    },

    label:{
        fontSize:14,
        color:'#555',
        marginBottom:5
    },

    value:{
        fontSize:16,
        fontWeight:'bold'
    },

    input:{
        borderWidth:1,
        borderColor:'#ccc',
        borderRadius:10,
        padding:8,
        fontSize:16
    },

    saveButton:{
        marginTop:30,
        backgroundColor:'#00b894',
        paddingVertical:12,
        paddingHorizontal:50,
        borderRadius:20,
        elevation:5
    },

    logoutButton:{
        marginTop:15,
        backgroundColor:'#ff4d4d',
        paddingVertical:12,
        paddingHorizontal:50,
        borderRadius:20,
        elevation:5
    },

    clearButton:{
        marginTop:15,
        backgroundColor:'#ff9f43',
        paddingVertical:12,
        paddingHorizontal:50,
        borderRadius:20,
        elevation:5
    },

    buttonText:{
        color:'white',
        fontSize:16,
        fontWeight:'bold'
    }

});

export default Profile;