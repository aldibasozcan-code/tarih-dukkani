import { auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Kullanıcı kayıt
export const registerUser = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

// Kullanıcı giriş
export const loginUser = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

// Çıkış
export const logoutUser = async () => {
    return await signOut(auth);
};

// Durum dinleyici
export const subscribeToAuth = (callback) => {
    return onAuthStateChanged(auth, callback);
};