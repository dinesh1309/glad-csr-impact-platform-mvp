import { NextRequest, NextResponse } from "next/server";
import { extractFromText, parseJSONResponse, type ProviderName } from "@/lib/ai/provider";
import { buildKpiSuggestionPrompt } from "@/lib/ai/prompts";

interface KpiSuggestionResponse {
  kpiIds: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileInfo, kpiList } = body as {
      fileInfo: string;
      kpiList: string;
    };

    if (!fileInfo || !kpiList) {
      return NextResponse.json(
        { success: false, error: "Both fileInfo and kpiList are required" },
        { status: 400 }
      );
    }

    const prompt = buildKpiSuggestionPrompt(fileInfo, kpiList);

    const override = (body as { providerOverride?: ProviderName }).providerOverride;
    const result = await extractFromText(
      "See file details and KPI list in the prompt above.",
      prompt,
      override || undefined
    );
    const data = parseJSONResponse<KpiSuggestionResponse>(result.text);

    return NextResponse.json({
      success: true,
      kpiIds: Array.isArray(data.kpiIds) ? data.kpiIds : [],
      provider: result.provider,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "KPI suggestion failed";
    console.error("KPI suggestion error:", error);

    // Graceful fallback — return empty array instead of error
    return NextResponse.json({
      success: true,
      kpiIds: [],
      error: message,
    });
  }
}
