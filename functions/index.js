const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const cors = require("cors")({ origin: true });

const evidenceService = require("./src/services/evidenceService");
const openaiClient = require("./src/ai/openaiClient");

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
            } catch(e) {
                // Silently fails in production if env files don't exist
            }

            // Fallback a Secret Manager si seguimos sin key
            if (!apiKey || apiKey.trim() === "" || apiKey === "tu-api-key") {
                try { apiKey = openAiKey.value(); } catch(e) {}
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

            if (isDeepPulse) {
                logger.info(`TRIGGERING DEEP PULSE for ${userId} at Q${questionCount}`);
                
                // Deep pulse merges all raw history and refines the evidence map
                const systemPrompt = `You are an expert vocational analyst. We are updating a candidate's Evidence Map.
Current Map: ${JSON.stringify(evidenceMap)}
Chronological History (User Context & Answers): ${JSON.stringify(history)}

Analyze the complete history. Refine the exact map structure by either creating new labels or updating existing ones. Provide exact quotes as justifications to back up the traits. 
Respond ONLY with JSON representing the updated Evidence Map.`;
                
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
            const deltaSystemPrompt = `You are guiding a user through a vocational discovery experience. You are NOT conducting a formal interview; you are an empathetic mentor.
Current Evidence Map: ${JSON.stringify(evidenceMap)}

Your task: Formulate the NEXT open-ended question to help unveil more about this person's vocational identity based on their last answer. 
Make the question conversational, insightful, and concise. Do NOT summarize their map. Just ask the question.`;
            
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
