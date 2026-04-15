import { registerWithEmail, saveUserData } from "../services/auth.js";

const signupForm = document.getElementById("signup-form");
const btnSignup = document.getElementById("btn-signup");
const errorMsg = document.getElementById("error-msg");
const emailInput = document.getElementById("input-email");
const passwordInput = document.getElementById("input-password");

const showError = (msg) => {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
};

const clearError = () => {
    errorMsg.textContent = "";
    errorMsg.style.display = "none";
};

const setLoading = (isLoading) => {
    if (isLoading) {
        btnSignup.style.opacity = "0.7";
        btnSignup.disabled = true;
    } else {
        btnSignup.style.opacity = "1";
        btnSignup.disabled = false;
    }
};

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        showError("Por favor ingresa tu email y contraseña.");
        return;
    }
    
    if (password.length < 6) {
        showError("La contraseña debe tener al menos 6 caracteres.");
        return;
    }
    
    try {
        setLoading(true);
        const user = await registerWithEmail(email, password);
        await saveUserData(user);
        window.location.href = "labs.html"; // Redirect where appropriate
    } catch (err) {
        console.error(err);
        if (err.code === "auth/email-already-in-use") {
            showError("El email ya está en uso.");
        } else {
            showError("Error al crear la cuenta.");
        }
        setLoading(false);
    }
});
