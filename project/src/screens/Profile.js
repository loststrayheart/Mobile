import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { db } from "../../FirebaseConfig";
import { query, collection, getDocs, where } from "firebase/firestore";
import { PlannerContext } from "../context/PlannerContext";
import { CommonActions } from '@react-navigation/native';

const Profile = ({ navigation }) => {

    const { userID, setUserID } = useContext(PlannerContext);

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

                    const docData = querySnapshot.docs[0].data();

                    setForm({
                        name: docData.name,
                        year: docData.year,
                        role: docData.role
                    });

                }

            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();

    }, [userID]);


    const handleLogout = () => {
        // 1. ล้างข้อมูลใน Context
        setUserID(null);
        setForm({ name: '', year: '', role: '' });

        // 2. ใช้ Reset แทนการ navigate เพื่อล้าง Stack ประวัติหน้าจอทั้งหมด
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Register' }], // ชื่อหน้าแรกที่ต้องการให้เด้งกลับไป
            })
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

            <View style={styles.card}>

                <View style={styles.infoContainer}>

                    <View style={styles.row}>
                        <Text style={styles.label}>ชื่อ</Text>
                        <Text style={styles.value}>{form.name}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>รหัสนิสิต</Text>
                        <Text style={styles.value}>{userID}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>คณะ</Text>
                        <Text style={styles.value}>{form.role}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>ชั้นปี</Text>
                        <Text style={styles.value}>{form.year}</Text>
                    </View>

                </View>

            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutText}>ออกจากระบบ</Text>
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
        marginBottom:20,
        color:'white'
    },

    card:{
        width:'85%',
        backgroundColor:'white',
        borderRadius:25,
        padding:25,
        alignItems:'center',
        elevation:8
    },

    infoContainer:{
        width:'100%',
        marginTop:10
    },

    row:{
        flexDirection:'row',
        justifyContent:'space-between',
        marginBottom:15,
        paddingBottom:5,
        borderBottomWidth:0.5,
        borderColor:'#ccc'
    },

    label:{
        fontSize:16,
        fontWeight:'600',
        color:'#555'
    },

    value:{
        fontSize:16,
        fontWeight:'bold',
        color:'#000'
    },

    logoutButton:{
        marginTop:30,
        backgroundColor:'#ff4d4d',
        paddingVertical:12,
        paddingHorizontal:50,
        borderRadius:20,
        elevation:5
    },

    logoutText:{
        color:'white',
        fontSize:16,
        fontWeight:'bold'
    }

});

export default Profile;