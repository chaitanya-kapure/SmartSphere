import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔥 your config
const firebaseConfig = {
  apiKey: "AIzaSyCTeVxGAtWDvzpOR1tTfK1J2j0PlUNURqg",
  authDomain: "smartspherecity.firebaseapp.com",
  projectId: "smartspherecity",
  storageBucket: "smartspherecity.firebasestorage.app",
  messagingSenderId: "864297042178",
  appId: "1:864297042178:web:7172643efd4d42f7f4821b"
};

// 🔥 initialize app
const app = initializeApp(firebaseConfig);

// 🔥 THIS LINE WAS MISSING ❌ → now added ✅
export const db = getFirestore(app);