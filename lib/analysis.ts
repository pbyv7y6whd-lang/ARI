import Anthropic from "@anthropic-ai/sdk";
import { ParsedPDF } from "./pdf";
import { ReportAnalysis } from "./supabase";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are an elite buy-side equity analyst at a top-tier hedge fund with 20+ years of experience analysing annual reports. You have deep expertise in financial statement analysis, business quality assessment, management evaluation, and identifying investment catalysts and risks.

Your analysis must:
- Think and write like a seasoned buy-side analyst briefing a portfolio manager
- Focus relentlessly on investment implications, not accounting summaries
- Ground every conclusion in specific evidence from the annual report (cite actual numbers, quotes, or disclosures)
- Distinguish between what management says and what the numbers show
- Identify non-obvious insights that the market may be missing
- Be direct about uncertainty — if evidence is weak, say so explicitly
- Never pad with generic statements — every sentence must add analytical value

Output ONLY valid JSON matching the exact schema provided. No preamble, no markdown, no explanation outside the JSON.`;

function buildPrompt(
  stockName: string,
  documents: { file_name: string; doc_type: string; year: string | null; text: string }[],
  multiYear: boolean
): string {
  const docSummary = documents.map(d =>
    `\n\n${"=".repeat(60)}\nDOCUMENT: ${d.file_name} (${d.doc_type}${d.year ? `, ${d.year}` : ""})\n${"=".repeat(60)}\n${d.text}`
  ).join("");

  return `Analyse the following documents for ${stockName} and return a comprehensive investment research report as JSON.
${docSummary}

Return a JSON object with EXACTLY this structure. Every field is required. Be specific, evidence-based, and analytically rigorous:

