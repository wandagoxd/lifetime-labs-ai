import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    mountUnifiedLayout,
    setUnifiedHeaderAuth
} from "../components/unified-layout.js";
import { renderSenecaCabra } from "../components/seneca-cabra.js";
import { db, subscribeToAuthChanges, logoutUser, deleteUserAccount } from "../services/auth.js";

function safeMetricValue(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.round(parsed);
}

function setProfileEmail(emailText) {
    const emailNode = document.getElementById("profile-user-email");
    if (emailNode) {
        emailNode.textContent = emailText || "Sesion: invitado";
    }
}

function setProfileMetrics({ streakDays = 0, evolutionPercent = 0 } = {}) {
    const streakNode = document.getElementById("profile-streak-days");
    const evolutionNode = document.getElementById("profile-evolution-percent");

    if (streakNode) streakNode.textContent = `${safeMetricValue(streakDays)}`;
    if (evolutionNode) evolutionNode.textContent = `${safeMetricValue(evolutionPercent)}`;
}

async function syncProfileFromFirestore(user) {
    if (!user?.uid) {
        setProfileMetrics({ streakDays: 0, evolutionPercent: 0 });
        return;
    }

    try {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        const data = snapshot.exists() ? snapshot.data() : {};
        setProfileMetrics({
            streakDays: data?.streak_days ?? 0,
            evolutionPercent: data?.evolution_percent ?? 0
        });

        const langSelect = document.getElementById("language-select");
        if (langSelect && data?.language_pref) {
            langSelect.value = data.language_pref;
        }

    } catch (error) {
        console.error("No se pudo leer perfil en Firestore:", error);
        setProfileMetrics({ streakDays: 0, evolutionPercent: 0 });
    }
}

function initProfilePage() {
    mountUnifiedLayout({
        title: "Perfil",
        activeNav: "profile",
        authId: "profile-auth",
        authText: "Sesion: invitado"
    });
    renderSenecaCabra("seneca-cabra-slot");

    let currentUser = null;

    subscribeToAuthChanges(async (user) => {
        currentUser = user;
        const email = user?.email || "invitado";
        setUnifiedHeaderAuth(`Sesion: ${email}`, "profile-auth");
        setProfileEmail(email);
        await syncProfileFromFirestore(user);
    });

    const langSelect = document.getElementById("language-select");
    if (langSelect) {
        langSelect.addEventListener("change", async (e) => {
            if (!currentUser) return;
            try {
                await setDoc(doc(db, "users", currentUser.uid), {
                    language_pref: e.target.value
                }, { merge: true });
            } catch (err) {
                console.error("Error saving language", err);
            }
        });
    }

    const btnDelete = document.getElementById("btn-delete-account");
    if (btnDelete) {
        btnDelete.addEventListener("click", async () => {
            if (!currentUser) return;
            const confirmDelete = confirm("¿Estás súper seguro? Esto borrará toda tu información y laboratorios.");
            if (!confirmDelete) return;

            try {
                btnDelete.textContent = "Eliminando...";
                await deleteUserAccount(currentUser);
                window.location.href = "index.html";
            } catch (err) {
                console.error("Error deleting account:", err);
                alert("Hubo un error borrando tu cuenta. Asegúrate de haber iniciado sesión recientemente.");
                btnDelete.textContent = "Eliminar Mi Cuenta (Test)";
            }
        });
    }

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            try {
                await logoutUser();
                window.location.href = "index.html"; // Redirect to landing
            } catch (err) {
                console.error("Error signing out:", err);
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", initProfilePage);
