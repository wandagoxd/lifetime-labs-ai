import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    mountUnifiedLayout,
    setUnifiedHeaderAuth
} from "../components/unified-layout.js";
import { renderSenecaCabra } from "../components/seneca-cabra.js";
import { db, subscribeToAuthChanges } from "../services/auth.js";

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

    subscribeToAuthChanges(async (user) => {
        const email = user?.email || "invitado";
        setUnifiedHeaderAuth(`Sesion: ${email}`, "profile-auth");
        setProfileEmail(email);
        await syncProfileFromFirestore(user);
    });
}

document.addEventListener("DOMContentLoaded", initProfilePage);
