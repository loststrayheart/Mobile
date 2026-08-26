import React, { useContext, useState,useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity,FlatList } from "react-native";
import { PlannerContext } from "../context/PlannerContext";
import { db } from "../../FirebaseConfig";
import { addDoc,query,collection,getDoc,updateDoc,deleteDoc,doc,where,getDocs } from "firebase/firestore";


const Dashboard = ({ navigation }) => {

    const now = new Date();

    const [day,setDay] = useState(now.getDay())
    const [hour,setHour] = useState(now.getHours())
    const [minute,setMinute] = useState(now.getMinutes())
    const [second,setSecond] = useState(now.getSeconds())

    const {userID} = useContext(PlannerContext);

    const { items } = useContext(PlannerContext);

    const [filter,setFilter] = useState("today");

    const today = new Date();

    const convertDate = (dateString) => {
        return new Date(dateString);
    };
    
    
    const handle_upcoming = () =>{
        return(
            navigation.navigate('Upcoming')
        )
        
    }
    const handle_nextclass = () =>{
        return(
            navigation.navigate('NextClass')
        )
        
    }

    const handle_query = async () => {
        try {
            const classRef = collection(db, "NextClass");
            const q = query(classRef, where("userid", "==", userID));

            
            const querySnapshot = await getDocs(q);

            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            console.log("ดึงข้อมูลสำเร็จ:", classes);
            return classes;
        } catch (error) {
            console.error("Error fetching classes: ", error);
            return [];
        }
    }

    const handle_query_Upcoming = async () => {
        try {
            const classRef = collection(db, "UpComingExam");
            const q = query(classRef, where("userid", "==", userID));

            
            const querySnapshot = await getDocs(q);

            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            console.log("ดึงข้อมูลสำเร็จ:", classes);
            return classes;
        } catch (error) {
            console.error("Error fetching classes: ", error);
            return [];
        }
    }

    const [classList, setClassList] = useState([]);
    const [classList_Upcoming, setClassList_Upcoming] = useState([]);


    useEffect(() => {
        const loadData = async () => {
            const data = await handle_query(userID);
            setClassList(data);
        };
        loadData();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            const data_upcoming = await handle_query_Upcoming(userID);
            setClassList_Upcoming(data_upcoming);
        };
        loadData();
    }, []);

    const getFilteredItems = () => {

        return items.filter(item => {

            const itemDate = convertDate(item.date);

            if(filter === "today"){
                return itemDate.toDateString() === today.toDateString();
            }

            if(filter === "week"){
                const nextWeek = new Date();
                nextWeek.setDate(today.getDate()+7);
                return itemDate >= today && itemDate <= nextWeek;
            }

            if(filter === "month"){
                const nextMonth = new Date();
                nextMonth.setMonth(today.getMonth()+1);
                return itemDate >= today && itemDate <= nextMonth;
            }

            return true;
        })
        .sort((a,b)=>{

            const dateA = new Date(`${a.date}T${a.hour}:${a.minute}`);
            const dateB = new Date(`${b.date}T${b.hour}:${b.minute}`);

            return dateA - dateB;
        });
    };

    const handle_refresh = async () =>{
        const data = await handle_query();
        setClassList(data);

        const data_upcoming =await handle_query_Upcoming(userID);
        setClassList_Upcoming(data_upcoming);

        if(day == 2){
            setDay("Tuesday")
        }

        console.log(`${day} at time ${hour} : ${minute} :${second}`)
    }

    const filteredData = getFilteredItems();

    const nextClass = filteredData[0];

    const handle_today = async () => {
        try {
            const today = new Date();
            // สร้าง String ให้ตรงกับรูปแบบที่คุณบันทึกใน DB (วัน/เดือน/ปี)
            // หมายเหตุ: getMonth() เริ่มที่ 0 จึงต้อง +1
            const dateString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

            console.log("กำลังค้นหาข้อมูลของวันที่:", dateString);

            const classRef = collection(db, "UpComingExam");
            const q = query(
                classRef,
                where("userid", "==", userID),
                where("Date", "==", dateString) // กรองทั้ง user และวันที่
            );

            const querySnapshot = await getDocs(q);
            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            setClassList_Upcoming(classes); // อัปเดต state เพื่อให้ FlatList แสดงผล
        } catch (error) {
            console.error("Error fetching today's exams: ", error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลวันนี้ได้");
        }
    }

    const handle_week = async () => {
        try {
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7); // กำหนดช่วงเวลา 7 วัน

            const classRef = collection(db, "UpComingExam");
            // เรากรองแค่ userid ในฝั่ง Firebase
            const q = query(classRef, where("userid", "==", userID));

            const querySnapshot = await getDocs(q);
            const allData = [];
            querySnapshot.forEach((doc) => {
                allData.push({ id: doc.id, ...doc.data() });
            });

            // กรองวันที่ในฝั่ง Client
            const filtered = allData.filter(item => {
                // สมมติ item.Date เก็บค่าเป็น "10/3/2026"
                const [d, m, y] = item.Date.split('/');
                const itemDate = new Date(y, m - 1, d); // สร้าง Date object จาก String

                return itemDate >= today && itemDate <= nextWeek;
            });

            setClassList_Upcoming(filtered);
        } catch (error) {
            console.error("Error filtering week: ", error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลรายสัปดาห์ได้");
        }
    }

    const handle_one_month = async () => {
        try {
            const today = new Date();
            const nextMonth = new Date();
            
            nextMonth.setMonth(today.getMonth() + 1);

            const classRef = collection(db, "UpComingExam");
            const q = query(classRef, where("userid", "==", userID));

            const querySnapshot = await getDocs(q);
            const allData = [];
            querySnapshot.forEach((doc) => {
                allData.push({ id: doc.id, ...doc.data() });
            });

            // กรองข้อมูล: ต้องอยู่ระหว่างวันนี้ ถึง วันที่ในอีก 1 เดือนข้างหน้า
            const filtered = allData.filter(item => {
                const [d, m, y] = item.Date.split('/');
                const itemDate = new Date(y, m - 1, d);

                return itemDate >= today && itemDate <= nextMonth;
            });

            setClassList_Upcoming(filtered);
        } catch (error) {
            console.error("Error filtering month: ", error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลรายเดือนได้");
        }
    }

    return(
        <View style={styles.container}>

            <View style={styles.filterRow}>

                <TouchableOpacity style={styles.filterBtn} onPress={handle_refresh}>
                    <Text>Refresh</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.filterBtn} onPress={handle_today}>
                    <Text>วันนี้</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.filterBtn} onPress={handle_week}>
                    <Text>7 วัน</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.filterBtn} onPress={handle_one_month}>
                    <Text>1 เดือน</Text>
                </TouchableOpacity>

            </View>

            <View style={{ ...styles.card, height: 280 }}>
                <Text style={styles.title}>Next Class</Text>

                

                <FlatList
                    data={classList} // ข้อมูลจาก useState ที่ดึงมาจาก handle_query
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        
                        <View style={{...styles.dataItem,backgroundColor:'lightgray',marginTop:5,borderRadius:15,height:60}}>
                            <Text style={{...styles.data,marginLeft:10,marginTop:5}}>
                                {item.Subject_Name}
                            </Text>
                            <Text style={{ fontSize: 12, color: 'gray' ,marginLeft:5,marginTop:0}}>
                                เวลา: {item.Time_Start} - {item.Time_End}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text>ไม่มีข้อมูลวิชาเรียนในฐานข้อมูล</Text>}
                />

            </View>

            <View style={{ ...styles.card, height: 280 }}>
                <Text style={styles.title}>Up Coming</Text>
                <FlatList
                    data={classList_Upcoming} // ข้อมูลจาก useState ที่ดึงมาจาก handle_query_upcoming
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
            <View style={{width:390,height:100,flexDirection:'row'}}>
                <TouchableOpacity onPress={handle_upcoming}>
                    <View style={{ width: 390 / 2, height: 100, backgroundColor: '#006664', borderRadius: 30, justifyContent: 'center', alignItems: 'center' ,marginRight:10}}>
                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>Upcoming ADD</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handle_nextclass}>
                    <View style={{ width: 390 / 2, height: 100, backgroundColor: '#006664', borderRadius: 30, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>NextClass ADD</Text>
                    </View>
                </TouchableOpacity>
            </View>
            
            

        </View>
    )
}

const styles= StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#f5f5f5',
        alignItems:'center',
        marginTop:10
    },
    card:{
        width:390,
        backgroundColor:'#fff',
        borderRadius:30,
        padding:20,
        marginBottom:15,
        elevation:15
    },
    title:{
        fontSize:24,
        fontWeight:'bold',
        color:'#006664',
        marginBottom:10
    },
    filterRow:{
        flexDirection:'row',
        marginBottom:15
    },
    filterBtn:{
        backgroundColor:'#ddd',
        padding:10,
        marginHorizontal:5,
        borderRadius:10
    },
    data:{
        fontSize:16,
        marginBottom:5
    }
})

export default Dashboard
