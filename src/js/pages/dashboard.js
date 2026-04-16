import { subscribeToAuthChanges } from "../services/auth.js";
import { mountUnifiedLayout } from "../components/unified-layout.js";

document.addEventListener("DOMContentLoaded", () => {
    mountUnifiedLayout({
        title: "Hogar",
        activeNav: "home",
        badgeText: "Lifetime Labs"
    });

    subscribeToAuthChanges((user) => {
        if (!user) {
            // Redirigir al login si no hay sesión activa
            window.location.href = "login.html";
        }
    });
});
