import React, { useState, useContext } from "react";
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, Modal, FlatList, ScrollView } from 'react-native';
import { PlannerContext } from "../context/PlannerContext";
import { db } from "../../FirebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

// ---- ตัวเลือก Picker ----
const TYPE_OPTIONS = ["รายวิชา", "กิจกรรม" ];
const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// ---- Component: Simple Modal Picker ----
const PickerModal = ({ visible, title, options, selectedValue, onSelect, onClose }) => (
    <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
            <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{title}</Text>
                <FlatList
                    data={options}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.modalItem,
                                item === selectedValue && styles.modalItemSelected
                            ]}
                            onPress={() => { onSelect(item); onClose(); }}
                        >
                            <Text style={[
                                styles.modalItemText,
                                item === selectedValue && styles.modalItemTextSelected
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </TouchableOpacity>
    </Modal>
);

// ---- Component: Scroll Drum Picker (for time) ----
const DrumPicker = ({ options, value, onChange, label }) => {
    return (
        <View style={styles.drumContainer}>
            <Text style={styles.drumLabel}>{label}</Text>
            <ScrollView
                style={styles.drum}
                snapToInterval={44}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.y / 44);
                    const clamped = Math.max(0, Math.min(index, options.length - 1));
                    onChange(options[clamped]);
                }}
                contentOffset={{ x: 0, y: options.indexOf(value) * 44 }}
            >
                {/* padding top/bottom so first/last item can center */}
                <View style={{ height: 44 }} />
                {options.map((opt) => (
                    <View key={opt} style={styles.drumItem}>
                        <Text style={[
                            styles.drumItemText,
                            opt === value && styles.drumItemTextSelected
                        ]}>
                            {opt}
                        </Text>
                    </View>
                ))}
                <View style={{ height: 44 }} />
            </ScrollView>
            {/* highlight bar */}
            <View pointerEvents="none" style={styles.drumHighlight} />
        </View>
    );
};

