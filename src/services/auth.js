import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC6Og0HnsPYakcW8glklBp1m4nq0HnUHOw",
    authDomain: "lifetimelabs-online.firebaseapp.com",
    projectId: "lifetimelabs-online",
    storageBucket: "lifetimelabs-online.firebasestorage.app",
    messagingSenderId: "448707262284",
    appId: "1:448707262284:web:ff0cf94b3128aceac581e9"
};

// Inicializamos una sola vez
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- Funciones ---
export const loginWithEmail = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const registerWithEmail = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
};

export const saveUserData = async (user, additionalData = {}) => {
    const userRef = doc(db, "users", user.uid);
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Usuario Nuevo",
        photoURL: user.photoURL || "",
        lastLogin: new Date(),
        role: "student",
        ...additionalData
    };
    await setDoc(userRef, userData, { merge: true });
    return userData;
};