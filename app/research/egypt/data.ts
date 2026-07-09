// Egypt sovereign risk data — last updated July 2026
// Separate from layout so adding another country is a data swap, not a rebuild.

export const META = {
  country:     "Egypt",
  iso:         "EGY",
  lastUpdated: "9 July 2026",
  riskFlag:    "2026 Iran conflict (US/Israel strikes from 28 Feb, Hormuz disruption) is the dominant near-term external shock. IMF programme anchor intact; inflation tracking 16–17% vs CBE 7% target.",
  position:    "LONG Eurobonds · Target 220–240bps (from 281bps CDS)",
  sources:     "IMF WEO July 2026 Update & Article IV; CAPMAS; CBE; ECES; World Bank WGI 2023; S&P/Moody's/Fitch April 2026; WJP Rule of Law Index 2024; Freedom House 2025; GAFI; UNCTAD",
};

export const RATINGS = [
  { agency: "S&P",     rating: "B",    outlook: "Stable",   date: "Apr 2026" },
  { agency: "Moody's", rating: "Caa1", outlook: "Positive", date: "Apr 2026" },
  { agency: "Fitch",   rating: "B",    outlook: "Stable",   date: "Apr 2026" },
];

export const SUMMARY_STATS = [
  { label: "GDP Growth (2025F)", value: "4.4%",   sub: "IMF July 2026 WEO",         color: "green" },
  { label: "Inflation (mid-2026)", value: "~16%", sub: "vs CBE target 7%±2",        color: "red"   },
  { label: "FX Reserves",        value: "$52.8bn", sub: "March 2026",               color: "green" },
  { label: "Interest/Revenue",   value: "87%",    sub: "Tax revenue to debt service", color: "red"  },
];

// ── 1. MACRO MOMENTUM ─────────────────────────────────────────────
export const GROWTH_BARS = [
  { label: "FY22/23",    value: 3.8,  color: "#c8873a" },
  { label: "FY23/24",    value: 2.4,  color: "#8b2e2e" },
  { label: "FY24/25",    value: 4.4,  color: "#c8873a" },
  { label: "H1 FY25/26", value: 5.3,  color: "#2d6a4f" },
];

export const IMF_FORECASTS = [
  { label: "2025", value: 4.4, color: "#c8873a" },
  { label: "2026", value: 4.6, color: "#2d6a4f" },
  { label: "2027", value: 4.4, color: "#c8873a" },
];

export const GDP_COMPOSITION = [
  { label: "Services",        value: 51.3, color: "#c8873a" },
  { label: "Manufacturing",   value: 15.5, color: "#1a0a2e" },
  { label: "Extraction",      value: 13.5, color: "#5b21b6" },
  { label: "Agriculture",     value: 14.5, color: "#2d6a4f" },
  { label: "Other",           value: 5.2,  color: "#d8d4cc" },
];

export const INVESTMENT_SHIFT = [
  { year: "FY22/23", private: 25,   public: 75   },
  { year: "FY23/24", private: 37,   public: 63   },
  { year: "FY24/25", private: 47.5, public: 43.3 },
];

export const MACRO_DETAIL = [
  { label: "10yr CAGR",         value: "~5.5%", sub: "Current run-rate below trend" },
  { label: "Investment rate",   value: "~13%",  sub: "Down from 18.2% in FY2018/19" },
  { label: "Private consumption", value: "78–89%", sub: "of GDP; rises on EGP weakness" },
  { label: "Net exports",       value: "Negative", sub: "Narrowing as exports outpace imports" },
];

export const MACRO_TEXT = `Growth bottomed at 2.4% in FY2023/24 under combined FX scarcity, capital flight and suppressed private activity — well below Egypt's 5.5% ten-year CAGR. The March 2024 IMF programme unlocked the recovery: FY2024/25 came in at 4.4%, H1 FY2025/26 at 5.3%. The investment rate has compressed to ~13% from 18.2% in FY2018/19 under fiscal consolidation, while the investment ownership mix tells the more important structural story — private investment flipped to majority share in FY2024/25 (47.5% vs 43.3% public), reversing a 75% public-sector peak in FY2022/23 and marking the first such reversal in years. State-owned enterprises account for ~16% of output, 25% of investment and 6% of employment; the military-owned commercial sector (est. 1.5–2% of GDP, officially undisclosed) benefits from tax exemptions and conscript labour, and banking, energy and the Suez Canal Authority remain firmly state-controlled despite nominal divestment policy. Gold exports have surged to $6.76bn (10M-2025) from $2.63bn, partly offsetting the swing from net gas exporter to net importer as Zohr field output has declined.`;

