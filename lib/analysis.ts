import Anthropic from "@anthropic-ai/sdk";
import { ParsedPDF, buildAnalysisText } from "./pdf";
import { ReportAnalysis } from "./supabase";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are an elite buy-side equity analyst. Analyse annual reports and return structured investment research JSON.

Rules:
- Cite specific evidence (numbers, quotes) from the report
- Be concise — each text field max 2-3 sentences unless instructed otherwise
- Focus on investment implications only
- Output ONLY valid JSON. No preamble, no markdown, no text outside the JSON.
- Ensure the JSON is complete and properly closed — never truncate mid-response.`;

// ── Build the analysis prompt ─────────────────────────────────────────────────
function buildPrompt(
  stockName: string,
  docs: { file_name: string; doc_type: string; year: string | null; text: string }[],
  multiYear: boolean
): string {
  const content = docs.map(d =>
    `\n\n${"─".repeat(60)}\nFILING: ${d.file_name} | ${d.doc_type}${d.year ? ` | ${d.year}` : ""}\n${"─".repeat(60)}\n${d.text}`
  ).join("");

  return `Analyse the following filings for ${stockName} and return a comprehensive institutional investment research report as JSON.
${content}

Return ONLY this exact JSON structure — all fields required:

{
  "investmentSnapshot": {
    "companyDescription": "2-3 sentence business description",
    "sector": "Primary sector",
    "keyProducts": ["product/service 1"],
    "geographicExposure": ["geography with % if available"],
    "investmentRelevance": "Why this matters to investors now",
    "attractivenessScore": <1-10>,
    "attractivenessRationale": "Explanation with evidence"
  },
  "executiveSummary": {
    "whatHappened": "Key developments this year (150 words max)",
    "whatMattersMost": "2-3 things determining investment outcome (150 words max)",
    "whyInvestorsCare": "Investment thesis in plain language (150 words max)"
  },
  "keyDrivers": {
    "drivers": [{
      "category": "Revenue|Margin|Cost|Capital Allocation|Industry",
      "name": "Driver name",
      "mechanism": "How it works",
      "upside": "Best case with magnitude",
      "downside": "Risk with magnitude",
      "rank": <1-10, 1=most important>
    }]
  },
  "bullCase": {
    "points": [{
      "title": "Bull point",
      "evidence": "Specific evidence from filing",
      "catalyst": "What unlocks value",
      "timeline": "3-6 months|6-12 months|1-2 years|2+ years",
      "confidence": "High|Medium|Low"
    }]
  },
  "bearCase": {
    "points": [{
      "title": "Bear point",
      "evidence": "Specific evidence from filing",
      "severity": "High|Medium|Low",
      "likelihood": "High|Medium|Low",
      "impact": "Impact on investment value"
    }]
  },
  "variantPerception": {
    "exists": <true|false>,
    "category": "Underappreciated growth|Margin expansion|Competitive advantage|Regulatory benefit|Industry shift|Capital allocation",
    "thesis": "What market is missing",
    "evidence": "Support from filing",
    "magnitude": "Potential impact if correct"
  },
  "managementQuality": {
    "ceoCredibility": "Assessment with evidence",
    "strategicConsistency": "Strategy delivery track record",
    "capitalAllocationQuality": "How capital has been deployed",
    "shareholderAlignment": "Insider ownership, incentives",
    "communicationQuality": "Candour vs obfuscation",
    "score": <1-10>,
    "evidence": "Key evidence for score"
  },
  "capitalAllocation": {
    "buybacks": "Buyback history and discipline",
    "dividends": "Dividend policy and coverage",
    "acquisitions": "M&A history and integration",
    "debtManagement": "Leverage trends",
    "reinvestment": "Capex and R&D investment",
    "rating": "Excellent|Good|Average|Poor",
    "rationale": "Justification"
  },
  "financialQuality": {
    "revenueGrowth": "Growth rates and sustainability",
    "margins": "Margin levels, trends, drivers",
    "cashConversion": "FCF quality vs reported earnings",
    "roicIndicators": "Return metrics and trends",
    "leverage": "Debt levels and coverage",
    "liquidity": "Liquidity and refinancing",
    "score": <1-10>
  },
  "accountingFlags": {
    "flags": [{
      "concern": "Concern name",
      "detail": "Specific detail",
      "severity": "High|Medium|Low"
    }]
  },
  "governanceReview": {
    "boardStructure": "Composition, tenure, skills",
    "independence": "Director independence quality",
    "governanceQuality": "Overall assessment",
    "executiveInfluence": "CEO/founder influence",
    "potentialConflicts": "Related party transactions",
    "score": <1-10>
  },
  "remunerationAnalysis": {
    "incentiveAlignment": "Incentive alignment assessment",
    "performanceMetrics": "What metrics drive pay",
    "potentialValueDestruction": "Any destructive incentives",
    "orientation": "Long-term value creation|Short-term earnings management|Mixed",
    "assessment": "Overall pay assessment"
  },
  "riskMatrix": {
    "risks": [{
      "category": "Operational|Financial|Regulatory|Competitive|Technological|Management",
      "name": "Risk name",
      "description": "Risk description with context",
      "severity": "High|Medium|Low"
    }]
  },
  "catalysts": {
    "threeMonths": ["catalyst"],
    "sixMonths": ["catalyst"],
    "twelveMonths": ["catalyst"],
    "twentyFourMonths": ["catalyst"]
  },
  "managementQuestions": {
    "questions": ["Question 1 (15 total, institutional quality)"]
  },
  "investmentMemo": {
    "thesis": "Core thesis in 2-3 sentences",
    "keyPositives": ["Positive 1"],
    "keyRisks": ["Risk 1"],
    "catalysts": ["Catalyst 1"],
    "furtherWork": ["What needs investigating"]
  },
  "overallScore": {
    "total": <0-100>,
    "businessQuality": <0-100>,
    "financialQuality": <0-100>,
    "managementQuality": <0-100>,
    "governanceQuality": <0-100>,
    "riskProfile": <0-100>,
    "capitalAllocationQuality": <0-100>,
    "explanation": "Comprehensive score explanation"
  }${multiYear ? `,
  "yearOnYearTrends": {
    "yearsAnalysed": ["2022","2023","2024"],
    "financialTrends": [{
      "metric": "Revenue",
      "values": [{"year": "2022", "value": "$Xbn"}, {"year": "2023", "value": "$Xbn"}],
      "trend": "improving|deteriorating|stable|mixed",
      "commentary": "What drove the change"
    }],
    "strategyEvolution": [{"year": "2023", "keyTheme": "Theme", "change": "What changed vs prior year"}],
    "managementToneShifts": "How tone changed across years",
    "capitalAllocationEvolution": "How approach evolved",
    "keyNarrativeChanges": "Biggest narrative changes",
    "improvingFactors": ["Factor improving"],
    "deterioratingFactors": ["Factor deteriorating"],
    "overallTrendAssessment": "Overall multi-year trajectory assessment"
  }` : ""}
}`;
}

// ── Main analysis function ────────────────────────────────────────────────────
export async function analyseStock(
  stockName: string,
  documents: { file_name: string; doc_type: string; year: string | null; parsed: ParsedPDF }[],
  onProgress?: (msg: string) => void
): Promise<ReportAnalysis> {
  const t0 = Date.now();
  onProgress?.("Building optimised analysis context...");

  // Per-document: extract prioritised text, cap at 70k chars each, 110k total
  const PER_DOC_LIMIT = 40000;
  const TOTAL_LIMIT   = 60000;

  const docTexts: { file_name: string; doc_type: string; year: string | null; text: string }[] = [];
  let totalChars = 0;

  for (const doc of documents) {
    if (totalChars >= TOTAL_LIMIT) {
      console.log(`[analysis] skipping ${doc.file_name} — total char limit reached`);
      break;
    }
    const remaining = Math.min(PER_DOC_LIMIT, TOTAL_LIMIT - totalChars);
    const text = buildAnalysisText(doc.parsed, remaining);
    docTexts.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, text });
    totalChars += text.length;
    console.log(`[analysis] ${doc.file_name}: ${text.length.toLocaleString()} chars`);
  }

  console.log(`[analysis] total context: ${totalChars.toLocaleString()} chars across ${docTexts.length} doc(s)`);

  const multiYear = docTexts.filter(d => d.doc_type === "annual_report" && d.year).length > 1;
  onProgress?.(`Sending ${Math.round(totalChars / 1000)}k chars to Claude Sonnet...`);

  const t1 = Date.now();
  const message = await Promise.race([
    client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(stockName, docTexts, multiYear) }],
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Claude API timed out after 240 seconds")), 240_000)
    ),
  ]);
  console.log(`[analysis] Claude responded in ${Date.now() - t1}ms`);

  onProgress?.("Parsing analysis results...");

  const raw = message.content
    .filter(c => c.type === "text")
    .map(c => (c as { type: "text"; text: string }).text)
    .join("");

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error("[analysis] no JSON found in response:", raw.slice(0, 1000));
    throw new Error("Claude did not return valid JSON");
  }

  let analysis: ReportAnalysis;
  try {
    analysis = JSON.parse(match[0]) as ReportAnalysis;
  } catch (parseErr) {
    // Log where the JSON breaks
    const jsonStr = match[0];
    const errMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
    const posMatch = errMsg.match(/position (\d+)/);
    const pos = posMatch ? parseInt(posMatch[1]) : 500;
    console.error("[analysis] JSON parse error:", errMsg);
    console.error("[analysis] JSON around error:", jsonStr.slice(Math.max(0, pos - 100), pos + 100));
    console.error("[analysis] JSON length:", jsonStr.length);
    console.error("[analysis] JSON tail:", jsonStr.slice(-300));
    throw new Error(`JSON parse failed at position ${pos}: ${errMsg}`);
  }
  console.log(`[analysis] total pipeline: ${Date.now() - t0}ms`);
  return analysis;
}

// ── Compat alias ──────────────────────────────────────────────────────────────
export async function analyseReport(
  parsed: ParsedPDF,
  onProgress?: (msg: string) => void
): Promise<ReportAnalysis> {
  return analyseStock("Company", [{ file_name: "document.pdf", doc_type: "annual_report", year: null, parsed }], onProgress);
}
