import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for Smart Agricultural Irrigation System
// Project ID: smart-agricultural-eb686
const firebaseConfig = {
  apiKey: "AIzaSyARxiMjQBc9L5HqmygHTGFrnmI7seyK5F0",
  authDomain: "smart-agricultural-eb686.firebaseapp.com",
  projectId: "smart-agricultural-eb686",
  storageBucket: "smart-agricultural-eb686.firebasestorage.app",
  messagingSenderId: "264459463664",
  appId: "1:264459463664:web:8b90a32bf9f93ad6e28b35",
  measurementId: "G-BD44WS64RD"
};

// Initialize Firebase once
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Export Firebase Authentication & Cloud Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
