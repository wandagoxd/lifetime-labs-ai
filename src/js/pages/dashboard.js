import { subscribeToAuthChanges } from "../services/auth.js";

subscribeToAuthChanges((user) => {
    if (!user) {
        // Redirigir al login si no hay sesión activa
        window.location.href = "login.html";
    }
});