// ── 2. PRICE STABILITY ────────────────────────────────────────────
export const INFLATION_PATH = [
  { label: "FY21/22",     value: 13.5 },
  { label: "CY2023 avg",  value: 33.9 },
  { label: "FY22/23 pk",  value: 35.7 },
  { label: "FY23/24",     value: 28.4 },
  { label: "mid-2026",    value: 16.5 },
  { label: "CBE target",  value: 7,   dashed: true },
];

export const PRICES_STATS = [
  { label: "Peak (FY22/23)",     value: "35.7%", sub: "33.9% calendar-year avg 2023", color: "red"   },
  { label: "Current (mid-2026)", value: "~16%",  sub: "Revised up from 11% projection", color: "red"  },
  { label: "CBE Target 2026",    value: "7%±2",  sub: "Actual tracking 16–17%",       color: "red"   },
  { label: "CBE Target 2028",    value: "5%±2",  sub: "Medium-term anchor",           color: "gold"  },
];

export const PRICES_TEXT = `Inflation peaked at 35.7% in FY2022/23 and had been on a steady disinflation path into early 2026. That path has been disrupted. The CBE's 7%±2% end-2026 target — already ambitious — has been further undermined by the Iran conflict: oil-price volatility, Hormuz shipping costs and a weaker EGP from capital outflow pressure have pushed actual mid-2026 inflation to 16–17%, revised up from an earlier 11% projection. The CBE is caught in a difficult position: cutting rates to support growth risks a further EGP sell-off and renewed inflation; holding rates maintains the real-rate buffer that keeps domestic T-bill demand intact but puts pressure on the fiscal interest bill. Rate easing has accordingly been cautious. The 5%±2% end-2028 target remains the medium-term anchor but is now contingent on conflict resolution, EGP stability and continued IMF programme adherence — all of which carry meaningful uncertainty from where we sit in July 2026.`;

// ── 3. EXTERNAL POSITION ──────────────────────────────────────────
export const EXTERNAL_STATS = [
  { label: "FX Reserves",      value: "$52.8bn",  sub: "March 2026",              color: "green" },
  { label: "Remittances",      value: "$41.5bn",  sub: "2025, all-time high",     color: "green" },
  { label: "Portfolio inflows", value: "~$38bn",  sub: "March 2025 estimate",     color: "green" },
  { label: "FDI (2024)",       value: "~$47bn",  sub: "incl. $35bn Ras El Hekma", color: "gold"  },
];

export const TRADE_STATS = [
  { label: "Trade openness",    value: "~40%",    sub: "Exports + imports / GDP"   },
  { label: "Largest partner",   value: "EU 24.6%", sub: "27.7% exports / 23.1% imports" },
  { label: "Imports mix",       value: "Intermed.", sub: "36.3% intermediate goods" },
  { label: "FX regime",         value: "Managed float", sub: "Since March 2024; still close CBE/IMF oversight" },
];

export const CAPITAL_SOURCES = [
  { label: "Arab-sourced",      value: 54, color: "#c8873a" },
  { label: "Non-Arab foreign",  value: 26, color: "#1a0a2e" },
  { label: "Domestic",          value: 19, color: "#2d6a4f" },
  { label: "Other",             value: 1,  color: "#d8d4cc" },
];

export const EXTERNAL_WATCH = [
  { label: "Suez Canal",        status: "AT RISK",  detail: "Red Sea Houthi attacks + 2026 Iran/Hormuz disruption — direct FX earner",        color: "#8b2e2e" },
  { label: "Gulf Remittances",  status: "AT RISK",  detail: "Dominant source; Gulf fiscal capacity exposed to oil cycle and Iran conflict",      color: "#8b2e2e" },
  { label: "Tourism",           status: "WATCH",    detail: "Regional conflict dampens inflows; near-border Gaza war compounds",                color: "#c8873a" },
  { label: "Gold Exports",      status: "POSITIVE", detail: "$6.76bn (10M-2025) vs $2.63bn prior — fast-rising windfall offset",               color: "#2d6a4f" },
  { label: "Gas Balance",       status: "NEGATIVE", detail: "Zohr decline: net importer now; exposed both sides of energy trade account",       color: "#8b2e2e" },
  { label: "FDI Quality",       status: "WATCH",    detail: "2024 record $47bn incl. single $35bn Ras El Hekma deal — concentrated, not diversified", color: "#c8873a" },
];

