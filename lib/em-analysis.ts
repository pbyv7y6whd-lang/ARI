import Anthropic from "@anthropic-ai/sdk";
import { buildAnalysisText } from "./pdf";
import type { ParsedPDF } from "./pdf";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const PER_DOC_LIMIT = 20000;
const TOTAL_LIMIT   = 30000;

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
      max_tokens: 4096,
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

const SOVEREIGN_SYSTEM = `You are a senior EM sovereign credit analyst at a top-tier hedge fund (think Brevan Howard, BlueBay, Greylock Capital). You read IMF Article IVs, central bank reports, MoF fiscal data, Eurobond prospectuses, and rating agency reports. Your output goes directly to a portfolio manager making allocation decisions on sovereign Eurobonds.

Analyst standards:
- Every claim must cite a specific number from the documents (%, $bn, bps, ratio). No assertions without evidence.
- Be direct and analytical — no filler phrases ("it is worth noting", "importantly", "overall"). Every sentence must add information.
- Distinguish between current snapshot and trajectory. A deteriorating credit at 60% debt/GDP is more dangerous than a stable one at 80%.
- Flag data gaps explicitly if key metrics are absent from documents provided.
- Trade ideas must be actionable: name the specific bond (tenor/maturity), entry level, target, stop, and time horizon.
- Output ONLY valid JSON. No preamble, no markdown, no text outside the JSON.
- Ensure the JSON is complete and properly closed — never truncate mid-response.`;

function buildSovereignPrompt(countryName: string, docs: { file_name: string; doc_type: string; year: string | null; text: string }[]): string {
  const content = formatDocsForPrompt(docs);
  return `Produce a PM-ready EM sovereign credit assessment for ${countryName} from the documents below. This goes to a portfolio manager making Eurobond allocation decisions today.
${content}

Return ONLY this JSON — all fields required. Use "N/A — not in documents" if data is absent rather than guessing:

{
  "snapshot": {
    "country": "${countryName}",
    "region": "Sub-Saharan Africa|MENA|LatAm|Eastern Europe|Asia",
    "creditView": "Positive|Neutral|Negative",
    "creditRationale": "2 sentences max. State the dominant credit driver and its direction. No hedging."
  },
  "fiscalProfile": {
    "fiscalBalanceGdp": "e.g. -3.8% of GDP (FY2025e)",
    "primaryBalanceGdp": "e.g. +0.4% of GDP",
    "debtToGdp": "e.g. 87% of GDP",
    "revenueToGdp": "e.g. 16.2% of GDP",
    "interestToRevenue": "e.g. 38% — critical threshold if >30%",
    "trend": "improving|stable|deteriorating",
    "keyMetric": "The single most important fiscal data point and why it matters for credit"
  },
  "externalSector": {
    "currentAccountGdp": "e.g. -3.1% of GDP",
    "fxReservesUsd": "e.g. $9.4bn (gross), $4.1bn (net of swaps)",
    "importCoverMonths": "e.g. 3.2 months — below 3m is distress threshold",
    "externalFinancingNeed": "e.g. $18bn in FY2026 (CAD + amortisation)",
    "keyRisk": "Primary external vulnerability in one sentence with numbers"
  },
  "debtSustainability": {
    "refinancingRisk": "High|Medium|Low",
    "maturityWall": "e.g. $2bn due H1 2026, $3.5bn due 2027 — state if bond or bilateral",
    "currencyMix": "e.g. 55% hard currency, 30% local, 15% multilateral concessional",
    "imfProgramme": {
      "active": true,
      "details": "e.g. $8bn EFF, approved Mar 2024, 2nd review passed Oct 2024, next tranche $1.2bn",
      "continuationRisk": "Risk that programme goes off-track — evidence-based"
    },
    "debtTrajectory": "Stabilising|Declining|Rising — with peak debt/GDP level and year if available"
  },
  "politicalEconomy": {
    "reformMomentum": "Strong|Moderate|Weak",
    "keyReform": "The most critical reform underway and status",
    "socialRisk": "Austerity fatigue, unemployment, subsidy cuts — specific evidence",
    "externalRelations": "IMF/GCC/bilateral creditor dynamics — any conditionality or geopolitical dimension"
  },
  "catalystsAndRisks": {
    "positiveCatalysts": [
      { "catalyst": "Specific event or data release", "timing": "e.g. Q2 2026", "spreadImpact": "e.g. -50 to -80bps on the curve" }
    ],
    "negativeRisks": [
      { "risk": "Specific risk", "probability": "High|Medium|Low", "spreadImpact": "e.g. +150bps+, likely triggers IMF suspension" }
    ]
  },
  "tradeIdeas": [
    {
      "bond": "e.g. EGYPT 7.625% 2029 or 6.588% 2028",
      "direction": "Long|Short|Avoid",
      "entryLevel": "e.g. Z+820bps / ~9.10% yield / ~$85 price",
      "target": "e.g. Z+680bps / ~$91 (12m horizon)",
      "stop": "e.g. Z+950bps / ~$81 — IMF programme suspension",
      "riskReward": "e.g. 2.3x (carry included)",
      "horizon": "3m|6m|12m|18m+",
      "rationale": "2-3 sentences: why this bond, why now, what makes the entry compelling vs alternatives on the curve",
      "keyMonitor": "The one data point or event that changes the thesis"
    }
  ],
  "creditVerdict": {
    "recommendation": "Overweight|Neutral|Underweight",
    "currentSpreadContext": "e.g. trading at Z+780bps, 200bps wide of Jan 2024 tights — cheap vs history or fair?",
    "summary": "3 sentences for a PM: current positioning, primary driver of the view, and what would change it"
  },
  "overallScore": {
    "total": 0,
    "breakdown": {
      "fiscal": "0-25",
      "external": "0-25",
      "debtSustainability": "0-25",
      "politicalEconomy": "0-25"
    },
    "rationale": "What the score reflects — be direct about the weakest pillar"
  }
}`;
}

