import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { getProviderHealth } = await import("@/lib/ai/provider");
    const health = await getProviderHealth();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        claude: { available: false, latency: 0 },
        ollama: { available: false, model: "mistral", latency: 0 },
        activeProvider: "none",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