// ---- Component: Time Picker Modal ----
const TimePickerModal = ({ visible, title, hour, minute, onConfirm, onClose }) => {
    const [h, setH] = useState(hour || "00");
    const [m, setM] = useState(minute || "00");

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.timeModalCard}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <View style={styles.drumRow}>
                        <DrumPicker options={HOURS} value={h} onChange={setH} label="ชั่วโมง" />
                        <Text style={styles.timeSep}>:</Text>
                        <DrumPicker options={MINUTES} value={m} onChange={setM} label="นาที" />
                    </View>
                    <View style={styles.timeModalButtons}>
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
const Add = ({ navigation }) => {

    const { userID } = useContext(PlannerContext);

    const [form, setForm] = useState({
        infoname: '',
        info: '',
        day: '',
        startHour: '08',
        startMinute: '00',
        endHour: '09',
        endMinute: '00',
        userid: userID
    });

    // Modal visibility states
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [showDayPicker, setShowDayPicker] = useState(false);
    const [showStartTime, setShowStartTime] = useState(false);
    const [showEndTime, setShowEndTime] = useState(false);

    const checkClassConflict = async () => {
        const classSnap = await getDocs(collection(db, "NextClass"));
        const newStart = parseInt(form.startHour) * 60 + parseInt(form.startMinute);
        const newEnd = parseInt(form.endHour) * 60 + parseInt(form.endMinute);
        let conflict = false;

        classSnap.forEach((docu) => {
            const classData = docu.data();
            if (classData.userid === userID && classData.Date === form.day) {
                const classStart =
                    parseInt(classData.Time_Start.split(":")[0]) * 60 +
                    parseInt(classData.Time_Start.split(":")[1]);
                const classEnd =
                    parseInt(classData.Time_End.split(":")[0]) * 60 +
                    parseInt(classData.Time_End.split(":")[1]);
                if (newStart < classEnd && newEnd > classStart) conflict = true;
            }
        });
        return conflict;
    };

    const handleAdd = async () => {
        if (!form.infoname || !form.info || !form.day) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบ");
            return;
        }
        try {
            const conflict = await checkClassConflict();
            if (conflict) {
                Alert.alert("แจ้งเตือน", "มีวิชาเรียนในเวลานี้");
                return;
            }
            await addDoc(collection(db, "Activities"), {
                ...form,
                userid: userID,
                createdAt: new Date()
            });
            Alert.alert("สำเร็จ", "บันทึกข้อมูลแล้ว");
        } catch (error) {
            Alert.alert("เกิดข้อผิดพลาด", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>

                <Text style={styles.text}>เพิ่มข้อมูล</Text>

                {/* ชื่อข้อมูล */}
                <TextInput
                    style={styles.input}
                    placeholder="ชื่อข้อมูล"
                    value={form.infoname}
                    onChangeText={(text) => setForm(prev => ({ ...prev, infoname: text }))}
                />

                {/* Picker: ประเภท */}
                <Text style={styles.label}>ประเภท</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTypePicker(true)}>
                    <Text style={form.info ? styles.pickerText : styles.pickerPlaceholder}>
                        {form.info || "เลือกประเภท"}
                    </Text>
                    <Text style={styles.pickerArrow}>▾</Text>
                </TouchableOpacity>

                {/* Picker: วัน */}
                <Text style={styles.label}>วัน</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDayPicker(true)}>
                    <Text style={form.day ? styles.pickerText : styles.pickerPlaceholder}>
                        {form.day || "เลือกวัน"}
                    </Text>
                    <Text style={styles.pickerArrow}>▾</Text>
                </TouchableOpacity>

                {/* Picker: เวลาเริ่ม */}
                <Text style={styles.label}>เวลาเริ่ม</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStartTime(true)}>
                    <Text style={styles.pickerText}>
                        {form.startHour}:{form.startMinute} น.
                    </Text>
                    <Text style={styles.pickerArrow}></Text>
                </TouchableOpacity>

                {/* Picker: เวลาสิ้นสุด */}
                <Text style={styles.label}>เวลาสิ้นสุด</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowEndTime(true)}>
                    <Text style={styles.pickerText}>
                        {form.endHour}:{form.endMinute} น.
                    </Text>
                    <Text style={styles.pickerArrow}></Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleAdd}>
                    <Text style={styles.buttonText}>บันทึก</Text>
                </TouchableOpacity>

            </View>

            {/* Modal: ประเภท */}
            <PickerModal
                visible={showTypePicker}
                title="เลือกประเภท"
                options={TYPE_OPTIONS}
                selectedValue={form.info}
                onSelect={(val) => setForm(prev => ({ ...prev, info: val }))}
                onClose={() => setShowTypePicker(false)}
            />

            {/* Modal: วัน */}
            <PickerModal
                visible={showDayPicker}
                title="เลือกวัน"
                options={DAY_OPTIONS}
                selectedValue={form.day}
                onSelect={(val) => setForm(prev => ({ ...prev, day: val }))}
                onClose={() => setShowDayPicker(false)}
            />

            {/* Modal: เวลาเริ่ม */}
            <TimePickerModal
                visible={showStartTime}
                title="เวลาเริ่ม"
                hour={form.startHour}
                minute={form.startMinute}
                onConfirm={(h, m) => setForm(prev => ({ ...prev, startHour: h, startMinute: m }))}
                onClose={() => setShowStartTime(false)}
            />

            {/* Modal: เวลาสิ้นสุด */}
            <TimePickerModal
                visible={showEndTime}
                title="เวลาสิ้นสุด"
                hour={form.endHour}
                minute={form.endMinute}
                onConfirm={(h, m) => setForm(prev => ({ ...prev, endHour: h, endMinute: m }))}
                onClose={() => setShowEndTime(false)}
            />

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
        paddingHorizontal: 10,
        height: 45,
        borderRadius: 8
    },

    label: {
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
        fontSize: 14
    },

    pickerButton: {
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8,
        height: 45,
        paddingHorizontal: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    pickerText: {
        fontSize: 15,
        color: '#000'
    },

    pickerPlaceholder: {
        fontSize: 15,
        color: '#aaa'
    },

    pickerArrow: {
        fontSize: 16,
        color: '#555'
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
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    modalCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: 300,
        maxHeight: 400,
        paddingVertical: 16,
        paddingHorizontal: 8
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12
    },

    modalItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 8,
        marginVertical: 2
    },

    modalItemSelected: {
        backgroundColor: '#e0f2f2'
    },

    modalItemText: {
        fontSize: 16,
        color: '#333'
    },

    modalItemTextSelected: {
        color: '#006664',
        fontWeight: 'bold'
    },

    // Time picker modal
    timeModalCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        width: 320,
        paddingVertical: 20,
        paddingHorizontal: 16
    },

    drumRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12
    },

    drumContainer: {
        alignItems: 'center',
        width: 100
    },

    drumLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6
    },

    drum: {
        height: 132,   // shows 3 items (44*3)
        width: 80
    },

    drumItem: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },

    drumItemText: {
        fontSize: 24,
        color: '#bbb'
    },

    drumItemTextSelected: {
        color: '#006664',
        fontWeight: 'bold',
        fontSize: 28
    },

    drumHighlight: {
        position: 'absolute',
        top: 44 + 22,   // center band (label height + 1 item + half item)
        left: 0,
        right: 0,
        height: 44,
        borderTopWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: '#006664',
        borderRadius: 6
    },

    timeSep: {
        fontSize: 28,
        fontWeight: 'bold',
        marginHorizontal: 8,
        marginTop: 20
    },

    timeModalButtons: {
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