export const EXTERNAL_TEXT = `The external position entered 2026 in materially better shape than the 2022–23 crisis: reserves rebuilt to $52.8bn (March 2026), banking NFA back to +$23.7bn (Nov 2025), remittances at an all-time high of $41.5bn in 2025, and ~$38bn in portfolio inflows by March 2025. That improvement is now being tested in real time. Suez Canal revenues — a direct FX earner — have been disrupted by both Houthi Red Sea attacks since January 2024 and the wider Hormuz closure following the Iran conflict from February 2026. Gulf remittances, the single largest FX source, are exposed to Gulf fiscal tightening if oil prices remain suppressed under conflict conditions. Tourism bookings into the region have softened. The $47bn 2024 FDI figure is largely a one-off: ~$35bn was the single Ras El Hekma land deal with Abu Dhabi's ADQ, not a repeatable flow. The gas account has structurally flipped negative as Zohr output declines, adding to import costs at the same time energy prices are elevated. Gold exports ($6.76bn in the first 10 months of 2025) provide a partial offset. Net: the reserve buffer remains meaningful but the flow position has deteriorated since March, and the IMF programme backstop is the critical line of defence if the external shock persists through H2 2026.`;

// ── 4. FISCAL & DEBT ──────────────────────────────────────────────
export const FISCAL_STATS = [
  { label: "Debt cap (law)",       value: "94.3%", sub: "of GDP, June 2025",         color: "red"   },
  { label: "Interest/Revenue",     value: "87%",   sub: "Tax revenue consumed",       color: "red"   },
  { label: "External borrow jump", value: "+186%", sub: "FY25/26 budget vs prior",   color: "red"   },
  { label: "IMF Programme",        value: "$8bn",  sub: "EFF, March 2024",           color: "green" },
];

export const FISCAL_TEXT = `Fiscal space was already the primary medium-term credit risk before the Iran conflict; it has since tightened further. Interest payments absorbing ~87% of tax revenue left almost no discretionary buffer going into 2026 — and the Suez revenue shock, higher import costs from Hormuz disruption and EGP pass-through have all compressed that buffer in real time. The FY2025/26 budget was built on a 186% jump in planned external borrowing even before the conflict: that number now looks optimistic given the risk-off environment for EM issuance. The debt ceiling law (94.3% of GDP, June 2025) provides a nominal anchor, but the ceiling itself is not a floor — it sets a parliamentary hurdle for any breach rather than a binding constraint on spending. Parliamentary oversight is thin in practice: the FY2025/26 budget was approved after a single day of debate. The Fiscal Risks Management Unit, established December 2025 under IMF conditionality, is a positive structural step but untested under stress. SOE divestment — the programme's primary revenue and credibility signal — is already lagging its timetable. The undisclosed military economy (~1.5–2% of GDP) sits outside the consolidated fiscal account entirely. The IMF programme is the critical anchor: disbursements remain conditional on fiscal performance, and any slippage that triggers a programme pause would remove the single most important external check on fiscal deterioration.`;

// ── 5. BANKING SYSTEM ────────────────────────────────────────────
export const BANKING_STATS = [
  { label: "Total assets",      value: "EGP 24.1tn", sub: "Dec 2025",                    color: "gold"  },
  { label: "Credit facilities", value: "EGP 10.4tn", sub: "Dec 2025",                    color: "gold"  },
  { label: "NPL ratio",         value: "1.9%",       sub: "End-2025 (down from 2.2% Mar)", color: "green" },
  { label: "Coverage ratio",    value: "90.2%",      sub: "Loan-loss provisioning",       color: "green" },
  { label: "Banking NFA",       value: "+$23.7bn",   sub: "Nov 2025 (recovered)",         color: "green" },
  { label: "Prior trough",      value: "Negative",   sub: "Deep deficit 2022–23",         color: "red"   },
];

