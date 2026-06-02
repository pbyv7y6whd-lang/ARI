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
  pageHint?: number;
};

const SECTION_PATTERNS = [
  { pattern: /chairman['']?s?\s+(statement|letter|review|report)/i, title: "Chairman Statement" },
  { pattern: /chief\s+executive['']?s?\s+(officer['']?s?\s+)?(statement|review|letter|report)/i, title: "CEO Review" },
  { pattern: /strategic\s+report/i, title: "Strategic Report" },
  { pattern: /business\s+(review|model|overview)/i, title: "Business Review" },
  { pattern: /financial\s+(review|highlights|summary|performance)/i, title: "Financial Review" },
  { pattern: /operating\s+(review|performance)/i, title: "Operating Review" },
  { pattern: /risk\s+(factors?|management|review|report)/i, title: "Risk Section" },
  { pattern: /principal\s+risks/i, title: "Risk Section" },
  { pattern: /corporate\s+governance/i, title: "Governance Section" },
  { pattern: /remuneration\s+(report|policy|committee)/i, title: "Remuneration Section" },
  { pattern: /directors['']?\s+remuneration/i, title: "Remuneration Section" },
  { pattern: /notes\s+to\s+(the\s+)?(consolidated\s+)?financial\s+statements/i, title: "Notes to Accounts" },
  { pattern: /notes\s+to\s+(the\s+)?accounts/i, title: "Notes to Accounts" },
  { pattern: /consolidated\s+(income|profit\s+and\s+loss)\s+statement/i, title: "Income Statement" },
  { pattern: /consolidated\s+balance\s+sheet/i, title: "Balance Sheet" },
  { pattern: /consolidated\s+statement\s+of\s+financial\s+position/i, title: "Balance Sheet" },
  { pattern: /cash\s+flow\s+statement/i, title: "Cash Flow Statement" },
  { pattern: /audit\s+(report|committee)/i, title: "Audit Report" },
  { pattern: /sustainability|esg|environmental/i, title: "ESG Section" },
];

export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  const data = await pdfParse(buffer, {
    max: 0,
  });

  const text = data.text;
  const pageCount = data.numpages;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sections = extractSections(text);

  return { text, pageCount, wordCount, sections };
}

function extractSections(text: string): ExtractedSection[] {
  const lines = text.split("\n");
  const sections: ExtractedSection[] = [];
  const foundTitles = new Set<string>();

  let currentSection: ExtractedSection | null = null;
  let contentBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this line matches a section header
    const matchedSection = SECTION_PATTERNS.find(({ pattern }) =>
      pattern.test(line) && line.length < 120
    );

    if (matchedSection && !foundTitles.has(matchedSection.title)) {
      // Save previous section
      if (currentSection && contentBuffer.length > 0) {
        currentSection.content = contentBuffer.join("\n").trim();
        if (currentSection.content.length > 200) {
          sections.push(currentSection);
        }
      }

      foundTitles.add(matchedSection.title);
      currentSection = { title: matchedSection.title, content: "" };
      contentBuffer = [];
    } else if (currentSection) {
      contentBuffer.push(line);
      // Cap individual sections at ~50k chars to prevent huge chunks
      if (contentBuffer.join("\n").length > 50000) {
        currentSection.content = contentBuffer.join("\n").trim();
        sections.push(currentSection);
        // Continue with same section but reset buffer (part 2)
        currentSection = {
          title: currentSection.title + " (continued)",
          content: "",
        };
        contentBuffer = [];
      }
    }
  }

  // Push last section
  if (currentSection && contentBuffer.length > 0) {
    currentSection.content = contentBuffer.join("\n").trim();
    if (currentSection.content.length > 200) {
      sections.push(currentSection);
    }
  }

  // If no sections found, create a single full-text section
  if (sections.length === 0) {
    return [{ title: "Full Document", content: text.slice(0, 150000) }];
  }

  return sections;
}

export function chunkText(text: string, maxChunkSize = 80000): string[] {
  if (text.length <= maxChunkSize) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChunkSize;
    if (end < text.length) {
      // Try to break at a paragraph boundary
      const lastNewline = text.lastIndexOf("\n\n", end);
      if (lastNewline > start + maxChunkSize * 0.7) {
        end = lastNewline;
      }
    }
    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks;
}
