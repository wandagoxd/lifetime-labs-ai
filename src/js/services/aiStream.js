export const fetchAIStream = async (userId, answerText, questionCount, onChunk, onComplete, onError) => {
    try {
        const response = await fetch("http://127.0.0.1:5001/lifetimelabs-online/us-central1/chatStream", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId: userId, answer: answerText, questionCount: questionCount })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;

        let fullText = "";
        let buffer = "";

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            
            if (value) {
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop(); // Keep the incomplete line for the next chunk
                
                for (let line of lines) {
                    line = line.trim();
                    if (line.startsWith("data: ")) {
                        const dataStr = line.slice(6).trim();
                        if (dataStr === "[DONE]") {
                            onComplete(fullText);
                            return;
                        }

                        if (dataStr) {
                            let parsed;
                            try {
                                parsed = JSON.parse(dataStr);
                            } catch(e) {
                                console.warn("Failed to parse SSE data chunk", dataStr);
                                continue;
                            }
                            
                            if (parsed && parsed.error) {
                                throw new Error(parsed.error);
                            }
                            if (parsed && parsed.text !== undefined) {
                                fullText += parsed.text;
                                onChunk(parsed.text, fullText);
                            }
                        }
                    }
                }
            }
        }
        
        onComplete(fullText);
        
    } catch (err) {
        console.error("AI Stream Error:", err);
        if (onError) onError(err);
    }
};
