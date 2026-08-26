import React,{useContext,useEffect,useState} from "react";
import { View, Text , StyleSheet,TouchableOpacity,ScrollView,FlatList} from "react-native";
import { db } from "../../FirebaseConfig";
import { addDoc,query,collection,getDoc,updateDoc,deleteDoc,doc,where,getDocs } from "firebase/firestore";
import { PlannerContext } from "../context/PlannerContext";



const Timetable = () => {

    const{userID} = useContext(PlannerContext);

    const [classList, setClassList] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const data = await handle_all(userID);
            setClassList(data);
        };
        loadData();
    }, []);

    //handle_query

    const handle_all = async () => {
        try {
            const classRef = collection(db, "NextClass");
            const q = query(classRef, where("userid", "==", userID));


            const querySnapshot = await getDocs(q);

            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            console.log("ดึงข้อมูลสำเร็จ:", classes);

            setClassList(classes);

            return classes;

        } catch (error) {
            console.error("Error fetching classes: ", error);
            return [];
        }

        

        
    }

    const handle_mon = async () => {
        try {
            const classRef = collection(db, "NextClass");

            
            const q = query(
                classRef,
                where("userid", "==", userID),
                where("Date", "==", 'Monday')
            );

            const querySnapshot = await getDocs(q);

            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            console.log(`ดึงข้อมูล Monday สำเร็จ:`, classes);

            setClassList(classes);

            return classes;
        } catch (error) {
            console.error("Error fetching classes: ", error);
            return [];
        }
    }

    const handle_tue = async () => {
        try {
            const classRef = collection(db, "NextClass");

            
            const q = query(
                classRef,
                where("userid", "==", userID),
                where("Date", "==", 'Tuesday')
            );

            const querySnapshot = await getDocs(q);

            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            console.log(`ดึงข้อมูล Monday สำเร็จ:`, classes);

            setClassList(classes);

            return classes;
        } catch (error) {
            console.error("Error fetching classes: ", error);
            return [];
        }
    }

    const handle_wed = async () => {
        try {
            const classRef = collection(db, "NextClass");

            
            const q = query(
                classRef,
                where("userid", "==", userID),
                where("Date", "==", 'Wednesday')
            );

            const querySnapshot = await getDocs(q);

            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            console.log(`ดึงข้อมูล Monday สำเร็จ:`, classes);

            setClassList(classes);

            return classes;
        } catch (error) {
            console.error("Error fetching classes: ", error);
            return [];
        }
    }

    const handle_thu = async () => {
        try {
            const classRef = collection(db, "NextClass");

            
            const q = query(
                classRef,
                where("userid", "==", userID),
                where("Date", "==", 'Thursday')
            );

            const querySnapshot = await getDocs(q);

            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            console.log(`ดึงข้อมูล Monday สำเร็จ:`, classes);

            setClassList(classes);

            return classes;
        } catch (error) {
            console.error("Error fetching classes: ", error);
            return [];
        }
    }

    const handle_fri = async () => {
        try {
            const classRef = collection(db, "NextClass");

            
            const q = query(
                classRef,
                where("userid", "==", userID),
                where("Date", "==", 'Friday')
            );

            const querySnapshot = await getDocs(q);

            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            console.log(`ดึงข้อมูล Monday สำเร็จ:`, classes);

            setClassList(classes);

            return classes;
        } catch (error) {
            console.error("Error fetching classes: ", error);
            return [];
        }
    }

    const handle_sat = async () => {
        try {
            const classRef = collection(db, "NextClass");

            
            const q = query(
                classRef,
                where("userid", "==", userID),
                where("Date", "==", 'Saturnday')
            );

            const querySnapshot = await getDocs(q);

            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            console.log(`ดึงข้อมูล Monday สำเร็จ:`, classes);

            setClassList(classes);

            return classes;
        } catch (error) {
            console.error("Error fetching classes: ", error);
            return [];
        }
    }

    const handle_sun = async () => {
        try {
            const classRef = collection(db, "NextClass");

            
            const q = query(
                classRef,
                where("userid", "==", userID),
                where("Date", "==", 'Sunday')
            );

            const querySnapshot = await getDocs(q);

            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            console.log(`ดึงข้อมูล Monday สำเร็จ:`, classes);

            setClassList(classes);

            return classes;
        } catch (error) {
            console.error("Error fetching classes: ", error);
            return [];
        }
    }

    const handle_refresh = async () =>{
        const data = await handle_all();
        setClassList(data);
    }

    return (
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <View style={{...styles.Box,alignItems:'center',justifyContent:'center'}}>
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity onPress={handle_all}>
                        <View style={styles.Box_Day}>
                            <Text>
                                All
                            </Text>
                        </View>
                    </TouchableOpacity>
                <TouchableOpacity onPress={handle_refresh}>
                        <View style={styles.Box_Day}>
                            <Text>
                                Refresh
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                
                <View style={{ width: 300, height: 100 ,justifyContent:'center',alignItems:'center',flexDirection:'row',borderWidth:0}}>
                    <TouchableOpacity onPress={handle_mon}>
                        <View style={styles.Box_Day}>
                            <Text>
                                Monday
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handle_tue}>
                        <View style={styles.Box_Day}>
                            <Text>
                                Tuesday
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handle_wed}>
                        <View style={styles.Box_Day}>
                            <Text>
                                Wednesday
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handle_thu}>
                        <View style={styles.Box_Day}>
                            <Text>
                                Thursday
                            </Text>
                        </View>
                    </TouchableOpacity >
                </View>
                <View style={{ width: 300, height: 100 ,justifyContent:'center',alignItems:'center',flexDirection:'row',borderWidth:0}}>
                    <TouchableOpacity onPress={handle_fri}>
                        <View style={styles.Box_Day}>
                            <Text>
                                Friday
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handle_sat}>
                        <View style={styles.Box_Day}>
                            <Text>
                                Saturnday
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handle_sun}>
                        <View style={styles.Box_Day}>
                            <Text>
                                Sunday
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                
                
            </View>
            <View style={{ ...styles.Box, alignItems: 'center' }}>
                <FlatList
                    data={classList} // ข้อมูลจาก useState ที่ดึงมาจาก handle_query
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (

                        <View style={{ ...styles.dataItem, backgroundColor: 'lightgray', marginTop: 5, borderRadius: 15, height: 60 }}>
                            <Text style={{ ...styles.data, marginLeft: 10, marginTop: 5 }}>
                                {item.Subject_Name}
                            </Text>
                            <Text style={{ fontSize: 12, color: 'gray', marginLeft: 5, marginTop: 0 }}>
                                เวลา: {item.Time_Start} - {item.Time_End}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text>ไม่มีข้อมูลวิชาเรียนในฐานข้อมูล</Text>}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    Box:{
        width:350,
        height:300,
        backgroundColor:'#fff',
        elevation:22,
        shadowColor:'#006664',
        marginTop:20,
        borderRadius:25
    },
    Box_Day: {
        backgroundColor: 'lightgray', 
        width: 75, 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 30,
        borderRadius:12,
        marginTop:10,
        marginLeft:10
    }
})

export default Timetable
