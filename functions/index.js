const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const cors = require("cors")({ origin: true });

const evidenceService = require("./src/services/evidenceService");
const openaiClient = require("./src/ai/openaiClient");
const admin = require("firebase-admin");

const openAiKey = defineSecret("OPENAI_API_KEY");

// --------------------------------------------------------------------------
// 1. Stage 1 Ingestion
// --------------------------------------------------------------------------
exports.submitStageOne = onRequest({ cors: true }, async (req, res) => {
  // For local dev without cors wrapper just do cors(req, res, () => {...})
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const { userId, answers } = req.body;
      if (!userId || !answers) {
        return res.status(400).send("Missing userId or answers");
      }

      await evidenceService.bulkSaveStageOne(userId, answers);
      logger.info(`Stage 1 bulk save completed for user: ${userId}`);

      res.status(200).json({ success: true, message: "Stage 1 saved" });
    } catch (error) {
      logger.error("Error in submitStageOne", error);
      res.status(500).json({ error: error.message });
    }
  });
});

// --------------------------------------------------------------------------
// 2. Stage 2 Generative AI Stream (Delta & Deep Pulse logic)
// --------------------------------------------------------------------------
exports.chatStream = onRequest({ cors: true, secrets: [openAiKey], timeoutSeconds: 120 }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { userId, answer, questionCount } = req.body;

    if (!userId || !answer) {
      return res.status(400).send("Missing userId or answer");
    }

    // Must initiate SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
      // Setup AI
      // Setup AI
      let apiKey = process.env.OPENAI_API_KEY;

      // Forza siempre a leer el archivo directamente para sobreescribir la memoria basura del emulador
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const match = envContent.match(/OPENAI_API_KEY=["']?([^"'\r\n]+)["']?/);
          if (match && match[1]) {
            apiKey = match[1];
          }
        }
      } catch (e) {
        // Silently fails in production if env files don't exist
      }

      // Fallback a Secret Manager si seguimos sin key
      if (!apiKey || apiKey.trim() === "" || apiKey === "tu-api-key") {
        try { apiKey = openAiKey.value(); } catch (e) { }
      }

      if (!apiKey || apiKey.trim() === "" || apiKey === "tu-api-key") {
        throw new Error("OpenAI API Key is missing. Verifica tu archivo .env.local.");
      }

      const openai = openaiClient.getOpenAIClient(apiKey);

      // 1. Save user answer to history
      await evidenceService.appendToHistory(userId, "user", answer);

      // 2. Fetch required context
      const history = await evidenceService.getRawHistory(userId, 20); // Gets up to last 20 interactions
      let evidenceMap = await evidenceService.getEvidenceMap(userId);

      // Logic Check: Is it time for a Deep Thinking Pulse? (Every 5th question)
      const isDeepPulse = questionCount && questionCount % 5 === 0;

      // GET Language Pref
      const userSnap = await admin.firestore().collection("users").doc(userId).get();
      const languagePref = (userSnap.exists && userSnap.data().language_pref) ? userSnap.data().language_pref : "es";
      const langInstruction = `RESPOND STRICTLY IN ${languagePref === "en" ? "ENGLISH" : "SPANISH"}.`;

      if (isDeepPulse) {
        logger.info(`TRIGGERING DEEP PULSE for ${userId} at Q${questionCount}`);

        // Deep pulse merges all raw history and refines the evidence map
        const systemPrompt = `You are an expert vocational analyst conducting a "Synthesis Pulse". We are building a "Cluster" (Inference Map) of the candidate.
Current Cluster: ${JSON.stringify(evidenceMap)}
Chronological History (User Context & Answers): ${JSON.stringify(history)}

Goal: Cross-referencing. Look for contradictions, hidden patterns, and ideological evolution across their answers (e.g. how does their view of X evolve with Y?).
Because this is non-deterministic growth, you are allowed to be "unsure". If there is conflicting evidence, hold both ideas in the Cluster until more information settles the debate.
Respond ONLY with JSON representing the new updated Cluster. Use a nested structure where traits, contradictions, and areas to probe are clearly defined.`;

        const deepPulseMsg = [{ role: "system", content: systemPrompt }];
        const newMapJsonStr = await openaiClient.deepThinkingCompletion(openai, deepPulseMsg);

        try {
          const newMap = JSON.parse(newMapJsonStr);
          await evidenceService.updateEvidenceMap(userId, newMap);
          evidenceMap = newMap; // Update local scope for the next delta question
        } catch (parseErr) {
          logger.error("Deep Pulse JSON parse failed", parseErr);
        }
      }

      // 3. Delta Pulse (Always ask the next question)
      // Even if we just did a Deep Pulse, we still need to ask a question to continue the experience.
      const deltaSystemPrompt = `You are guiding a user through a deep vocational discovery experience. You are an empathetic mentor doing profound psychological cross-analysis.
Current Inference Cluster: ${JSON.stringify(evidenceMap)}

Your task: Formulate the NEXT open-ended question to dig deeply into the user's motivations, true wants, and thought processes. Go beyond surface-level interests. Ask questions that reveal *why* they think the way they do, probing specific contradictions or hidden desires found in the Inference Cluster.
Make the question highly insightful, psychological, and conversational. Do NOT summarize their map. Just ask the question.
${langInstruction}`;

      // Format history for OpenAI
      const chatMessages = [
        { role: "system", content: deltaSystemPrompt },
        ...history.map(item => ({
          role: item.type === "user" ? "user" : "assistant",
          content: typeof item.content === 'object' ? JSON.stringify(item.content) : item.content
        }))
      ];

      // 4. We will stream the AI's question, but we also want to save it to DB once it's done. 
      // We can't easily save a streamed response without intercepting chunks, so we could modify our stream util to return the full string.
      // For now, let's stream directly, but capture the chunks in index.js to save later.
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: chatMessages,
        stream: true,
      });

      let fullAssistantResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullAssistantResponse += content;
          res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
        }
      }

      // End of stream
      res.write("data: [DONE]\n\n");
      res.end();

      // 5. Save the generated AI question/feedback silently to history
      await evidenceService.appendToHistory(userId, "ai", fullAssistantResponse);

    } catch (error) {
      logger.error("Error in chatStream", error);
      res.write(`data: ${JSON.stringify({ error: error.message || "Stream interrupted" })}\n\n`);
      res.end();
    }
  });
});

