import Anthropic from "@anthropic-ai/sdk";
import { buildAnalysisText } from "./pdf";
import type { ParsedPDF } from "./pdf";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const PER_DOC_LIMIT = 40000;
const TOTAL_LIMIT   = 60000;

function buildDocContext(
  docs: { file_name: string; doc_type: string; year: string | null; parsed: ParsedPDF }[]
): { texts: { file_name: string; doc_type: string; year: string | null; text: string }[]; totalChars: number } {
  const texts: { file_name: string; doc_type: string; year: string | null; text: string }[] = [];
  let totalChars = 0;
  for (const doc of docs) {
    if (totalChars >= TOTAL_LIMIT) break;
    const remaining = Math.min(PER_DOC_LIMIT, TOTAL_LIMIT - totalChars);
    const text = buildAnalysisText(doc.parsed, remaining);
    texts.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, text });
    totalChars += text.length;
  }
  return { texts, totalChars };
}

function formatDocsForPrompt(
  texts: { file_name: string; doc_type: string; year: string | null; text: string }[]
): string {
  return texts.map(d =>
    `\n\n${"─".repeat(60)}\nDOCUMENT: ${d.file_name} | ${d.doc_type}${d.year ? ` | ${d.year}` : ""}\n${"─".repeat(60)}\n${d.text}`
  ).join("");
}

async function callClaude(system: string, user: string): Promise<string> {
  const message = await Promise.race([
    client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      system,
      messages: [{ role: "user", content: user }],
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Claude API timed out after 240 seconds")), 240_000)
    ),
  ]);
  return message.content
    .filter(c => c.type === "text")
    .map(c => (c as { type: "text"; text: string }).text)
    .join("");
}

function parseJSON<T>(raw: string): T {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Claude did not return valid JSON");
  try {
    return JSON.parse(match[0]) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`JSON parse failed: ${msg}`);
  }
}

// ── Sovereign Analysis ────────────────────────────────────────────────────────

const SOVEREIGN_SYSTEM = `You are an elite buy-side EM sovereign credit analyst. You analyse IMF Article IV consultations, central bank reports, Ministry of Finance fiscal data, Eurobond prospectuses, and rating agency reports. Your job is to produce rigorous credit assessments that help portfolio managers make Overweight/Neutral/Underweight decisions on sovereign Eurobonds.

Rules:
- Cite specific data points (percentages, USD amounts, ratios) from the documents provided
- Be precise and evidence-driven — no generic observations
- Credit view should reflect the trajectory, not just the current snapshot
- Output ONLY valid JSON. No preamble, no markdown, no text outside the JSON.
- Ensure the JSON is complete and properly closed — never truncate mid-response.`;

function buildSovereignPrompt(countryName: string, docs: { file_name: string; doc_type: string; year: string | null; text: string }[]): string {
  const content = formatDocsForPrompt(docs);
  return `Analyse the following documents for ${countryName} and return a comprehensive EM sovereign credit assessment as JSON.
${content}

Return ONLY this exact JSON structure — all fields required:

{
  "snapshot": {
    "country": "${countryName}",
    "region": "Sub-Saharan Africa|MENA|LatAm|Eastern Europe|Asia",
    "creditView": "Positive|Neutral|Negative",
    "creditRationale": "2-3 sentence rationale for the credit view"
  },
  "fiscalProfile": {
    "fiscalBalanceGdp": "e.g. -4.2% of GDP",
    "primaryBalanceGdp": "e.g. -1.1% of GDP",
    "debtToGdp": "e.g. 68% of GDP",
    "revenueToGdp": "e.g. 18% of GDP",
    "interestToRevenue": "e.g. 32%",
    "trend": "improving|stable|deteriorating",
    "commentary": "2-3 sentences on fiscal dynamics, consolidation path, revenue mobilisation"
  },
  "externalSector": {
    "currentAccountGdp": "e.g. -3.5% of GDP",
    "fxReservesUsd": "e.g. $4.2bn",
    "importCoverMonths": "e.g. 2.8 months",
    "externalDebtGdp": "e.g. 52% of GDP",
    "commentary": "2-3 sentences on balance of payments, reserve adequacy, external financing needs"
  },
  "debtSustainability": {
    "refinancingRisk": "High|Medium|Low",
    "currencyMix": "e.g. 65% USD, 20% local currency, 15% multilateral",
    "maturityProfile": "e.g. $1.2bn due 2025, $800m due 2027",
    "imfProgramme": {
      "active": true,
      "details": "e.g. $3bn ECF approved March 2023, 4th review completed"
    },
    "commentary": "2-3 sentences on debt sustainability, rollover risks, creditor structure"
  },
  "politicalEconomy": {
    "reformMomentum": "Strong|Moderate|Weak",
    "governanceQuality": "assessment with evidence",
    "externalRelations": "IMF, World Bank, bilateral creditors relationship",
    "commentary": "2-3 sentences on political risk, reform implementation, social pressures"
  },
  "bullCase": {
    "points": [
      { "title": "Bull point title", "evidence": "Specific evidence", "trigger": "What needs to happen" }
    ]
  },
  "bearCase": {
    "points": [
      { "title": "Bear point title", "evidence": "Specific evidence", "severity": "High|Medium|Low" }
    ]
  },
  "creditVerdict": {
    "recommendation": "Overweight|Neutral|Underweight",
    "targetSpread": "e.g. 450-500bps over UST",
    "keyCatalysts": ["catalyst 1", "catalyst 2"],
    "keyRisks": ["risk 1", "risk 2"],
    "summary": "3-4 sentence credit verdict for a portfolio manager"
  },
  "overallScore": {
    "total": <0-100>,
    "rationale": "Explanation of the score covering fiscal, external, debt sustainability and political economy"
  }
}`;
}

