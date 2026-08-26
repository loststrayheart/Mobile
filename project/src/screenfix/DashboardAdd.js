import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../FirebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { PlannerContext } from "../context/PlannerContext";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear + i));

// ---- Time Picker Modal ----
const TimePickerModal = ({ visible, title, hour, minute, onConfirm, onClose }) => {
    const [h, setH] = useState(hour || "08");
    const [m, setM] = useState(minute || "00");

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <View style={styles.pickerRow}>
                        <View style={styles.pickerCol}>
                            <Text style={styles.pickerLabel}>ชั่วโมง</Text>
                            <Picker selectedValue={h} onValueChange={setH} style={styles.timePicker}>
                                {HOURS.map((hh) => <Picker.Item key={hh} label={hh} value={hh} />)}
                            </Picker>
                        </View>
                        <Text style={styles.timeSep}>:</Text>
                        <View style={styles.pickerCol}>
                            <Text style={styles.pickerLabel}>นาที</Text>
                            <Picker selectedValue={m} onValueChange={setM} style={styles.timePicker}>
                                {MINUTES.map((mm) => <Picker.Item key={mm} label={mm} value={mm} />)}
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

// ---- Date Picker Modal ----
const DatePickerModal = ({ visible, day, month, year, onConfirm, onClose }) => {
    const [d, setD] = useState(day || "01");
    const [mo, setMo] = useState(month || "01");
    const [y, setY] = useState(year || String(currentYear));

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>เลือกวันที่</Text>
                    <View style={styles.pickerRow}>
                        <View style={styles.pickerCol}>
                            <Text style={styles.pickerLabel}>วัน</Text>
                            <Picker selectedValue={d} onValueChange={setD} style={styles.datePicker}>
                                {DAYS.map((dd) => <Picker.Item key={dd} label={dd} value={dd} />)}
                            </Picker>
                        </View>
                        <View style={styles.pickerCol}>
                            <Text style={styles.pickerLabel}>เดือน</Text>
                            <Picker selectedValue={mo} onValueChange={setMo} style={styles.datePicker}>
                                {MONTHS.map((mm) => <Picker.Item key={mm} label={mm} value={mm} />)}
                            </Picker>
                        </View>
                        <View style={styles.pickerCol}>
                            <Text style={styles.pickerLabel}>ปี</Text>
                            <Picker selectedValue={y} onValueChange={setY} style={styles.datePicker}>
                                {YEARS.map((yy) => <Picker.Item key={yy} label={yy} value={yy} />)}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmBtn} onPress={() => { onConfirm(d, mo, y); onClose(); }}>
                            <Text style={styles.confirmBtnText}>ตกลง</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// ---- Main Component ----
const DashboardAdd = () => {

    const { userID } = useContext(PlannerContext);

    const [time, setTime] = useState({ day: '', month: '', year: '' });

    const [Form, setForm] = useState({
        Subject_ID: '',
        Subject_Name: '',
        Time_Start: '',
        Time_End: '',
        userid: userID
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const getHM = (timeStr) => {
        if (timeStr && timeStr.includes(":")) {
            const [h, m] = timeStr.split(":");
            return { h, m };
        }
        return { h: "08", m: "00" };
    };

    const handledata = async () => {
        if (!time.day || !time.month || !time.year) {
            return Alert.alert("Error", "กรุณากรอกวันที่ให้ครบ");
        }
        if (!Form.Subject_ID || !Form.Subject_Name || !Form.Time_Start || !Form.Time_End) {
            return Alert.alert("Error", "กรุณากรอกข้อมูลให้ครบ");
        }

        const formattedDate = `${time.day}/${time.month}/${time.year}`;

        try {
            await addDoc(collection(db, "UpComingExam"), {
                ...Form,
                Date: formattedDate,
                userid: userID
            });
            Alert.alert("บันทึกสำเร็จ");
            setTime({ day: '', month: '', year: '' });
            setForm({ Subject_ID: '', Subject_Name: '', Time_Start: '', Time_End: '', userid: userID });
        } catch (err) {
            Alert.alert("บันทึกไม่สำเร็จ");
        }
    };

    const dateLabel = time.day && time.month && time.year
        ? `${time.day}/${time.month}/${time.year}`
        : null;

    const startHM = getHM(Form.Time_Start);
    const endHM = getHM(Form.Time_End);

    return (
        <View style={styles.container}>
            <View>

                <Text>{userID}</Text>

                {/* Date Picker */}
                <Text>Date</Text>
                <TouchableOpacity style={styles.timeButton} onPress={() => setShowDatePicker(true)}>
                    <Text style={dateLabel ? styles.timeText : styles.timePlaceholder}>
                        {dateLabel || "DD/MM/YYYY"}
                    </Text>
                    <Text style={styles.clockIcon}></Text>
                </TouchableOpacity>

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

                {/* Time Start Picker */}
                <Text>Time Start</Text>
                <TouchableOpacity style={styles.timeButton} onPress={() => setShowStartPicker(true)}>
                    <Text style={Form.Time_Start ? styles.timeText : styles.timePlaceholder}>
                        {Form.Time_Start || "HH:MM"}
                    </Text>
                    <Text style={styles.clockIcon}></Text>
                </TouchableOpacity>

                {/* Time End Picker */}
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

            {/* Modal: Date */}
            <DatePickerModal
                visible={showDatePicker}
                day={time.day || "01"}
                month={time.month || "01"}
                year={time.year || String(currentYear)}
                onConfirm={(d, mo, y) => setTime({ day: d, month: mo, year: y })}
                onClose={() => setShowDatePicker(false)}
            />

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

    modalCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: 340,
        paddingVertical: 20,
        paddingHorizontal: 12
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

    datePicker: {
        width: '100%'
    },

    timeSep: {
        fontSize: 28,
        fontWeight: 'bold',
        marginHorizontal: 2,
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

export default DashboardAdd;