// --------------------------------------------------------------------------
// 3. Stage 3 Generate Labs
// --------------------------------------------------------------------------
exports.generateLabs = onRequest({ cors: true, secrets: [openAiKey], timeoutSeconds: 300 }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    const { userId } = req.body;
    if (!userId) return res.status(400).send("Missing userId");

    try {
      let apiKey = process.env.OPENAI_API_KEY;

      // Forza siempre a leer el archivo directamente para sobreescribir la memoria basura del emulador
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const match = envContent.match(/OPENAI_API_KEY=["']?([^"'\r\n]+)["']?/);
          if (match && match[1]) {
            apiKey = match[1];
          }
        }
      } catch (e) { }

      // Fallback a Secret Manager si seguimos sin key
      if (!apiKey || apiKey.trim() === "" || apiKey === "tu-api-key") {
        try { apiKey = openAiKey.value(); } catch (e) { }
      }

      if (!apiKey || apiKey.trim() === "" || apiKey === "tu-api-key") {
        throw new Error("OpenAI API Key is missing. Verifica tu archivo .env.local.");
      }

      const openai = openaiClient.getOpenAIClient(apiKey);
      
      const userSnap = await admin.firestore().collection("users").doc(userId).get();
      const languagePref = (userSnap.exists && userSnap.data().language_pref) ? userSnap.data().language_pref : "es";
      const langInstruction = `RESPOND STRICTLY IN ${languagePref === "en" ? "ENGLISH" : "SPANISH"}.`;

      const history = await evidenceService.getRawHistory(userId, 50);
      const evidenceMap = await evidenceService.getEvidenceMap(userId);

      const prompt = `You are an expert curriculum designer creating vocational discovery exercises for a digital platform.

CONTEXT: A student will read your problem and respond with TWO written text solutions (each ~200 words). They type their answers into a text box on a website. There is NO physical interaction — no building, no coding, no lab equipment, no materials. Everything is purely analytical and written.

YOUR TASK: Based on the user's Inference Cluster and chronological history, determine their best career fit or university program. Then generate exactly 4 realistic scenario-based "laboratories" — essentially mini case studies or thought experiments that someone in that career would face.

STRICT RULES FOR EACH LAB:
1. The problem MUST be solvable entirely through written reasoning, analysis, or strategic thinking.
2. NEVER ask the student to build, code, construct, design physically, draw, or use any tool or material.
3. Instead, present a realistic SCENARIO or DILEMMA (e.g., "A client comes to you with X problem... How would you approach it and why?" or "You are given this data... What conclusions do you draw?").
4. The problem should reveal the student's decision-making, creativity, and critical thinking through their written answer.
5. Adjust the complexity strictly to the user's educational level found in their history (elementary = simple and fun, university = professional-grade).

Return ONLY a valid JSON object:
{
  "labs": [
    {
      "id": "lab_1",
      "title": "Short descriptive title",
      "category_fit": "Career or program name (e.g., 'Industrial Engineering', 'Psychology')",
      "problem_statement": "A detailed scenario the student must analyze and respond to in writing...",
      "expected_skills": ["Skill 1", "Skill 2"]
    }
  ]
}

${langInstruction}`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `Cluster: ${JSON.stringify(evidenceMap)}\nHistory: ${JSON.stringify(history)}` }
        ],
        response_format: { type: "json_object" }
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      
      const userRef = admin.firestore().collection("users").doc(userId);
      await userRef.set({ generated_labs: parsed }, { merge: true });

      res.status(200).json({ success: true, data: parsed });
    } catch (err) {
      logger.error("Error generating labs", err);
      res.status(500).json({ error: err.message });
    }
  });
});

