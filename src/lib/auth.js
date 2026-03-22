import { auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Kullanıcı kayıt
export const registerUser = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

// Kullanıcı giriş
export const loginUser = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

// Google ile giriş
export const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // DİKKAT: Google Cloud Console onay ekranında yetkiler eksik olduğu için
    // Takvim izni (scope) satırı geçici olarak yorum satırına alındı.
    // Console ayarları düzeltildiğinde alttaki satır açılacak:
    // provider.addScope('https://www.googleapis.com/auth/calendar.events');
    
    return await signInWithPopup(auth, provider);
};

// Çıkış
export const logoutUser = async () => {
    localStorage.removeItem('_gcal_token'); // Temizle
    return await signOut(auth);
};

// Durum dinleyici
export const subscribeToAuth = (callback) => {
    return onAuthStateChanged(auth, callback);
};