{
  "investmentSnapshot": {
    "companyDescription": "2-3 sentence description of the business",
    "sector": "Primary sector",
    "keyProducts": ["product/service 1", "product/service 2"],
    "geographicExposure": ["geography 1 with % if available"],
    "investmentRelevance": "Why this company matters to investors right now",
    "attractivenessScore": <1-10 integer>,
    "attractivenessRationale": "Detailed explanation of score"
  },
  "executiveSummary": {
    "whatHappened": "Key operational and financial developments (150 words max)",
    "whatMattersMost": "The 2-3 things that will determine the investment outcome (150 words max)",
    "whyInvestorsCare": "Investment thesis in plain language (150 words max)"
  },
  "keyDrivers": {
    "drivers": [
      {
        "category": "Revenue|Margin|Cost|Capital Allocation|Industry",
        "name": "Driver name",
        "mechanism": "How this driver works",
        "upside": "Best case scenario with magnitude",
        "downside": "Downside risk with magnitude",
        "rank": <1-10 integer, 1 = most important>
      }
    ]
  },
  "bullCase": {
    "points": [
      {
        "title": "Bull point title",
        "evidence": "Specific evidence from the documents",
        "catalyst": "What could unlock this value",
        "timeline": "3-6 months / 6-12 months / 1-2 years / 2+ years",
        "confidence": "High|Medium|Low"
      }
    ]
  },
  "bearCase": {
    "points": [
      {
        "title": "Bear point title",
        "evidence": "Specific evidence from the documents",
        "severity": "High|Medium|Low",
        "likelihood": "High|Medium|Low",
        "impact": "Quantified or described impact on investment value"
      }
    ]
  },
  "variantPerception": {
    "exists": <true|false>,
    "category": "Underappreciated growth|Margin expansion|Competitive advantage|Regulatory benefit|Industry shift|Capital allocation|null",
    "thesis": "What the market is missing and why",
    "evidence": "Specific support from the documents",
    "magnitude": "Potential impact if correct"
  },
  "managementQuality": {
    "ceoCredibility": "Assessment with specific evidence",
    "strategicConsistency": "Strategy consistency, pivots, delivery track record",
    "capitalAllocationQuality": "How management has deployed capital",
    "shareholderAlignment": "Insider ownership, incentive structure",
    "communicationQuality": "Candour, specificity, transparency vs obfuscation",
    "score": <1-10 integer>,
    "evidence": "Key supporting evidence for the score"
  },
  "capitalAllocation": {
    "buybacks": "Buyback history and price discipline",
    "dividends": "Dividend policy, coverage, growth",
    "acquisitions": "M&A history, prices paid, integration",
    "debtManagement": "Leverage trends, debt structure",
    "reinvestment": "Capex, R&D, organic growth investment",
    "rating": "Excellent|Good|Average|Poor",
    "rationale": "Detailed justification"
  },
  "financialQuality": {
    "revenueGrowth": "Growth rates, quality, sustainability",
    "margins": "Margin levels, trends, drivers",
    "cashConversion": "FCF quality vs reported earnings",
    "roicIndicators": "Return metrics, trends",
    "leverage": "Debt levels, coverage ratios",
    "liquidity": "Liquidity position, refinancing needs",
    "score": <1-10 integer>
  },
  "accountingFlags": {
    "flags": [
      {
        "concern": "Name of concern",
        "detail": "Specific detail from the accounts",
        "severity": "High|Medium|Low"
      }
    ]
  },
  "governanceReview": {
    "boardStructure": "Board composition, tenure, skills",
    "independence": "Independent director quality",
    "governanceQuality": "Overall governance assessment",
    "executiveInfluence": "CEO/founder influence over board",
    "potentialConflicts": "Related party transactions, conflicts",
    "score": <1-10 integer>
  },
  "remunerationAnalysis": {
    "incentiveAlignment": "Are incentives aligned with shareholder value?",
    "performanceMetrics": "What metrics drive pay?",
    "potentialValueDestruction": "Any incentives that could destroy value?",
    "orientation": "Long-term value creation|Short-term earnings management|Mixed",
    "assessment": "Overall pay assessment"
  },
  "riskMatrix": {
    "risks": [
      {
        "category": "Operational|Financial|Regulatory|Competitive|Technological|Management",
        "name": "Risk name",
        "description": "Specific risk description",
        "severity": "High|Medium|Low"
      }
    ]
  },
  "catalysts": {
    "threeMonths": ["catalyst 1", "catalyst 2"],
    "sixMonths": ["catalyst 1", "catalyst 2"],
    "twelveMonths": ["catalyst 1", "catalyst 2"],
    "twentyFourMonths": ["catalyst 1", "catalyst 2"]
  },
  "managementQuestions": {
    "questions": ["Question 1", "...15 total questions"]
  },
  "investmentMemo": {
    "thesis": "Core investment thesis in 2-3 sentences",
    "keyPositives": ["Positive 1", "Positive 2", "Positive 3"],
    "keyRisks": ["Risk 1", "Risk 2", "Risk 3"],
    "catalysts": ["Catalyst 1", "Catalyst 2"],
    "furtherWork": ["What else needs investigating before conviction"]
  },
  "overallScore": {
    "total": <0-100 integer>,
    "businessQuality": <0-100 integer>,
    "financialQuality": <0-100 integer>,
    "managementQuality": <0-100 integer>,
    "governanceQuality": <0-100 integer>,
    "riskProfile": <0-100 integer>,
    "capitalAllocationQuality": <0-100 integer>,
    "explanation": "Comprehensive explanation of the total score"
  }${multiYear ? `,
  "yearOnYearTrends": {
    "yearsAnalysed": ["2020", "2021", "2022", "2023", "2024"],
    "financialTrends": [
      {
        "metric": "Revenue",
        "values": [{ "year": "2020", "value": "£Xm" }, { "year": "2021", "value": "£Xm" }],
        "trend": "improving|deteriorating|stable|mixed",
        "commentary": "What drove the change and what it means for the investment case"
      }
    ],
    "strategyEvolution": [
      {
        "year": "2021",
        "keyTheme": "Theme name",
        "change": "What changed vs prior year and why it matters"
      }
    ],
    "managementToneShifts": "How has management language, confidence, and candour changed across the years? More cautious? More bullish? Less transparent?",
    "capitalAllocationEvolution": "How has the approach to buybacks, dividends, acquisitions, and reinvestment changed over the years?",
    "keyNarrativeChanges": "What are the biggest changes in what management emphasises — new risks, new opportunities, dropped topics?",
    "improvingFactors": ["Factor getting better year on year"],
    "deterioratingFactors": ["Factor getting worse year on year"],
    "overallTrendAssessment": "Is the overall trajectory of the business improving, deteriorating, or mixed? What does the multi-year picture tell us that a single year cannot?"
  }` : ""}
}`;
}

export async function analyseStock(
  stockName: string,
  documents: { file_name: string; doc_type: string; year: string | null; parsed: ParsedPDF }[],
  onProgress?: (msg: string) => void
): Promise<ReportAnalysis> {
  onProgress?.("Building analysis from documents...");

  // Build text for each document, section-aware, cap per doc
  const docTexts = documents.map((doc) => {
    let text = "";
    if (doc.parsed.sections.length > 0) {
      for (const s of doc.parsed.sections) {
        const chunk = `\n[${s.title}]\n${s.content}`;
        if (text.length + chunk.length < 60000) text += chunk;
      }
    }
    if (text.length < 5000) text = doc.parsed.text.slice(0, 60000);
    return { file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, text };
  });

  onProgress?.("Running AI analysis — this takes 2–3 minutes...");

  const multiYear = docTexts.filter(d => d.doc_type === "annual_report" && d.year).length > 1;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: multiYear ? 10000 : 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(stockName, docTexts, multiYear) }],
  });

  onProgress?.("Parsing results...");

  const raw = message.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { type: "text"; text: string }).text)
    .join("");

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Failed to extract JSON from analysis response");

  return JSON.parse(match[0]) as ReportAnalysis;
}

// Keep backward compat for any remaining callers
export async function analyseReport(
  parsed: ParsedPDF,
  onProgress?: (msg: string) => void
): Promise<ReportAnalysis> {
  return analyseStock(
    "Company",
    [{ file_name: "document.pdf", doc_type: "annual_report", year: null, parsed }],
    onProgress
  );
}
