import { TOTAL_INTERACTIONS, getPhaseMetaByQuestionIndex } from "./phase-config.js";

export const COREON_VISUAL_STATES = {
    ACTIVATION: "activation",
    ANALYSIS: "analysis",
    WRITING: "writing",
    IDLE: "idle",
    TRANSITION: "transition",
    SUCCESS: "success"
};

export const LAB_SCREEN_STATES = {
    INIT: "init",
    TRANSITION: "transition",
    ASKING: "asking",
    THINKING: "thinking",
    REPORTING: "reporting",
    COMPLETED: "completed"
};

const initialState = {
    sessionId: "",
    screenState: LAB_SCREEN_STATES.INIT,
    visualState: COREON_VISUAL_STATES.ACTIVATION,
    totalQuestions: TOTAL_INTERACTIONS,
    answeredCount: 0,
    activeQuestionNumber: 1,
    activePhase: getPhaseMetaByQuestionIndex(0),
    currentQuestion: "",
    streamingText: "",
    lastValidQuestion: "",
    fallbackActive: false,
    isStreaming: false,
    isThinking: false,
    isInputEnabled: false,
    transitionMessage: "Iniciando lectura de patrones academicos...",
    turns: [],
    report: null,
    errors: []
};

function reduce(state, action) {
    switch (action.type) {
    case "BOOT":
        return {
            ...state,
            sessionId: action.payload.sessionId || state.sessionId,
            screenState: LAB_SCREEN_STATES.TRANSITION,
            visualState: COREON_VISUAL_STATES.ACTIVATION,
            transitionMessage: action.payload.message || state.transitionMessage
        };

    case "TRANSITION_COMPLETE":
        return {
            ...state,
            screenState: LAB_SCREEN_STATES.ASKING,
            visualState: COREON_VISUAL_STATES.TRANSITION
        };

    case "STREAM_START":
        return {
            ...state,
            screenState: LAB_SCREEN_STATES.ASKING,
            visualState: COREON_VISUAL_STATES.WRITING,
            isStreaming: true,
            isThinking: false,
            isInputEnabled: false,
            fallbackActive: false,
            streamingText: "",
            currentQuestion: ""
        };

    case "STREAM_DELTA":
        return {
            ...state,
            streamingText: `${state.streamingText}${action.payload.delta || ""}`
        };

    case "STREAM_COMPLETE": {
        const completedQuestion = (action.payload.question || state.streamingText || "").trim();
        return {
            ...state,
            currentQuestion: completedQuestion,
            streamingText: completedQuestion,
            lastValidQuestion: completedQuestion || state.lastValidQuestion,
            isStreaming: false,
            isInputEnabled: true,
            visualState: COREON_VISUAL_STATES.IDLE
        };
    }

    case "STREAM_ERROR": {
        const fallbackQuestion = action.payload.fallbackQuestion || state.lastValidQuestion;
        return {
            ...state,
            currentQuestion: fallbackQuestion,
            streamingText: fallbackQuestion,
            isStreaming: false,
            isInputEnabled: true,
            fallbackActive: true,
            visualState: COREON_VISUAL_STATES.IDLE,
            errors: [...state.errors, action.payload.error || "stream_error"]
        };
    }

    case "SUBMIT_RESPONSE": {
        const newAnsweredCount = state.answeredCount + 1;
        const nextQuestionNumber = Math.min(newAnsweredCount + 1, state.totalQuestions);
        const nextPhase = getPhaseMetaByQuestionIndex(Math.min(newAnsweredCount, state.totalQuestions - 1));
        const allDone = newAnsweredCount >= state.totalQuestions;

        return {
            ...state,
            turns: [...state.turns, action.payload.turn],
            answeredCount: newAnsweredCount,
            activeQuestionNumber: nextQuestionNumber,
            activePhase: nextPhase,
            screenState: allDone ? LAB_SCREEN_STATES.REPORTING : LAB_SCREEN_STATES.THINKING,
            visualState: allDone ? COREON_VISUAL_STATES.ANALYSIS : COREON_VISUAL_STATES.ANALYSIS,
            isThinking: true,
            isInputEnabled: false,
            currentQuestion: allDone ? state.currentQuestion : ""
        };
    }

    case "THINKING_DONE":
        return {
            ...state,
            isThinking: false,
            screenState: state.report ? LAB_SCREEN_STATES.COMPLETED : LAB_SCREEN_STATES.ASKING
        };

    case "REPORT_READY":
        return {
            ...state,
            report: action.payload.report,
            screenState: LAB_SCREEN_STATES.COMPLETED,
            visualState: COREON_VISUAL_STATES.SUCCESS,
            isThinking: false,
            isInputEnabled: false
        };

    case "REPORT_ERROR":
        return {
            ...state,
            errors: [...state.errors, action.payload.error || "report_error"],
            screenState: LAB_SCREEN_STATES.COMPLETED,
            visualState: COREON_VISUAL_STATES.SUCCESS,
            report: action.payload.fallbackReport
        };

    case "SET_VISUAL_STATE":
        return {
            ...state,
            visualState: action.payload.visualState
        };

    default:
        return state;
    }
}

export function createLabStateMachine(customInitialState = {}) {
    let state = {
        ...initialState,
        ...customInitialState
    };
    const listeners = new Set();

    const notify = () => {
        listeners.forEach((listener) => listener(state));
    };

    return {
        getState() {
            return state;
        },
        dispatch(action) {
            state = reduce(state, action);
            notify();
            return state;
        },
        subscribe(listener) {
            listeners.add(listener);
            listener(state);
            return () => listeners.delete(listener);
        }
    };
}

