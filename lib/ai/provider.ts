// AI Provider selection + failover logic
// See: Technical Architecture §4.2, §4.6

import { extractWithClaude, extractTextWithClaude, checkClaudeHealth } from "./claude";
import { extractWithOllama, checkOllamaHealth } from "./ollama";

export type ProviderName = "claude" | "ollama";

interface ProviderCache {
  provider: ProviderName | null;
  checkedAt: number;
}

// Cache provider check for 30 seconds
let providerCache: ProviderCache = { provider: null, checkedAt: 0 };
const CACHE_TTL = 30_000;

/**
 * Determine which AI provider to use based on env config and availability.
 */
export async function getActiveProvider(): Promise<ProviderName> {
  const setting = process.env.AI_PROVIDER || "auto";

  if (setting === "claude") return "claude";
  if (setting === "ollama") return "ollama";

  // Auto mode — check cache first
  const now = Date.now();
  if (providerCache.provider && now - providerCache.checkedAt < CACHE_TTL) {
    return providerCache.provider;
  }

  // Check Claude first (preferred)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const claude = await checkClaudeHealth();
      if (claude.available) {
        providerCache = { provider: "claude", checkedAt: now };
        return "claude";
      }
    } catch {
      // Claude unavailable, try Ollama
    }
  }

  // Check Ollama
  try {
    const ollama = await checkOllamaHealth();
    if (ollama.available) {
      providerCache = { provider: "ollama", checkedAt: now };
      return "ollama";
    }
  } catch {
    // Ollama unavailable
  }

  throw new Error("No AI provider available. Please check your Claude API key or start Ollama.");
}

/**
 * Extract structured data from a PDF using the best available provider.
 * Includes automatic failover: primary → secondary → error.
 */
export async function extractFromPDF(
  pdfBuffer: Buffer,
  prompt: string,
  providerOverride?: ProviderName
): Promise<{ text: string; provider: ProviderName }> {
  const pdfBase64 = pdfBuffer.toString("base64");
  let primary: ProviderName;

  try {
    primary = providerOverride ?? (await getActiveProvider());
  } catch {
    throw new Error("No AI provider available");
  }

  // Attempt 1: Primary provider
  try {
    if (primary === "claude") {
      return await extractWithClaude(pdfBase64, prompt);
    } else {
      const { extractTextFromPDF } = await import("./pdf-parser");
      const text = await extractTextFromPDF(pdfBuffer);
      return await extractWithOllama(text, prompt);
    }
  } catch (primaryError) {
    console.warn(`Primary provider (${primary}) failed:`, primaryError);
  }

  // Attempt 2: Fallback provider
  const fallback: ProviderName = primary === "claude" ? "ollama" : "claude";
  try {
    if (fallback === "claude") {
      return await extractWithClaude(pdfBase64, prompt);
    } else {
      const { extractTextFromPDF } = await import("./pdf-parser");
      const text = await extractTextFromPDF(pdfBuffer);
      return await extractWithOllama(text, prompt);
    }
  } catch (fallbackError) {
    console.warn(`Fallback provider (${fallback}) failed:`, fallbackError);
  }

  throw new Error("AI extraction failed with both providers. Please try again or enter data manually.");
}

/**
 * Extract structured data from plain text using the best available provider.
 */
export async function extractFromText(
  text: string,
  prompt: string,
  providerOverride?: ProviderName
): Promise<{ text: string; provider: ProviderName }> {
  let primary: ProviderName;

  try {
    primary = providerOverride ?? (await getActiveProvider());
  } catch {
    throw new Error("No AI provider available");
  }

  // Attempt 1: Primary
  try {
    if (primary === "claude") {
      return await extractTextWithClaude(text, prompt);
    } else {
      return await extractWithOllama(text, prompt);
    }
  } catch (primaryError) {
    console.warn(`Primary provider (${primary}) failed:`, primaryError);
  }

  // Attempt 2: Fallback
  const fallback: ProviderName = primary === "claude" ? "ollama" : "claude";
  try {
    if (fallback === "claude") {
      return await extractTextWithClaude(text, prompt);
    } else {
      return await extractWithOllama(text, prompt);
    }
  } catch (fallbackError) {
    console.warn(`Fallback provider (${fallback}) failed:`, fallbackError);
  }

  throw new Error("AI extraction failed with both providers. Please try again or enter data manually.");
}

/**
 * Parse JSON from AI response text. Handles common issues like
 * markdown code blocks wrapping the JSON.
 */
export function parseJSONResponse<T>(text: string): T {
  // Strip markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  return JSON.parse(cleaned) as T;
}

/**
 * Get health status of both providers.
 */
export async function getProviderHealth() {
  const [claude, ollama] = await Promise.allSettled([
    process.env.ANTHROPIC_API_KEY
      ? checkClaudeHealth()
      : Promise.resolve({ available: false, latency: 0 }),
    checkOllamaHealth(),
  ]);

  const claudeResult =
    claude.status === "fulfilled"
      ? claude.value
      : { available: false, latency: 0 };
  const ollamaResult =
    ollama.status === "fulfilled"
      ? ollama.value
      : { available: false, model: process.env.OLLAMA_MODEL || "mistral", latency: 0 };

  let activeProvider: ProviderName | "none" = "none";
  if (claudeResult.available) activeProvider = "claude";
  else if (ollamaResult.available) activeProvider = "ollama";

  return {
    claude: claudeResult,
    ollama: ollamaResult,
    activeProvider,
  };
}
