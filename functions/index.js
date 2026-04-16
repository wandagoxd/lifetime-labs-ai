/* eslint-disable max-len, require-jsdoc, comma-dangle, no-constant-condition */
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {setGlobalOptions} = require("firebase-functions/v2");
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");

if (!admin.apps.length) {
  admin.initializeApp();
}

setGlobalOptions({
  maxInstances: 10,
  region: "us-central1",
});

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

const ALLOWED_ORIGINS = new Set([
  "https://lifetimelabs-online.web.app",
  "https://lifetimelabs-online.firebaseapp.com",
  "https://lifetimelabs.com",
  "https://www.lifetimelabs.com",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
]);

const REPORT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    profile_summary: {type: "string"},
    top_strengths: {
      type: "array",
      items: {type: "string"},
    },
    career_matches: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: {type: "string"},
          name: {type: "string"},
          score: {type: "number"},
          reason: {type: "string"},
        },
        required: ["id", "name", "score", "reason"],
      },
    },
    career_match_ids: {
      type: "array",
      items: {type: "string"},
    },
    graduate_similarity: {
      type: "object",
      additionalProperties: false,
      properties: {
        match_percentage: {type: "number"},
        career: {type: "string"},
        sector: {type: "string"},
        insight: {type: "string"},
      },
      required: ["match_percentage", "career", "sector", "insight"],
    },
    academic_alerts: {
      type: "array",
      items: {type: "string"},
    },
    recommended_route: {
      type: "array",
      items: {type: "string"},
    },
    visual_competency_scores: {
      type: "object",
      additionalProperties: false,
      properties: {
        pensamiento_critico: {type: "number"},
        empatia: {type: "number"},
        analisis_tecnico: {type: "number"},
        creatividad: {type: "number"},
      },
      required: ["pensamiento_critico", "empatia", "analisis_tecnico", "creatividad"],
    },
    bank_redirect_url: {type: "string"},
  },
  required: [
    "profile_summary",
    "top_strengths",
    "career_matches",
    "career_match_ids",
    "graduate_similarity",
    "academic_alerts",
    "recommended_route",
    "visual_competency_scores",
    "bank_redirect_url",
  ],
};

function applyCors(req, res) {
  const origin = req.headers.origin || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://lifetimelabs-online.web.app";

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }

  return false;
}

function writeSse(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7).trim();
}

async function resolveUserId(req) {
  const token = extractBearerToken(req);
  if (!token) return null;

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid || null;
  } catch (error) {
    logger.warn("Token invalido para coreonStream.", error);
    return null;
  }
}

function safeJsonParse(maybeJson) {
  try {
    return JSON.parse(maybeJson);
  } catch (error) {
    return null;
  }
}

function formatTurnsForPrompt(turns = []) {
  if (!Array.isArray(turns) || !turns.length) return "Sin respuestas previas.";

  return turns
      .slice(-8)
      .map((turn) => `Q${turn.questionNumber} (${turn.phaseLabel}): ${turn.answer}`)
      .join("\n");
}

function buildQuestionPrompt(payload = {}) {
  const phase = payload.phase || {};
  const turnsText = formatTurnsForPrompt(payload.turns || []);
  const origins = (payload.origins && payload.origins.responses) || {};

  return [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text: [
            "Eres Coreon, agente cognitivo de Lifetime Labs.",
            "Genera una sola pregunta corta en espanol (max 220 caracteres), con tono friendly-academic soft-tech.",
            "No uses formato de chatbot, no agregues saludo, no agregues listas, no agregues markdown.",
            "La pregunta debe profundizar el perfil academico del estudiante y mantener continuidad con respuestas previas.",
            "Entrega solo la pregunta final."
          ].join(" "),
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: [
            `Sesion: ${payload.sessionId || "sin_sesion"}`,
            `Pregunta actual: ${payload.questionNumber || 1}/${payload.totalQuestions || 23}`,
            `Fase: ${phase.phaseId || "contexto"} (${phase.phaseLabel || "Contexto"})`,
            `Posicion fase: ${phase.questionInPhase || 1}/${phase.totalInPhase || 1}`,
            `Orígenes base: ${JSON.stringify(origins)}`,
            "Respuestas recientes:",
            turnsText
          ].join("\n"),
        },
      ],
    },
  ];
}

function buildReportPrompt(payload = {}) {
  const turnsText = formatTurnsForPrompt(payload.turns || []);
  const origins = (payload.origins && payload.origins.responses) || {};

  return [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text: [
            "Genera un Reporte de Potencial academico para un estudiante de Universidad de los Andes.",
            "Devuelve JSON estricto siguiendo el schema indicado.",
            "Incluye 3 a 5 carreras compatibles con id util para banco de carreras.",
            "Usa lenguaje claro, accionable, sin placeholders."
          ].join(" "),
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: [
            `Sesion: ${payload.sessionId || "sin_sesion"}`,
            `Usuario: ${payload.userId || "guest"}`,
            `Respuestas test-origins: ${JSON.stringify(origins)}`,
            "Respuestas de laboratorio:",
            turnsText
          ].join("\n"),
        },
      ],
    },
  ];
}

