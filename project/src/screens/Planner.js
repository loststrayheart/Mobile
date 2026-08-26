import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { db } from "../../FirebaseConfig";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";

const Planner = ({ navigation }) => {
    const [activities, setActivities] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        // ดึงทั้ง Activities และ Checklists
        const actSnap = await getDocs(collection(db, "Activities"));
        const taskSnap = await getDocs(collection(db, "Checklists"));
        
        setActivities(actSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTasks(taskSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    const addTask = async () => {
        if (!newTask) return;
        await addDoc(collection(db, "Checklists"), { text: newTask, checked: false });
        setNewTask("");
        fetchData(); // Refresh ข้อมูล
    };

    const toggleTask = async (item) => {
        const taskRef = doc(db, "Checklists", item.id);
        await updateDoc(taskRef, { checked: !item.checked });
        fetchData();
    };
    //Read
    useEffect(() => { fetchData(); }, []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={styles.headerTitle}>My Planner</Text>

            {/* ส่วนกิจกรรม */}
            <Text style={styles.sectionTitle}>Activity Schedule</Text>
            {activities.map(item => (
                <View key={item.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{item.infoname}</Text>
                    <Text style={styles.cardTime}>{item.startHour}:{item.startMinute} - {item.endHour}:{item.endMinute}</Text>
                </View>
            ))}

            {/* ส่วน Checklist */}
            <Text style={styles.sectionTitle}>Daily Checklist</Text>
            <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="เพิ่มงานใหม่..." value={newTask} onChangeText={setNewTask} />
                <TouchableOpacity style={styles.addBtn} onPress={addTask}><Text style={{color:'white'}}>เพิ่ม</Text></TouchableOpacity>
            </View>
            {tasks.map(item => (
                <Pressable key={item.id} style={styles.checkItem} onPress={() => toggleTask(item)}>
                    <View style={[styles.checkbox, item.checked && {backgroundColor:'#006664'}]} />
                    <Text style={item.checked && {textDecorationLine:'line-through', color:'gray'}}>{item.text}</Text>
                </Pressable>
            ))}

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Add')}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0', padding: 20, paddingTop: 60 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#006664', marginBottom: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#006664', marginTop: 20, marginBottom: 10 },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 5, borderLeftColor: '#006664' },
    cardTitle: { fontWeight: 'bold' },
    inputContainer: { flexDirection: 'row', marginBottom: 10 },
    input: { flex: 1, backgroundColor: 'white', padding: 10, borderRadius: 5 },
    addBtn: { backgroundColor: '#006664', padding: 10, borderRadius: 5, marginLeft: 5 },
    checkItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 5 },
    checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#006664', marginRight: 10, borderRadius: 4 },
    fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#ff7f50', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    fabText: { fontSize: 30, color: 'white' }
});

export default Planner;