export const BANKING_TEXT = `Egypt's banking sector entered the Iran conflict with its strongest balance sheet in years: total assets ~EGP 24.1tn, NPLs down to 1.9% (from 2.2% in March 2025), loan-loss coverage at 90.2%, and banking NFA fully recovered to +$23.7bn by November 2025 — a $20.3bn swing over the year. That improvement followed the 2023–24 crisis in which the pound lost more than 70% of its value, and the system absorbed that shock without systemic failure. The sector is dominated by state-owned National Bank of Egypt and Banque Misr alongside ~35 private and foreign banks; pensions and insurance remain underdeveloped relative to regional peers. The bank-sovereign nexus is the transmission risk that matters most from here. Domestic banks are the primary buyer of EGP T-bills, incentivised by high real rates; that demand is what keeps domestic financing costs manageable and IMF-programme targets achievable. If the conflict prolongs, EGP weakens further, or the programme slips, banks face rising FX translation losses, thinner real-rate margins, and potential sovereign credit risk repricing all at once — three shocks through the same channel.`;

// ── 6. GOVERNANCE & INSTITUTIONS ─────────────────────────────────
export const WGI_SCORES = [
  { label: "Control of Corruption", egypt: -0.82, worldAvg: -0.03 },
  { label: "Rule of Law",           egypt: -0.18, worldAvg: -0.04 },
  { label: "Gov't Effectiveness",   egypt: -0.24, worldAvg:  0.00 },
  { label: "Regulatory Quality",    egypt: -0.31, worldAvg:  0.00 },
  { label: "Voice & Accountability",egypt: -1.20, worldAvg:  0.00 },
  { label: "Political Stability",   egypt: -0.65, worldAvg:  0.00 },
];

export const GOVERNANCE_STATS = [
  { label: "WJP Rule of Law",       value: "~135th", sub: "of 142 countries",           color: "red"  },
  { label: "Corruption (WGI)",      value: "-0.82",  sub: "vs -0.03 world avg",         color: "red"  },
  { label: "Rule of Law trend",     value: "Improving", sub: "From -0.27 (2022) → -0.18 (2023)", color: "gold" },
  { label: "Freedom House",         value: "Not Free", sub: "Press, assembly, dissent tightly restricted", color: "red" },
];

export const GOVERNANCE_TEXT = `Institutional quality is Egypt's most persistent structural credit weakness. WGI scores rank Egypt in the bottom quartile globally on corruption control (-0.82 vs -0.03 world average) and near bottom on voice and accountability (-1.20), where Freedom House rates Egypt "Not Free" — press freedom, assembly rights and political opposition have all been tightly restricted since 2013. Rule of law (-0.18) is below average but is the one score genuinely improving, from -0.27 in 2022. WJP places Egypt at ~135th of 142 countries. For a bondholder, the practical read: legal recourse under Egyptian law is unreliable, data quality depends on official sources with limited independent verification, and SOE reform is subject to discretionary reversal. IMF conditionality partially substitutes as an external monitoring framework — the December 2025 Fiscal Risks Management Unit and the debt ceiling law are direct programme outputs. Government effectiveness is mid-to-low: strong for centrally directed mega-projects, weaker in routine service delivery and regulatory implementation.`;

// ── 7. POLITICAL & GEOPOLITICAL ───────────────────────────────────
export const GEO_EVENTS = [
  { date: "Oct 2023",     label: "Gaza war begins; Egypt as key mediator",              severity: "high"     },
  { date: "Jan 2024",     label: "Red Sea Houthi attacks on commercial shipping",       severity: "high"     },
  { date: "Jan 2024",     label: "Egypt joins BRICS as full member",                    severity: "positive" },
  { date: "Mar 2024",     label: "IMF EFF $8bn agreed; pound floated to ~EGP 50/$",    severity: "positive" },
  { date: "Apr 2026",     label: "S&P, Moody's, Fitch all affirm ratings",             severity: "positive" },
  { date: "28 Feb 2026",  label: "US/Israel strikes on Iran begin; Hormuz disrupted",  severity: "high"     },
  { date: "2026 (live)",  label: "Khamenei killed; Iranian missile/drone response",     severity: "high"     },
];

export const BILATERAL = [
  { partner: "USA",        type: "Strategic",   detail: "~$1.3bn/yr military aid; major non-NATO ally since Camp David" },
  { partner: "UAE / KSA",  type: "Capital",     detail: "$35bn Ras El Hekma (ADQ); dominant FDI source" },
  { partner: "IMF",        type: "Programme",   detail: "$8bn EFF; conditionality anchors reform credibility" },
  { partner: "EU",         type: "Trade",       detail: "Largest trading partner 24.6% of trade; Association Agreement" },
  { partner: "Russia",     type: "Energy/Infra",detail: "El-Dabaa nuclear plant; key wheat supplier" },
  { partner: "Israel",     type: "Fraught",     detail: "Peace treaty intact but Sisi called Israel 'the enemy' in 2026" },
  { partner: "Ethiopia",   type: "Dispute",     detail: "GERD — unresolved; no binding downstream Nile flow agreement" },
  { partner: "China",      type: "Investment",  detail: "Belt and Road infrastructure financing" },
];

