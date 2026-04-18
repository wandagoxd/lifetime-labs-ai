import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./auth.js";

// Guarda las respuestas del Test de Orígenes en Firestore
export const saveOriginsResults = async (userId, userResponses, currentUserEmail) => {
    try {
        const response = await fetch("http://127.0.0.1:5001/lifetimelabs-online/us-central1/submitStageOne", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId, answers: userResponses })
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        console.log("Resultados contextuales (Stage 1) guardados exitosamente.");
        return true;
    } catch (err) {
        console.error("Error al guardar los resultados del Stage 1:", err);
        throw err;
    }
};
