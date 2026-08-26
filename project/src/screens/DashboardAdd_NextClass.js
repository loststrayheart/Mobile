import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity,TextInput, Alert , FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker"
import { db } from "../../FirebaseConfig";
import { addDoc,query,collection,getDoc,updateDoc,deleteDoc,doc,where,getDocs} from "firebase/firestore";
import { PlannerContext } from "../context/PlannerContext";

const DashboardAdd_NextClass = () =>{

    const {userID} = useContext(PlannerContext)
    //userid

    const [Form,setForm] = useState(
        {Date:'',Subject_ID:'',Subject_Name:'',Time_Start:'',Time_End:'',userid:userID}
    )

    

    
    
    const handledata = async () => {
        try {
            // 1. ตรวจสอบข้อมูลเบื้องต้น
            if (!Form.Date || !Form.Time_Start || !Form.Time_End) {
                return Alert.alert("Error", "กรุณากรอกข้อมูลให้ครบถ้วน");
            }

            // 2. ดึงตารางเรียนทั้งหมดที่มีอยู่ของ User คนนี้
            const classRef = collection(db, "NextClass");
            const q = query(classRef, where("userid", "==", userID), where("Date", "==", Form.Date));
            const querySnapshot = await getDocs(q);

            // 3. ตรวจสอบความเหลื่อมของเวลา
            let isOverlapping = false;

            querySnapshot.forEach((doc) => {
                const existingClass = doc.data();

                // แปลงเวลาเป็นตัวเลขเพื่อเปรียบเทียบ (เช่น "13:00" -> 1300)
                const newStart = parseInt(Form.Time_Start.replace(":", ""));
                const newEnd = parseInt(Form.Time_End.replace(":", ""));
                const existStart = parseInt(existingClass.Time_Start.replace(":", ""));
                const existEnd = parseInt(existingClass.Time_End.replace(":", ""));

                // เงื่อนไขการเช็คเวลาเหลื่อม: (StartA < EndB) และ (EndA > StartB)
                if (newStart < existEnd && newEnd > existStart) {
                    isOverlapping = true;
                }
            });

            if (isOverlapping) {
                Alert.alert("แจ้งเตือน", "เวลานี้ซ้ำกับวิชาที่มีอยู่แล้ว!");
                return; // หยุดการทำงาน ไม่ให้บันทึกลงฐานข้อมูล
            }

            // 4. ถ้าไม่ซ้ำ ให้บันทึกข้อมูล
            await addDoc(collection(db, "NextClass"), Form);
            Alert.alert("บันทึกสำเร็จ");

        } catch (err) {
            console.error(err);
            Alert.alert("บันทึกไม่สำเร็จ", err.message);
        }
    }

    
    return(
        <View style={{ width: 430, height: 780, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{}}>
                <Text>{userID}</Text>
                <View style={styles.input}>
                    <Picker
                        selectedValue={Form.Date}
                        onValueChange={(text) => setForm({ ...Form, Date: (text) })}
                    >
                        <Picker.Item label="" value="" />
                        <Picker.Item label="Monday" value="Monday" />
                        <Picker.Item label="Tuesday" value="Tuesday" />
                        <Picker.Item label="Wednesday" value="Wednesday" />
                        <Picker.Item label="Thursday" value="Thursday" />
                        <Picker.Item label="Friday" value="Friday" />
                        <Picker.Item label="Saturnday" value="Saturnday" />
                        <Picker.Item label="Sunday" value="Sunday" />
                    </Picker>
                </View>

                
                
                
                <Text>Subject ID</Text>
                <TextInput
                    style={styles.input}
                    placeholder='XXXXXXXX-XX'
                    value = {Form.Subject_ID}
                    onChangeText={(text) => setForm ({...Form, Subject_ID: text})}

                />
                <Text>Subject Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Subject Name'
                    value = {Form.Subject_Name}
                    onChangeText={(text) => setForm ({...Form, Subject_Name: text})}

                />
                <Text>Time Start</Text>
                <TextInput
                    style={styles.input}
                    placeholder='XX:XX'
                    value = {Form.Time_Start}
                    onChangeText={(text) => setForm ({...Form, Time_Start: text})}

                />
                <Text>Time End</Text>
                <TextInput
                    style={styles.input}
                    placeholder='XX:XX'
                    value = {Form.Time_End}
                    onChangeText={(text) => setForm ({...Form, Time_End: text})}

                />
                <TouchableOpacity onPress={handledata}>
                    <View style={{width:200,height:100,backgroundColor:'#006664',marginLeft:26,borderRadius:20,justifyContent:'center',alignItems:'center'}}>
                        <Text style={{fontSize:22,fontWeight:'bold',color:'#fff'}}>Enter</Text>
                    </View>
                </TouchableOpacity>

            </View>
            
        </View>
    )
}

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
        marginLeft: 0
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



export default DashboardAdd_NextClass