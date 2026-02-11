// Claude API integration
// See: Technical Architecture §4.3

import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

export interface ClaudeExtractionResult {
  text: string;
  provider: "claude";
}

/**
 * Send a PDF (as base64) to Claude for extraction.
 * Claude natively understands PDF content — no pre-processing needed.
 */
export async function extractWithClaude(
  pdfBase64: string,
  prompt: string
): Promise<ClaudeExtractionResult> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text response");
  }

  return { text: textBlock.text, provider: "claude" };
}

/**
 * Send plain text to Claude for extraction (for non-PDF content).
 */
export async function extractTextWithClaude(
  text: string,
  prompt: string
): Promise<ClaudeExtractionResult> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `${prompt}\n\nDocument content:\n<document>\n${text}\n</document>`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text response");
  }

  return { text: textBlock.text, provider: "claude" };
}

/**
 * Quick connectivity check — verifies the API key works.
 */
export async function checkClaudeHealth(): Promise<{
  available: boolean;
  latency: number;
}> {
  const start = Date.now();
  try {
    // Use a minimal request to check connectivity
    await getClient().messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 10,
      messages: [{ role: "user", content: "ping" }],
    });
    return { available: true, latency: Date.now() - start };
  } catch {
    return { available: false, latency: Date.now() - start };
  }
}
