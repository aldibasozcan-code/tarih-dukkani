import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "tarih-dukkani.firebaseapp.com",
  projectId: "tarih-dukkani",
  storageBucket: "tarih-dukkani.firebasestorage.app",
  messagingSenderId: "996152364130",
  appId: "1:996152364130:web:e3a9a81cb8a05cce7ed53b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
