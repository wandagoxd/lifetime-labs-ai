import {
    mountUnifiedLayout,
    setUnifiedHeaderActions
} from "../components/unified-layout.js";
import { subscribeToAuthChanges } from "../services/auth.js";

const guestActions = [
    { label: "Iniciar sesión", href: "/login.html", variant: "secondary" },
    { label: "Crear cuenta", href: "/signup.html", variant: "primary" }
];

const authenticatedActions = [
    { label: "Ir a Labs", href: "/labs.html", variant: "primary" }
];

document.addEventListener("DOMContentLoaded", () => {
    mountUnifiedLayout({
        title: "Por qué nosotros",
        activeNav: "why-us",
        headerActions: guestActions
    });

    subscribeToAuthChanges((user) => {
        setUnifiedHeaderActions(user ? authenticatedActions : guestActions);
    });
});
