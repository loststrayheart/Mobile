import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../FirebaseConfig";
import { addDoc, query, collection, where, getDocs } from "firebase/firestore";
import { PlannerContext } from "../context/PlannerContext";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// ---- Time Picker Modal ----
const TimePickerModal = ({ visible, title, hour, minute, onConfirm, onClose }) => {
    const [h, setH] = useState(hour || "00");
    const [m, setM] = useState(minute || "00");

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.timeModalCard}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <View style={styles.pickerRow}>
                        <View style={styles.pickerCol}>
                            <Text style={styles.pickerLabel}>ชั่วโมง</Text>
                            <Picker
                                selectedValue={h}
                                onValueChange={(val) => setH(val)}
                                style={styles.timePicker}
                            >
                                {HOURS.map((hh) => (
                                    <Picker.Item key={hh} label={hh} value={hh} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.timeSep}>:</Text>
                        <View style={styles.pickerCol}>
                            <Text style={styles.pickerLabel}>นาที</Text>
                            <Picker
                                selectedValue={m}
                                onValueChange={(val) => setM(val)}
                                style={styles.timePicker}
                            >
                                {MINUTES.map((mm) => (
                                    <Picker.Item key={mm} label={mm} value={mm} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmBtn} onPress={() => { onConfirm(h, m); onClose(); }}>
                            <Text style={styles.confirmBtnText}>ตกลง</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// ---- Main Component ----
const DashboardAdd_NextClass = () => {

    const { userID } = useContext(PlannerContext);

    const [Form, setForm] = useState({
        Date: '',
        Subject_ID: '',
        Subject_Name: '',
        Time_Start: '',
        Time_End: '',
        userid: userID
    });

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // แยก hour/minute สำหรับ picker
    const getHM = (timeStr) => {
        if (timeStr && timeStr.includes(":")) {
            const [h, m] = timeStr.split(":");
            return { h, m };
        }
        return { h: "08", m: "00" };
    };

    const convertToMinute = (time) => {
        const [h, m] = time.split(":");
        return parseInt(h) * 60 + parseInt(m);
    };

    const handledata = async () => {
        try {
            if (!Form.Date || !Form.Time_Start || !Form.Time_End) {
                return Alert.alert("Error", "กรุณากรอกข้อมูลให้ครบถ้วน");
            }

            const newStart = convertToMinute(Form.Time_Start);
            const newEnd = convertToMinute(Form.Time_End);

            if (newEnd <= newStart) {
                return Alert.alert("Error", "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม");
            }

            const classRef = collection(db, "NextClass");
            const q = query(classRef, where("userid", "==", userID), where("Date", "==", Form.Date));
            const querySnapshot = await getDocs(q);

            let isOverlapping = false;
            querySnapshot.forEach((doc) => {
                const existingClass = doc.data();
                const existStart = convertToMinute(existingClass.Time_Start);
                const existEnd = convertToMinute(existingClass.Time_End);
                if (newStart < existEnd && newEnd > existStart) isOverlapping = true;
            });

            if (isOverlapping) {
                Alert.alert("แจ้งเตือน", "เวลานี้ซ้ำกับวิชาที่มีอยู่แล้ว!");
                return;
            }

            await addDoc(collection(db, "NextClass"), Form);
            Alert.alert("บันทึกสำเร็จ");

            setForm({ Date: '', Subject_ID: '', Subject_Name: '', Time_Start: '', Time_End: '', userid: userID });

        } catch (err) {
            console.error(err);
            Alert.alert("บันทึกไม่สำเร็จ", err.message);
        }
    };

    const startHM = getHM(Form.Time_Start);
    const endHM = getHM(Form.Time_End);

    return (
        <View style={styles.container}>
            <View>

                <Text>{userID}</Text>

                {/* Picker: วัน */}
                <View style={styles.pickerBox}>
                    <Picker
                        selectedValue={Form.Date}
                        onValueChange={(text) => setForm({ ...Form, Date: text })}
                    >
                        <Picker.Item label="Select Day" value="" />
                        <Picker.Item label="Monday" value="Monday" />
                        <Picker.Item label="Tuesday" value="Tuesday" />
                        <Picker.Item label="Wednesday" value="Wednesday" />
                        <Picker.Item label="Thursday" value="Thursday" />
                        <Picker.Item label="Friday" value="Friday" />
                        <Picker.Item label="Saturday" value="Saturday" />
                        <Picker.Item label="Sunday" value="Sunday" />
                    </Picker>
                </View>

                <Text>Subject ID</Text>
                <TextInput
                    style={styles.input}
                    placeholder='XXXXXXXX-XX'
                    value={Form.Subject_ID}
                    onChangeText={(text) => setForm({ ...Form, Subject_ID: text })}
                />

                <Text>Subject Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Subject Name'
                    value={Form.Subject_Name}
                    onChangeText={(text) => setForm({ ...Form, Subject_Name: text })}
                />

                {/* Picker: Time Start */}
                <Text>Time Start</Text>
                <TouchableOpacity style={styles.timeButton} onPress={() => setShowStartPicker(true)}>
                    <Text style={Form.Time_Start ? styles.timeText : styles.timePlaceholder}>
                        {Form.Time_Start || "HH:MM"}
                    </Text>
                    <Text style={styles.clockIcon}></Text>
                </TouchableOpacity>

                {/* Picker: Time End */}
                <Text>Time End</Text>
                <TouchableOpacity style={styles.timeButton} onPress={() => setShowEndPicker(true)}>
                    <Text style={Form.Time_End ? styles.timeText : styles.timePlaceholder}>
                        {Form.Time_End || "HH:MM"}
                    </Text>
                    <Text style={styles.clockIcon}></Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handledata}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Enter</Text>
                    </View>
                </TouchableOpacity>

            </View>

            {/* Modal: Time Start */}
            <TimePickerModal
                visible={showStartPicker}
                title="เวลาเริ่ม"
                hour={startHM.h}
                minute={startHM.m}
                onConfirm={(h, m) => setForm(prev => ({ ...prev, Time_Start: `${h}:${m}` }))}
                onClose={() => setShowStartPicker(false)}
            />

            {/* Modal: Time End */}
            <TimePickerModal
                visible={showEndPicker}
                title="เวลาสิ้นสุด"
                hour={endHM.h}
                minute={endHM.m}
                onConfirm={(h, m) => setForm(prev => ({ ...prev, Time_End: `${h}:${m}` }))}
                onClose={() => setShowEndPicker(false)}
            />

        </View>
    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },

    input: {
        width: 250,
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 10
    },

    pickerBox: {
        width: 250,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#fff',
        marginBottom: 10
    },

    timeButton: {
        width: 250,
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 16,
        height: 45,
        backgroundColor: '#fff',
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    timeText: {
        fontSize: 16,
        color: '#000'
    },

    timePlaceholder: {
        fontSize: 16,
        color: '#aaa'
    },

    clockIcon: {
        fontSize: 18
    },

    button: {
        width: 200,
        height: 80,
        backgroundColor: '#006664',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },

    buttonText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff'
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    timeModalCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: 320,
        paddingVertical: 20,
        paddingHorizontal: 16
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8
    },

    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    pickerCol: {
        alignItems: 'center',
        flex: 1
    },

    pickerLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2
    },

    timePicker: {
        width: '100%'
    },

    timeSep: {
        fontSize: 28,
        fontWeight: 'bold',
        marginHorizontal: 4,
        marginTop: 16
    },

    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 12
    },

    cancelBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center'
    },

    cancelBtnText: {
        color: '#666',
        fontWeight: 'bold'
    },

    confirmBtn: {
        flex: 1,
        backgroundColor: '#006664',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center'
    },

    confirmBtnText: {
        color: 'white',
        fontWeight: 'bold'
    }

});

export default DashboardAdd_NextClass;