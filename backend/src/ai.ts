export async function generateSolution(taskDescription: string): Promise<{solution: string, confidence: number}> {
  const prompt = `You are an autonomous AI agent in a massive system.
Solve this problem: "${taskDescription}"
Output ONLY a valid JSON object with exactly two keys:
"solution": a string containing a concise explanation of how to fix it.
"confidence": a number between 0.0 and 1.0 indicating how confident you are in this fix.

Example: {"solution": "Restart the container.", "confidence": 0.95}
JSON:`;

  try {
    const res = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt: prompt,
        stream: false,
        format: "json"
      })
    });
    
    if (!res.ok) {
      throw new Error(`Ollama API returned ${res.status}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.response);
    return {
      solution: parsed.solution || "Fallback generic fix applied due to parsing issue.",
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5
    };
  } catch (err) {
    console.error("AI Error:", err);
    return { solution: "Ollama connection failed or returned invalid format.", confidence: 0.1 };
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const res = await fetch("http://127.0.0.1:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text",
        prompt: text
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama Embed API returned ${res.status}`);
    }

    const data = await res.json();
    return data.embedding; // Array of floats
  } catch (err) {
    console.error("Embedding Error:", err);
    return [];
  }
}
