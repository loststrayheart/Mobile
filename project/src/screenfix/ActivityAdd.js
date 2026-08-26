import React, { useContext, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { db } from "../../FirebaseConfig";
import { query, collection, where, getDocs, addDoc } from "firebase/firestore";

const ActivityAdd = ({navigation}) =>{

    const [newTask, setNewTask] = useState("");
    const [activities, setActivities] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {

        setLoading(true);

        const actSnap = await getDocs(collection(db, "Activities"));
        const taskSnap = await getDocs(collection(db, "Checklists"));

        setActivities(actSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTasks(taskSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        setLoading(false);

    };

    const addTask = async () => {

        if (!newTask) return;

        await addDoc(collection(db, "Checklists"), {
            text: newTask,
            checked: false
        });

        setNewTask("");
        fetchData();

    };
    return(
        <View style={{ flex: 1 }}>
            <View style={styles.inputContainer}>
                

                <TextInput
                    style={styles.input}
                    placeholder="เพิ่มงานใหม่..."
                    value={newTask}
                    onChangeText={setNewTask}
                />

                <TouchableOpacity style={styles.addBtn} onPress={addTask}>
                    <Text style={{ color: 'white' }}>เพิ่ม</Text>
                </TouchableOpacity>

            </View>

        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 20,
        paddingTop: 60
    },

    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#006664',
        marginBottom: 10
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#006664',
        marginTop: 20,
        marginBottom: 10
    },

    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#006664'
    },

    activityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    cardTitle: {
        fontWeight: 'bold'
    },

    cardTime: {
        color: '#555'
    },

    deleteBtn: {
        color: 'red',
        fontWeight: 'bold'
    },

    inputContainer: {
        flexDirection: 'row',
        marginBottom: 10
    },

    input: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5
    },

    addBtn: {
        backgroundColor: '#006664',
        padding: 10,
        borderRadius: 5,
        marginLeft: 5
    },

    checkItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 5
    },

    checkItem: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#006664',
        marginRight: 10,
        borderRadius: 4
    },

    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#ff7f50',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },

    fabText: {
        fontSize: 30,
        color: 'white'
    }

});

export default ActivityAdd