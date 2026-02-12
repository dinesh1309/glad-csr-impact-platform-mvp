// Compare Claude vs Ollama extraction on the same MoU text
// Run: node docs/seed-data/compare-providers.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Agent } from "undici";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mouText = fs.readFileSync(path.join(__dirname, "mou_text.txt"), "utf-8");

// Load env
const envPath = path.join(__dirname, "../../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

// Import the prompt
const promptFile = fs.readFileSync(
  path.join(__dirname, "../../lib/ai/prompts.ts"),
  "utf-8"
);
const promptMatch = promptFile.match(
  /export const MOU_EXTRACTION_PROMPT = `([\s\S]*?)`;/
);
const PROMPT = promptMatch[1];

const fullPrompt = `${PROMPT}\n\nDocument content:\n<document>\n${mouText}\n</document>`;

// ---- Claude ----
async function callClaude() {
  console.log("[Claude] Sending request...");
  const start = Date.now();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [{ role: "user", content: fullPrompt }],
    }),
  });
  const data = await res.json();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[Claude] Done in ${elapsed}s`);
  return { text: data.content[0].text, elapsed };
}

// ---- Ollama (streaming to avoid Node undici headersTimeout) ----
async function callOllama() {
  console.log("[Ollama/Mistral] Sending request (streaming)...");
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30 * 60 * 1000);
  try {
    const ollamaAgent = new Agent({
      headersTimeout: 30 * 60 * 1000,
      bodyTimeout: 30 * 60 * 1000,
    });
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      dispatcher: ollamaAgent,
      body: JSON.stringify({
        model: "mistral",
        prompt: fullPrompt,
        stream: true,
        options: { temperature: 0, num_predict: 4096 },
      }),
    });
    // Accumulate streamed NDJSON tokens
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = "";
    let tokens = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            result += parsed.response;
            tokens++;
            if (tokens % 100 === 0) process.stdout.write(`  [Ollama] ${tokens} tokens...\r`);
          }
        } catch { /* skip */ }
      }
    }
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[Ollama/Mistral] Done in ${elapsed}s (${tokens} tokens)`);
    return { text: result, elapsed };
  } finally {
    clearTimeout(timeout);
  }
}

function parseJSON(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  return JSON.parse(cleaned.trim());
}

// ---- Ground truth KPIs from human analysis of the MoU ----
const GROUND_TRUTH = [
  { name: "CSR Fellows Deployed", target: 2 },
  { name: "Student Outreach", target: 200000 },
  { name: "Centres of Excellence", target: 5 },
  { name: "National Hackathons", target: 3 },
  { name: "Innovation Showcases", target: 2 },
  { name: "Capacity-Building Workshops", target: 10 },
  { name: "Industry-Led Sessions", target: 8 },
  { name: "Stakeholder Roundtables", target: 4 },
  { name: "Corporate Partnerships", target: 15 },
  { name: "Industry-Academia Collaborations", target: 10 },
  { name: "Bi-Annual Impact Reports", target: 2 },
  { name: "Annual Impact Reports", target: 1 },
  { name: "Progress Reports (Six-Monthly)", target: 2 },
  { name: "Real-Time Dashboard", target: 1 },
  { name: "Student Database Updates (Quarterly)", target: 4 },
];

function scoreExtraction(kpis) {
  let matched = 0;
  let exactTarget = 0;
  const matchedGT = new Set();

  for (const kpi of kpis) {
    const kpiLower = kpi.name.toLowerCase();
    for (let i = 0; i < GROUND_TRUTH.length; i++) {
      if (matchedGT.has(i)) continue;
      const gt = GROUND_TRUTH[i];
      const gtLower = gt.name.toLowerCase();
      // Fuzzy match: check if key words overlap
      const gtWords = gtLower.split(/[\s-\/]+/).filter((w) => w.length > 3);
      const kpiWords = kpiLower.split(/[\s-\/]+/).filter((w) => w.length > 3);
      const overlap = gtWords.filter((w) =>
        kpiWords.some((kw) => kw.includes(w) || w.includes(kw))
      );
      if (overlap.length >= 1) {
        matched++;
        matchedGT.add(i);
        if (kpi.targetValue === gt.target) exactTarget++;
        break;
      }
    }
  }

  return {
    totalExtracted: kpis.length,
    groundTruthMatched: matched,
    exactTargetMatch: exactTarget,
    coveragePercent: ((matched / GROUND_TRUTH.length) * 100).toFixed(1),
    targetAccuracyPercent:
      matched > 0 ? ((exactTarget / matched) * 100).toFixed(1) : "0.0",
  };
}

