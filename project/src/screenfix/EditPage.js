import React, { useState } from "react";
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    Alert, ScrollView, ActivityIndicator, Platform
} from "react-native";
import { db } from "../../FirebaseConfig";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const DAYS_IN_MONTH = Array.from({ length: 31 }, (_, i) => String(i + 1));
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => String(currentYear - 5 + i));

const parseThaiDate = (str) => {
    if (!str) return { day: '1', month: '1', year: String(currentYear) };
    const parts = str.split('/');
    if (parts.length < 3) return { day: '1', month: '1', year: String(currentYear) };
    return { day: parts[0], month: parts[1], year: parts[2] };
};

const parseTime = (str) => {
    if (!str) return { hour: '08', minute: '00' };
    const parts = str.split(':');
    return {
        hour: (parts[0] || '08').padStart(2, '0'),
        minute: (parts[1] || '00').padStart(2, '0'),
    };
};

const EditPage = ({ route, navigation }) => {

    const { item, collection: colName } = route.params;
    const isUpcoming = colName === 'UpComingExam';

    // วันที่ (UpComingExam)
    const parsedDate = parseThaiDate(item.Date || '');
    const [dateDay, setDateDay] = useState(parsedDate.day);
    const [dateMonth, setDateMonth] = useState(parsedDate.month);
    const [dateYear, setDateYear] = useState(parsedDate.year);

    // วัน (NextClass)
    const [dayName, setDayName] = useState(item.Date || 'Monday');

    // เวลาเริ่ม
    const parsedStart = parseTime(item.Time_Start || '');
    const [startHour, setStartHour] = useState(parsedStart.hour);
    const [startMinute, setStartMinute] = useState(parsedStart.minute);

    // เวลาสิ้นสุด
    const parsedEnd = parseTime(item.Time_End || '');
    const [endHour, setEndHour] = useState(parsedEnd.hour);
    const [endMinute, setEndMinute] = useState(parsedEnd.minute);

    const [form, setForm] = useState({
        Subject_Name: item.Subject_Name || '',
        Room: item.Room || '',
        Note: item.Note || '',
    });

    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!form.Subject_Name.trim()) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อวิชา");
            return;
        }

        const dateValue = isUpcoming
            ? `${dateDay}/${dateMonth}/${dateYear}`
            : dayName;
        const timeStart = `${startHour}:${startMinute}`;
        const timeEnd = `${endHour}:${endMinute}`;

        try {
            setLoading(true);
            const ref = doc(db, colName, item.id);
            await updateDoc(ref, {
                Subject_Name: form.Subject_Name,
                Date: dateValue,
                Time_Start: timeStart,
                Time_End: timeEnd,
                Room: form.Room,
                Note: form.Note,
            });
            Alert.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว", [
                { text: "ตกลง", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "ยืนยันการลบ",
            `ต้องการลบ "${form.Subject_Name}" หรือไม่?`,
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ลบ",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deleteDoc(doc(db, colName, item.id));
                            Alert.alert("สำเร็จ", "ลบข้อมูลเรียบร้อยแล้ว", [
                                { text: "ตกลง", onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error(error);
                            Alert.alert("Error", "ไม่สามารถลบข้อมูลได้");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const PickerRow = ({ label, value, onChange, items }) => (
        <View style={{ flex: 1 }}>
            <Text style={styles.subLabel}>{label}</Text>
            <View style={styles.pickerWrapper}>
                <Picker selectedValue={value} onValueChange={onChange}
                    style={styles.picker} itemStyle={styles.pickerItem}>
                    {items.map(v => <Picker.Item key={v} label={v} value={v} />)}
                </Picker>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← กลับ</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isUpcoming ? 'แก้ไขข้อมูลสอบ' : 'แก้ไขวิชาเรียน'}
                </Text>
            </View>

            <View style={styles.card}>

                {/* ชื่อวิชา */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>ชื่อวิชา <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={form.Subject_Name}
                        onChangeText={(text) => setForm({ ...form, Subject_Name: text })}
                        placeholder="กรอกชื่อวิชา"
                    />
                </View>

                {/* วันที่ (UpComingExam) */}
                {isUpcoming ? (
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>วันที่สอบ</Text>
                        <View style={styles.rowPicker}>
                            <PickerRow label="วันที่" value={dateDay} onChange={setDateDay} items={DAYS_IN_MONTH} />
                            <View style={{ width: 8 }} />
                            <PickerRow label="เดือน" value={dateMonth} onChange={setDateMonth} items={MONTHS} />
                            <View style={{ width: 8 }} />
                            <View style={{ flex: 1.4 }}>
                                <Text style={styles.subLabel}>ปี (ค.ศ.)</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker selectedValue={dateYear} onValueChange={setDateYear}
                                        style={styles.picker} itemStyle={styles.pickerItem}>
                                        {YEARS.map(v => <Picker.Item key={v} label={v} value={v} />)}
                                    </Picker>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : (
                    /* วัน (NextClass) */
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>วัน</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker selectedValue={dayName} onValueChange={setDayName}
                                style={styles.picker} itemStyle={styles.pickerItem}>
                                {DAYS.map(d => <Picker.Item key={d} label={d} value={d} />)}
                            </Picker>
                        </View>
                    </View>
                )}

                {/* เวลาเริ่ม */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>เวลาเริ่ม <Text style={styles.required}>*</Text></Text>
                    <View style={styles.rowPicker}>
                        <PickerRow label="ชั่วโมง" value={startHour} onChange={setStartHour} items={HOURS} />
                        <View style={{ width: 8 }} />
                        <PickerRow label="นาที" value={startMinute} onChange={setStartMinute} items={MINUTES} />
                    </View>
                </View>

                {/* เวลาสิ้นสุด */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>เวลาสิ้นสุด <Text style={styles.required}>*</Text></Text>
                    <View style={styles.rowPicker}>
                        <PickerRow label="ชั่วโมง" value={endHour} onChange={setEndHour} items={HOURS} />
                        <View style={{ width: 8 }} />
                        <PickerRow label="นาที" value={endMinute} onChange={setEndMinute} items={MINUTES} />
                    </View>
                </View>


            </View>

            {/* ปุ่มบันทึก */}
            <TouchableOpacity
                style={[styles.saveButton, loading && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={loading}
            >
                {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.saveButtonText}>บันทึกข้อมูล</Text>
                }
            </TouchableOpacity>

            {/* ปุ่มลบ */}
            <TouchableOpacity
                style={[styles.deleteButton, loading && { opacity: 0.6 }]}
                onPress={handleDelete}
                disabled={loading}
            >
                <Text style={styles.deleteButtonText}>ลบรายการนี้</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: '#f0f4f4',
    },
    container: {
        padding: 20,
        paddingBottom: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#006664',
        borderRadius: 20,
    },
    backText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#006664',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#006664',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        marginBottom: 20,
    },
    fieldGroup: {
        marginBottom: 16,
    },
    rowPicker: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 13,
        color: '#555',
        marginBottom: 6,
        fontWeight: '600',
    },
    subLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
        textAlign: 'center',
    },
    required: {
        color: '#ff4d4d',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        backgroundColor: '#fafafa',
        color: '#333',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fafafa',
        height: Platform.OS === 'ios' ? 120 : 50,
        justifyContent: 'center',
    },
    picker: {
        height: Platform.OS === 'ios' ? 120 : 50,
        transform: Platform.OS === 'ios' ? [{ scaleY: 0.85 }] : [],
    },
    pickerItem: {
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#00b894',
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 4,
        marginBottom: 12,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 4,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditPage;