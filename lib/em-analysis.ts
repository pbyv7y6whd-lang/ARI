import Anthropic from "@anthropic-ai/sdk";
import { buildAnalysisText } from "./pdf";
import type { ParsedPDF } from "./pdf";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const ANNUAL_REPORT_LIMIT = 50000; // annual reports get more space — financials are near the back
const PER_DOC_LIMIT       = 20000;
const TOTAL_LIMIT         = 90000;

const PRIORITY_DOC_TYPES = ["annual_report", "bond_prospectus", "imf_article_iv", "central_bank_report"];

function buildDocContext(
  docs: { file_name: string; doc_type: string; year: string | null; parsed: ParsedPDF }[]
): { texts: { file_name: string; doc_type: string; year: string | null; text: string }[]; totalChars: number } {
  // Sort: priority doc types first, then others
  const sorted = [...docs].sort((a, b) => {
    const ai = PRIORITY_DOC_TYPES.indexOf(a.doc_type);
    const bi = PRIORITY_DOC_TYPES.indexOf(b.doc_type);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const texts: { file_name: string; doc_type: string; year: string | null; text: string }[] = [];
  let totalChars = 0;
  for (const doc of sorted) {
    if (totalChars >= TOTAL_LIMIT) break;
    const perLimit = doc.doc_type === "annual_report" ? ANNUAL_REPORT_LIMIT : PER_DOC_LIMIT;
    const remaining = Math.min(perLimit, TOTAL_LIMIT - totalChars);
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
  if (!match) {
    const preview = raw.slice(0, 200).replace(/\n/g, " ");
    throw new Error(`Claude did not return valid JSON. Response preview: "${preview}"`);
  }
  try {
    return JSON.parse(match[0]) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Log the raw content around the failure point for debugging
    const failPos = parseInt(msg.match(/position (\d+)/)?.[1] ?? "0");
    const snippet = match[0].slice(Math.max(0, failPos - 100), failPos + 100);
    throw new Error(`JSON parse failed at pos ${failPos}: ${msg} — snippet: ...${snippet}...`);
  }
}

// ── Sovereign Analysis ────────────────────────────────────────────────────────

const SOVEREIGN_SYSTEM = `You are a junior analyst at Mesarete Capital, a London-based EM credit investment manager. You support senior analysts and PMs on the full investment lifecycle across EM hard currency credit — sovereigns, quasi-sovereigns, and corporates. Your output goes directly to a senior analyst or PM who will use it to make allocation decisions.

Your work covers: directional and relative value trade idea generation, fundamental credit analysis (fiscal, external, debt sustainability), financing sources and uses, debt repayment schedules, and portfolio sizing recommendations.

Analyst standards:
- Every claim must cite a specific number from the documents (%, $bn, bps, ratio, x). No assertions without evidence.
- Be direct — no filler phrases ("it is worth noting", "importantly"). Every sentence adds information.
- Distinguish trajectory from snapshot: a deteriorating 60% debt/GDP is more dangerous than a stable 80%.
- Relative value matters as much as direction: where does this bond trade vs peers, vs the issuer's own curve, vs the quasi-sovereign complex?
- DERIVE BEFORE YOU WRITE N/A: Before writing "N/A — not in documents" for any metric, check whether it can be calculated arithmetically from numbers already stated in the documents or in your own response. Show your working in parentheses. Examples:
  · Import cover months = gross FX reserves ($bn) ÷ (annual goods imports ($bn) ÷ 12). If you have reserves and import data anywhere in the documents, calculate it.
  · Gross financing need = overall fiscal deficit + maturing external debt in the period. If both are stated, sum them and show the components.
  · Interest/revenue ratio = interest payments as % of GDP ÷ revenue as % of GDP. If you have both GDP ratios, calculate.
  · Current account % GDP = CA balance ($bn) ÷ nominal GDP ($bn) × 100. If both are in the documents, calculate.
  · External debt service ratio = total external debt service ÷ goods & services export earnings × 100.
  · FX reserve change = end-period reserves minus start-period reserves, show both dates and the delta.
  Only write "N/A — not in documents" if the component inputs are genuinely absent from all source documents.
- Trade ideas must include BOTH directional (long/short outright) AND relative value (long X vs short Y) where appropriate.
- Portfolio sizing must be explicit: how much of the fund, and why (conviction, liquidity, volatility).
- Output ONLY valid JSON. No preamble, no markdown, no text outside the JSON.
- Ensure the JSON is complete and properly closed — never truncate mid-response.`;

function buildSovereignPrompt(countryName: string, docs: { file_name: string; doc_type: string; year: string | null; text: string }[]): string {
  const content = formatDocsForPrompt(docs);
  return `Produce a senior-analyst-ready EM sovereign credit note for ${countryName}. This is for Mesarete Capital, an EM credit HF — it goes to the PM and senior analyst for allocation decisions across hard currency Eurobonds.

Cover: fundamental credit analysis, financing sources and uses, debt repayment schedule, relative value vs peers, directional and RV trade ideas, and a portfolio sizing recommendation.
${content}

Return ONLY this JSON — all fields required. For every field: first try to calculate the metric from numbers in the documents (show working in parentheses). Only use "N/A — not in documents" if the input data is genuinely absent:

{
  "snapshot": {
    "country": "${countryName}",
    "region": "Sub-Saharan Africa|MENA|LatAm|Eastern Europe|Asia",
    "creditView": "Positive|Neutral|Negative",
    "creditRationale": "2 sentences max. Lead with the dominant credit driver and trajectory. No hedging language."
  },
  "fiscalProfile": {
    "fiscalBalanceGdp": "e.g. -3.8% of GDP (FY2025e)",
    "primaryBalanceGdp": "e.g. +0.4% of GDP",
    "debtToGdp": "e.g. 87% of GDP",
    "revenueToGdp": "e.g. 16.2% of GDP",
    "interestToRevenue": "e.g. 38% — flag if >30%, distress if >50%",
    "trend": "improving|stable|deteriorating",
    "keyMetric": "The single fiscal data point most relevant to creditworthiness, with context"
  },
  "financingSourcesAndUses": {
    "grossFinancingNeed": "e.g. $22bn FY2026 (CAD $8bn + debt amortisation $14bn)",
    "fundingSources": "e.g. IMF/MFI $6bn, bilateral GCC $4bn, domestic T-bills $8bn, Eurobond $4bn",
    "fundingGap": "e.g. $4bn unfunded — requires market access or additional bilateral support",
    "domesticFundingCapacity": "e.g. T-bill issuance running at $1.2bn/month, local banks absorbed 85% of recent auction",
    "commentary": "1-2 sentences on the realism of the funding plan and key execution risks"
  },
  "debtRepaymentSchedule": {
    "next12Months": "e.g. $2.1bn Eurobond Apr 2026 + $900m bilateral Jun 2026",
    "next24Months": "e.g. additional $3.5bn due 2027 — largest maturity wall",
    "imfTranchePipeline": "e.g. $1.2bn tranche expected Q1 2026 subject to 3rd review",
    "refinancingStrategy": "e.g. Plans to pre-fund Apr 2026 maturity via new Eurobond in Q4 2025 — market access dependent"
  },
  "externalSector": {
    "currentAccountGdp": "e.g. -3.1% of GDP",
    "fxReservesUsd": "e.g. $9.4bn gross / $4.1bn net of swaps and forwards",
    "importCoverMonths": "e.g. 3.2 months gross — below 3m is a distress signal",
    "externalFinancingNeed": "e.g. $18bn FY2026",
    "keyVulnerability": "Primary external risk in one sentence with numbers"
  },
  "debtSustainability": {
    "refinancingRisk": "High|Medium|Low",
    "maturityWall": "e.g. $2bn H1 2026 (Eurobond) + $3.5bn 2027 (bilateral + bond)",
    "currencyMix": "e.g. 55% hard currency Eurobonds, 30% domestic, 15% multilateral concessional",
    "imfProgramme": {
      "active": true,
      "details": "e.g. $8bn EFF approved Mar 2024, 2nd review passed Oct 2024, $1.2bn next tranche",
      "continuationRisk": "Evidence-based assessment of programme derailment risk"
    },
    "debtTrajectory": "Stabilising|Declining|Rising — with peak debt/GDP estimate and year"
  },
  "politicalEconomy": {
    "reformMomentum": "Strong|Moderate|Weak",
    "keyReform": "Most credit-relevant reform in progress and current status",
    "socialRisk": "Austerity fatigue, subsidy cuts, unemployment — specific evidence with numbers",
    "externalRelations": "IMF, GCC, bilateral creditors, geopolitical dynamics — any conditionality"
  },
  "relativeValue": {
    "currentSpread": "e.g. EGYPT curve: 2026 at Z+580bps, 2029 at Z+820bps, 2032 at Z+890bps",
    "peerComparison": "e.g. vs Nigeria 2029 at Z+750bps, Pakistan 2029 at Z+950bps — EGYPT screens cheap to NG but rich to PK",
    "curveShape": "e.g. 2-10yr curve at +310bps — steep vs peer median of +200bps, front-end expensive on roll",
    "historicalContext": "e.g. Current spread 220bps wide of Jan 2024 tights, 180bps tight of Oct 2023 stress peak",
    "rvConclusion": "Which part of the curve offers best risk-adjusted entry and why"
  },
  "catalystsAndRisks": {
    "positiveCatalysts": [
      { "catalyst": "Specific event or data release", "timing": "e.g. Q2 2026", "spreadImpact": "e.g. -50 to -80bps on the curve" }
    ],
    "negativeRisks": [
      { "risk": "Specific risk with evidence", "probability": "High|Medium|Low", "spreadImpact": "e.g. +150bps+, likely triggers IMF suspension" }
    ]
  },
  "tradeIdeas": [
    {
      "type": "Directional|RV",
      "bond": "e.g. EGYPT 7.625% 2029 — for RV: Long EGYPT 2029 / Short NIGERIA 2029",
      "direction": "Long|Short|Long-Short|Avoid",
      "entryLevel": "e.g. Z+820bps / ~9.10% yield / ~$85 price — or for RV: EGYPT/NIGERIA spread at -70bps",
      "target": "e.g. Z+680bps / ~$91 — or RV: spread narrows to +50bps",
      "stop": "e.g. Z+950bps / ~$81 — IMF review failure",
      "riskReward": "e.g. 2.3x (carry + spread compression)",
      "horizon": "3m|6m|12m|18m+",
      "rationale": "2-3 sentences: why this bond/pair, entry thesis, what makes it compelling",
      "keyMonitor": "One data point or event that invalidates the trade"
    }
  ],
  "portfolioSizing": {
    "recommendation": "e.g. 2-3% of AUM — Moderate conviction, add on weakness",
    "convictionLevel": "High|Medium|Low",
    "sizingRationale": "Why this size: conviction, liquidity, spread volatility, correlation to existing book",
    "addLevels": "e.g. Add to 4% if spread widens to Z+900bps on IMF review delay without programme break",
    "exitStrategy": "e.g. Reduce to 1% at Z+650bps target or on signs of fiscal slippage"
  },
  "creditVerdict": {
    "recommendation": "Overweight|Neutral|Underweight",
    "currentSpreadContext": "e.g. Z+820bps — 200bps wide of Jan 2024 tights, carry of ~9.1% compensates for refinancing risk",
    "summary": "3 sentences for the PM: positioning, primary driver, what changes the view"
  },
  "overallScore": {
    "total": 0,
    "breakdown": {
      "fiscal": "0-25",
      "external": "0-25",
      "debtSustainability": "0-25",
      "politicalEconomy": "0-25"
    },
    "rationale": "Direct assessment of the weakest pillar and whether it is structural or cyclical"
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

const CORPORATE_SYSTEM = `You are a junior analyst at Mesarete Capital, a London-based EM credit investment manager. You support senior analysts and PMs on EM hard currency credit across sovereigns, quasi-sovereigns, and corporates. Your corporate analysis covers three-statement fundamentals (income statement, balance sheet, cash flow), debt repayment schedules, financing sources and uses, FX risk, and relative value vs sector peers. Your output goes directly to a senior analyst or PM.

Analyst standards:
- Every claim must cite a specific number (leverage, coverage, $bn, %). No assertions without evidence.
- Be direct — no filler. Every sentence adds information.
- For quasi-sovereigns, assess implicit sovereign support explicitly: ownership structure, strategic importance, track record of support, and whether spreads appropriately reflect the linkage.
- FX mismatch is often the kill-shot in EM credit — stress-test it explicitly.
- Distinguish accounting from cash credit quality: watch working capital, capex intensity, related-party flows, and dividend upstreaming.
- Trade ideas must include both directional and RV (vs sector peers, vs senior/sub stack) where relevant.
- New issue analysis: assess fair value vs secondary, NIP, and portfolio sizing relative to existing exposure.
- DERIVE BEFORE YOU WRITE N/A: Before writing "N/A — not in documents" for any metric, check whether it can be calculated from numbers already in the documents or your response. Show your working in parentheses. Examples:
  · EBITDA margin = EBITDA ÷ revenue × 100. If both are stated, calculate.
  · Net debt = gross debt − cash. If both are stated, calculate.
  · Net debt / EBITDA = net debt ÷ EBITDA. If both are stated, calculate.
  · Interest coverage = EBITDA ÷ interest expense. If both are stated, calculate.
  · FCF = EBITDA − interest − tax − capex ± working capital change. Derive from components if available.
  · FCF / debt service = FCF ÷ (interest + scheduled amortisation). If both are stated, calculate.
  · FX stress: if revenue currency split and debt currency split are known, model a 20-30% depreciation scenario explicitly.
  Only write "N/A — not in documents" if the component inputs are genuinely absent.
- Flag data gaps as "N/A — not in documents" rather than guessing.
- Output ONLY valid JSON. No preamble, no markdown, no text outside the JSON.
- Ensure the JSON is complete and properly closed — never truncate mid-response.`;

function buildCorporatePrompt(issuerName: string, docs: { file_name: string; doc_type: string; year: string | null; text: string }[], sector?: string): string {
  const content = formatDocsForPrompt(docs);
  const isBank = sector?.toLowerCase().includes("financ") || sector?.toLowerCase().includes("bank");

  const bankMetricsSchema = isBank ? `
  "bankMetrics": {
    "cet1Ratio": "latest figure, prior period, regulatory minimum, trend",
    "nim": "latest NIM, prior period, vs peer average",
    "roae": "latest annualised, FY figure, note if FX gains inflate",
    "stage3Ratio": "NPL equivalent, trend",
    "stage2Ratio": "figure, vs peers, flag if sovereign-driven",
    "loansToDeposits": "figure vs sector average",
    "casaRatio": "figure and funding advantage",
    "sovereignExposure": "% of assets, multiple of CET1",
    "liquidityCoverage": "FCY coverage ratio",
    "operatingProfitRwa": "figure, vs peers",
    "sovereignCeiling": "rating constraint and VR",
    "fxStressBank": "25% depreciation scenario: CET1 impact, FCY coverage, prior devaluation track record"
  },` : "";

  return `You are a senior EM credit analyst at a specialist EM hedge fund. Produce an institutional-quality credit note for ${issuerName} — write like a JPMorgan or Goldman EM credit research note. Precise, no filler, lead with numbers. Flag data gaps explicitly rather than estimating.
${isBank ? "IMPORTANT: This is a BANK. No EBITDA/FCF/net debt metrics. Use bank P&L equivalents: NII for revenue, pre-provision profit for EBITDA, regulatory capital for leverage. Fill bankMetrics fully." : ""}
${content}

Return ONLY valid JSON. All fields required. Use "N/A — not in documents" only if genuinely absent.

{
  "snapshot": {
    "issuer": "${issuerName}",
    "country": "country",
    "sector": "Oil & Gas|Metals & Mining|Financials|Telecoms|Real Estate|Utilities|Consumer|Infrastructure|Other",
    "isQuasiSovereign": true,
    "sovereignOwnership": "ownership % and entity",
    "creditView": "Positive|Neutral|Negative",
    "creditRationale": "2 sentences. Lead with dominant driver."
  },${bankMetricsSchema}
  "threeStatementSummary": {
    "revenue": "${isBank ? "NII + fee income, YoY growth, NIM" : "revenue, YoY growth, driver"}",
    "ebitda": "${isBank ? "pre-provision profit, % of gross loans" : "EBITDA, margin, trend"}",
    "interestExpense": "${isBank ? "cost of deposits trend, NIM outlook" : "interest expense, rate sensitivity"}",
    "netIncome": "net income, flag non-cash items",
    "capex": "${isBank ? "N/A — RWA growth rate instead" : "maintenance + growth capex"}",
    "freeCashFlow": "${isBank ? "N/A — internal capital generation rate" : "FCF after capex, debt service coverage"}",
    "workingCapital": "${isBank ? "loan growth rate, deposit growth" : "working capital trend, flag receivables"}",
    "cashAndEquivalents": "cash figure, accessibility"
  },
  "creditMetrics": {
    "netDebtToEbitda": "${isBank ? "N/A — CET1 ratio vs sector avg vs regulatory min" : "x FY, trajectory"}",
    "ebitdaToInterest": "${isBank ? "N/A — NIM vs peer avg, bps advantage" : "x, flag if <2.5x"}",
    "fcfDebtServiceCoverage": "${isBank ? "N/A — loans/deposits vs sector, FCY liquidity" : "x FCF / debt service"}",
    "liquidityRunway": "cash + facilities vs near-term maturities",
    "trend": "improving|stable|deteriorating",
    "keyWeakness": "key credit concern with numbers"
  },
  "financingSourcesAndUses": {
    "annualDebtService": "${isBank ? "deposit-funded profile, FCY coverage" : "interest + amortisation total"}",
    "fundingSources": "sources of funding",
    "fundingGap": "gap or fully funded assessment",
    "accessToMarkets": "last market access, current cost estimate",
    "parentOrSovereignSupport": "support history and nature"
  },
  "debtRepaymentSchedule": {
    "next12Months": "maturities due",
    "next24Months": "maturities due",
    "beyondTwoYears": "longer-dated maturities",
    "refinancingStrategy": "stated plan and credibility",
    "refinancingRisk": "High|Medium|Low"
  },
  "quasiSovereignAssessment": {
    "applicable": true,
    "ownershipStructure": "e.g. 65% MOF, 35% free float — listed on local exchange",
    "strategicImportance": "e.g. Sole gas distribution monopoly — critical infrastructure, cannot be allowed to default",
    "supportTrackRecord": "e.g. Government injected $600m capital in 2018 and provided $400m guarantee in 2020",
    "spreadToSovereign": "e.g. Trading at Z+180bps over sovereign curve — historically 80-120bps, currently cheap",
    "supportAssumption": "Explicit|Implicit|Unclear — state why and how it affects the credit view"
  },
  "fxRisk": {
    "revenuesCurrency": "e.g. 60% USD exports, 40% local currency domestic",
    "debtCurrency": "e.g. 80% USD Eurobonds, 20% local bank",
    "mismatch": "High|Medium|Low|Natural Hedge",
    "stressTest": "e.g. 25% EGP depreciation: leverage +0.6x to 4.4x, EBITDA/interest drops to 2.1x — manageable but tight",
    "hedging": "e.g. No derivatives — natural hedge via USD revenues covers ~75% of USD debt service"
  },
  "businessQuality": {
    "marketPosition": "Ranking with evidence — e.g. #1 cement producer with 28% market share",
    "revenueVisibility": "High|Medium|Low — and why",
    "marginTrend": "e.g. EBITDA margin 33% FY24 vs 29% FY22 — expanding on pricing, flag if sustainable",
    "sovereignCeiling": "e.g. Sovereign B2/B, issuer B1/B+ — one notch above ceiling, upside constrained",
    "keyRisk": "Biggest credit risk with evidence"
  },
  "relativeValue": {
    "currentSpread": "e.g. ISSUER 2027s at Z+480bps, 2029s at Z+540bps",
    "peerComparison": "e.g. vs PEER1 2027 at Z+420bps, PEER2 2027 at Z+510bps — ISSUER screens 60bps wide to PEER1",
    "seniorSubStack": "e.g. Senior at Z+480bps vs Sub Tier 2 at Z+680bps — 200bps pickup for one notch of subordination, historically 150bps",
    "historicalContext": "e.g. Current spread 150bps wide of 12m tights, 80bps tight of stress peak",
    "rvConclusion": "Best entry point on the curve or capital structure and why"
  },
  "catalystsAndRisks": {
    "positiveCatalysts": [
      { "catalyst": "Specific event", "timing": "e.g. Q1 2026", "spreadImpact": "e.g. -60 to -80bps" }
    ],
    "negativeRisks": [
      { "risk": "Specific risk with numbers", "probability": "High|Medium|Low", "spreadImpact": "e.g. +200bps+, restructuring risk" }
    ]
  },
  "tradeIdeas": [
    {
      "type": "Directional|RV",
      "bond": "e.g. ISSUER 6.25% 2027 — or for RV: Long ISSUER 2027 / Short PEER 2027",
      "direction": "Long|Short|Long-Short|Avoid",
      "entryLevel": "e.g. Z+480bps / ~8.2% / ~$94 — or RV: ISSUER/PEER at +60bps",
      "target": "e.g. Z+380bps / ~$98 — or RV: spread narrows to +20bps",
      "stop": "e.g. Z+580bps / ~$90 — refinancing execution fails",
      "riskReward": "e.g. 2.0x",
      "horizon": "3m|6m|12m|18m+",
      "rationale": "2-3 sentences: why this bond/pair, what's the entry thesis",
      "keyMonitor": "Single metric or event that invalidates the trade"
    }
  ],
  "portfolioSizing": {
    "recommendation": "e.g. 1.5-2% of AUM — medium conviction, size reflects refinancing risk",
    "convictionLevel": "High|Medium|Low",
    "sizingRationale": "Conviction, liquidity, spread vol, correlation to EM sovereign book",
    "addLevels": "e.g. Add to 3% if 2027 spreads widen past Z+550bps without fundamental deterioration",
    "exitStrategy": "e.g. Take profit at Z+380bps or reduce if FCF/interest falls below 2.0x"
  },
  "creditVerdict": {
    "recommendation": "Buy|Hold|Sell",
    "currentSpreadContext": "e.g. Z+480bps — 80bps wide to peer average, NIP on last deal was 40bps, secondary looks fair to cheap",
    "summary": "3 sentences for a PM: positioning, primary driver, what changes the view"
  },
  "managementQuestions": [
    {
      "question": "Sharp, specific question probing a key vulnerability identified in the analysis",
      "context": "Why this matters — what the answer reveals about the credit"
    },
    {
      "question": "Second question — probe a different risk: refinancing, sovereign linkage, FX, or asset quality",
      "context": "Why this matters"
    },
    {
      "question": "Third question — forward-looking: strategy, capital allocation, or stress scenario response",
      "context": "Why this matters"
    }
  ],
  "overallScore": {
    "total": 0,
    "breakdown": {
      "leverage": "0-25",
      "liquidity": "0-25",
      "businessQuality": "0-25",
      "fxAndCountryRisk": "0-25"
    },
    "rationale": "Direct assessment of weakest pillar — structural or cyclical?"
  }
}`;
}

export async function analyseCorporate(
  issuerName: string,
  documents: { file_name: string; doc_type: string; year: string | null; parsed: ParsedPDF }[],
  onProgress?: (msg: string) => void,
  sector?: string
): Promise<object> {
  onProgress?.("Building corporate credit context...");
  const { texts, totalChars } = buildDocContext(documents);
  console.log(`[corporate] total context: ${totalChars.toLocaleString()} chars across ${texts.length} doc(s)`);
  onProgress?.(`Running corporate analysis across ${texts.length} document(s)...`);

  const t0 = Date.now();
  const raw = await callClaude(CORPORATE_SYSTEM, buildCorporatePrompt(issuerName, texts, sector));
  console.log(`[corporate] Claude responded in ${Date.now() - t0}ms`);

  onProgress?.("Parsing credit assessment...");
  return parseJSON(raw);
}
