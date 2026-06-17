"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import s from "./research.module.css";

const NAV = [
  { id: "intro",     label: "Introduction" },
  { id: "oil-trade", label: "Oil Trade & EM Credit" },
  { id: "em-macro",  label: "EM Credit Macro" },
  { id: "sovereign", label: "Sovereign Credit" },
  { id: "corporate", label: "Corporate Credit" },
  { id: "cases",     label: "Case Studies" },
  { id: "data",      label: "Data & Sources" },
];

export default function ResearchPage() {
  const [active,      setActive]    = useState("intro");
  const [sidebarOpen, setSidebar]   = useState(false);
  const [tab,         setTab]       = useState<"egypt"|"uae">("egypt");

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    NAV.forEach(n => {
      const el = document.getElementById(n.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setSidebar(false);
  };

  return (
    <div className={s.root}>

      {/* ── Hamburger ─────────────────────────────────────── */}
      <button className={s.hamburger} onClick={() => setSidebar(o => !o)} aria-label="Menu">
        <span /><span /><span />
      </button>

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className={`${s.sidebar} ${sidebarOpen ? s.open : ""}`}>
        <div className={s.sidebarTop}>
          <div className={s.sidebarName}>Suleiman Ashraf</div>
          <div className={s.sidebarTitle}>MSc Finance · LSE<br />Macro &amp; EM Credit Research</div>
        </div>

        <nav className={s.sidebarNav}>
          <div className={s.navSection}>Contents</div>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`${s.navLink} ${active === n.id ? s.active : ""}`}
              onClick={() => scrollTo(n.id)}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className={s.sidebarBottom}>
          <Link href="/" className={s.sidebarBackLink}>← ARI Research</Link>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────── */}
      <main className={s.main}>
        <div className={s.contentWrap}>

          {/* ── HERO ──────────────────────────────────────── */}
          <section id="intro" className={s.hero}>
            <div className={s.heroEyebrow}>Research Portfolio · 2026</div>
            <h1 className={s.heroName}>Suleiman Ashraf</h1>
            <p className={s.heroRole}>
              MSc Finance, London School of Economics &nbsp;·&nbsp; Macro &amp; EM Credit Research<br />
              Prior experience in UK public markets and governance research
            </p>
            <p className={s.heroThesis}>
              Focused on the intersection of macro, sovereign credit, and geopolitics —
              where commodity price dynamics, external financing conditions, and political
              economy determine which countries and companies are mispriced.
            </p>
            <div className={s.heroBadges}>
              {["EM Sovereign Credit","Oil & Commodities","Macro Strategy","Governance","UK Small Caps","AIM"].map(b => (
                <span key={b} className={s.badge}>{b}</span>
              ))}
            </div>
          </section>

          {/* ── OIL TRADE ─────────────────────────────────── */}
          <section id="oil-trade" className={s.section}>
            <div className={s.sectionLabel}>Trade Journal · June 2026</div>
            <h2 className={s.sectionTitle}>My First Macro Trade: Shorting Oil Through a War</h2>
            <p className={s.sectionSub}>
              A live account of a macro trade from thesis to execution — what the research said,
              what the market did, where execution failed, and where the analysis leads next.
            </p>

            <div className={s.callout}>
              <div className={s.calloutTitle}>A note on purpose</div>
              <p>
                This article documents a live oil trade run entirely with personal capital.
                It is not a polished post-mortem — it is written in real time, with the short
                position still open as of 16 June 2026. The purpose is threefold: to demonstrate
                how I construct and research a macro thesis; to be honest about where execution
                fell short of the analytical work; and to show where the commodity analysis leads
                when applied to EM credit markets. The position size reflects the constraints of
                personal capital, not the ambition of the framework.
              </p>
            </div>

            {/* Timeline */}
            <div className={s.timeline}>
              {[
                { date: "Nov 2025", label: "3x Long initiated",       price: "Oil ~$73" },
                { date: "Dec 2025", label: "Scaled to ~£15k",         price: "ETP ~$16" },
                { date: "Dec 17",   label: "Holiday panic sell",       price: "~$15.80" },
                { date: "Mar 2026", label: "1x Short initiated",       price: "Oil ~$100" },
                { date: "Apr–May",  label: "Hormuz spike",             price: "Oil $117" },
                { date: "Jun 15",   label: "US-Iran deal signed",      price: "Oil $80" },
              ].map((t, i) => (
                <div key={i} className={s.tlItem}>
                  <div className={s.tlDate}>{t.date}</div>
                  <div className={s.tlLabel}>{t.label}</div>
                  <div className={s.tlPrice}>{t.price}</div>
                </div>
              ))}
            </div>

            <div className={s.prose}>
              <h3>The Thesis</h3>
              <p>
                The macro backdrop entering late 2025 was unambiguously bearish for oil. OPEC+ had
                spent much of 2025 unwinding the production cuts it had accumulated since 2022 — cuts
                that at their peak totalled approximately 5.86 million barrels per day. By mid-2025,
                the group had added back nearly 2.9 million b/d in cumulative supply increases,
                signalling a preference for market share recovery over price support. Brent averaged
                $74/bbl in H1 2025 before falling sharply — by August 2025 the monthly average had
                dropped to $67.87/bbl.
              </p>
              <p>
                The IEA projected a supply surplus of 3.7 million barrels per day heading into 2026.
                Non-OPEC+ supply was accelerating: US Permian output was holding near 13.7 million b/d,
                Brazil was adding FPSOs in the Santos Basin, and Guyana had surpassed 900,000 b/d.
                J.P. Morgan's Global Commodities team published a full-year 2026 Brent base case of{" "}
                <strong>$60/barrel</strong>. The pre-conflict consensus pointed to Brent averaging
                $55–$63/bbl, with the futures curve in contango reflecting expectations of building
                inventories.
              </p>
              <p>
                Alongside the structural backdrop, I was tracking an underpriced geopolitical risk
                premium. The appointment of Mojtaba Khamenei as Supreme Leader — hardline, IRGC-rooted,
                more aggressive on nuclear development — signalled a material shift in Iran's strategic
                posture. Shipping data from Vortexa showed early tanker avoidance. VLCC war risk
                insurance premia were edging higher. I was also reading{" "}
                <em>Persians: The Age of the Great Kings</em> by Lloyd Llewellyn-Jones — which I'd
                recommend to anyone trying to understand how Iranian leadership calculates the cost of
                capitulation versus resistance. A civilisational narrative of resilience, active in
                Iranian political culture, made quick de-escalation structurally unlikely.
              </p>
            </div>

            <div className={s.pullQuote}>
              <p>
                "A regime rooted in 2,500 years of civilisational resilience, facing US-Israeli
                military pressure, was structurally unlikely to back down quickly."
              </p>
            </div>

            <div className={s.prose}>
              <h3>Act One: The Long — And How I Left £59,000 on the Table</h3>
              <p>
                Starting 26 November 2025, I built a position in the <strong>WisdomTree Brent Crude
                Oil 3x Daily Leveraged ETP (3BRL)</strong>, accumulating approximately £14,700 at a
                weighted average of ~$16.50. The thesis was correct. But by December, with no
                pre-defined risk management framework, I sold the position almost at breakeven before
                a holiday trip to Dubai and Pakistan — driven not by a change in thesis but by the
                absence of automated risk controls.
              </p>
            </div>

            <div className={s.dataRow}>
              <div className={s.dataCell}>
                <div className={s.dataLabel}>Avg Entry</div>
                <div className={`${s.dataValue} ${s.gold}`}>$16.50</div>
                <div className={s.dataSub}>3BRL, Nov–Dec 2025</div>
              </div>
              <div className={s.dataCell}>
                <div className={s.dataLabel}>ETP Peak</div>
                <div className={`${s.dataValue} ${s.green}`}>$83.00</div>
                <div className={s.dataSub}>5 May 2026 · +403%</div>
              </div>
              <div className={s.dataCell}>
                <div className={s.dataLabel}>Profit Foregone</div>
                <div className={`${s.dataValue} ${s.red}`}>~£59k</div>
                <div className={s.dataSub}>On £14,699 invested</div>
              </div>
            </div>

            <div className={s.callout}>
              <div className={s.calloutTitle}>The Structural Mistake</div>
              <p>
                The exit was not driven by a change in thesis. The real mistake was the failure to build
                a framework before entering the position — a pre-set stop loss or target executes
                regardless of where you are. Without one, risk management defaults to your availability,
                which is not risk management at all.
              </p>
            </div>

            <div className={s.prose}>
              <h3>Act Three: The Short — Right Thesis, Wrong Timing</h3>
              <p>
                With oil at ~$103 in late March 2026, I initiated a short via the{" "}
                <strong>WisdomTree Brent Crude Oil 1x Daily Short ETP (SBRT)</strong> — 1x rather
                than 3x given the multi-month time horizon and daily compounding drag risk. The $100
                level had been my threshold: at that price, oil was trading ~$40 above J.P. Morgan's
                pre-war structural fair value, and the futures curve's steep backwardation confirmed
                the market viewed any disruption as transitory.
              </p>
              <p>
                On 28 February, US-Israeli military action triggered the Hormuz blockade. Brent averaged
                $117.29/bbl across April with intraday spikes above $140 — the highest since 2008. My
                short went immediately underwater. SBRT hit a low of ~$7.60 against my average entry of
                $9.13, a drawdown of ~17%. I held — and continued adding small amounts.
              </p>
              <p>
                On 15 June 2026, a US-Iran peace agreement was signed. Oil fell from above $100 to
                $80.55. The position moved to <strong>+£873 (+4.71%)</strong> on £19,424 invested.
                The position is now profitable — but the compounding drag from the $140 intraday spike
                permanently eroded approximately £3,400 in theoretical gains. The instrument didn't match
                the trade.
              </p>
            </div>

            <div className={s.chartPlaceholder}>
              <span className={s.chartLabel}>[ Brent Crude Price Chart Nov 2025 – Jun 2026 ]</span>
            </div>

            <table className={s.table}>
              <thead>
                <tr>
                  <th>Oil Price</th>
                  <th>SBRT Est.</th>
                  <th>P&amp;L vs avg $9.13</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Today ($80.55)", "$9.58",  "+£873 (+4.7%)",   "profit"],
                  ["$75",           "~$10.10", "~+£2,000 (+11%)", "profit"],
                  ["$70 (target)",  "~$10.60", "~+£3,000 (+17%)", "profit"],
                  ["$65 (bull)",    "~$11.10", "~+£4,000 (+22%)", "profit"],
                  ["$60 (JPM base)","~$11.70", "~+£5,200 (+28%)", "profit"],
                ].map(([price, etp, pl, cls]) => (
                  <tr key={price}>
                    <td>{price}</td>
                    <td>{etp}</td>
                    <td className={cls === "profit" ? s.profit : s.loss}>{pl}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={s.prose}>
              <h3>What I'd Do Differently</h3>
            </div>

            {[
              ["01", "Pre-define the exit before the entry", "The December long was entered without a stop loss or price target. A pre-defined exit executes regardless of external conditions. Without one, risk management defaults to availability."],
              ["02", "Use the right instrument for the time horizon", "Daily-resetting ETPs are appropriate for short-term trending markets. For a multi-month hold through a volatile macro event, the drag is a structural headwind. A direct CFD or longer-dated put structure would have captured the same thesis more cleanly."],
              ["03", "Size for the worst case, not the expected case", "At its low, SBRT was down ~17% and I had no remaining cash to add. A proper framework would have deployed 60–70% initially, reserving dry powder for the lows. The best buying opportunity came when I had no capital left."],
              ["04", "Separate the learning period from capital deployment", "The July–October short-term trading phase cost money and provided education. The mistake was not separating it clearly from the core thesis trade."],
              ["05", "Can you time a macro peak? Realistically, no.", "The $100 level was a reasonable entry — but Hormuz illustrates why peak-picking in commodity markets is difficult even for professionals. The right framing is not 'can I identify the exact peak' but 'is this level high enough that my expected return over a 6-month horizon is positive even accounting for adverse scenarios.'"],
            ].map(([num, title, body]) => (
              <div key={num} className={s.lessonItem}>
                <div className={s.lessonNum}>{num}</div>
                <div className={s.lessonContent}>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ── EM MACRO ──────────────────────────────────── */}
          <section id="em-macro" className={s.section}>
            <div className={s.sectionLabel}>Framework</div>
            <h2 className={s.sectionTitle}>EM Credit: Macro Framework</h2>
            <p className={s.sectionSub}>
              The key macro variables that drive EM sovereign and corporate credit —
              rates, spreads, the dollar, and commodity linkages.
            </p>

            <div className={s.macroGrid}>
              {[
                { label: "US 10Y Yield",        value: "4.35%",  sub: "Key external financing anchor" },
                { label: "DXY Index",            value: "103.2",  sub: "Dollar strength = EM stress" },
                { label: "EMBI Global Spread",   value: "+385bp", sub: "EM sovereign risk premium" },
                { label: "Brent Crude",          value: "$80.5",  sub: "Post-Hormuz deal, Jun 2026" },
                { label: "Fed Funds Rate",       value: "4.50%",  sub: "Higher-for-longer still dominant" },
                { label: "EM Inflation (avg)",   value: "5.8%",   sub: "Easing but above target" },
              ].map(m => (
                <div key={m.label} className={s.macroCell}>
                  <div className={s.macroCellLabel}>{m.label}</div>
                  <div className={s.macroCellValue}>{m.value}</div>
                  <div className={s.macroCellSub}>{m.sub}</div>
                </div>
              ))}
            </div>

            <div className={s.chartPlaceholder}>
              <span className={s.chartLabel}>[ EMBI Spread vs DXY · 2022–2026 ]</span>
            </div>

            <div className={s.prose}>
              <h3>Oil → EM Credit Transmission</h3>
              <p>
                The Hormuz resolution doesn't reset the oil market to neutral. For EM sovereigns,
                the trajectory of Brent from here has direct implications for credit quality and
                spread dynamics through two distinct channels.
              </p>
              <p>
                For <strong>oil exporters</strong> — Saudi Arabia (breakeven ~$76–80/bbl), Iraq
                (oil = 90%+ of federal revenues), UAE — a sustained period above $90 generates
                meaningful current account and fiscal surpluses, compressing sovereign spread risk.
                Iraq in particular sits near solvency thresholds at low oil prices; the difference
                between $70 and $100 oil is not a margin question but a fiscal sustainability question.
              </p>
              <p>
                For <strong>oil importers</strong> — Pakistan, Egypt, Kenya — the $117 oil spike
                was a significant terms-of-trade deterioration. The Hormuz deal and normalisation
                toward $70–75/bbl is a material credit positive: it reduces the current account
                deficit, eases FX pressure, and loosens the inflation constraint forcing central
                banks to keep rates restrictive.
              </p>
              <p>
                The spread compression trade in oil-importing EM credit — particularly high-yield
                frontier names with significant energy import exposure — is one of the more compelling
                opportunities coming out of the Hormuz resolution.
              </p>
            </div>
          </section>

          {/* ── SOVEREIGN ─────────────────────────────────── */}
          <section id="sovereign" className={s.section}>
            <div className={s.sectionLabel}>Sovereign Deep Dives</div>
            <h2 className={s.sectionTitle}>Sovereign Credit</h2>
            <p className={s.sectionSub}>
              Selected sovereign credit analysis — fiscal dynamics, external financing, IMF
              programme interaction, and spread drivers.
            </p>

            <div className={s.tabs}>
              <button className={`${s.tab} ${tab === "egypt" ? s.active : ""}`} onClick={() => setTab("egypt")}>Egypt</button>
              <button className={`${s.tab} ${tab === "uae"   ? s.active : ""}`} onClick={() => setTab("uae")}>UAE</button>
            </div>

            {tab === "egypt" && (
              <div>
                <div className={s.dataRow}>
                  {[
                    { label: "Eurobond Spread", value: "+780bp", cls: "red",  sub: "vs UST, Jun 2026" },
                    { label: "FX Reserves",     value: "$28bn",  cls: "gold", sub: "~4.5 months import cover" },
                    { label: "IMF Programme",   value: "$8bn",   cls: "gold", sub: "EFF (2024–2027)" },
                  ].map(d => (
                    <div key={d.label} className={s.dataCell}>
                      <div className={s.dataLabel}>{d.label}</div>
                      <div className={`${s.dataValue} ${(s as Record<string,string>)[d.cls]}`}>{d.value}</div>
                      <div className={s.dataSub}>{d.sub}</div>
                    </div>
                  ))}
                </div>
                <div className={s.prose}>
                  <h3>Thesis</h3>
                  <p>
                    Egypt is the canonical oil-importing EM credit stress case: large twin deficits,
                    a structurally overvalued currency held in place by GCC support and IMF conditionality,
                    and a fiscal adjustment programme that has repeatedly underdelivered on the structural
                    reform side. The pound's managed depreciation since 2022 has reduced some external
                    imbalance but created significant imported inflation.
                  </p>
                  <p>
                    The Hormuz oil normalisation is a genuine tailwind for Egypt — lower energy import
                    costs improve the current account and reduce the subsidy bill. But the structural
                    story remains constrained: IMF programme reviews have flagged persistent delays on
                    SOE reform, energy price liberalisation, and fiscal consolidation. The spread at
                    +780bp prices in meaningful default risk — the question is whether the IMF anchor
                    and GCC bilateral support are sufficient to prevent crystallisation.
                  </p>
                  <h3>Key Risks</h3>
                  <p>
                    Programme derailment from delayed structural reforms; renewed energy price shock;
                    political constraints on subsidy reduction; GCC support conditionality becoming
                    more demanding; tourism revenue sensitivity to regional instability.
                  </p>
                </div>
              </div>
            )}

            {tab === "uae" && (
              <div>
                <div className={s.dataRow}>
                  {[
                    { label: "Sovereign Rating", value: "AA-",    cls: "green", sub: "S&P, stable outlook" },
                    { label: "Fiscal BE Oil",    value: "$50/bbl", cls: "gold", sub: "Abu Dhabi breakeven" },
                    { label: "Non-oil GDP",      value: "~70%",    cls: "gold", sub: "of total GDP, 2025" },
                  ].map(d => (
                    <div key={d.label} className={s.dataCell}>
                      <div className={s.dataLabel}>{d.label}</div>
                      <div className={`${s.dataValue} ${(s as Record<string,string>)[d.cls]}`}>{d.value}</div>
                      <div className={s.dataSub}>{d.sub}</div>
                    </div>
                  ))}
                </div>
                <div className={s.prose}>
                  <h3>Thesis</h3>
                  <p>
                    The UAE is the most credible GCC diversification story — non-oil GDP now represents
                    approximately 70% of total output, underpinned by Dubai's financial services, tourism,
                    and trade hub positioning, and Abu Dhabi's sovereign wealth infrastructure. The fiscal
                    breakeven oil price of ~$50/bbl gives substantial buffer relative to current prices and
                    even to J.P. Morgan's pre-war $60 structural base case.
                  </p>
                  <p>
                    The UAE's sukuk market and conventional Eurobond issuance represent the GCC benchmark —
                    Abu Dhabi and Dubai credits trade near or through some Western European sovereigns.
                    The key investment question is the spread pick-up available in the sub-sovereign and
                    quasi-sovereign space: ADNOC, Mubadala, DP World — entities with implicit or explicit
                    government backing but wider spreads than the sovereign.
                  </p>
                  <h3>Key Dynamics</h3>
                  <p>
                    Dubai property market cycle risk; geopolitical exposure given proximity to Iran;
                    long-term oil price decline risk to Abu Dhabi fiscal model; labour market dependence
                    on expatriate workforce with potential political sensitivity.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ── CORPORATE CREDIT ──────────────────────────── */}
          <section id="corporate" className={s.section}>
            <div className={s.sectionLabel}>Corporate Credit</div>
            <h2 className={s.sectionTitle}>EM Corporate Credit</h2>
            <p className={s.sectionSub}>
              Sector breakdowns and issuer-level analysis across EM corporate credit —
              energy, financials, infrastructure, and real estate.
            </p>

            <div className={s.cardGrid}>
              {[
                {
                  tag: "Energy",
                  title: "GCC National Oil Companies",
                  body: "ADNOC, Saudi Aramco, QatarEnergy — among the world's lowest-cost producers. Spread compression trade post-Hormuz resolution as supply normalises and sovereign backing reasserts.",
                },
                {
                  tag: "Financials",
                  title: "GCC Banks: Deposit Franchise Quality",
                  body: "UAE and Saudi banks carry exceptionally low funding costs relative to loan yields, supported by high government deposit bases and implicit sovereign backstops. Tier 2 paper offers attractive spread pick-up.",
                },
                {
                  tag: "Infrastructure",
                  title: "DP World & Port Operators",
                  body: "Secular growth in EM trade flows. DP World's Eurobonds trade wide of the Dubai sovereign — reflecting leverage and acquisition activity — creating a differentiated entry point into the UAE credit story.",
                },
                {
                  tag: "Real Estate",
                  title: "Egyptian & Pakistani Property",
                  body: "High-yield domestic issuers with significant FX mismatch. Dollar-denominated debt against local currency revenues creates acute vulnerability in depreciation scenarios — requires careful position sizing.",
                },
              ].map(c => (
                <div key={c.tag} className={s.card}>
                  <div className={s.cardLabel}>{c.tag}</div>
                  <div className={s.cardTitle}>{c.title}</div>
                  <div className={s.cardBody}>{c.body}</div>
                </div>
              ))}
            </div>

            <div className={s.chartPlaceholder}>
              <span className={s.chartLabel}>[ EM Corporate vs EM Sovereign Spread Differential ]</span>
            </div>
          </section>

          {/* ── CASE STUDIES ──────────────────────────────── */}
          <section id="cases" className={s.section}>
            <div className={s.sectionLabel}>Case Studies</div>
            <h2 className={s.sectionTitle}>Deep Dives</h2>
            <p className={s.sectionSub}>
              Extended analysis on selected themes — restructuring dynamics, IMF programme mechanics,
              and diversification economics.
            </p>

            <div className={s.prose}>
              <h3>Case Study 1 — Egypt: Restructuring Without Restructuring</h3>
              <p>
                Egypt has navigated three IMF programmes since 2016 without a formal sovereign
                restructuring — managing debt sustainability through a combination of currency
                depreciation, GCC bilateral support, and repeated programme modifications. The
                2022 programme was agreed against a backdrop of acute reserve pressure following
                the Russian invasion of Ukraine, which cut off a significant source of tourism
                revenue and wheat imports simultaneously.
              </p>
              <p>
                What makes Egypt analytically interesting is the gap between formal programme
                compliance and genuine structural adjustment. Egypt has repeatedly met headline
                fiscal targets while delaying the SOE reform and energy price liberalisation that
                form the structural backbone of the IMF's sustainability case. The programme
                continues because Egypt is too geopolitically important to fail — a dynamic that
                creates a form of implicit insurance against default that is not captured in
                spread levels alone.
              </p>
              <p>
                The oil price transmission in Egypt is unusually direct: the country is a net
                energy importer, runs a petroleum subsidy programme that represents a material
                portion of fiscal expenditure, and generates approximately $13–14bn annually
                from Suez Canal tolls — revenues that fell sharply during the Hormuz crisis as
                shipping was re-routed away from the Red Sea corridor. The post-Hormuz
                normalisation is therefore a multi-channel positive for Egypt: lower import
                costs, reduced subsidy pressure, and recovering canal revenues simultaneously.
              </p>
            </div>

            <div className={s.pullQuote}>
              <p>
                "Egypt continues because it is too geopolitically important to fail — a dynamic
                that creates implicit default insurance not captured in spread levels alone."
              </p>
            </div>

            <div className={s.prose}>
              <h3>Case Study 2 — UAE: The Diversification Premium</h3>
              <p>
                The UAE represents the most credible test case for whether a Gulf hydrocarbon
                economy can structurally diversify away from oil dependency. The data suggests
                significant progress: non-oil GDP now represents approximately 70% of total
                output, and the IMF projects the UAE will maintain a positive current account
                balance even at oil prices as low as $40/bbl — well below any plausible long-run
                equilibrium.
              </p>
              <p>
                Dubai's model deserves particular attention. The emirate has essentially zero
                oil reserves of its own; its prosperity is entirely a function of services —
                financial intermediation, trade, tourism, and increasingly technology and
                professional services. The depth and quality of Dubai's financial infrastructure
                — including DIFC, which operates under English common law with independent
                courts — creates a genuine institutional moat relative to the rest of the region.
              </p>
              <p>
                The sukuk market innovation coming out of Dubai and Abu Dhabi over the past
                decade has materially deepened the EM Islamic fixed income universe, creating
                a new class of investment-grade instruments attractive to both conventional and
                Shariah-compliant investors. This is the context in which GCC corporate credit —
                ADNOC, Mubadala, DP World — needs to be evaluated.
              </p>
            </div>
          </section>

          {/* ── DATA ──────────────────────────────────────── */}
          <section id="data" className={s.section}>
            <div className={s.sectionLabel}>Appendix</div>
            <h2 className={s.sectionTitle}>Data &amp; Sources</h2>
            <p className={s.sectionSub}>Key data sources and reference material used across this research.</p>

            <table className={s.table}>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Used For</th>
                  <th>Coverage</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["J.P. Morgan Global Research",       "Oil price forecasts, EM spread data",          "2025–2026"],
                  ["IEA Short-Term Energy Outlook",      "Supply/demand balance, Hormuz data",           "Jun 2026"],
                  ["IMF World Economic Outlook",         "EM fiscal breakevens, growth forecasts",       "Apr 2026"],
                  ["EIA / Argus Freight",                "VLCC rates, tanker traffic data",              "2025–2026"],
                  ["Vortexa / S&P Commodity Insights",   "AIS shipping data, Hormuz transits",           "2025–2026"],
                  ["Trading Economics",                  "Brent crude price data, FX rates",             "Live"],
                  ["WisdomTree",                        "SBRT / 3BRL ETP documentation",                 "Product docs"],
                  ["Wood Mackenzie",                    "Post-conflict oil scenario analysis",            "Jun 2026"],
                  ["Llewellyn-Jones, Lloyd",             "Persians: The Age of the Great Kings",          "Historical"],
                ].map(([source, use, cov]) => (
                  <tr key={source}>
                    <td><strong>{source}</strong></td>
                    <td>{use}</td>
                    <td style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "11px", color: "var(--dim, #555)" }}>{cov}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ── FOOTER ────────────────────────────────────── */}
          <div className={s.footer}>
            <p className={s.footerText}>
              <strong>Disclosure:</strong> This research reflects personal views and is written
              for informational and educational purposes only. Nothing here constitutes investment
              advice or a recommendation to buy or sell any security. All figures are approximate
              and based on publicly available data and personal trade records. Past performance
              is not indicative of future results.
            </p>
            <p className={s.footerText} style={{ marginTop: "12px" }}>
              Suleiman Ashraf · MSc Finance, LSE ·{" "}
              <a href="https://www.linkedin.com/in/suleiman-ashraf/" target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--gold)", textDecoration: "none" }}>LinkedIn</a>
              {" · "}
              <a href="mailto:suleimanashraf@outlook.com"
                style={{ color: "var(--gold)", textDecoration: "none" }}>suleimanashraf@outlook.com</a>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
