import {
    doc,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./auth.js";

export async function initializeLabSession(userId, sessionId) {
    if (!userId || !sessionId) return;

    const sessionRef = doc(db, "users", userId, "lab_sessions", sessionId);
    await setDoc(
        sessionRef,
        {
            sessionId,
            status: "in_progress",
            startedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            totalQuestions: 23,
            answeredCount: 0,
            turns: []
        },
        { merge: true }
    );
}

export async function persistLabTurn(userId, sessionId, turn) {
    if (!userId || !sessionId) return;

    const sessionRef = doc(db, "users", userId, "lab_sessions", sessionId);
    await setDoc(
        sessionRef,
        {
            turns: turn ? [...(turn.previousTurns || []), turn.currentTurn] : [],
            answeredCount: turn?.answeredCount || 0,
            updatedAt: serverTimestamp()
        },
        { merge: true }
    );
}

export async function persistLabSnapshot(userId, sessionId, snapshot) {
    if (!userId || !sessionId) return;

    const sessionRef = doc(db, "users", userId, "lab_sessions", sessionId);
    await setDoc(
        sessionRef,
        {
            answeredCount: snapshot.answeredCount,
            activeQuestionNumber: snapshot.activeQuestionNumber,
            activePhase: snapshot.activePhase,
            currentQuestion: snapshot.currentQuestion,
            fallbackActive: snapshot.fallbackActive,
            updatedAt: serverTimestamp()
        },
        { merge: true }
    );
}

export async function savePotentialReport(userId, report, metadata = {}) {
    if (!userId) return;

    const reportRef = doc(db, "reports", userId);
    await setDoc(
        reportRef,
        {
            ...report,
            userId,
            generatedAt: serverTimestamp(),
            metadata: {
                source: "labs-openai-streaming",
                ...metadata
            }
        },
        { merge: true }
    );

    const sessionRef = doc(db, "users", userId, "lab_sessions", metadata.sessionId || "latest");
    await setDoc(
        sessionRef,
        {
            status: "completed",
            reportRef: `reports/${userId}`,
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        },
        { merge: true }
    );
}