export async function analyseSovereign(
  countryName: string,
  documents: { file_name: string; doc_type: string; year: string | null; parsed: ParsedPDF }[],
  onProgress?: (msg: string) => void
): Promise<object> {
  onProgress?.("Building sovereign credit analysis context...");
  const { texts, totalChars } = buildDocContext(documents);
  console.log(`[sovereign] total context: ${totalChars.toLocaleString()} chars across ${texts.length} doc(s)`);
  onProgress?.(`Sending ${Math.round(totalChars / 1000)}k chars to Claude Sonnet...`);

  const t0 = Date.now();
  const raw = await callClaude(SOVEREIGN_SYSTEM, buildSovereignPrompt(countryName, texts));
  console.log(`[sovereign] Claude responded in ${Date.now() - t0}ms`);

  onProgress?.("Parsing sovereign credit assessment...");
  return parseJSON(raw);
}

// ── Corporate Analysis ────────────────────────────────────────────────────────

const CORPORATE_SYSTEM = `You are an elite buy-side EM corporate credit analyst. You analyse annual reports, bond prospectuses, investor presentations, earnings transcripts, and rating agency reports for emerging market corporates. Your job is to produce rigorous credit assessments that help portfolio managers make Buy/Hold/Sell decisions on EM corporate bonds.

Rules:
- Cite specific financial figures (leverage ratios, coverage ratios, USD amounts) from the documents
- Focus on credit quality, not equity upside
- Pay close attention to FX risk — revenue/cost/debt currency mismatches are critical in EM
- Output ONLY valid JSON. No preamble, no markdown, no text outside the JSON.
- Ensure the JSON is complete and properly closed — never truncate mid-response.`;

function buildCorporatePrompt(issuerName: string, docs: { file_name: string; doc_type: string; year: string | null; text: string }[]): string {
  const content = formatDocsForPrompt(docs);
  return `Analyse the following documents for ${issuerName} and return a comprehensive EM corporate credit assessment as JSON.
${content}

Return ONLY this exact JSON structure — all fields required:

{
  "snapshot": {
    "issuer": "${issuerName}",
    "country": "Country of incorporation",
    "sector": "Primary sector e.g. Oil & Gas, Metals & Mining, Financials, Telecoms, Real Estate",
    "creditView": "Positive|Neutral|Negative",
    "creditRationale": "2-3 sentence rationale for the credit view"
  },
  "creditMetrics": {
    "netDebtToEbitda": "e.g. 3.2x",
    "interestCoverage": "e.g. 4.1x EBITDA/interest",
    "debtToEquity": "e.g. 1.8x",
    "fcfConversion": "e.g. 65% FCF/EBITDA",
    "liquidityRatio": "e.g. 1.4x current ratio",
    "trend": "improving|stable|deteriorating"
  },
  "debtStructure": {
    "totalDebt": "e.g. $2.4bn",
    "currencyMix": "e.g. 80% USD Eurobonds, 20% local currency bank debt",
    "maturityProfile": "e.g. $500m due 2025, $750m due 2027, $1.15bn due 2029+",
    "nextMajorMaturity": "e.g. $500m 5.75% Notes due March 2025",
    "refinancingRisk": "High|Medium|Low",
    "commentary": "2-3 sentences on debt structure, refinancing strategy, covenant headroom"
  },
  "fxRisk": {
    "revenuesCurrency": "e.g. 70% USD, 30% local currency",
    "debtCurrency": "e.g. 80% USD",
    "mismatch": "High|Medium|Low|None",
    "hedging": "e.g. natural hedge via USD export revenues / no hedging in place",
    "commentary": "2-3 sentences on FX exposure, natural hedges, sensitivity to local currency depreciation"
  },
  "businessQuality": {
    "competitivePosition": "Market position with evidence",
    "revenueVisibility": "High|Medium|Low — explain why",
    "marginTrend": "Trend with numbers",
    "countryRisk": "Assessment of operating environment risk",
    "commentary": "2-3 sentences on business model strength, diversification, strategic direction"
  },
  "bullCase": {
    "points": [
      { "title": "Bull point title", "evidence": "Specific evidence from filings" }
    ]
  },
  "bearCase": {
    "points": [
      { "title": "Bear point title", "evidence": "Specific evidence", "severity": "High|Medium|Low" }
    ]
  },
  "creditVerdict": {
    "recommendation": "Buy|Hold|Sell",
    "spreadView": "Tighten|Stable|Widen",
    "keyRisks": ["risk 1", "risk 2"],
    "summary": "3-4 sentence credit verdict for a portfolio manager covering entry point, catalyst, and key risk"
  },
  "overallScore": {
    "total": <0-100>,
    "rationale": "Explanation of the score covering leverage, liquidity, business quality, FX risk and country risk"
  }
}`;
}

export async function analyseCorporate(
  issuerName: string,
  documents: { file_name: string; doc_type: string; year: string | null; parsed: ParsedPDF }[],
  onProgress?: (msg: string) => void
): Promise<object> {
  onProgress?.("Building corporate credit analysis context...");
  const { texts, totalChars } = buildDocContext(documents);
  console.log(`[corporate] total context: ${totalChars.toLocaleString()} chars across ${texts.length} doc(s)`);
  onProgress?.(`Sending ${Math.round(totalChars / 1000)}k chars to Claude Sonnet...`);

  const t0 = Date.now();
  const raw = await callClaude(CORPORATE_SYSTEM, buildCorporatePrompt(issuerName, texts));
  console.log(`[corporate] Claude responded in ${Date.now() - t0}ms`);

  onProgress?.("Parsing corporate credit assessment...");
  return parseJSON(raw);
}
