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
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    
    try {
        // Pop-up bazen domain/cookie engellerine takılabiliyor, Redirect daha garantidir.
        // Ancak kullanıcı deneyimi için önce popup deneyip hata olursa redirect'e düşebiliriz.
        // Şimdilik doğrudan Popup hatası alanlar için daha sağlam bir yapı kuruyoruz.
        return await signInWithPopup(auth, provider);
    } catch (error) {
        if (error.code === 'auth/unauthorized-domain') {
            console.error("Domain yetkisi hatası! Redirect yöntemine geçiliyor...", window.location.hostname);
            localStorage.setItem('_auth_redirecting', 'true');
            return await signInWithRedirect(auth, provider);
        }
        throw error;
    }
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