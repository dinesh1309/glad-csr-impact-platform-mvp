// Ollama (local) AI integration
// See: Technical Architecture §4.4

import { Agent } from "undici";

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";

// Custom dispatcher: Node's built-in fetch uses undici with a default
// headersTimeout of 300s. Ollama's prompt evaluation for large documents
// can exceed this, so we extend it to 15 minutes.
const ollamaDispatcher = new Agent({
  headersTimeout: 15 * 60 * 1000,
  bodyTimeout: 15 * 60 * 1000,
});

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
  // Use stream: true to avoid Node undici headersTimeout (5 min default).
  // Ollama with stream:false holds headers until full generation is done,
  // which can exceed 5 min for large documents on Mistral 7B.
  // Streaming sends headers immediately and we accumulate the tokens.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15 * 60 * 1000);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      // @ts-expect-error -- Node's fetch supports undici dispatcher
      dispatcher: ollamaDispatcher,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${prompt}\n\nDocument content:\n<document>\n${text}\n</document>`,
        stream: true,
        options: {
          temperature: 0,
          num_predict: 4096,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    // Accumulate streamed NDJSON tokens
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) result += parsed.response;
        } catch {
          // Skip malformed lines
        }
      }
    }

    return { text: result, provider: "ollama" };
  } finally {
    clearTimeout(timeout);
  }
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
