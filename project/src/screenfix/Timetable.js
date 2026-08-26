import React, { useContext, useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ScrollView } from "react-native";
import { db } from "../../FirebaseConfig";
import { query, collection, where, getDocs } from "firebase/firestore";
import { PlannerContext } from "../context/PlannerContext";
import { useFocusEffect } from "@react-navigation/native";

const DAY_ORDER = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };

// NextClass: Date เป็นชื่อวัน
const sortByDayName = (list) =>
    [...list].sort((a, b) => (DAY_ORDER[a.Date] ?? 99) - (DAY_ORDER[b.Date] ?? 99));

// UpComingExam: Date เป็นวันที่ เช่น "13/3/2569" (พ.ศ.)
const parseThaiDate = (str) => {
    if (!str) return new Date(9999, 0, 1);
    const [d, m, y] = str.split('/');
    return new Date(parseInt(y) - 543, parseInt(m) - 1, parseInt(d));
};

const sortByThaiDate = (list) =>
    [...list].sort((a, b) => parseThaiDate(a.Date) - parseThaiDate(b.Date));

const Timetable = ({ navigation }) => {

    const { userID } = useContext(PlannerContext);
    const [classList_Upcoming, setClassList_Upcoming] = useState([]);
    const [classList, setClassList] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    
    const fetchUpcoming = async () => {
        try {
            const q = query(collection(db, "UpComingExam"), where("userid", "==", userID));
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    
    const fetchNextClass = async () => {
        try {
            const q = query(collection(db, "NextClass"), where("userid", "==", userID));
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    
    const loadAll = async () => {
        const [upcoming, next] = await Promise.all([fetchUpcoming(), fetchNextClass()]);
        setClassList_Upcoming(sortByThaiDate(upcoming));
        setClassList(sortByDayName(next));
    };

    
    useEffect(() => {
        loadAll();
    }, [userID]);

    
    useFocusEffect(
        useCallback(() => {
            loadAll();
        }, [userID])
    );

    
    const onRefresh = async () => {
        setRefreshing(true);
        await loadAll();
        setRefreshing(false);
    };

    
    const renderUpcomingCard = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('EditPage', { item, collection: 'UpComingExam' })}
            activeOpacity={0.8}
        >
            <View style={styles.card}>
                <View style={styles.cardLeft}>
                    <Text style={styles.cardDate}>{item.Date}</Text>
                    <Text style={styles.cardTime}>{item.Time_Start} - {item.Time_End}</Text>
                </View>
                <View style={styles.cardRight}>
                    <Text style={styles.cardSubject}>{item.Subject_Name}</Text>
                    {item.Room ? <Text style={styles.cardDetail}>🏫 {item.Room}</Text> : null}
                </View>
            </View>
        </TouchableOpacity>
    );

    // Card สำหรับ NextClass
    const renderClassCard = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('EditPage', { item, collection: 'NextClass' })}
            activeOpacity={0.8}
        >
            <View style={styles.card}>
                <View style={styles.cardLeft}>
                    <Text style={styles.cardDate}>{item.Date}</Text>
                    <Text style={styles.cardTime}>{item.Time_Start} - {item.Time_End}</Text>
                </View>
                <View style={styles.cardRight}>
                    <Text style={styles.cardSubject}>{item.Subject_Name}</Text>
                    {item.Room ? <Text style={styles.cardDetail}>🏫 {item.Room}</Text> : null}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#f0f4f4' }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#006664']} />
            }
        >
            <View style={styles.container}>

                <Text style={styles.pageTitle}>ตารางเรียน / สอบ</Text>

                {/* Upcoming Exam */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}> ตารางสอบ</Text>
                    <FlatList
                        data={classList_Upcoming}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        renderItem={renderUpcomingCard}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>ไม่มีข้อมูลสอบ</Text>
                        }
                    />
                </View>

                {/* Next Class */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}> ตารางเรียน</Text>
                    <FlatList
                        data={classList}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        renderItem={renderClassCard}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>ไม่มีข้อมูลวิชาเรียนในฐานข้อมูล</Text>
                        }
                    />
                </View>

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 40,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#006664',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#006664',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#006664',
        marginBottom: 10,
        marginLeft: 5,
    },
    card: {
        backgroundColor: '#f7fafa',
        borderRadius: 15,
        marginTop: 8,
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    cardLeft: {
        backgroundColor: '#006664',
        width: 100,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardDate: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cardTime: {
        fontSize: 12,
        color: '#cef5f3',
        marginTop: 4,
        textAlign: 'center',
    },
    cardRight: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    cardSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cardDetail: {
        fontSize: 13,
        color: '#777',
        marginTop: 4,
    },
    emptyText: {
        color: '#aaa',
        textAlign: 'center',
        paddingVertical: 15,
    },
});

export default Timetable;