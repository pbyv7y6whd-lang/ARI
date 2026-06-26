"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import s from "./research.module.css";

type NavItem = { id: string; label: string };
type NavGroup = { label: string; single?: string; children?: NavItem[] };

const NAV: NavGroup[] = [
  { label: "Oil Trade", single: "oil-trade" },
  { label: "Sources",   single: "data" },
];

// flat list of all scroll targets for the observer
const ALL_IDS = ["oil-trade", "data"];

export default function ResearchPage() {
  const [active,      setActive]    = useState("oil-trade");
  const [sidebarOpen, setSidebar]   = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    ALL_IDS.forEach(id => {
      const el = document.getElementById(id);
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
          {NAV.map(group => (
            <div key={group.label}>
              {group.single ? (
                /* top-level single link */
                <button
                  className={`${s.navLink} ${active === group.single ? s.active : ""}`}
                  onClick={() => scrollTo(group.single!)}
                >
                  {group.label}
                </button>
              ) : (
                /* country group */
                <>
                  <div className={s.navGroupHeader}>{group.label}</div>
                  {group.children!.map(child => (
                    <button
                      key={child.id}
                      className={`${s.navSubLink} ${active === child.id ? s.active : ""}`}
                      onClick={() => scrollTo(child.id)}
                    >
                      {child.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", fontSize: 11, color: "var(--dim, #aaa)", fontStyle: "italic" }}>
          More coming soon.
        </div>

        <div className={s.sidebarBottom}>
          <Link href="/" className={s.sidebarBackLink}>← EMI</Link>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────── */}
      <main className={s.main}>
        <div className={s.contentWrap}>

          {/* ── HERO ──────────────────────────────────────── */}
          <section id="intro" className={s.hero}>
            <div className={s.heroEyebrow}>Research Notes · 2026</div>
            <h1 className={s.heroName}>Suleiman Ashraf</h1>
            <p className={s.heroRole}>
              MSc Finance, London School of Economics
            </p>
            <p className={s.heroThesis}>
              This is where I document my thinking on EM credit and macro as I learn —
              trade journals, sovereign research notes, and frameworks I'm building out.
              Not professional analysis. Just genuine curiosity, written down.
            </p>
            <div className={s.heroStats}>
              <div className={s.heroStat}>
                <span className={s.heroStatNum}>1</span>
                <span className={s.heroStatLabel}>Trade journal</span>
              </div>
              <div className={s.heroStatDivider} />
              <div className={s.heroStat}>
                <span className={s.heroStatNum}>20+</span>
                <span className={s.heroStatLabel}>Months investing</span>
              </div>
            </div>
            <div className={s.heroBadges}>
              {["EM Sovereign Credit","Oil & Commodities","Macro"].map(b => (
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


            <div className={s.prose}>
              <h3>Act One: The Long — And How I Left Over £50,000 on the Table</h3>
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
                <div className={`${s.dataValue} ${s.red}`}>~£50k</div>
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
              <h3>Act Two: The Airstrike — A Trade Within a Trade</h3>
              <p>
                In June 2025, Israel conducted a series of airstrikes on Iranian nuclear and military
                infrastructure. Oil spiked sharply — Brent moved from the low $70s to above $85 in
                under a week. I did not hold a position at the time, but I was tracking it closely.
                The key analytical observation was not the spike itself but what happened next: within
                ten days, oil gave back more than half the move. The market had priced in an escalation
                that didn't come, then repriced quickly when the Iranian response was measured rather
                than retaliatory at scale.
              </p>
              <p>
                This episode directly informed the short thesis that followed. It confirmed that the
                oil market's geopolitical risk premium was highly mean-reverting — spikes driven by
                event risk, rather than fundamental supply disruption, were pricing anomalies. It also
                showed that AIS tracking data was a reliable leading indicator: Vortexa's real-time
                tanker flow data showed normalising traffic through the Gulf before the price normalised.
                Shipping data was moving faster than the market.
              </p>
              <p>
                By late 2025 and into early 2026, VLCC war-risk insurance premia had risen to their
                highest levels since 2019 — confirming elevated geopolitical concern — but actual tanker
                transits through Hormuz remained elevated. The divergence between insurance pricing and
                actual traffic volume was a signal the risk premium was being systematically overstated.
                The futures curve was in steep backwardation, the market pricing a supply shock as
                structural rather than transitory.
              </p>
            </div>

            <div className={s.prose}>
              <h3>Act Three: The Short — Right Thesis, Wrong Instrument</h3>
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
                The instrument mattered enormously here. Daily-resetting leveraged ETPs suffer path
                dependency — when an underlying spikes sharply and then reverts, the compounding drag
                means you don't recover dollar-for-dollar even when your directional call is ultimately
                correct. A direct CFD on Brent crude — or a longer-dated put spread — would have
                captured the same thesis without the structural headwind. At SOFR-linked financing rates
                of ~5.3%, the roll cost on a CFD was meaningful but materially less damaging than the
                ~$3,400 in compounding drag the ETP produced from the $140 intraday spike.
              </p>
              <p>
                On 15 June 2026, a US-Iran peace agreement was signed. Oil fell from above $100 to
                $80.55. The position moved to <strong>+£873 (+4.71%)</strong> on £19,424 invested.
                The position is now profitable — but the compounding drag from the $140 intraday spike
                permanently eroded approximately £3,400 in theoretical gains. The instrument didn't match
                the trade.
              </p>
            </div>

            {/* 3BRL 1Y chart */}
            <div style={{ margin: "32px 0 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--dim,#9a9590)", marginBottom: 8 }}>3BRL · WisdomTree Brent Crude Oil 3x Leveraged · 1Y</div>
              <svg viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block", background: "#f9f7f4", border: "1px solid #e8e2d9" }}>
                {/* y-axis labels */}
                {[[10,180],[20,150],[30,120],[40,90],[50,60],[70,30]].map(([v,y]) => (
                  <text key={v} x="34" y={y+4} fontSize="9" fill="#9a9590" textAnchor="end">{v}</text>
                ))}
                {/* grid lines */}
                {[30,60,90,120,150,180].map(y => (
                  <line key={y} x1="40" y1={y} x2="690" y2={y} stroke="#e8e2d9" strokeWidth="0.5" />
                ))}
                {/* chart line: starts flat ~16-17 (y≈148), rises to ~70 (y≈27), dips to ~45 (y≈84), spikes ~75 (y≈18), crashes to ~30 (y≈120) */}
                <polyline
                  fill="none" stroke="#c8873a" strokeWidth="2" strokeLinejoin="round"
                  points="40,148 80,152 110,155 130,150 150,148 170,145 190,140 210,135 230,125 250,115 270,95 290,70 310,27 325,43 340,18 355,30 375,55 395,84 415,75 435,65 450,72 470,80 490,85 510,100 530,110 550,115 570,118 590,118 610,120 650,120 690,120"
                />
                {/* area fill */}
                <polygon
                  fill="#c8873a" fillOpacity="0.08"
                  points="40,148 80,152 110,155 130,150 150,148 170,145 190,140 210,135 230,125 250,115 270,95 290,70 310,27 325,43 340,18 355,30 375,55 395,84 415,75 435,65 450,72 470,80 490,85 510,100 530,110 550,115 570,118 590,118 610,120 650,120 690,120 690,190 40,190"
                />
                {/* current price label */}
                <rect x="648" y="111" width="42" height="14" rx="2" fill="#c8873a" />
                <text x="669" y="121" fontSize="9" fill="white" textAnchor="middle" fontWeight="600">$30.36</text>
                {/* entry price dashed line at ~$16.50 → y≈149 */}
                <line x1="40" y1="148" x2="690" y2="148" stroke="#9a9590" strokeWidth="1" strokeDasharray="4,3" />
                <text x="690" y="145" fontSize="8" fill="#9a9590" textAnchor="end">Entry ~$16.50</text>
                {/* x labels */}
                {[["Jul 25",40],["Sep",140],["Nov",230],["Jan 26",320],["Mar",400],["May",490],["Jun 26",620]].map(([l,x]) => (
                  <text key={l} x={x} y="195" fontSize="8.5" fill="#9a9590" textAnchor="middle">{l}</text>
                ))}
              </svg>
              <div style={{ fontSize: 10, color: "var(--dim,#9a9590)", marginTop: 6 }}>Peak ~$75 · 5 May 2026. Current $30.36 · +2.85% 1Y. Entry ~$16.50 (dashed).</div>
            </div>

            {/* SBRT 3M chart */}
            <div style={{ margin: "32px 0 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--dim,#9a9590)", marginBottom: 8 }}>SBRT · WisdomTree Brent Crude Oil 1x Short · 3M</div>
              <svg viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block", background: "#f9f7f4", border: "1px solid #e8e2d9" }}>
                {/* y-axis labels */}
                {[[7.5,175],[8.0,148],[8.5,120],[9.0,93],[9.5,65],[10.0,38],[10.5,10]].map(([v,y]) => (
                  <text key={v} x="36" y={y+4} fontSize="9" fill="#9a9590" textAnchor="end">{v.toFixed(1)}</text>
                ))}
                {[10,38,65,93,120,148,175].map(y => (
                  <line key={y} x1="40" y1={y} x2="690" y2={y} stroke="#e8e2d9" strokeWidth="0.5" />
                ))}
                {/* avg entry dashed line at $9.129 → y≈89 */}
                <line x1="40" y1="89" x2="690" y2="89" stroke="#9a9590" strokeWidth="1" strokeDasharray="4,3" />
                <text x="44" y="85" fontSize="8" fill="#9a9590">Avg entry $9.13</text>
                {/* chart line: starts ~$9.3 (y≈80), volatile, dips to ~$7.6 (y≈175 scaled), recovers to $10.327 (y≈18) */}
                <polyline
                  fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinejoin="round"
                  points="40,80 60,72 75,65 90,75 105,80 120,70 135,68 150,85 165,90 180,95 195,120 210,135 225,150 240,165 255,175 270,168 285,158 300,155 315,148 330,140 345,130 360,118 375,108 390,98 405,88 420,78 435,68 450,60 465,52 480,45 500,38 520,28 545,22 570,20 600,18 640,18 690,18"
                />
                <polygon
                  fill="#2d6a4f" fillOpacity="0.07"
                  points="40,80 60,72 75,65 90,75 105,80 120,70 135,68 150,85 165,90 180,95 195,120 210,135 225,150 240,165 255,175 270,168 285,158 300,155 315,148 330,140 345,130 360,118 375,108 390,98 405,88 420,78 435,68 450,60 465,52 480,45 500,38 520,28 545,22 570,20 600,18 640,18 690,18 690,190 40,190"
                />
                {/* current price label */}
                <rect x="648" y="9" width="42" height="14" rx="2" fill="#2d6a4f" />
                <text x="669" y="19" fontSize="9" fill="white" textAnchor="middle" fontWeight="600">$10.33</text>
                {/* x labels */}
                {[["Mar 26",40],["Apr",190],["May",370],["Jun 26",620]].map(([l,x]) => (
                  <text key={l} x={x} y="195" fontSize="8.5" fill="#9a9590" textAnchor="middle">{l}</text>
                ))}
              </svg>
              <div style={{ fontSize: 10, color: "var(--dim,#9a9590)", marginTop: 6 }}>Low ~$7.60 during Hormuz spike (Apr–May). Current $10.327 · +12.63% 3M. Avg entry $9.13 (dashed).</div>
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
                  ["26 Jun (live)",  "$10.35", "+£2,686 (+14.48%)", "profit"],
                  ["15 Jun ($80.55)", "$9.58", "+£873 (+4.7%)",   "profit"],
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

            {/* USD/GBP 3M chart */}
            <div style={{ margin: "32px 0 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--dim,#9a9590)", marginBottom: 8 }}>USD/GBP · 3M — FX context for GBP returns</div>
              <svg viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block", background: "#f9f7f4", border: "1px solid #e8e2d9" }}>
                {[[0.735,175],[0.745,140],[0.755,105],[0.760,70],[0.765,35]].map(([v,y]) => (
                  <text key={v} x="38" y={y+4} fontSize="9" fill="#9a9590" textAnchor="end">{v.toFixed(3)}</text>
                ))}
                {[35,70,105,140,175].map(y => (
                  <line key={y} x1="42" y1={y} x2="690" y2={y} stroke="#e8e2d9" strokeWidth="0.5" />
                ))}
                {/* line: starts ~0.755 (y≈105), dips to ~0.733 (y≈190), recovers to 0.7567 (y≈98) */}
                <polyline
                  fill="none" stroke="#5b6fa6" strokeWidth="2" strokeLinejoin="round"
                  points="42,105 65,98 80,88 95,100 110,112 125,125 140,140 155,158 170,168 185,178 200,185 215,190 230,182 245,170 260,158 275,148 290,140 305,130 320,118 335,108 350,100 365,95 380,90 400,88 420,82 440,75 460,72 480,68 500,65 520,60 545,58 565,55 580,52 600,48 625,45 650,40 680,42 690,45"
                />
                <polygon
                  fill="#5b6fa6" fillOpacity="0.07"
                  points="42,105 65,98 80,88 95,100 110,112 125,125 140,140 155,158 170,168 185,178 200,185 215,190 230,182 245,170 260,158 275,148 290,140 305,130 320,118 335,108 350,100 365,95 380,90 400,88 420,82 440,75 460,72 480,68 500,65 520,60 545,58 565,55 580,52 600,48 625,45 650,40 680,42 690,45 690,190 42,190"
                />
                <rect x="648" y="36" width="42" height="14" rx="2" fill="#5b6fa6" />
                <text x="669" y="46" fontSize="9" fill="white" textAnchor="middle" fontWeight="600">0.7567</text>
                {[["Mar 26",42],["Apr",190],["May",390],["Jun 26",620]].map(([l,x]) => (
                  <text key={l} x={x} y="196" fontSize="8.5" fill="#9a9590" textAnchor="middle">{l}</text>
                ))}
              </svg>
              <div style={{ fontSize: 10, color: "var(--dim,#9a9590)", marginTop: 6 }}>USD/GBP 0.7567 · +1.00% 3M. Sterling strength since March reduces USD-denominated ETP gains in GBP terms.</div>
            </div>

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

            {/* ── OIL → EM CREDIT SECOND LIFE ───────────────── */}
            <div className={s.prose} style={{ marginTop: 48 }}>
              <h3>Oil and EM Credit: Why This Trade Has a Second Life</h3>
              <p>
                The Hormuz resolution doesn't end the oil analysis — it begins it. For EM sovereign
                credit, the trajectory of Brent from $80 toward J.P. Morgan's structural base case
                of $60 creates a second-order opportunity that is, in many ways, more interesting than
                the commodity trade itself.
              </p>
              <p>
                Pakistan, Egypt, and Kenya are all significant net oil importers. At $117/bbl — the
                April average during the Hormuz blockade — each country faced acute terms-of-trade
                deterioration: wider current account deficits, depleted FX reserves, higher imported
                inflation forcing central banks to keep rates restrictive, and in Pakistan's and
                Egypt's cases, direct pressure on IMF programme conditionality as fiscal targets became
                harder to meet with a higher energy import bill.
              </p>
              <p>
                As oil normalises toward $70–75/bbl, all three channels reverse simultaneously.
                For <strong>Pakistan</strong> — where the current account deficit was already under
                IMF-monitored stress — every $10/bbl decline in Brent saves approximately $1.5–2bn
                annually in import costs. At current spread levels (~1,100bp), the Pakistan Eurobond
                market is pricing meaningful refinancing risk. That spread pricing is partially an
                oil-import story dressed up as a political risk story. The two are not independent.
              </p>
              <p>
                For <strong>Egypt</strong>, the oil normalisation is a three-channel positive: lower
                energy import costs reduce the subsidy bill directly; reduced FX pressure eases the
                managed depreciation constraint; and Suez Canal revenues — which fell sharply as
                shipping was re-routed away from the Red Sea corridor during the Hormuz crisis — begin
                recovering as tanker transits normalise. Egypt earns approximately $8–10bn annually
                from the Canal; that revenue stream is oil-conflict correlated in a way the market
                doesn't always price correctly.
              </p>
              <p>
                For <strong>Kenya</strong> — a frontier credit with approximately 75% of its energy
                needs met by oil imports — the transmission is more direct. Fuel costs represent a
                significant share of the CPI basket; lower oil reduces the inflation overshoot that
                has kept the Central Bank of Kenya's policy rate elevated, suppressing domestic
                credit growth and economic activity.
              </p>
              <p>
                The spread compression trade across these three names is not a consensus call. The
                market has been pricing geopolitical risk into EM high-yield spreads for months. As
                that risk premium unwinds with oil, the spread tightening in oil-importing EM credit
                is the second life of this thesis — and it is where the commodity analysis connects
                directly to the sovereign credit research I'm building.
              </p>
            </div>


          </section>

          {/* ── MORE COMING SOON ──────────────────────────── */}
          <div style={{ padding: "48px 0 24px", color: "var(--dim, #888)", fontSize: 13 }}>
            More coming soon.
          </div>

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
