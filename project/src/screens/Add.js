import React, { useState, useContext,useEffect } from "react";
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import { PlannerContext } from "../context/PlannerContext";
import { db } from "../../FirebaseConfig"; 
import { collection, addDoc } from "firebase/firestore";

const Add = ({ navigation }) => {
    const { userID } = useContext(PlannerContext); // ดึง userID มาด้วย

    const [form, setForm] = useState({
        infoname: '', info: 'รายวิชา', day: 'Monday', date: '',
        startHour: '00', startMinute: '00', endHour: '00', endMinute: '00',userid:userID
    });

    const handleAdd = async () => {
        if (!form.date || !form.infoname) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบ");
            return;
        }

        try {
            // บันทึกลงคอลเลกชัน "Activities" พร้อมระบุ userid
            await addDoc(collection(db, "Activities"), {
                ...form,
                userid: userID,
                createdAt: new Date()
            });
            Alert.alert("สำเร็จ", "บันทึกข้อมูลแล้ว");
            navigation.navigate('Planner');
        } catch (error) {
            Alert.alert("เกิดข้อผิดพลาด", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>

                <Text style={styles.text}>เพิ่มข้อมูล</Text>

                <TextInput
                    style={styles.input}
                    placeholder="เพิ่มข้อมูล"
                    value={form.infoname}
                    onChangeText={(text) =>
                        setForm(prev => ({ ...prev, infoname: text }))
                    }
                />

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={form.info}
                        onValueChange={(v) =>
                            setForm(prev => ({ ...prev, info: v }))
                        }>
                        <Picker.Item label="รายวิชา" value="รายวิชา" />
                        <Picker.Item label="กิจกรรม" value="กิจกรรม" />
                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={form.day}
                        onValueChange={(v) =>
                            setForm(prev => ({ ...prev, day: v }))
                        }>
                        <Picker.Item label="Monday" value="Monday" />
                        <Picker.Item label="Tuesday" value="Tuesday" />
                        <Picker.Item label="Wednesday" value="Wednesday" />
                        <Picker.Item label="Thursday" value="Thursday" />
                        <Picker.Item label="Friday" value="Friday" />
                        <Picker.Item label="Saturday" value="Saturday" />
                        <Picker.Item label="Sunday" value="Sunday" />
                    </Picker>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD เช่น 2026-02-18"
                    value={form.date}
                    onChangeText={(text) =>
                        setForm(prev => ({ ...prev, date: text }))
                    }
                />

                {/* เวลาเริ่ม */}
                <Text style={styles.timeLabel}>เวลาเริ่ม</Text>
                <View style={styles.pickercard}>
                    <View style={styles.timePicker}>
                        <Picker
                            selectedValue={form.startHour}
                            onValueChange={(v) =>
                                setForm(prev => ({ ...prev, startHour: v }))
                            }>
                            {Array.from({ length: 24 }, (_, i) => (
                                <Picker.Item
                                    key={i}
                                    label={String(i).padStart(2, '0')}
                                    value={String(i).padStart(2, '0')}
                                />
                            ))}
                        </Picker>
                    </View>

                    <View style={styles.timePicker}>
                        <Picker
                            selectedValue={form.startMinute}
                            onValueChange={(v) =>
                                setForm(prev => ({ ...prev, startMinute: v }))
                            }>
                            {Array.from({ length: 60 }, (_, i) => (
                                <Picker.Item
                                    key={i}
                                    label={String(i).padStart(2, '0')}
                                    value={String(i).padStart(2, '0')}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* เวลาสิ้นสุด */}
                <Text style={styles.timeLabel}>เวลาสิ้นสุด</Text>
                <View style={styles.pickercard}>
                    <View style={styles.timePicker}>
                        <Picker
                            selectedValue={form.endHour}
                            onValueChange={(v) =>
                                setForm(prev => ({ ...prev, endHour: v }))
                            }>
                            {Array.from({ length: 24 }, (_, i) => (
                                <Picker.Item
                                    key={i}
                                    label={String(i).padStart(2, '0')}
                                    value={String(i).padStart(2, '0')}
                                />
                            ))}
                        </Picker>
                    </View>

                    <View style={styles.timePicker}>
                        <Picker
                            selectedValue={form.endMinute}
                            onValueChange={(v) =>
                                setForm(prev => ({ ...prev, endMinute: v }))
                            }>
                            {Array.from({ length: 60 }, (_, i) => (
                                <Picker.Item
                                    key={i}
                                    label={String(i).padStart(2, '0')}
                                    value={String(i).padStart(2, '0')}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleAdd}
                >
                    <Text style={styles.buttonText}>บันทึก</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

export default Add;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    card: {
        backgroundColor: 'white',
        width: 350,
        borderRadius: 30,
        padding: 20
    },

    text: {
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 15
    },

    input: {
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 10,
        paddingHorizontal: 10
    },

    pickerContainer: {
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 10
    },

    pickercard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },

    timePicker: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#000'
    },

    timeLabel: {
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5
    },

    button: {
        backgroundColor: '#006664',
        padding: 12,
        borderRadius: 12,
        marginTop: 15,
        alignItems: 'center'
    },

    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    }

});