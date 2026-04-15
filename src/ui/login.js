import { loginWithEmail, loginWithGoogle, saveUserData } from "../services/auth.js";

const btnLogin = document.getElementById("btn-login");
const btnGoogle = document.getElementById("btn-google");
const errorMsg = document.getElementById("error-msg");
const emailInput = document.getElementById("input-email");
const passwordInput = document.getElementById("input-password");
const togglePassword = document.getElementById("toggle-password");

const showError = (msg) => {
    errorMsg.textContent = msg;
    errorMsg.classList.add("show");
};

const clearError = () => {
    errorMsg.textContent = "";
    errorMsg.classList.remove("show");
};

const setLoading = (isLoading) => {
    if (isLoading) {
        btnLogin.classList.add("loading");
        btnLogin.disabled = true;
    } else {
        btnLogin.classList.remove("loading");
        btnLogin.disabled = false;
    }
};

btnLogin.addEventListener("click", async (e) => {
    e.preventDefault();
    clearError();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        showError("Por favor ingresa tu email y contraseña.");
        return;
    }
    
    try {
        setLoading(true);
        const user = await loginWithEmail(email, password);
        await saveUserData(user);
        window.location.href = "labs.html"; // Redirect where appropriate
    } catch (err) {
        console.error(err);
        showError("Email o contraseña incorrectos.");
        setLoading(false);
    }
});

btnGoogle.addEventListener("click", async (e) => {
    e.preventDefault();
    clearError();
    try {
        const user = await loginWithGoogle();
        await saveUserData(user);
        window.location.href = "labs.html";
    } catch (err) {
        console.error(err);
        showError("Error al iniciar sesión con Google.");
    }
});

togglePassword.addEventListener("click", (e) => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        e.target.textContent = "visibility_off";
    } else {
        passwordInput.type = "password";
        e.target.textContent = "visibility";
    }
});