import { auth, firebaseProjectId } from "./auth.js";

const DEFAULT_REGION = "us-central1";

function buildFunctionUrl(functionName) {
    return `https://${DEFAULT_REGION}-${firebaseProjectId}.cloudfunctions.net/${functionName}`;
}

async function getOptionalIdToken() {
    try {
        if (auth.currentUser) {
            return await auth.currentUser.getIdToken();
        }
    } catch (error) {
        console.warn("No se pudo obtener token de sesion para Labs.", error);
    }
    return "";
}

function parseServerEventChunk(chunk, onEvent) {
    const eventBlocks = chunk
        .split("\n\n")
        .map((block) => block.trim())
        .filter(Boolean);

    for (const block of eventBlocks) {
        const lines = block.split("\n");
        let eventType = "message";
        let dataText = "";

        for (const line of lines) {
            if (line.startsWith("event:")) {
                eventType = line.slice(6).trim();
            }
            if (line.startsWith("data:")) {
                dataText += line.slice(5).trim();
            }
        }

        if (!dataText || dataText === "[DONE]") continue;

        let payload;
        try {
            payload = JSON.parse(dataText);
        } catch (error) {
            payload = { type: "raw", value: dataText };
        }

        onEvent({ eventType, payload });
    }
}

export async function streamLabQuestion(payload, { onDelta }) {
    const idToken = await getOptionalIdToken();
    const response = await fetch(buildFunctionUrl("coreonStream"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
            mode: "question",
            ...payload
        })
    });

    if (!response.ok || !response.body) {
        const message = await response.text();
        throw new Error(`No se pudo abrir stream: ${response.status} ${message}`);
    }

    const decoder = new TextDecoder("utf-8");
    const reader = response.body.getReader();
    let fullQuestion = "";
    let pending = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        pending += decoder.decode(value, { stream: true });
        const lastSeparatorIndex = pending.lastIndexOf("\n\n");
        if (lastSeparatorIndex === -1) continue;

        const chunk = pending.slice(0, lastSeparatorIndex + 2);
        pending = pending.slice(lastSeparatorIndex + 2);

        parseServerEventChunk(chunk, ({ payload: streamPayload }) => {
            if (streamPayload.type === "delta") {
                fullQuestion += streamPayload.delta || "";
                onDelta(streamPayload.delta || "");
            }
            if (streamPayload.type === "complete" && streamPayload.question && !fullQuestion.trim()) {
                fullQuestion = streamPayload.question;
                onDelta(streamPayload.question);
            }
            if (streamPayload.type === "error") {
                throw new Error(streamPayload.message || "stream_error");
            }
        });
    }

    if (!fullQuestion.trim()) {
        throw new Error("stream_empty_question");
    }

    return fullQuestion.trim();
}

export async function generateLabReport(payload) {
    const idToken = await getOptionalIdToken();
    const response = await fetch(buildFunctionUrl("coreonStream"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
            mode: "report",
            ...payload
        })
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`No se pudo generar reporte: ${response.status} ${message}`);
    }

    const data = await response.json();
    if (!data || !data.report) {
        throw new Error("report_missing_payload");
    }

    return data.report;
}

