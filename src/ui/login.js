console.log("¡El script de Login cargó correctamente!");
import { loginWithEmail, loginWithGoogle, saveUserData } from "../services/auth.js";

const btnLogin = document.getElementById("btn-login");
const btnGoogle = document.getElementById("btn-google");
const errorMsg = document.getElementById("error-msg");

// ... (tus funciones de showError y clearError se quedan igual)

// --- Login con Google (ACTUALIZADO) ---
btnGoogle.addEventListener("click", async () => {
    clearError();
    try {
        const user = await loginWithGoogle();
        await saveUserData(user); // Guardamos en Firestore
        window.location.href = "index.html"; // Redirigimos
    } catch (err) {
        console.error(err);
        showError("Error al iniciar sesión con Google.");
    }
});

// ... (el resto del código se queda igual)

// --- Bonus: Funcionalidad del botón del "Ojo" para la contraseña ---
document.getElementById("toggle-password").addEventListener("click", (e) => {
    const pwdInput = document.getElementById("input-password");
    if (pwdInput.type === "password") {
        pwdInput.type = "text";
        e.target.textContent = "visibility_off"; // Cambia el icono
    } else {
        pwdInput.type = "password";
        e.target.textContent = "visibility";
    }
});

// services/auth.js (Añade estas importaciones)
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore(app);

// Función para guardar o actualizar el perfil del usuario
export const saveUserData = async (user, additionalData = {}) => {
    const userRef = doc(db, "users", user.uid); // Usamos el UID de Auth como ID del documento

    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Usuario Nuevo",
        photoURL: user.photoURL || "",
        lastLogin: new Date(),
        role: "student", // Valor por defecto
        ...additionalData
    };

    // 'merge: true' evita que borres datos existentes si solo quieres actualizar uno
    await setDoc(userRef, userData, { merge: true });
    return userData;
};

// Dentro del evento click de login
try {
    const user = await loginWithGoogle();
    await saveUserData(user); // Aquí se crea el registro en la base de datos
    window.location.href = "index.html";
} catch (err) {
    showError("Error al procesar los datos.");
}