// ---- Main ----
console.log("=== GLAD CSR Platform — Provider Comparison ===\n");
console.log(`Ground truth KPIs: ${GROUND_TRUTH.length}`);
console.log(`MoU text length: ${mouText.length} chars\n`);

// Run sequentially — Ollama needs full CPU and can take 15-25 min
const claudeResult = await callClaude();
const claudeData = parseJSON(claudeResult.text);
// Save Claude immediately so we don't lose it if Ollama times out
fs.writeFileSync(
  path.join(__dirname, "compare_claude.json"),
  JSON.stringify({ success: true, data: claudeData, provider: "claude" }, null, 2)
);
console.log("[Claude] Results saved to compare_claude.json");

console.log("\nWaiting for Ollama/Mistral (may take 15-25 min on CPU)...");
const ollamaResult = await callOllama();

const ollamaData = parseJSON(ollamaResult.text);

// Save Ollama results
fs.writeFileSync(
  path.join(__dirname, "compare_ollama.json"),
  JSON.stringify({ success: true, data: ollamaData, provider: "ollama" }, null, 2)
);

const claudeScore = scoreExtraction(claudeData.kpis);
const ollamaScore = scoreExtraction(ollamaData.kpis);

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║          PROVIDER COMPARISON RESULTS                      ║");
console.log("╠════════════════════════════════════════════════════════════╣");
console.log(
  `║ Metric                    │ Claude Sonnet  │ Ollama Mistral ║`
);
console.log(
  `╠═══════════════════════════╪════════════════╪════════════════╣`
);
console.log(
  `║ Response time             │ ${claudeResult.elapsed.padStart(10)}s   │ ${ollamaResult.elapsed.padStart(10)}s   ║`
);
console.log(
  `║ KPIs extracted            │ ${String(claudeScore.totalExtracted).padStart(10)}     │ ${String(ollamaScore.totalExtracted).padStart(10)}     ║`
);
console.log(
  `║ Ground truth matched      │ ${(claudeScore.groundTruthMatched + "/" + GROUND_TRUTH.length).padStart(10)}     │ ${(ollamaScore.groundTruthMatched + "/" + GROUND_TRUTH.length).padStart(10)}     ║`
);
console.log(
  `║ Coverage %                │ ${(claudeScore.coveragePercent + "%").padStart(10)}     │ ${(ollamaScore.coveragePercent + "%").padStart(10)}     ║`
);
console.log(
  `║ Exact target matches      │ ${(claudeScore.exactTargetMatch + "/" + claudeScore.groundTruthMatched).padStart(10)}     │ ${(ollamaScore.exactTargetMatch + "/" + ollamaScore.groundTruthMatched).padStart(10)}     ║`
);
console.log(
  `║ Target accuracy %         │ ${(claudeScore.targetAccuracyPercent + "%").padStart(10)}     │ ${(ollamaScore.targetAccuracyPercent + "%").padStart(10)}     ║`
);
console.log(
  `╚═══════════════════════════╧════════════════╧════════════════╝`
);

// Project details comparison
console.log("\n--- Project Details ---");
const pd1 = claudeData.projectDetails;
const pd2 = ollamaData.projectDetails;
for (const key of Object.keys(pd1)) {
  const match = String(pd1[key]) === String(pd2[key]) ? "✓" : "✗";
  console.log(`  ${match} ${key}: Claude="${pd1[key]}" | Ollama="${pd2[key]}"`);
}

// KPI-by-KPI detail
console.log("\n--- Claude KPIs ---");
for (const k of claudeData.kpis) {
  console.log(`  [${k.category}] ${k.name}: ${k.targetValue} ${k.unit}`);
}
console.log("\n--- Ollama KPIs ---");
for (const k of ollamaData.kpis) {
  console.log(`  [${k.category}] ${k.name}: ${k.targetValue} ${k.unit}`);
}
