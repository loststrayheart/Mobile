import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // สำหรับ React Native แนะนำให้ปิดไว้ก่อนถ้าไม่ได้ตั้งค่าเพิ่ม

const firebaseConfig = {
  apiKey: "AIzaSyDyaZO4yH_POY_ekRsxswhmr2eVPNkPnrM",
  authDomain: "study-d7dfc.firebaseapp.com",
  databaseURL: "https://study-d7dfc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "study-d7dfc",
  storageBucket: "study-d7dfc.firebasestorage.app",
  messagingSenderId: "475567418448",
  appId: "1:475567418448:web:bff4dfbd5cac90f4467555",
  measurementId: "G-NJ6R63CPH1"
};

// ย้ายมาเรียกใช้ข้างล่างหลังจากประกาศค่าแล้ว
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);