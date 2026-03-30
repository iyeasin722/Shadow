// Firebase কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyDk2_bo8CPJKhtdTEcG2SnpViSNsxCcdDQ",
  authDomain: "iyeasin.firebaseapp.com",
  databaseURL: "https://iyeasin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iyeasin",
  storageBucket: "iyeasin.firebasestorage.app", // 👈 Storage Bucket
  messagingSenderId: "496731961702",
  appId: "1:496731961702:web:68d6aeb6088fc0809af0a7"
};

// Initialize Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

console.log("🔥 Firebase Ready!");
console.log("✅ Auth ready");
console.log("✅ Database ready");
console.log("⏳ Storage ready (Blaze plan required for upload)");

// Storage চেক
window.checkStorageStatus = async () => {
  try {
    const testRef = storage.ref('test.txt');
    console.log("✅ Storage is accessible");
    return true;
  } catch (e) {
    console.warn("⚠️ Storage needs Blaze plan upgrade");
    console.log("📌 To use Storage, upgrade to Blaze plan in Firebase Console");
    return false;
  }
};