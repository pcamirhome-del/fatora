import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, push, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAYdWvZbTTkGlfI6vv02EFUMbw5eeF4UpU",
  authDomain: "sample-firebase-adddi-app.firebaseapp.com",
  databaseURL: "https://sample-firebase-adddi-app-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-adddi-app",
  storageBucket: "sample-firebase-adddi-app.firebasestorage.app",
  messagingSenderId: "1013529485030",
  appId: "1:1013529485030:web:1f1836b6d3d63cd9b42527"
};

// التأكد من عدم تهيئة التطبيق أكثر من مرة لتجنب أخطاء الخدمة
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// تمرير الـ app والـ URL صراحة لضمان توفر خدمة قاعدة البيانات
export const db = getDatabase(app, firebaseConfig.databaseURL);

/**
 * دالة لحفظ سجل المحادثة أو الفواتير في Firebase
 */
export async function saveToCloud(path: string, data: any) {
  try {
    const dataRef = ref(db, path);
    const newItemRef = push(dataRef);
    await set(newItemRef, {
      ...data,
      timestamp: Date.now()
    });
    console.log("✅ تم الحفظ في السحابة بنجاح!");
    return true;
  } catch (error) {
    console.error("❌ فشل الحفظ في السحابة:", error);
    return false;
  }
}