export const GEO_TEXT = `Egypt is a semi-presidential republic dominated by President Sisi since 2013; a 2019 constitutional amendment extended terms to six years and his current third term runs to 2030. The December 2023 election (90% margin, 67% turnout) was described by independent observers as a foregone conclusion — no meaningful succession mechanism has ever been tested. The 2026 Iran conflict — US/Israeli strikes from 28 February, Khamenei killed, Iranian missile and drone response across the region, periodic Hormuz closure — is the dominant live credit variable. It pressures all of Egypt's key FX earners simultaneously: Suez Canal revenues, Gulf remittances and tourism. Gaza war continuation and Red Sea Houthi attacks compound exposure. Key bilateral relationships: the US provides ~$1.3bn/year in military aid (major non-NATO ally since Camp David); Gulf SWFs (especially UAE/ADQ) are the dominant capital source; Russia is building El-Dabaa nuclear and supplying wheat; the EU is the largest trade partner. Egypt is not currently sanctioned but has demonstrated willingness to use economic levers (Qatar blockade 2017–21). GERD remains an unresolved slow-moving risk.`;

// ── 8. STRUCTURAL RISKS ───────────────────────────────────────────
export const STRUCTURAL_STATS = [
  { label: "Water per capita",    value: "~500m³", sub: "UN scarcity threshold: 1,000m³",     color: "red"  },
  { label: "Population",          value: "~120m",  sub: "95% on <5% of land area",             color: "gold" },
  { label: "Under-15 cohort",     value: "31–33%", sub: "Median age 24.7",                    color: "gold" },
  { label: "Suez transit",        value: "~12%",   sub: "of global maritime trade",            color: "gold" },
];

export const INFRA_ITEMS = [
  { label: "500kV grid",         value: "8,250km", sub: "Up from 2,364km in 2014",            color: "green" },
  { label: "Renewables",         value: "8.6GW",   sub: "Target: 42% of mix by 2030",         color: "green" },
  { label: "New gas discovery",  value: "~2 tcf",  sub: "Temsah field, announced Apr 2026",   color: "green" },
  { label: "Climate risk",       value: "Delta",   sub: "Alexandria/Nile Delta: sea-level rise", color: "red" },
];

export const SOCIAL_ITEMS = [
  { label: "Youth unemployment",   value: "13.2%",  sub: "2× headline rate",                  color: "red"  },
  { label: "Female LFP",          value: "Low",     sub: "Structurally below male rate",       color: "red"  },
  { label: "Extreme poverty",     value: "~2.4%",   sub: "$2.15/day line, 2025F",              color: "green"},
  { label: "Fertility (2023)",    value: "2.54",    sub: "Declining; potential dividend ahead", color: "gold" },
];

export const STRUCTURAL_TEXT = `Egypt's structural risk profile is dominated by water and food. At ~500m³/capita/year the country is well below the UN absolute scarcity threshold (1,000m³), and the GERD dispute with Ethiopia remains unresolved — Ethiopia continues filling without a binding minimum-flow agreement. Any sustained GERD restriction compounds existing water stress and feeds through to agricultural output (~14.5% of GDP) and food import costs. Egypt is the world's largest wheat importer (~13m tonnes/year), with subsidised bread reaching ~70% of the population. The Suez Canal carries ~12% of global maritime trade — its dual role as revenue source and geopolitical chokepoint makes it Egypt's single most credit-relevant physical feature. Infrastructure is improving: the 500kV transmission grid expanded from 2,364km (2014) to 8,250km (2024), renewable capacity reached 8.6GW, and a ~2 trillion cubic foot gas discovery at Temsah was announced April 2026. Demographically, 95% of ~120m people live on <5% of the land; the 31–33% under-15 cohort is a long-run growth asset but near-term pressure on jobs and services. Youth unemployment at 13.2% (more than double headline) and structurally low female labour force participation are persistent social stability risks. Climate risk is material: the low-lying Nile Delta including Alexandria is exposed to sea-level rise and coastal erosion, and heat stress threatens agricultural productivity.`;