// --------------------------------------------------------------------------
// 4. Evaluate Lab Solution
// --------------------------------------------------------------------------
exports.evaluateLab = onRequest({ cors: true, secrets: [openAiKey] }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    const { labTitle, problemStatement, solutionA, solutionB } = req.body;
    
    try {
      let apiKey = process.env.OPENAI_API_KEY;
      
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const match = envContent.match(/OPENAI_API_KEY=["']?([^"'\r\n]+)["']?/);
          if (match && match[1]) {
            apiKey = match[1];
          }
        }
      } catch (e) { }

      if (!apiKey || apiKey.trim() === "" || apiKey === "tu-api-key") {
        try { apiKey = openAiKey.value(); } catch (e) { }
      }

      if (!apiKey || apiKey.trim() === "" || apiKey === "tu-api-key") {
        throw new Error("OpenAI API Key is missing. Verifica tu archivo .env.local.");
      }
      
      const openai = openaiClient.getOpenAIClient(apiKey);

      const userSnap = await admin.firestore().collection("users").doc(req.body.userId).get();
      const languagePref = (userSnap.exists && userSnap.data().language_pref) ? userSnap.data().language_pref : "es";
      const langInstruction = `RESPOND STRICTLY IN ${languagePref === "en" ? "ENGLISH" : "SPANISH"}.`;

      const prompt = `You are a strict but encouraging mentor. A student has submitted two alternative approaches (Solution A and Solution B) to the following real-life problem.
Lab Title: ${labTitle}
Problem: ${problemStatement}

Solution A:
${solutionA}

Solution B:
${solutionB}

Evaluate both approaches. Which one is more viable or better thought out and why? Provide constructive feedback directly to the student in 1 or 2 paragraphs maximum. Use a conversational, mentorship tone.
${langInstruction}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }]
      });

      res.status(200).json({ feedback: response.choices[0].message.content });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});
