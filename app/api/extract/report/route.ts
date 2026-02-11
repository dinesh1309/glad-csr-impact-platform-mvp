import { NextRequest, NextResponse } from "next/server";
import { extractFromPDF, parseJSONResponse } from "@/lib/ai/provider";
import { buildReportExtractionPrompt } from "@/lib/ai/prompts";
import type { ReportExtraction, KPI } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kpisJson = formData.get("kpis") as string | null;

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

    // Parse existing KPIs to provide context for extraction
    let kpis: KPI[] = [];
    if (kpisJson) {
      try {
        kpis = JSON.parse(kpisJson);
      } catch {
        // Continue without KPI context
      }
    }

    const kpiContext = kpis
      .map(
        (k) =>
          `- ${k.id}: ${k.name} (target: ${k.targetValue} ${k.unit}, category: ${k.category})`
      )
      .join("\n");

    const prompt = buildReportExtractionPrompt(
      kpiContext || "No KPIs provided — extract any measurable values found."
    );

    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const result = await extractFromPDF(pdfBuffer, prompt);
    const data = parseJSONResponse<ReportExtraction>(result.text);

    return NextResponse.json({
      success: true,
      data,
      provider: result.provider,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Extraction failed";
    console.error("Report extraction error:", error);

    return NextResponse.json(
      { success: false, error: message, canRetry: true },
      { status: 422 }
    );
  }
}