export async function analyseSovereign(
  countryName: string,
  documents: { file_name: string; doc_type: string; year: string | null; parsed: ParsedPDF }[],
  onProgress?: (msg: string) => void
): Promise<object> {
  onProgress?.("Building sovereign credit context...");
  const { texts, totalChars } = buildDocContext(documents);
  console.log(`[sovereign] total context: ${totalChars.toLocaleString()} chars across ${texts.length} doc(s)`);
  onProgress?.(`Running sovereign analysis across ${texts.length} document(s)...`);

  const t0 = Date.now();
  const raw = await callClaude(SOVEREIGN_SYSTEM, buildSovereignPrompt(countryName, texts));
  console.log(`[sovereign] Claude responded in ${Date.now() - t0}ms`);

  onProgress?.("Parsing credit assessment...");
  return parseJSON(raw);
}

// ── Corporate Analysis ────────────────────────────────────────────────────────

const CORPORATE_SYSTEM = `You are a senior EM corporate credit analyst at a top-tier hedge fund (think Bluebay, Ashmore, Stone Harbor). You analyse annual reports, bond prospectuses, investor presentations, earnings transcripts, and rating agency reports for EM corporates. Your output goes directly to a PM making bond allocation decisions.

Analyst standards:
- Every claim must cite a specific number from the documents (leverage ratio, coverage ratio, $bn, %). No assertions without evidence.
- Be direct — no filler. Every sentence must add information.
- FX mismatch is often the killer in EM credit — stress-test it explicitly.
- Distinguish between accounting metrics and cash credit quality (watch working capital, capex, related-party flows).
- Trade ideas must be actionable: name the specific bond (coupon/maturity), entry level in spread or yield, target, stop, time horizon.
- Flag data gaps with "N/A — not in documents" rather than guessing.
- Output ONLY valid JSON. No preamble, no markdown, no text outside the JSON.
- Ensure the JSON is complete and properly closed — never truncate mid-response.`;

