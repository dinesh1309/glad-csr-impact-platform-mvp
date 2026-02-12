// PDF text extraction for Ollama path (Claude handles PDFs natively)
// Uses unpdf — server-friendly, no web worker dependency
// See: Technical Architecture §4.4

import { extractText } from "unpdf";

/**
 * Extract text content from a PDF buffer.
 * Used when sending to Ollama (which can't read PDFs directly).
 */
export async function extractTextFromPDF(
  pdfBuffer: Buffer
): Promise<string> {
  const { text } = await extractText(new Uint8Array(pdfBuffer));
  return text.join("\n\n");
}
