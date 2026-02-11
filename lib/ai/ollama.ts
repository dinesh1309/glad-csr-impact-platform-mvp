// Ollama (local) AI integration
// See: Technical Architecture §4.4

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";

export interface OllamaExtractionResult {
  text: string;
  provider: "ollama";
}

/**
 * Send text content to Ollama for extraction.
 * PDFs must be pre-processed to text before calling this.
 */
export async function extractWithOllama(
  text: string,
  prompt: string
): Promise<OllamaExtractionResult> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: `${prompt}\n\nDocument content:\n<document>\n${text}\n</document>`,
      stream: false,
      options: {
        temperature: 0,
        num_predict: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return { text: data.response, provider: "ollama" };
}

/**
 * Check if Ollama is running and the model is available.
 */
export async function checkOllamaHealth(): Promise<{
  available: boolean;
  model: string;
  latency: number;
}> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { available: false, model: OLLAMA_MODEL, latency: Date.now() - start };
    }

    const data = await response.json();
    const models: { name: string }[] = data.models || [];
    const hasModel = models.some(
      (m) => m.name === OLLAMA_MODEL || m.name.startsWith(`${OLLAMA_MODEL}:`)
    );

    return {
      available: hasModel,
      model: OLLAMA_MODEL,
      latency: Date.now() - start,
    };
  } catch {
    return { available: false, model: OLLAMA_MODEL, latency: Date.now() - start };
  }
}
