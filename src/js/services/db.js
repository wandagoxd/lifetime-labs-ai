import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./auth.js";

// Guarda las respuestas del Test de Orígenes en Firestore
export const saveOriginsResults = async (userId, userResponses, currentUserEmail) => {
    try {
        const userRef = doc(db, "users", userId);
        const payload = {
            email: currentUserEmail || "no-email", // Fail-safe
            originsTest: {
                responses: userResponses,
                completedAt: new Date(),
                status: "completed"
            }
        };
        await setDoc(userRef, payload, { merge: true });
        console.log("Resultados guardados exitosamente.");
        return true;
    } catch (err) {
        console.error("Error al guardar los resultados:", err);
        throw err;
    }
};