function buildCorporatePrompt(issuerName: string, docs: { file_name: string; doc_type: string; year: string | null; text: string }[]): string {
  const content = formatDocsForPrompt(docs);
  return `Produce a PM-ready EM corporate credit assessment for ${issuerName} from the documents below. This goes to a PM making bond allocation decisions today.
${content}

Return ONLY this JSON — all fields required. Use "N/A — not in documents" if data is absent:

{
  "snapshot": {
    "issuer": "${issuerName}",
    "country": "Country of incorporation",
    "sector": "Oil & Gas|Metals & Mining|Financials|Telecoms|Real Estate|Utilities|Consumer|Infrastructure|Other",
    "creditView": "Positive|Neutral|Negative",
    "creditRationale": "2 sentences max. Lead with the dominant credit driver — leverage, liquidity, FX, or sovereign ceiling."
  },
  "creditMetrics": {
    "netDebtToEbitda": "e.g. 3.8x (FY2024) vs 4.2x (FY2023) — direction matters",
    "ebitdaToInterest": "e.g. 3.1x — <2.5x is distress territory for EM",
    "fcfYield": "e.g. 6.2% of debt — FCF after capex and interest",
    "liquidityRunway": "e.g. $420m cash + $200m undrawn RCF vs $310m due within 12m",
    "trend": "improving|stable|deteriorating",
    "keyWeakness": "The metric that most concerns a credit analyst, with the number"
  },
  "debtStructure": {
    "totalDebt": "e.g. $2.1bn gross, $1.8bn net",
    "currencyMix": "e.g. 75% USD Eurobonds, 25% local currency bank debt",
    "maturityWall": "e.g. $400m 5.875% due Jun 2026, $600m 6.25% due Nov 2027",
    "nextMaturity": "e.g. $400m Notes due Jun 2026 — must refinance or repay in 18m",
    "refinancingRisk": "High|Medium|Low",
    "covenantHeadroom": "e.g. Net leverage covenant at 4.0x, currently 3.8x — thin headroom"
  },
  "fxRisk": {
    "revenuesCurrency": "e.g. 60% USD export revenues, 40% local currency domestic",
    "debtCurrency": "e.g. 75% USD",
    "mismatch": "High|Medium|Low|Natural Hedge",
    "stressTest": "e.g. 20% local currency depreciation adds ~0.4x to leverage, coverage drops to 2.3x",
    "hedging": "e.g. No formal hedging — natural hedge via USD revenues covers 80% of USD debt service"
  },
  "businessQuality": {
    "marketPosition": "Ranking with evidence — e.g. #2 producer in country X with 18% market share",
    "revenueVisibility": "High|Medium|Low",
    "marginTrend": "e.g. EBITDA margin 34% (FY24) vs 29% (FY22) — expanding on cost cuts",
    "sovereignCeiling": "e.g. Sovereign rated B2/B, issuer at B1/B+ — one notch above ceiling, limits upside",
    "keyRisk": "The single biggest business risk with evidence"
  },
  "catalystsAndRisks": {
    "positiveCatalysts": [
      { "catalyst": "Specific event", "timing": "e.g. Q1 2026", "spreadImpact": "e.g. -60 to -80bps" }
    ],
    "negativeRisks": [
      { "risk": "Specific risk with numbers", "probability": "High|Medium|Low", "spreadImpact": "e.g. +200bps+ / restructuring risk" }
    ]
  },
  "tradeIdeas": [
    {
      "bond": "e.g. ISSUER 6.25% 2027 or 5.875% 2026",
      "direction": "Long|Short|Avoid",
      "entryLevel": "e.g. Z+480bps / ~8.2% yield / ~$94 price",
      "target": "e.g. Z+380bps / ~$98 (6m horizon, carry + tightening)",
      "stop": "e.g. Z+580bps / ~$90 — maturity extension risk materialises",
      "riskReward": "e.g. 2.0x",
      "horizon": "3m|6m|12m|18m+",
      "rationale": "2-3 sentences: why this bond, what's the entry thesis, why now vs waiting",
      "keyMonitor": "The single metric or event that invalidates the trade"
    }
  ],
  "creditVerdict": {
    "recommendation": "Buy|Hold|Sell",
    "currentSpreadContext": "e.g. trading at Z+460bps, peer group at Z+380bps — 80bps wide to peers, partially justified by FX risk",
    "summary": "3 sentences for a PM: current positioning, the primary driver, and what changes the view"
  },
  "overallScore": {
    "total": 0,
    "breakdown": {
      "leverage": "0-25",
      "liquidity": "0-25",
      "businessQuality": "0-25",
      "fxAndCountryRisk": "0-25"
    },
    "rationale": "Be direct about the weakest pillar and whether it's structural or cyclical"
  }
}`;
}

export async function analyseCorporate(
  issuerName: string,
  documents: { file_name: string; doc_type: string; year: string | null; parsed: ParsedPDF }[],
  onProgress?: (msg: string) => void
): Promise<object> {
  onProgress?.("Building corporate credit context...");
  const { texts, totalChars } = buildDocContext(documents);
  console.log(`[corporate] total context: ${totalChars.toLocaleString()} chars across ${texts.length} doc(s)`);
  onProgress?.(`Running corporate analysis across ${texts.length} document(s)...`);

  const t0 = Date.now();
  const raw = await callClaude(CORPORATE_SYSTEM, buildCorporatePrompt(issuerName, texts));
  console.log(`[corporate] Claude responded in ${Date.now() - t0}ms`);

  onProgress?.("Parsing credit assessment...");
  return parseJSON(raw);
}
