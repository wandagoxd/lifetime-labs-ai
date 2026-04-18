const { OpenAI } = require("openai");

/**
 * Initializes and returns an OpenAI client using the provided API key.
 * @param {string} apiKey 
 * @returns {OpenAI}
 */
const getOpenAIClient = (apiKey) => {
    return new OpenAI({
        apiKey: apiKey
    });
};

/**
 * Stream a chat completion through the given response object using SSE format.
 * @param {OpenAI} openai 
 * @param {object} res Express response object
 * @param {Array} messages Array of message objects for OpenAI
 */
const streamChatCompletion = async (openai, res, messages) => {
    const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        stream: true,
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
            // Write SSE chunk
            res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
        }
    }
    
    // Signal end of stream
    res.write("data: [DONE]\n\n");
    res.end();
};

/**
 * Perform a standard (non-streaming) completion for Deep Thinking processes.
 * @param {OpenAI} openai 
 * @param {Array} messages 
 * @returns {Promise<string>}
 */
const deepThinkingCompletion = async (openai, messages) => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        response_format: { type: "json_object" } // Assume deep thinking returns JSON evidence map
    });

    return response.choices[0].message.content;
};

module.exports = {
    getOpenAIClient,
    streamChatCompletion,
    deepThinkingCompletion
};
