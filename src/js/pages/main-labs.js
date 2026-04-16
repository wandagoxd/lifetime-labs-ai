import { getPhaseMetaByQuestionIndex, TOTAL_INTERACTIONS } from "../lab/phase-config.js";
import {
    COREON_VISUAL_STATES,
    LAB_SCREEN_STATES,
    createLabStateMachine
} from "../lab/state-machine.js";
import { buildFallbackReport } from "../lab/report-schema.js";
import { subscribeToAuthChanges } from "../services/auth.js";
import {
    initializeLabSession,
    persistLabSnapshot,
    persistLabTurn,
    savePotentialReport
} from "../services/lab-db.js";
import { generateLabReport, streamLabQuestion } from "../services/lab-streaming.js";

const LOCAL_RUNTIME_KEY = "ll-labs-runtime-v1";
const TRANSITION_DURATION_MS = 1850;
const THINKING_DURATION_MS = 900;

const dom = {
    coreonShell: document.getElementById("coreon-shell"),
    coreonFeedback: document.getElementById("coreon-feedback"),
    coreonSubstatus: document.getElementById("coreon-substatus"),
    phaseChip: document.getElementById("phase-chip"),
    progressCounter: document.getElementById("progress-counter"),
    progressBar: document.getElementById("progress-bar"),
    transitionOverlay: document.getElementById("transition-overlay"),
    transitionMessage: document.getElementById("transition-message"),
    conversationHistory: document.getElementById("conversation-history"),
    conversationQuestion: document.getElementById("conversation-question"),
    fallbackTag: document.getElementById("fallback-tag"),
    thinkingIndicator: document.getElementById("thinking-indicator"),
    responseForm: document.getElementById("response-form"),
    responseInput: document.getElementById("response-input"),
    submitButton: document.getElementById("submit-response"),
    reportContainer: document.getElementById("report-container"),
    reportSummary: document.getElementById("report-summary"),
    reportStrengths: document.getElementById("report-strengths"),
    reportCareers: document.getElementById("report-careers"),
    reportGraduate: document.getElementById("report-graduate"),
    reportAlerts: document.getElementById("report-alerts"),
    reportRoute: document.getElementById("report-route"),
    reportScores: document.getElementById("report-scores"),
    reportCta: document.getElementById("report-cta")
};

const coreonLabels = {
    [COREON_VISUAL_STATES.ACTIVATION]: "Coreon activando sensores del laboratorio...",
    [COREON_VISUAL_STATES.ANALYSIS]: "Analizando patrones academicos y resiliencia...",
    [COREON_VISUAL_STATES.WRITING]: "Sintetizando la siguiente pregunta en tiempo real...",
    [COREON_VISUAL_STATES.IDLE]: "Listo para registrar tu siguiente respuesta.",
    [COREON_VISUAL_STATES.TRANSITION]: "Moviendo el laboratorio al siguiente bloque cognitivo...",
    [COREON_VISUAL_STATES.SUCCESS]: "Reporte de Potencial completado. Ikigai detectado."
};

let currentUser = null;
let isBootstrapped = false;

const runtimeSnapshot = readRuntimeSnapshot();
const sessionId = runtimeSnapshot?.sessionId || `lab-${Date.now()}`;

