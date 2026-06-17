import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", color: "#0f0f0f", fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #d8d4cc", padding: "0 40px", background: "#fafaf8" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontSize: 12, color: "#6b6b6b", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            ← Suleiman Ashraf
          </Link>
          <Link href="/dashboard" style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
            color: "#c8873a", border: "1px solid #c8873a", padding: "5px 14px", textDecoration: "none",
          }}>
            EMI Platform ↗
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "72px 40px 100px" }}>

        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8873a", marginBottom: 20 }}>
          About
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(32px,5vw,48px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 12 }}>
          Suleiman Ashraf
        </h1>

        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: 18, color: "#6b6b6b", lineHeight: 1.6, marginBottom: 40, borderLeft: "3px solid #c8873a", paddingLeft: 20 }}>
          MSc Finance, London School of Economics. EM Credit & Macro Research.
        </p>

        <div style={{ borderTop: "1px solid #d8d4cc", paddingTop: 40, marginBottom: 48 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6b6b6b", marginBottom: 16 }}>
                Background
              </div>
              <p style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.85, marginBottom: 16 }}>
                MSc Finance student at the London School of Economics, with prior experience in UK public markets and governance research.
              </p>
              <p style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.85, marginBottom: 16 }}>
                Primary research focus: Emerging Markets sovereign credit — the intersection of sovereign risk, external financing conditions, and commodity price transmission into EM fiscal dynamics.
              </p>
              <p style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.85 }}>
                This site documents my research process, trade journal, and analytical framework — written in public, with the belief that intellectual honesty about both process and mistakes is more valuable than a curated performance.
              </p>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6b6b6b", marginBottom: 16 }}>
                Research Interests
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "EM Sovereign Credit & Spread Dynamics",
                  "Commodity Price Transmission (Oil → EM Fiscal)",
                  "External Debt Sustainability",
                  "IMF Programme Design & Conditionality",
                  "EM FX & Current Account Dynamics",
                  "ETP & Derivatives Market Mechanics",
                  "UK Public Markets & Governance",
                ].map(item => (
                  <li key={item} style={{
                    fontSize: 13, color: "#6b6b6b", padding: "9px 0",
                    borderBottom: "1px solid #d8d4cc", display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#c8873a", flexShrink: 0, display: "inline-block" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ARI section */}
        <div style={{ borderTop: "1px solid #d8d4cc", paddingTop: 40, marginBottom: 48 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6b6b6b", marginBottom: 16 }}>
            EMI Research Platform
          </div>
          <p style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.85, marginBottom: 16 }}>
            EMI (Emerging Market Intelligence) is a research platform built to document EM sovereign credit and macro analysis — trade journals, sovereign deep dives, and frameworks across Pakistan, Egypt, and the UAE.
          </p>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
            border: "1px solid #c8873a", padding: "9px 18px", color: "#c8873a", textDecoration: "none",
          }}>
            Open EMI →
          </Link>
        </div>

        {/* Links */}
        <div style={{ borderTop: "1px solid #d8d4cc", paddingTop: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6b6b6b", marginBottom: 20 }}>
            Contact
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="https://www.linkedin.com/in/suleiman-ashraf/" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid #d8d4cc", padding: "9px 18px", color: "#0f0f0f", textDecoration: "none" }}>
              LinkedIn ↗
            </a>
            <a href="mailto:suleimanashraf@outlook.com"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid #d8d4cc", padding: "9px 18px", color: "#0f0f0f", textDecoration: "none" }}>
              suleimanashraf@outlook.com
            </a>
            <Link href="/research"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid #d8d4cc", padding: "9px 18px", color: "#0f0f0f", textDecoration: "none" }}>
              Research Portfolio →
            </Link>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #d8d4cc", marginTop: 48, paddingTop: 24, fontSize: 11, color: "#6b6b6b" }}>
          Not investment advice. For research and informational purposes only.
        </div>

      </div>
    </div>
  );
}
