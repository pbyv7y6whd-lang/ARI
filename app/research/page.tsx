"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import s from "./research.module.css";

type NavItem = { id: string; label: string };
type NavGroup = { label: string; single?: string; children?: NavItem[] };

const NAV: NavGroup[] = [
  { label: "Oil Trade",          single: "oil-trade" },
  { label: "Egypt Sovereign",    single: "egypt-sovereign" },
  { label: "Guarantee Framework",single: "guarantee-framework" },
  { label: "Sources",            single: "data" },
];

// flat list of all scroll targets for the observer
const ALL_IDS = ["oil-trade", "egypt-sovereign", "guarantee-framework", "data"];

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

          <div className={s.navGroupHeader} style={{ marginTop: 16 }}>Country Monitors</div>
          <Link href="/research/egypt" className={s.navSubLink}>Egypt · Sovereign Risk ↗</Link>
        </nav>

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
                  ["26 Jun · close", "$10.490", "+£3,032 (+16.34%)", "profit"],
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
                <tr>
                  <td colSpan={3} style={{ fontSize: 10, color: "var(--dim,#9a9590)", paddingTop: 6 }}>
                    26 Jun breakdown: +£2,799 position gain · +£232 FX impact (unhedged USD/GBP) · 4:30pm market close
                  </td>
                </tr>
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
                The transmission is clearest in oil-importing EM sovereigns. Pakistan (~1,100bp CDS)
                and Kenya are both structurally exposed — every $10/bbl decline in Brent materially
                reduces their import bills and eases IMF programme pressure. But the name I've spent
                the most time on is Egypt, and it illustrates why the oil-credit linkage is more
                nuanced than it first appears.
              </p>
              <p>
                Egypt is not a simple oil-import story. The transmission runs through three simultaneous
                channels. First, direct energy costs: Egypt became a net oil importer approximately
                four months before this writing, meaning Brent at $117 was widening the current account
                at exactly the moment other inflows were under pressure. As oil normalises toward $70,
                that reverses. Second, Suez Canal revenues — approximately $8–10bn annually pre-crisis
                — fell sharply as shipping was re-routed during Hormuz. Tanker transit normalisation
                is already underway; those revenues recover with a lag, not immediately. Third, and
                most structurally important: Gulf sovereign fiscal capacity. Saudi Arabia's fiscal
                breakeven sits at approximately $90–95/bbl. At $70 Brent, Gulf states are at or below
                breakeven, which compresses their discretionary bilateral transfer capacity to Egypt —
                GCC deposits at the CBE ($18.3bn) are the single most important non-IMF financing
                line Egypt has. Lower oil is therefore a two-sided variable for Egypt in a way it
                isn't for Pakistan or Kenya.
              </p>
              <p>
                This asymmetry is what makes the Egypt credit view interesting. The oil trade gave me
                the analytical lens; my Egypt sovereign credit note is where I've tried to price it.
                At 281bps CDS, I think the market is pricing too much stress over a 12-month horizon
                and not enough over a 24-month one — a distinction that matters for how you size and
                structure the position.
              </p>
            </div>


          </section>

          {/* ── EGYPT SOVEREIGN ───────────────────────────── */}
          <section id="egypt-sovereign" className={s.section}>
            <div className={s.sectionLabel}>Sovereign Credit · June 2026</div>
            <h2 className={s.sectionTitle}>Egypt: LONG Eurobonds at 281bps CDS</h2>
            <p className={s.sectionSub}>
              Post-Hormuz deterioration reflects a transitory external shock — Iran conflict spillovers,
              Suez Canal disruption, energy price passthrough. This is not a structural breakdown in the
              IMF programme trajectory. I initiate a modest long in USD-denominated Egyptian eurobonds,
              targeting spread compression from 281bps toward 220–240bps by year-end 2026.
            </p>

            {/* Restricted note banner */}
            <div style={{ marginBottom:32 }}>
              <div style={{ padding:"16px 24px", background:"#f4f0e8", border:"1px solid #d8d4cc", opacity:0.8 }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"#9a9590", marginBottom:6 }}>Full Research Note · 9 pages</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#6b6b6b", marginBottom:4 }}>Egypt Sovereign Credit Note — June 2026</div>
                <div style={{ fontSize:11, color:"#9a9590", lineHeight:1.6 }}>Macro overview · Fiscal analysis · DSA · External financing · Risks · Trade recommendation</div>
                <div style={{ fontSize:11, color:"#9a9590", marginTop:8, fontStyle:"italic" }}>Full note contains third-party licensed data and is not for public distribution.</div>
              </div>
              <div style={{ padding:"12px 24px", borderLeft:"1px solid #d8d4cc", borderRight:"1px solid #d8d4cc", borderBottom:"1px solid #d8d4cc", background:"#fafaf8" }}>
                <span style={{ fontSize:12, color:"#6b6b6b" }}>To discuss this trade or the underlying analysis — </span>
                <a href="mailto:suleimanashraf@outlook.com" style={{ fontSize:12, color:"#c8873a", fontWeight:600, textDecoration:"none" }}>suleimanashraf@outlook.com</a>
              </div>
            </div>

            {/* Recommendation box */}
            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:0, border:"1px solid var(--border,#e8e2d9)", marginTop:32 }}>
              <div style={{ background:"var(--gold,#c8873a)", padding:"24px 28px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minWidth:120 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.75)", marginBottom:6 }}>Recommendation</div>
                <div style={{ fontSize:28, fontWeight:800, color:"white", letterSpacing:"-0.02em" }}>LONG</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.75)", marginTop:4 }}>Egyptian Eurobonds</div>
              </div>
              <div style={{ padding:"20px 28px", background:"var(--bg2,#f4f0f8)" }}>
                {[
                  ["Entry",      "Current spread levels (~281bps 5yr CDS)"],
                  ["Target",     "220–240bps spread compression by year-end 2026"],
                  ["Stop-loss",  "Exit on sustained move wider than 350bps"],
                  ["Conviction", "Moderate — position sized modestly given Hormuz tail risk"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", gap:12, marginBottom:8, fontSize:13 }}>
                    <span style={{ fontWeight:700, minWidth:80, color:"var(--ink,#1a0a2e)" }}>{k}</span>
                    <span style={{ color:"var(--dim,#9a9590)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key metrics */}
            <table className={s.table} style={{ marginTop:32 }}>
              <thead>
                <tr><th>Indicator</th><th>Value</th></tr>
              </thead>
              <tbody>
                {[
                  ["Public Debt / GDP (FY2024/25)",  "91.8%"],
                  ["Gross Financing Needs",           "~40% of GDP (next 3 years)"],
                  ["Interest / Tax Revenue",          "~83%"],
                  ["Gross International Reserves",    "$53.1bn (May 2026)"],
                  ["5yr CDS Spread",                  "281bps (25 Jun 2026)"],
                  ["Real GDP Growth (FY2024/25)",     "4.4%"],
                  ["CPI Inflation",                   "14.6% YoY (May 2026)"],
                  ["IMF Programme",                   "EFF $8bn, Dec 2026 expiry"],
                  ["GCC Deposits at CBE",             "$18.3bn (non-withdrawal assured Dec 2026)"],
                  ["T-bill Yield (182-day)",          "25.66% (25 Jun 2026)"],
                ].map(([ind, val]) => (
                  <tr key={ind}><td>{ind}</td><td style={{ fontWeight:600 }}>{val}</td></tr>
                ))}
              </tbody>
            </table>

            <div className={s.prose} style={{ marginTop:40 }}>
              <p>
                Egypt's post-February 2026 deterioration reflects a transitory external shock — Iran conflict
                spillovers, Suez Canal disruption, and energy price passthrough — not a structural breakdown in
                its IMF programme trajectory. The fundamentals that drove the 2024 recovery remain intact: a
                functioning IMF anchor, a rebuilt reserve position ($53bn gross), demonstrated fiscal
                consolidation, and a credible CBE monetary framework. With Brent back at ~$70, acute pressure
                is easing and I expect foreign investor inflows to resume into H2 2026, driving spread
                compression from current levels.
              </p>
              <p>
                The primary risk is the GCC financing gap. Gulf states are increasingly prioritising domestic
                investment over bilateral regional support — a structural shift that creates medium-term
                vulnerability as the EFF expires in December 2026. The IMF rates overall sovereign stress as
                HIGH and assesses debt as "sustainable but not with high probability." The view turns negative
                on a failed IMF 7th review or evidence of Gulf deposit withdrawal ahead of December. Until then,
                the carry compensates for the risk and the programme anchor provides the floor.
              </p>
            </div>

            {/* hidden from prose — skip the long sections */}
            {false && <div className={s.prose} style={{ marginTop:40 }}>
              <h3>1. Macro Overview</h3>
              <p>
                The February 2026 IMF 5th/6th EFF review is the right analytical starting point. By that date,
                real GDP had recovered to 4.4% in FY2024/25, accelerating to 5.3% year-on-year in Q1 FY2025/26.
                Inflation had fallen sharply from a peak above 35% to 12.3% by December 2025, driven by tight
                monetary policy and the elimination of the parallel FX market premium following the March 2024
                devaluation. Gross reserves had risen to ~$59.2bn by December 2025, supported by the Ras El
                Hekma $35bn UAE deal, a $3.5bn Qatari land sale, and record nonresident T-bill inflows.
              </p>
              <p>
                The Iran conflict, escalating from June 2025, disrupted this trajectory through three simultaneous
                channels. Egypt became a net energy importer approximately four months prior to the current
                assessment period. Suez Canal revenues — running at ~$9–10bn annually pre-crisis — suffered
                further disruption as shipping insurance repricing and cargo rerouting decisions operate on
                contract cycles of months to years, not geopolitical headlines. Tourism receipts, having recovered
                to 4.6% of GDP, are directly exposed to regional conflict sentiment. Remittances at 9.9% of GDP
                are partially exposed to Gulf economic conditions through the labour market channel. All three
                assumptions underpinning the IMF's pre-war CAD projection were violated simultaneously.
              </p>
              <h3>2. The Oil Price Transmission Mechanism</h3>
              <p>
                The central analytical lens for Egypt's external vulnerability is the oil price transmission
                chain: Brent crude → Gulf sovereign fiscal surplus compression → reduced bilateral transfer
                capacity → CBE deposit rollover risk → NFA drawdown and reserve pressure → EGP depreciation →
                imported inflation acceleration → real rate erosion → carry trade deterioration → nonresident
                outflow pressure. This chain makes Egypt's credit trajectory significantly more correlated with
                global oil prices than a standard EM framework would suggest for a country that is itself only a
                marginal hydrocarbon producer.
              </p>
              <p>
                Gulf sovereign fiscal breakevens — Saudi Arabia at approximately $90–95/barrel — mean that at
                Brent ~$70, Gulf states are operating at or below breakeven. This compresses discretionary
                bilateral deployment capacity precisely when Egypt's own revenue streams are under pressure. The
                mechanism is asymmetric: lower oil eases domestic inflation but compresses Gulf support; higher
                oil from Hormuz re-escalation restores Gulf fiscal headroom but widens Egypt's energy import bill.
                The investment thesis is calibrated around the middle of that distribution.
              </p>
              <h3>3. Fiscal Position</h3>
              <p>
                Egypt's fiscal position has improved materially under the IMF programme but remains structurally
                vulnerable. The single most alarming metric is interest payments absorbing approximately 83% of
                tax revenues. For every EGP100 collected in taxes, EGP83 is consumed by debt service before a
                single pound is spent on public services or investment. This interest-to-revenue trap is the
                central credit vulnerability — the mechanism through which any deterioration in borrowing costs,
                the FX rate, or growth becomes immediately fiscally destabilising.
              </p>
              <p>
                The fiscal deficit widened to 5.2% of GDP in July–March FY2025/26, reflecting reduced Suez
                Canal revenues, higher energy import costs, and a lower growth tax base. Deutsche Bank and Morgan
                Stanley project CPI re-accelerating toward 20% by year-end, requiring approximately 300bps of CBE
                rate hikes. That hiking cycle directly worsens gross financing needs by raising domestic T-bill
                rollover costs — the appropriate monetary response creates its own fiscal headwind.
              </p>
              <h3>4. Debt Sustainability</h3>
              <p>
                Gross public debt declined from 97.2% to 91.8% of GDP in FY2024/25 — the first meaningful
                reduction in years. The IMF projects continued reduction toward 75% by 2031. The IMF's own
                assessment, however, is that debt is "sustainable but not with high probability," with overall
                sovereign stress rated HIGH.
              </p>
              <p>
                The headline ratio conceals the actual risk profile. With 60% of domestic debt in short-term
                instruments, Egypt faces perpetual refinancing pressure. Gross financing needs are projected to
                remain approximately 40% of GDP over the next three years. The IMF's DSA explicitly includes
                $18.3bn in GCC central bank deposits within the measured debt stock — with non-withdrawal
                assurances running only through December 2026, coterminous with the EFF expiry. If those
                assurances lapse, the measured debt stock rises mechanically before any new market borrowing
                occurs.
              </p>
              <h3>5. External Financing</h3>
              <p>
                Gross reserves have rebuilt from ~$35bn in early 2023 to $53.1bn as of May 2026. The IMF
                programme provides a critical anchor: combined 5th/6th reviews released SDR1,465.44mn, with
                remaining disbursements rephased through December 2026. Programme continuation is not in question
                over the 2026 horizon — Egypt has demonstrated capacity to meet QPCs under significant pressure,
                and the IMF has both financial and reputational reasons to maintain support given Egypt is its
                fifth largest GRA exposure.
              </p>
              <p>
                The post-December 2026 cliff is the medium-term concern. Egypt will need to either renew GCC
                deposit assurances bilaterally or replace $18.3bn in financing at prevailing spreads. At 281bps
                CDS that refinancing is expensive but not prohibitive. At 400–500bps it becomes a material
                burden. The trajectory of GCC deposit assurances post-programme is therefore the single most
                important monitoring variable for the medium-term credit view.
              </p>
              <h3>6. Key Risks</h3>
              <p><strong>Downside:</strong> Hormuz tail risk (the US-Iran MoU is not a peace settlement — mines
              remain in the strait, a Singapore-flagged tanker was struck 25 June 2026); GCC financing gap as
              Gulf states prioritise domestic investment; inflation overshoot requiring ~300bps CBE rate hikes;
              hot money reversal from $32.8bn in nonresident T-bill holdings; SOE contingent liabilities with
              EGPC guarantees alone at ~18% of GDP.</p>
              <p><strong>Upside:</strong> Faster Suez Canal normalisation restoring the $9–10bn annual revenue
              run rate; 4–5 SOE listings by year-end reducing GFN and attracting FDI; Gulf re-engagement on
              higher oil; IMF 7th review completion in Q3 2026 as an independent positive catalyst for spread
              compression.</p>
              <h3>7. Instrument Selection: Eurobonds Over Local Currency</h3>
              <p>
                EGP T-bill carry at ~25.66% (182-day, 25 June 2026) is superficially attractive. I remain
                sceptical in practice: EGP forward markets are structurally thin, the Iran war has added
                uncertainty NDF markets have not yet fully priced, and capital control risk remains a tail
                scenario in a stress event that would prevent repatriation regardless of hedge. The anticipated
                300bps CBE rate hike signals the central bank is itself concerned about EGP stability. USD
                eurobonds in the 2029–2031 maturity range eliminate FX translation risk and are governed by
                international law — a cleaner expression of the sovereign credit view at a point of elevated EGP
                uncertainty.
              </p>
              <h3>Conclusion</h3>
              <p>
                At 281bps CDS, the market is pricing more stress than the programme fundamentals warrant over a
                12-month horizon. The IMF anchor holds through December 2026, GCC deposit assurances are locked
                through the same date, and the 7th review in Q3 2026 is a credible positive catalyst. I target
                spread compression toward 220–240bps by year-end, sized modestly to reflect the Hormuz tail risk
                and the medium-term GCC financing gap that emerges post-programme. The view turns negative on a
                failed IMF review or evidence of Gulf deposit withdrawal ahead of the December expiry. Until
                then, the carry compensates for the risk and the programme anchor provides the floor.
              </p>
            </div>}
          </section>

          {/* ── GUARANTEE FRAMEWORK ───────────────────────── */}
          <section id="guarantee-framework" className={s.section}>
            <div className={s.sectionLabel}>Credit Framework · July 2026</div>
            <h2 className={s.sectionTitle}>When Does a Guarantee Actually Transfer Sovereign Risk?</h2>
            <p className={s.sectionSub}>
              A framework for pricing quasi-sovereign issuance, with Egypt case studies.
              Most sovereign credit coverage stops at the eurobond curve. But Egypt's debt strategy
              now explicitly includes guaranteed and multilateral-backed structures — samurai bonds
              with AfDB partial credit guarantees, sukuk, IMF-adjacent issuance — as a deliberate
              tool for accessing cheaper funding and diversifying its investor base. Getting the
              guarantee analysis wrong in either direction is costly.
            </p>

            {/* CTA row */}
            <div style={{ display:"flex", flexDirection:"column", gap:12, margin:"32px 0" }}>
              <a
                href="/egypt-guarantee-framework.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 28px", background:"#1a0a2e", textDecoration:"none", gap:24 }}
              >
                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.5)", marginBottom:6 }}>Full Framework · PDF</div>
                  <div style={{ fontSize:16, fontWeight:700, color:"white", letterSpacing:"-0.01em" }}>When Does a Guarantee Actually Transfer Sovereign Risk?</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginTop:4 }}>Direction · Governing law · Immunity waiver · Guarantee scope · Payment mechanism · Case studies</div>
                </div>
                <div style={{ fontSize:18, color:"#c8873a", fontWeight:700, whiteSpace:"nowrap" }}>Open →</div>
              </a>
              <a
                href="/egypt-guarantee-checklist.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 28px", background:"#f4f0f8", border:"1px solid #e0d8ee", textDecoration:"none", gap:24 }}
              >
                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"#9a7cc0", marginBottom:4 }}>Companion Reference · PDF</div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#1a0a2e" }}>Guarantee Quality Checklist — Poor to Strong Scale</div>
                </div>
                <div style={{ fontSize:14, color:"#5b21b6", fontWeight:700, whiteSpace:"nowrap" }}>Open →</div>
              </a>
            </div>

            <div className={s.prose}>
              <h3>Direction matters more than guarantee quality alone</h3>
              <p>
                A guarantee does not reduce credit risk in the abstract — it reallocates it. Whether
                that reallocation helps or hurts the bondholder depends entirely on which side of the
                guarantee is actually the stronger credit. The intuitive assumption — once a bond is
                government-guaranteed, it should trade close to the sovereign curve — is usually
                right, but rests on a premise that often goes unexamined: that the sovereign is the
                stronger credit in the first place.
              </p>
              <p>
                That base case does not always hold. In export-oriented or hard-currency-revenue SOEs
                with strong FX deposit bases, standalone debt service capacity can exceed that of a
                fiscally stressed sovereign. In a genuine restructuring, an unguaranteed bond from a
                strong-cashflow SOE can be <em>safer</em> than a guaranteed one, because the SOE's
                assets are not necessarily swept into a sovereign restructuring perimeter — whereas
                an explicit guarantee ties that credit directly to the sovereign's fate. Guarantee
                quality always matters, but its sign flips depending on the direction of the credit
                gap. Establishing which credit is actually stronger is step one, not an afterthought.
              </p>
              <h3>The sovereign ceiling and where it creates mispricing</h3>
              <p>
                Rating agencies complicate this through the sovereign ceiling: a quasi-sovereign
                fundamentally stronger than its sovereign typically still has its rating capped at
                the sovereign level, because transfer and convertibility risk applies uniformly to
                anyone operating in that jurisdiction. The ceiling does not mean the credits are
                equally strong; it means the market's ability to price that difference is compressed.
                The strength of the ceiling depends on whose balance sheet ultimately stands behind
                the guarantee. Same-jurisdiction guarantees are close to mechanically capped.
                Cross-jurisdiction guarantees — a multilateral guaranteeing a sovereign — should not
                be capped in the same way, and when they trade as if they are, that gap is itself
                the signal.
              </p>
              <h3>Case study: Egypt's AfDB-guaranteed samurai bond</h3>
              <p>
                Egypt's AfDB-guaranteed sustainability samurai bond, issued in 2026, illustrates the
                framework in the direction that actually shows up in Egypt's market today. The
                guarantor (AfDB, AAA) is far stronger than the issuer (Egypt, deep single-B). Rather
                than a strong entity capped down by a weak sovereign, this is a weak sovereign lifted
                by a strong guarantor: the resulting tranches are rated AA+ and AA.
              </p>
              <p>
                The relative value question is whether the market has actually converged pricing
                toward the credit enhancement the guarantee provides. Comparing the guaranteed
                samurai bond's spread (to JGBs, or to AfDB's own funding curve) against the
                unguaranteed Egypt dollar eurobond curve, normalised for currency and tenor, shows
                how much of the theoretical AA+/AA uplift has actually been priced in. Where the
                guaranteed paper does not trade near AA levels despite its rating — whether due to
                JPY market technicals, illiquidity, or unfamiliarity with the guarantee mechanic
                among typical EM buyers — that gap represents unrealised value, provided the
                checklist confirms the rating uplift is genuinely credible rather than a
                rating-agency artefact.
              </p>
              <p>
                Because this is a <em>partial</em> credit guarantee, not a full one, the correct
                benchmark is not a clean AA spread. Probability of default remains anchored to
                Egypt's own credit profile; what the guarantee compresses is loss given default and
                near-term payment risk, not the sovereign's underlying solvency. A defensible
                fair-value spread reflects Egypt's own default probability combined with a materially
                improved recovery assumption — landing meaningfully closer to Egypt's own curve than
                to a clean AA. The mispricing worth acting on is the gap between the actual market
                spread and that properly modelled fair value, not a naive AA comparison that would
                overstate the opportunity. A dedicated RV note quantifying that spread is forthcoming.
              </p>
              <p>
                The full 9-factor checklist — explicit vs implicit, governing law &amp; payment standard,
                immunity waiver, guarantee scope, payment mechanism, guarantor identity, rating agency
                treatment, ranking &amp; documentation, and restructuring treatment — with the
                poor-to-strong scale and Egypt examples at each tier, is in the companion download above.
              </p>
            </div>
          </section>

          {/* ── CHARTS ────────────────────────────────────── */}
          <div style={{ padding: "48px 0 0" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dim,#9a9590)", marginBottom: 32 }}>Position Charts</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim,#9a9590)", marginBottom: 8 }}>3BRL · WisdomTree Brent Crude Oil 3x Leveraged · 1Y</div>
                <img src="/chart-3brl.jpg" alt="3BRL 1Y chart" style={{ width: "55%", display: "block", border: "1px solid #e8e2d9" }} />
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim,#9a9590)", marginBottom: 8 }}>SBRT · WisdomTree Brent Crude Oil 1x Short · 3M</div>
                <img src="/chart-sbrt.jpg" alt="SBRT 3M chart" style={{ width: "55%", display: "block", border: "1px solid #e8e2d9" }} />
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim,#9a9590)", marginBottom: 8 }}>USD/GBP · 3M</div>
                <img src="/chart-usdgbp.jpg" alt="USD/GBP 3M chart" style={{ width: "55%", display: "block", border: "1px solid #e8e2d9" }} />
              </div>
            </div>
          </div>

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
