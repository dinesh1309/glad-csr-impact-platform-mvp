import { NextRequest, NextResponse } from "next/server";
import { extractFromText, parseJSONResponse } from "@/lib/ai/provider";
import { buildEvidenceAnalysisPrompt } from "@/lib/ai/prompts";
import type { ValidationResult } from "@/lib/types";

interface EvidenceAnalysisResponse {
  validationResults: ValidationResult[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { evidenceMetadata, linkedKpiData } = body as {
      evidenceMetadata: string;
      linkedKpiData: string;
    };

    if (!evidenceMetadata || !linkedKpiData) {
      return NextResponse.json(
        {
          success: false,
          error: "Both evidenceMetadata and linkedKpiData are required",
        },
        { status: 400 }
      );
    }

    const prompt = buildEvidenceAnalysisPrompt(
      evidenceMetadata,
      linkedKpiData
    );

    const result = await extractFromText(
      "See evidence metadata and KPI data in the prompt above.",
      prompt
    );
    const data = parseJSONResponse<EvidenceAnalysisResponse>(result.text);

    return NextResponse.json({
      success: true,
      data: data.validationResults,
      provider: result.provider,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Evidence analysis failed";
    console.error("Evidence analysis error:", error);

    return NextResponse.json(
      { success: false, error: message, canRetry: true },
      { status: 422 }
    );
  }
}
