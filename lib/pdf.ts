import pdfParse from "pdf-parse";

export type ParsedPDF = {
  text: string;
  pageCount: number;
  wordCount: number;
  sections: ExtractedSection[];
};

export type ExtractedSection = {
  title: string;
  content: string;
  priority: number; // 1 = highest
};

// ── Section patterns with priority ───────────────────────────────────────────
const SECTION_PATTERNS: { pattern: RegExp; title: string; priority: number }[] = [
  { pattern: /chairman['']?s?\s+(statement|letter|review|report)/i,              title: "Chairman Statement",     priority: 1 },
  { pattern: /chief\s+executive['']?s?\s+(officer['']?s?\s+)?(statement|review|letter|report)/i, title: "CEO Review", priority: 1 },
  { pattern: /strategic\s+report/i,                                               title: "Strategic Report",      priority: 1 },
  { pattern: /business\s+(review|model|overview|description)/i,                   title: "Business Review",       priority: 1 },
  { pattern: /financial\s+(review|highlights|summary|performance|discussion)/i,   title: "Financial Review",      priority: 1 },
  { pattern: /risk\s+(factors?|management|review|report)/i,                       title: "Risk Section",          priority: 1 },
  { pattern: /principal\s+risks/i,                                                title: "Risk Section",          priority: 1 },
  { pattern: /operating\s+(review|performance|results)/i,                         title: "Operating Review",      priority: 2 },
  { pattern: /corporate\s+governance/i,                                           title: "Governance Section",    priority: 2 },
  { pattern: /remuneration\s+(report|policy|committee)/i,                         title: "Remuneration Section",  priority: 3 },
  { pattern: /directors['']?\s+remuneration/i,                                    title: "Remuneration Section",  priority: 3 },
  { pattern: /audit\s+(report|committee)/i,                                       title: "Audit Report",          priority: 3 },
  { pattern: /sustainability|esg|environmental/i,                                  title: "ESG Section",           priority: 3 },
  { pattern: /notes\s+to\s+(the\s+)?(consolidated\s+)?financial\s+statements/i,   title: "Notes to Accounts",     priority: 4 },
  { pattern: /notes\s+to\s+(the\s+)?accounts/i,                                   title: "Notes to Accounts",     priority: 4 },
  { pattern: /consolidated\s+(income|profit\s+and\s+loss)\s+statement/i,          title: "Income Statement",      priority: 2 },
  { pattern: /consolidated\s+(balance\s+sheet|statement\s+of\s+financial\s+position)/i, title: "Balance Sheet",   priority: 2 },
  { pattern: /cash\s+flow\s+statement/i,                                           title: "Cash Flow Statement",   priority: 2 },
];

// ── Parse PDF buffer ──────────────────────────────────────────────────────────
export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  const t0 = Date.now();
  const data = await pdfParse(buffer, { max: 120 }); // cap at 120 pages — IMF Article IVs are 150-200pp with key data tables in statistical appendix (pp 100-150)
  console.log(`[pdf] parse completed in ${Date.now() - t0}ms — ${data.numpages} pages`);

  const text      = data.text;
  const pageCount = data.numpages;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sections  = extractSections(text);

  console.log(`[pdf] extracted ${sections.length} sections, ${wordCount.toLocaleString()} words`);
  return { text, pageCount, wordCount, sections };
}

// ── Extract named sections ────────────────────────────────────────────────────
function extractSections(text: string): ExtractedSection[] {
  const lines   = text.split("\n");
  const sections: ExtractedSection[] = [];
  const seen    = new Set<string>();

  let currentSection: { title: string; priority: number } | null = null;
  let buf: string[] = [];

  const flush = () => {
    if (!currentSection || buf.length === 0) return;
    const content = buf.join("\n").trim();
    if (content.length > 200) {
      sections.push({ title: currentSection.title, content, priority: currentSection.priority });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = SECTION_PATTERNS.find(
      ({ pattern }) => pattern.test(trimmed) && trimmed.length < 120
    );

    if (match && !seen.has(match.title)) {
      flush();
      seen.add(match.title);
      currentSection = { title: match.title, priority: match.priority };
      buf = [];
    } else if (currentSection) {
      buf.push(trimmed);
      // Hard cap per section at 40k chars
      if (buf.join("\n").length > 40000) {
        flush();
        currentSection = { title: currentSection.title + " (cont.)", priority: currentSection.priority };
        buf = [];
      }
    }
  }
  flush();

  if (sections.length === 0) {
    return [{ title: "Full Document", content: text.slice(0, 80000), priority: 1 }];
  }

  return sections.sort((a, b) => a.priority - b.priority);
}

// ── Build optimised analysis text (capped at maxChars) ───────────────────────
// Prioritises high-priority sections; skips notes/remuneration if tight on space
export function buildAnalysisText(
  parsed: ParsedPDF,
  maxChars = 90000
): string {
  let out = "";

  // Priority 1 first, then 2, then 3, skip 4 (notes to accounts) unless space allows
  const byPriority = [...parsed.sections].sort((a, b) => a.priority - b.priority);

  for (const s of byPriority) {
    if (s.priority >= 4 && out.length > maxChars * 0.6) continue; // skip notes if already full
    const block = `\n\n=== ${s.title.toUpperCase()} ===\n${s.content}`;
    if (out.length + block.length > maxChars) {
      // Truncate to fill remaining space
      const remaining = maxChars - out.length - 60;
      if (remaining > 500) {
        out += `\n\n=== ${s.title.toUpperCase()} ===\n${s.content.slice(0, remaining)}`;
      }
      break;
    }
    out += block;
  }

  // Fallback: if sections gave us very little, supplement with raw text
  if (out.length < 10000) {
    out = parsed.text.slice(0, maxChars);
  }

  console.log(`[pdf] analysis text: ${out.length.toLocaleString()} chars`);
  return out;
}
