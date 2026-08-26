import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { db } from "../../FirebaseConfig";
import { query, collection, getDocs, where } from "firebase/firestore";
import { PlannerContext } from '../context/PlannerContext';

const Login = ({ navigation }) => {

    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const { setUserID } = useContext(PlannerContext);

    const handleLogin = async () => {

        if (studentId === '' || password === '') {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบ');
            return;
        }

        try {

            const usersRef = collection(db, "Users");
            const q = query(usersRef, where("studentId", "==", studentId));

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                Alert.alert("แจ้งเตือน", "ไม่พบรหัสนิสิตนี้");
                return;
            }

            let isLoginSuccess = false;

            querySnapshot.forEach((doc) => {

                const userData = doc.data();

                if (userData.password === password) {
                    isLoginSuccess = true;
                    console.log("เข้าสู่ระบบสำเร็จ:", userData.name);
                }

            });

            if (isLoginSuccess) {

                setUserID(studentId);

                Alert.alert("สำเร็จ", "เข้าสู่ระบบเรียบร้อย");

                navigation.replace("Main");

            } else {

                Alert.alert("แจ้งเตือน", "รหัสผ่านไม่ถูกต้อง");

            }

        } catch (error) {

            console.error("Error:", error);
            Alert.alert("Error", "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");

        }

    };

    return (

        <View style={styles.container}>

            <Text style={styles.label}>Login</Text>

            <View style={styles.card}>

                <TextInput
                    style={styles.input}
                    placeholder="รหัสนิสิต"
                    value={studentId}
                    onChangeText={setStudentId}
                    keyboardType="numeric"
                />

                <TextInput
                    style={styles.input}
                    placeholder="รหัสผ่าน"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
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
        alignItems: 'center'
    },

    label: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white'
    },

    input: {
        width: 250,
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 15
    },

    button: {
        width: 200,
        height: 50,
        borderRadius: 30,
        backgroundColor: '#006664',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },

    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    },

    card: {
        width: 320,
        padding: 30,
        backgroundColor: 'white',
        borderRadius: 30,
        alignItems: 'center'
    }

});

export default Login;