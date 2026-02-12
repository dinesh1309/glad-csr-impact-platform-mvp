import { NextRequest, NextResponse } from "next/server";
import { extractFromPDF, parseJSONResponse } from "@/lib/ai/provider";
import { MOU_EXTRACTION_PROMPT } from "@/lib/ai/prompts";
import type { ProjectDetails, KPI } from "@/lib/types";

interface MoUExtractionResponse {
  projectDetails: ProjectDetails;
  kpis: KPI[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const result = await extractFromPDF(pdfBuffer, MOU_EXTRACTION_PROMPT);
    const data = parseJSONResponse<MoUExtractionResponse>(result.text);

    return NextResponse.json({
      success: true,
      data,
      provider: result.provider,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Extraction failed";
    console.error("MoU extraction error:", error);

    const isNoProvider = message.includes("No AI provider");
    return NextResponse.json(
      { success: false, error: message, canRetry: !isNoProvider },
      { status: isNoProvider ? 503 : 422 }
    );
  }
}
