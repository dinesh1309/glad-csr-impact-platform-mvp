// PDF text extraction for Ollama path (Claude handles PDFs natively)
// See: Technical Architecture §4.4

import { PDFParse } from "pdf-parse";

/**
 * Extract text content from a PDF buffer.
 * Used when sending to Ollama (which can't read PDFs directly).
 */
export async function extractTextFromPDF(
  pdfBuffer: Buffer
): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
  const result = await parser.getText();
  return result.text;
}
