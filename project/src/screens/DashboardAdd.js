import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity,TextInput, Alert , FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker"
import { db } from "../../FirebaseConfig";
import { addDoc,query,collection,getDoc,updateDoc,deleteDoc,doc,where } from "firebase/firestore";
import { PlannerContext } from "../context/PlannerContext";

const DashboardAdd = () =>{

    const {userID} = useContext(PlannerContext)


    const [time,setTime] = useState({
        day:'',month:'',year:''
    })

    const [Form,setForm] = useState(
        {Subject_ID:'',Subject_Name:'',Time_Start:'',Time_End:'',userid:userID}
    )

    

    
    
    const handledata = async () => {

        const formattedDate = `${time.day}/${time.month}/${time.year}`;

        try {
            

            const formattedDate = `${time.day}/${time.month}/${time.year}`;

            setForm({
                Schedule: Form.Schedule, Subject_ID: Form.Subject_ID,
                Subject_Name: Form.Subject_Name, Time_Start: Form.Time_Start, Time_End: Form.Time_End, userid: userID
            });

            const dataToSave = {
                ...Form,            
                Date: formattedDate, 
                userid: userID      
            };

            const docRef = await addDoc(collection(db, "UpComingExam"), dataToSave);

            

            Alert.alert("บันทึกสำเร็จ")
        }
        catch (err) {
            Alert.alert("บันทึกไม่สำเร็จ")
        }
    }

    
    return(
        <View style={{ width: 430, height: 780, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{}}>
                <Text>{userID}</Text>
                

                
                <Text>Day</Text>
                <View style={styles.input}>
                    <Picker
                        selectedValue={time.day}
                        onValueChange={(text) => setTime({ ...time, day: (text) })}
                    >
                        <Picker.Item label="" value="" />
                        <Picker.Item label="1" value="1" />
                        <Picker.Item label="2" value="2" />
                        <Picker.Item label="3" value="3" />
                        <Picker.Item label="4" value="4" />
                        <Picker.Item label="5" value="5" />
                        <Picker.Item label="6" value="6" />
                        <Picker.Item label="7" value="7" />
                        <Picker.Item label="8" value="8" />
                        <Picker.Item label="9" value="9" />
                        <Picker.Item label="10" value="10" />
                        <Picker.Item label="11" value="11" />
                        <Picker.Item label="12" value="12" />
                        <Picker.Item label="13" value="13" />
                        <Picker.Item label="14" value="14" />
                        <Picker.Item label="15" value="15" />
                        <Picker.Item label="16" value="16" />
                        <Picker.Item label="17" value="17" />
                        <Picker.Item label="18" value="18" />
                        <Picker.Item label="19" value="19" />
                        <Picker.Item label="20" value="20" />
                        <Picker.Item label="21" value="21" />
                        <Picker.Item label="22" value="22" />
                        <Picker.Item label="23" value="23" />
                        <Picker.Item label="24" value="24" />
                        <Picker.Item label="25" value="25" />
                        <Picker.Item label="26" value="26" />
                        <Picker.Item label="27" value="27" />
                        <Picker.Item label="28" value="28" />
                        <Picker.Item label="29" value="29" />
                        <Picker.Item label="30" value="30" />
                        <Picker.Item label="31" value="31" />
                        <Picker.Item label="" value="" />
                    </Picker>
                </View>
                <Text>Month</Text>
                <View style={styles.input}>
                    <Picker
                        selectedValue={time.month}
                        onValueChange={(text) => setTime({ ...time, month: (text) })}
                    >
                        <Picker.Item label="" value="" />
                        <Picker.Item label="1" value="1" />
                        <Picker.Item label="2" value="2" />
                        <Picker.Item label="3" value="3" />
                        <Picker.Item label="4" value="4" />
                        <Picker.Item label="5" value="5" />
                        <Picker.Item label="6" value="6" />
                        <Picker.Item label="7" value="7" />
                        <Picker.Item label="8" value="8" />
                        <Picker.Item label="9" value="9" />
                        <Picker.Item label="10" value="10" />
                        <Picker.Item label="11" value="11" />
                        <Picker.Item label="12" value="12" />
                        <Picker.Item label="" value="" />
                    </Picker>
                </View>
                <Text>Year</Text>
                <View style={styles.input}>
                    <Picker
                        selectedValue={time.year}
                        onValueChange={(text) => setTime({ ...time, year: (text) })}
                    >
                        <Picker.Item label="" value="" />
                        <Picker.Item label="2026" value="2026" />
                        <Picker.Item label="2027" value="2027" />
                        <Picker.Item label="2028" value="2028" />
                        <Picker.Item label="2029" value="2029" />
                        <Picker.Item label="2030" value="2030" />
                        <Picker.Item label="2031" value="2031" />
                        <Picker.Item label="2032" value="2032" />
                        <Picker.Item label="" value="" />
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



export default DashboardAdd