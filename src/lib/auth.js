import { auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect
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
    
    try {
        const result = await signInWithPopup(auth, provider);
        return result;
    } catch (error) {
        // Bu adres Firebase'in izinli alan adları listesinde yok: yönlendirme de aynı sebeple çalışmaz
        if (error.code === 'auth/unauthorized-domain') {
            console.error("Google girişi için yetkisiz alan adı:", window.location.hostname);
            const e = new Error(`Bu adres (${window.location.hostname}) Google girişi için yetkili değil. E-posta ve şifreyle giriş yapın ya da adresi Firebase'de "Authorized domains" listesine ekleyin.`);
            e.code = error.code;
            throw e;
        }
        // Açılır pencere engellendi ya da bu ortamda desteklenmiyor (ör. mobil uygulama): yönlendirmeyle dene
        if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(error.code)) {
            localStorage.setItem('_auth_redirecting', 'true');
            return await signInWithRedirect(auth, provider);
        }
        throw error;
    }
};

// Çıkış
export const logoutUser = async () => {
    localStorage.removeItem('_is_admin');
    return await signOut(auth);
};

// Durum dinleyici
export const subscribeToAuth = (callback) => {
    return onAuthStateChanged(auth, callback);
};