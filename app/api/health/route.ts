import { NextResponse } from "next/server";
import { getProviderHealth } from "@/lib/ai/provider";

export async function GET() {
  try {
    const health = await getProviderHealth();
    return NextResponse.json(health);
  } catch {
    return NextResponse.json(
      { claude: { available: false, latency: 0 }, ollama: { available: false, model: "mistral", latency: 0 }, activeProvider: "none" },
      { status: 503 }
    );
  }
}