const machine = createLabStateMachine({
    sessionId,
    turns: runtimeSnapshot?.turns || [],
    answeredCount: runtimeSnapshot?.answeredCount || 0,
    activeQuestionNumber: runtimeSnapshot?.activeQuestionNumber || 1,
    activePhase:
        runtimeSnapshot?.activePhase || getPhaseMetaByQuestionIndex(runtimeSnapshot?.answeredCount || 0),
    lastValidQuestion: runtimeSnapshot?.lastValidQuestion || "",
    report: runtimeSnapshot?.report || null,
    screenState: runtimeSnapshot?.report ? LAB_SCREEN_STATES.COMPLETED : LAB_SCREEN_STATES.INIT,
    visualState: runtimeSnapshot?.report ? COREON_VISUAL_STATES.SUCCESS : COREON_VISUAL_STATES.ACTIVATION
});

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function readOriginsPayload() {
    try {
        const raw = localStorage.getItem("ll-origins-session");
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (error) {
        console.warn("No se pudo leer estado local de orígenes.", error);
        return null;
    }
}

function readRuntimeSnapshot() {
    try {
        const raw = localStorage.getItem(LOCAL_RUNTIME_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (error) {
        console.warn("No se pudo leer snapshot local del laboratorio.", error);
        return null;
    }
}

function persistRuntimeSnapshot(state) {
    try {
        const snapshot = {
            sessionId: state.sessionId,
            turns: state.turns,
            answeredCount: state.answeredCount,
            activeQuestionNumber: state.activeQuestionNumber,
            activePhase: state.activePhase,
            lastValidQuestion: state.lastValidQuestion,
            report: state.report || null
        };
        localStorage.setItem(LOCAL_RUNTIME_KEY, JSON.stringify(snapshot));
    } catch (error) {
        console.warn("No se pudo guardar snapshot local del laboratorio.", error);
    }
}

function clearRuntimeSnapshot() {
    localStorage.removeItem(LOCAL_RUNTIME_KEY);
}

function getProgressWidth(answeredCount) {
    const width = Math.max(4, Math.round((answeredCount / TOTAL_INTERACTIONS) * 100));
    return `${Math.min(width, 100)}%`;
}

function applyCoreonVisualState(visualState) {
    if (!dom.coreonShell) return;

    dom.coreonShell.classList.remove(
        "coreon-state-activation",
        "coreon-state-analysis",
        "coreon-state-writing",
        "coreon-state-idle",
        "coreon-state-transition",
        "coreon-state-success"
    );
    dom.coreonShell.classList.add(`coreon-state-${visualState}`);
}

function renderHistoryTurns(turns = []) {
    if (!dom.conversationHistory) return;

    dom.conversationHistory.innerHTML = turns
        .map(
            (turn) => `
            <article class="lab-band">
                <p class="lab-band__meta">Bloque ${escapeHtml(turn.questionNumber)} · ${escapeHtml(turn.phaseLabel)}</p>
                <p class="lab-band__question">${escapeHtml(turn.question)}</p>
                <p class="lab-band__answer">${escapeHtml(turn.answer)}</p>
            </article>
        `
        )
        .join("");
}

function renderCurrentQuestion(state) {
    if (!dom.conversationQuestion || !dom.fallbackTag) return;

    const text = escapeHtml(state.streamingText || state.currentQuestion || "");
    const caret = state.isStreaming ? '<span class="typing-caret">|</span>' : "";
    dom.conversationQuestion.innerHTML = text
        ? `<p class="question-text">${text}${caret}</p>`
        : `<p class="question-placeholder">Coreon está calibrando la siguiente pregunta...</p>`;

    dom.fallbackTag.classList.toggle("hidden", !state.fallbackActive);
}

function renderThinking(state) {
    if (!dom.thinkingIndicator) return;
    dom.thinkingIndicator.classList.toggle("hidden", !(state.isThinking || state.isStreaming));
}

function renderProgress(state) {
    if (dom.progressCounter) {
        const currentDisplay = Math.min(state.answeredCount + 1, state.totalQuestions);
        dom.progressCounter.textContent = `${currentDisplay}/${state.totalQuestions}`;
    }
    if (dom.progressBar) {
        dom.progressBar.style.width = getProgressWidth(state.answeredCount);
    }
    if (dom.phaseChip) {
        dom.phaseChip.textContent = `${state.activePhase.phaseLabel} · ${state.activePhase.questionInPhase}/${state.activePhase.totalInPhase}`;
    }
}

function renderTransition(state) {
    if (!dom.transitionOverlay || !dom.transitionMessage) return;

    const shouldShow = state.screenState === LAB_SCREEN_STATES.TRANSITION;
    dom.transitionOverlay.classList.toggle("hidden", !shouldShow);
    dom.transitionMessage.textContent = state.transitionMessage;
}

function renderCoreonCopy(state) {
    if (dom.coreonFeedback) {
        if (state.screenState === LAB_SCREEN_STATES.COMPLETED && state.report?.profile_summary) {
            dom.coreonFeedback.textContent = state.report.profile_summary;
        } else if (state.currentQuestion && !state.isStreaming && state.screenState !== LAB_SCREEN_STATES.COMPLETED) {
            dom.coreonFeedback.textContent = state.currentQuestion;
        } else {
            dom.coreonFeedback.textContent = coreonLabels[state.visualState];
        }
    }
    if (dom.coreonSubstatus) {
        dom.coreonSubstatus.textContent = coreonLabels[state.visualState];
    }
}

function renderInput(state) {
    if (!dom.responseInput || !dom.submitButton || !dom.responseForm) return;

    dom.responseForm.classList.toggle("hidden", state.screenState === LAB_SCREEN_STATES.COMPLETED);

    const allowInput = state.isInputEnabled && state.screenState !== LAB_SCREEN_STATES.COMPLETED;
    dom.responseInput.disabled = !allowInput;
    dom.submitButton.disabled = !allowInput;
    dom.responseForm.classList.toggle("opacity-50", !allowInput);
}

function renderReport(state) {
    if (!dom.reportContainer) return;

    const reportReady = state.screenState === LAB_SCREEN_STATES.COMPLETED && !!state.report;
    dom.reportContainer.classList.toggle("hidden", !reportReady);
    if (!reportReady) return;

    const report = state.report;
    if (dom.reportSummary) {
        dom.reportSummary.textContent = report.profile_summary || "";
    }
    if (dom.reportStrengths) {
        dom.reportStrengths.innerHTML = (report.top_strengths || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("");
    }
    if (dom.reportCareers) {
        dom.reportCareers.innerHTML = (report.career_matches || [])
            .map(
                (career) => `
                <article class="career-match">
                    <p class="career-match__name">${escapeHtml(career.name)}</p>
                    <p class="career-match__score">${Math.round(Number(career.score || 0))}%</p>
                    <p class="career-match__reason">${escapeHtml(career.reason)}</p>
                </article>
            `
            )
            .join("");
    }
    if (dom.reportGraduate) {
        dom.reportGraduate.innerHTML = `
            <p><strong>${Math.round(Number(report.graduate_similarity?.match_percentage || 0))}%</strong> de similitud con egresados de <strong>${escapeHtml(report.graduate_similarity?.career || "-")}</strong>.</p>
            <p>Sector: ${escapeHtml(report.graduate_similarity?.sector || "-")}</p>
            <p>${escapeHtml(report.graduate_similarity?.insight || "")}</p>
        `;
    }
    if (dom.reportAlerts) {
        dom.reportAlerts.innerHTML = (report.academic_alerts || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("");
    }
    if (dom.reportRoute) {
        dom.reportRoute.innerHTML = (report.recommended_route || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("");
    }
    if (dom.reportScores) {
        const scoreMap = report.visual_competency_scores || {};
        dom.reportScores.innerHTML = `
            <div><span>Pensamiento crítico</span><strong>${Math.round(Number(scoreMap.pensamiento_critico || 0))}</strong></div>
            <div><span>Empatía</span><strong>${Math.round(Number(scoreMap.empatia || 0))}</strong></div>
            <div><span>Análisis técnico</span><strong>${Math.round(Number(scoreMap.analisis_tecnico || 0))}</strong></div>
            <div><span>Creatividad</span><strong>${Math.round(Number(scoreMap.creatividad || 0))}</strong></div>
        `;
    }

    if (dom.reportCta) {
        dom.reportCta.onclick = () => {
            window.location.href = report.bank_redirect_url || "/banco";
        };
    }
}

function render(state) {
    applyCoreonVisualState(state.visualState);
    renderCoreonCopy(state);
    renderProgress(state);
    renderTransition(state);
    renderHistoryTurns(state.turns);
    renderCurrentQuestion(state);
    renderThinking(state);
    renderInput(state);
    renderReport(state);
    persistRuntimeSnapshot(state);
}

function normalizeReport(report, fallbackTurns = []) {
    const fallback = buildFallbackReport(fallbackTurns);
    const merged = {
        ...fallback,
        ...(report || {})
    };

    const normalizedMatches = (merged.career_matches || fallback.career_matches)
        .slice(0, 5)
        .map((career, index) => ({
            id: career.id || fallback.career_matches[index % fallback.career_matches.length].id,
            name: career.name || fallback.career_matches[index % fallback.career_matches.length].name,
            score: Number(career.score || fallback.career_matches[index % fallback.career_matches.length].score),
            reason: career.reason || fallback.career_matches[index % fallback.career_matches.length].reason
        }));

    const matchIds = normalizedMatches.map((career) => career.id);
    const redirectUrl = `/banco?carreras=${matchIds.join(",")}`;

    return {
        profile_summary: merged.profile_summary || fallback.profile_summary,
        top_strengths: merged.top_strengths?.length ? merged.top_strengths : fallback.top_strengths,
        career_matches: normalizedMatches,
        career_match_ids: merged.career_match_ids?.length ? merged.career_match_ids : matchIds,
        graduate_similarity: merged.graduate_similarity || fallback.graduate_similarity,
        academic_alerts: merged.academic_alerts?.length ? merged.academic_alerts : fallback.academic_alerts,
        recommended_route: merged.recommended_route?.length ? merged.recommended_route : fallback.recommended_route,
        visual_competency_scores: merged.visual_competency_scores || fallback.visual_competency_scores,
        bank_redirect_url: merged.bank_redirect_url || redirectUrl
    };
}

async function syncSnapshotToFirestore() {
    const state = machine.getState();
    if (!currentUser?.uid) return;
    await persistLabSnapshot(currentUser.uid, sessionId, state);
}

async function requestNextQuestion() {
    const state = machine.getState();
    if (state.answeredCount >= state.totalQuestions) return;

    const phaseMeta = getPhaseMetaByQuestionIndex(state.answeredCount);
    machine.dispatch({ type: "STREAM_START" });

    try {
        const question = await streamLabQuestion(
            {
                sessionId,
                userId: currentUser?.uid || "guest",
                questionNumber: state.answeredCount + 1,
                totalQuestions: state.totalQuestions,
                phase: phaseMeta,
                turns: state.turns.slice(-8),
                origins: readOriginsPayload()
            },
            {
                onDelta: (delta) => {
                    machine.dispatch({
                        type: "STREAM_DELTA",
                        payload: { delta }
                    });
                }
            }
        );

        machine.dispatch({
            type: "STREAM_COMPLETE",
            payload: { question }
        });
    } catch (error) {
        const snapshot = machine.getState();
        machine.dispatch({
            type: "STREAM_ERROR",
            payload: {
                error: error.message,
                fallbackQuestion: snapshot.lastValidQuestion || phaseMeta.fallbackQuestion
            }
        });
    }

    await syncSnapshotToFirestore();
}

async function buildAndPersistReport() {
    const state = machine.getState();

    try {
        const report = await generateLabReport({
            sessionId,
            userId: currentUser?.uid || "guest",
            turns: state.turns,
            origins: readOriginsPayload()
        });
        const normalizedReport = normalizeReport(report, state.turns);

        if (currentUser?.uid) {
            await savePotentialReport(currentUser.uid, normalizedReport, {
                sessionId,
                totalTurns: state.turns.length
            });
        }

        clearRuntimeSnapshot();
        machine.dispatch({
            type: "REPORT_READY",
            payload: { report: normalizedReport }
        });
    } catch (error) {
        const fallbackReport = normalizeReport(buildFallbackReport(state.turns), state.turns);
        if (currentUser?.uid) {
            await savePotentialReport(currentUser.uid, fallbackReport, {
                sessionId,
                totalTurns: state.turns.length,
                fallback: true
            });
        }
        clearRuntimeSnapshot();
        machine.dispatch({
            type: "REPORT_ERROR",
            payload: {
                error: error.message,
                fallbackReport
            }
        });
    }
}

async function submitAnswer(answerText) {
    const stateBeforeSubmit = machine.getState();
    const turn = {
        questionNumber: stateBeforeSubmit.answeredCount + 1,
        phaseId: stateBeforeSubmit.activePhase.phaseId,
        phaseLabel: stateBeforeSubmit.activePhase.phaseLabel,
        question: stateBeforeSubmit.currentQuestion || stateBeforeSubmit.streamingText,
        answer: answerText.trim(),
        submittedAt: new Date().toISOString()
    };

    machine.dispatch({
        type: "SUBMIT_RESPONSE",
        payload: { turn }
    });

    const stateAfterSubmit = machine.getState();
    const phaseChanged = stateBeforeSubmit.activePhase.phaseId !== stateAfterSubmit.activePhase.phaseId;
    if (currentUser?.uid) {
        await persistLabTurn(currentUser.uid, sessionId, {
            previousTurns: stateAfterSubmit.turns.slice(0, -1),
            currentTurn: turn,
            answeredCount: stateAfterSubmit.answeredCount
        });
    }

    await syncSnapshotToFirestore();

    if (stateAfterSubmit.answeredCount >= stateAfterSubmit.totalQuestions) {
        await buildAndPersistReport();
        return;
    }

    if (phaseChanged) {
        machine.dispatch({
            type: "SET_VISUAL_STATE",
            payload: { visualState: COREON_VISUAL_STATES.TRANSITION }
        });
    }

    await wait(THINKING_DURATION_MS);
    machine.dispatch({ type: "THINKING_DONE" });
    await requestNextQuestion();
}

function bindForm() {
    if (!dom.responseForm || !dom.responseInput) return;

    dom.responseForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const value = dom.responseInput.value.trim();
        if (!value) return;
        dom.responseInput.value = "";
        await submitAnswer(value);
    });
}

async function bootLab() {
    if (isBootstrapped) return;
    isBootstrapped = true;

    machine.dispatch({
        type: "BOOT",
        payload: {
            sessionId,
            message: "Iniciando lectura de patrones academicos..."
        }
    });

    if (currentUser?.uid) {
        await initializeLabSession(currentUser.uid, sessionId);
    }

    const state = machine.getState();
    if (state.report) {
        machine.dispatch({
            type: "REPORT_READY",
            payload: { report: state.report }
        });
        return;
    }

    await wait(TRANSITION_DURATION_MS);
    machine.dispatch({ type: "TRANSITION_COMPLETE" });

    if (state.answeredCount > 0 && state.lastValidQuestion) {
        machine.dispatch({
            type: "STREAM_COMPLETE",
            payload: { question: state.lastValidQuestion }
        });
        return;
    }

    await requestNextQuestion();
}

machine.subscribe(render);
bindForm();

subscribeToAuthChanges((user) => {
    currentUser = user;
    bootLab().catch((error) => {
        console.error("Error inicializando laboratorio conversacional:", error);
    });
});
