import React, { useContext, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Alert } from "react-native";
import { PlannerContext } from "../context/PlannerContext";
import { db } from "../../FirebaseConfig";
import { query, collection, where, getDocs, addDoc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";

const Dashboard = ({ navigation }) => {

    const now = new Date();
    const { userID } = useContext(PlannerContext);

    const [classList, setClassList] = useState([]);
    const [classList_Upcoming, setClassList_Upcoming] = useState([]);
    const [quickTask, setQuickTask] = useState("");
    const [activeFilter, setActiveFilter] = useState("today");

    // ---- NextClass: Date เก็บชื่อวัน เช่น "Monday" ----
    const dayNameToIndex = {
        'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
        'Friday': 4, 'Saturday': 5, 'Sunday': 6
    };
    // JS getDay(): 0=Sun,1=Mon,...6=Sat → แปลงเป็น index Mon=0..Sun=6
    const jsDayToIndex = (jsDay) => jsDay === 0 ? 6 : jsDay - 1;
    const todayIdx = jsDayToIndex(now.getDay());

    const sortNextClass = (data) => [...data].sort((a, b) => {
        const ia = dayNameToIndex[a.Date] ?? 99;
        const ib = dayNameToIndex[b.Date] ?? 99;
        if (ia !== ib) return ia - ib;
        const toMin = (t) => { const [h, m] = (t || '0:0').split(':'); return +h * 60 + +m; };
        return toMin(a.Time_Start) - toMin(b.Time_Start);
    });

    const filterNextClass = (data, filter) => {
        if (filter === 'today') {
            return data.filter(item => (dayNameToIndex[item.Date] ?? 99) >= todayIdx);
        } else {
            return data.filter(item => (dayNameToIndex[item.Date] ?? 99) < todayIdx);
        }
    };

    // ---- UpComingExam: Date เก็บวันที่จริง เช่น "13/3/2569" (พ.ศ.) ----
    // แปลง "d/m/yyyy_BE" → JS Date (ค.ศ.)
    const parseThaiDate = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length < 3) return null;
        const d = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1; // JS month 0-based
        const y = parseInt(parts[2]) - 543; // พ.ศ. → ค.ศ.
        return new Date(y, m, d);
    };

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // หาวันอาทิตย์สิ้นสัปดาห์นี้
    const daysUntilSunday = todayIdx === 6 ? 0 : 6 - todayIdx;
    const endOfWeek = new Date(todayStart);
    endOfWeek.setDate(todayStart.getDate() + daysUntilSunday);

    const sortUpcoming = (data) => [...data].sort((a, b) => {
        const da = parseThaiDate(a.Date)?.getTime() ?? 0;
        const db2 = parseThaiDate(b.Date)?.getTime() ?? 0;
        return da - db2;
    });

    const filterUpcoming = (data, filter) => {
        return data.filter(item => {
            const d = parseThaiDate(item.Date);
            if (!d) return false;
            if (filter === 'today') {
                // วันนี้ถึงอาทิตย์สิ้นสัปดาห์
                return d >= todayStart && d <= endOfWeek;
            } else {
                // สัปดาห์หน้า: หลังจากอาทิตย์สิ้นสัปดาห์นี้ขึ้นไป
                return d > endOfWeek;
            }
        });
    };

    const fetchNextClass = async () => {
        try {
            const q = query(collection(db, "NextClass"), where("userid", "==", userID));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return sortNextClass(data);
        } catch (error) { console.error(error); return []; }
    };

    const fetchUpcoming = async () => {
        try {
            const q = query(collection(db, "UpComingExam"), where("userid", "==", userID));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return sortUpcoming(data);
        } catch (error) { console.error(error); return []; }
    };

    const loadData = async (filter = activeFilter) => {
        const [nextData, upcomingData] = await Promise.all([fetchNextClass(), fetchUpcoming()]);
        setClassList(filterNextClass(nextData, filter));
        setClassList_Upcoming(upcomingData); // โชว์ทั้งหมด ไม่กรอง
    };

    useFocusEffect(
        useCallback(() => {
            loadData(activeFilter);
        }, [activeFilter])
    );

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        loadData(filter);
    };

    const handle_quick_plan = () => navigation.navigate("Select");

    const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const todayName = DAY_NAMES[todayIdx];

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>


            {/* Filter Buttons */}
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterBtn, activeFilter === 'today' && styles.filterBtnActive]}
                    onPress={() => handleFilterChange('today')}
                >
                    <Text style={[styles.filterBtnText, activeFilter === 'today' && styles.filterBtnTextActive]}>
                        วันนี้
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterBtn, activeFilter === 'next_week' && styles.filterBtnActive]}
                    onPress={() => handleFilterChange('next_week')}
                >
                    <Text style={[styles.filterBtnText, activeFilter === 'next_week' && styles.filterBtnTextActive]}>
                        สัปดาห์หน้า
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Quick Study Plan */}
            <TouchableOpacity onPress={handle_quick_plan} style={styles.quickAddBtn}>
                <Text style={styles.quickAddBtnText}>+ Quick Study Plan</Text>
            </TouchableOpacity>

            {/* Next Class */}
            <View style={styles.card}>
                <Text style={styles.title}>Next Class</Text>
                <FlatList
                    data={classList}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.itemCard}>
                            <View style={styles.itemLeft}>
                                <Text style={styles.itemDay}>{item.Date}</Text>
                                <Text style={styles.itemTime}>{item.Time_Start} - {item.Time_End}</Text>
                            </View>
                            <Text style={styles.itemSubject}>{item.Subject_Name}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>ไม่มีข้อมูลวิชาเรียน</Text>}
                />
            </View>

            {/* Upcoming Exam */}
            <View style={styles.card}>
                <Text style={styles.title}>Upcoming Exam</Text>
                <FlatList
                    data={classList_Upcoming}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.itemCard}>
                            <View style={styles.itemLeft}>
                                <Text style={styles.itemDay}>{item.Date}</Text>
                                <Text style={styles.itemTime}>{item.Time_Start} - {item.Time_End}</Text>
                            </View>
                            <Text style={styles.itemSubject}>{item.Subject_Name}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>ไม่มีข้อมูลสอบ</Text>}
                />
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 390,
        marginBottom: 12,
        paddingHorizontal: 5,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#006664',
    },
    timeText: {
        fontSize: 16,
        color: '#888',
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 10,
    },
    filterBtn: {
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#ccc',
        elevation: 2,
    },
    filterBtnActive: {
        backgroundColor: '#006664',
        borderColor: '#006664',
    },
    filterBtnText: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
    filterBtnTextActive: {
        color: '#fff',
    },
    quickAddBtn: {
        width: 390,
        backgroundColor: '#006664',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 4,
    },
    quickAddBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    card: {
        width: 390,
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 20,
        marginBottom: 15,
        elevation: 8,
        shadowColor: '#006664',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        minHeight: 120,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#006664',
        marginBottom: 10,
    },
    itemCard: {
        backgroundColor: '#f4fafa',
        borderRadius: 12,
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },
    itemLeft: {
        backgroundColor: '#006664',
        width: 90,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemDay: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    itemTime: {
        color: '#cef5f3',
        fontSize: 11,
        marginTop: 3,
        textAlign: 'center',
    },
    itemSubject: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 12,
        flex: 1,
    },
    emptyText: {
        color: '#aaa',
        textAlign: 'center',
        paddingVertical: 15,
    },
});

export default Dashboard;