function extractOutputText(responsePayload = {}) {
  if (typeof responsePayload.output_text === "string" && responsePayload.output_text.trim()) {
    return responsePayload.output_text;
  }

  const output = Array.isArray(responsePayload.output) ? responsePayload.output : [];
  const textChunks = [];

  for (const item of output) {
    const contents = Array.isArray(item.content) ? item.content : [];
    for (const content of contents) {
      if (content.type === "output_text" && content.text) {
        textChunks.push(content.text);
      }
      if (content.type === "text" && content.text) {
        textChunks.push(content.text);
      }
    }
  }

  return textChunks.join("").trim();
}

async function callOpenAiStream(requestBody, res, apiKey) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY_missing");
  }

  const upstreamResponse = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      stream: true,
      ...requestBody,
    }),
  });

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    const detail = await upstreamResponse.text();
    throw new Error(`openai_stream_failed: ${upstreamResponse.status} ${detail}`);
  }

  const reader = upstreamResponse.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let finalQuestion = "";

  while (true) {
    const {value, done} = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, {stream: true});

    let separatorIndex = buffer.indexOf("\n\n");
    while (separatorIndex !== -1) {
      const block = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      separatorIndex = buffer.indexOf("\n\n");

      const lines = block.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;

        const rawData = line.slice(5).trim();
        if (!rawData || rawData === "[DONE]") continue;

        const eventPayload = safeJsonParse(rawData);
        if (!eventPayload) continue;

        if (eventPayload.type === "response.output_text.delta") {
          const delta = eventPayload.delta || "";
          finalQuestion += delta;
          writeSse(res, "delta", {
            type: "delta",
            delta,
          });
        }

        if (eventPayload.type === "response.completed") {
          const maybeCompletedText = extractOutputText(eventPayload.response || {});
          if (!finalQuestion.trim() && maybeCompletedText) {
            finalQuestion = maybeCompletedText;
            writeSse(res, "delta", {
              type: "delta",
              delta: maybeCompletedText,
            });
          }
        }

        if (eventPayload.type === "error") {
          throw new Error(eventPayload.message || "openai_stream_event_error");
        }
      }
    }
  }

  writeSse(res, "complete", {
    type: "complete",
    question: finalQuestion.trim(),
  });
}

async function callOpenAiJson(requestBody, apiKey) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY_missing");
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      stream: false,
      ...requestBody,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`openai_json_failed: ${response.status} ${detail}`);
  }

  return response.json();
}

exports.coreonStream = onRequest({
  timeoutSeconds: 120,
  memory: "512MiB",
  secrets: [OPENAI_API_KEY],
}, async (req, res) => {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({error: "method_not_allowed"});
    return;
  }

  const payload = req.body || {};
  const mode = payload.mode || "question";
  const userId = await resolveUserId(req);
  const apiKey = OPENAI_API_KEY.value();

  logger.info("coreonStream request", {
    mode,
    userId: userId || "guest",
    sessionId: payload.sessionId || "unknown",
  });

  if (mode === "question") {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
      await callOpenAiStream(
          {
            input: buildQuestionPrompt({
              ...payload,
              userId: userId || payload.userId || "guest",
            }),
            max_output_tokens: 240,
          },
          res,
          apiKey
      );

      writeSse(res, "done", {type: "done"});
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      logger.error("coreonStream question failed", error);
      writeSse(res, "error", {
        type: "error",
        message: error.message || "question_stream_failed",
      });
      res.write("data: [DONE]\n\n");
      res.end();
    }
    return;
  }

  if (mode === "report") {
    try {
      const openAiPayload = await callOpenAiJson({
        input: buildReportPrompt({
          ...payload,
          userId: userId || payload.userId || "guest",
        }),
        text: {
          format: {
            type: "json_schema",
            name: "lifetime_potential_report",
            strict: true,
            schema: REPORT_SCHEMA,
          },
        },
        max_output_tokens: 1400,
      }, apiKey);

      const reportText = extractOutputText(openAiPayload);
      const reportJson = safeJsonParse(reportText);

      if (!reportJson) {
        throw new Error("report_parse_failed");
      }

      res.status(200).json({
        ok: true,
        report: reportJson,
      });
    } catch (error) {
      logger.error("coreonStream report failed", error);
      res.status(500).json({
        ok: false,
        error: error.message || "report_generation_failed",
      });
    }
    return;
  }

  res.status(400).json({error: "unsupported_mode"});
});
