// Egypt sovereign risk data — last updated July 2026
// Separate from layout so adding another country is a data swap, not a rebuild.

export const META = {
  country:     "Egypt",
  iso:         "EGY",
  lastUpdated: "July 2026",
  riskFlag:    "Hormuz disruption and ongoing Gaza war create near-term external shock; IMF programme anchor intact through Dec 2026.",
  position:    "LONG Eurobonds · Target 220–240bps (from 281bps CDS)",
  sources:     "IMF WEO July 2026, CAPMAS, CBE, World Bank WGI 2023, S&P/Moody's/Fitch April 2026, WJP Rule of Law Index 2024",
};

export const RATINGS = [
  { agency: "S&P",     rating: "B",    outlook: "Stable",   date: "Apr 2026" },
  { agency: "Moody's", rating: "Caa1", outlook: "Positive", date: "Apr 2026" },
  { agency: "Fitch",   rating: "B",    outlook: "Stable",   date: "Apr 2026" },
];

export const SUMMARY_STATS = [
  { label: "GDP Growth (2025F)", value: "4.4%",   sub: "IMF July 2026 WEO",        color: "green"  },
  { label: "Inflation (mid-2026)", value: "~14%", sub: "Down from 35.7% peak",     color: "gold"   },
  { label: "FX Reserves",        value: "$52.8bn", sub: "March 2026",              color: "green"  },
  { label: "Interest/Revenue",   value: "87%",    sub: "Debt service burden",      color: "red"    },
];

// ── 1. MACRO MOMENTUM ─────────────────────────────────────────────
export const GROWTH_BARS = [
  { label: "FY22/23",    value: 3.8  },
  { label: "FY23/24",    value: 2.4  },
  { label: "FY24/25",    value: 4.4  },
  { label: "H1 FY25/26", value: 5.3  },
];

export const IMF_FORECASTS = [
  { label: "2025",  value: 4.4 },
  { label: "2026",  value: 4.6 },
  { label: "2027",  value: 4.4 },
];

export const GDP_COMPOSITION = [
  { label: "Services",  value: 51,  color: "#c8873a" },
  { label: "Industry",  value: 31,  color: "#1a0a2e" },
  { label: "Agriculture", value: 13, color: "#2d6a4f" },
  { label: "Other",     value: 5,   color: "#d8d4cc" },
];

export const INVESTMENT_SHIFT = [
  { year: "FY22/23", private: 25, public: 75 },
  { year: "FY23/24", private: 38, public: 62 },
  { year: "FY24/25", private: 47.5, public: 43.3 },
];

export const MACRO_TEXT = `Growth bottomed at 2.4% in FY2023/24 under the combined pressure of FX scarcity,
capital flight, and suppressed private activity. The March 2024 IMF programme — anchored by a managed
float and fiscal consolidation — unlocked the recovery. FY2024/25 came in at 4.4%, with H1 FY2025/26
accelerating to 5.3%. The compositional shift matters as much as the headline: private investment
flipped to majority share in FY2024/25 (47.5% private vs 43.3% public), reversing a peak of 75% public
dominance in FY2022/23. Private consumption at 78–89% of GDP makes growth heavily domestic-demand
driven, which limits external vulnerability on the demand side but amplifies sensitivity to real income
shocks from inflation and FX depreciation.`;

// ── 2. PRICE STABILITY ────────────────────────────────────────────
export const INFLATION_PATH = [
  { label: "FY21/22", value: 13.5 },
  { label: "FY22/23", value: 35.7 },
  { label: "FY23/24", value: 28.4 },
  { label: "mid-2026", value: 14.5 },
  { label: "CBE target", value: 7, dashed: true },
];

export const PRICES_STATS = [
  { label: "Peak Inflation",     value: "35.7%", sub: "FY2022/23",          color: "red"   },
  { label: "Current (mid-2026)", value: "~14%",  sub: "Urban CPI",          color: "gold"  },
  { label: "CBE Target",         value: "7%±2",  sub: "Medium-term",        color: "green" },
  { label: "Unemployment",       value: "6.3%",  sub: "2025 (8.0% in 2020)", color: "green" },
];

export const PRICES_TEXT = `Inflation peaked at 35.7% in FY2022/23, driven by import cost pass-through
following successive EGP devaluations and subsidised energy price reform. The managed float normalised
the FX channel, and disinflation has been consistent — mid-2026 readings approaching 14–15%, still
roughly double the CBE's 7%±2% medium-term target. The last-mile problem is familiar: services inflation
and administered price adjustments (electricity tariffs, fuel) remain sticky. CBE easing has been
cautious, preserving real rate cushion to support the EGP and the carry trade that underpins T-bill
demand. Youth unemployment at 13.2% is a structural pressure point — lower than the 2020 headline of
8.0% masks the demographic concentration of joblessness.`;

// ── 3. EXTERNAL POSITION ──────────────────────────────────────────
export const EXTERNAL_STATS = [
  { label: "FX Reserves",   value: "$52.8bn", sub: "March 2026",             color: "green" },
  { label: "Banking NFA",   value: "$23.7bn+", sub: "Nov 2025 (recovered)",  color: "green" },
  { label: "Wheat Imports", value: "~13m t",  sub: "World's largest importer", color: "red" },
  { label: "Gold Exports",  value: "$6.76bn", sub: "10M to 2025",            color: "gold"  },
];

export const EXTERNAL_TEXT = `The external position has stabilised materially since the March 2024 IMF
programme. Reserves at $52.8bn (March 2026) provide meaningful import coverage, and the banking
sector's net foreign asset position — which swung deeply negative during the FX crisis — has recovered
to +$23.7bn+. The vulnerability picture is asymmetric: on the earnings side, gold exports have
surged ($6.76bn in 10M-2025 vs $2.63bn prior) as a windfall offset, but structural import dependence
is acute. Egypt is the world's largest wheat importer (~13m tonnes/year), and Zohr field decline has
flipped the country from gas exporter to importer. Suez Canal revenues — a critical FX earner — are
directly exposed to Red Sea shipping disruption from Houthi attacks and Hormuz risk from the 2026
Iran conflict. The IMF programme's phased disbursements provide a backstop, but any sustained external
shock narrows the reserve buffer faster than the headline figure suggests.`;

// ── 4. FISCAL & DEBT ──────────────────────────────────────────────
export const FISCAL_STATS = [
  { label: "Debt Cap (law)",      value: "94.3%", sub: "of GDP",              color: "red"   },
  { label: "Target",              value: "90%",   sub: "of GDP",              color: "gold"  },
  { label: "Interest/Revenue",    value: "87%",   sub: "Tax revenue consumed", color: "red"  },
  { label: "IMF Programme",       value: "$8bn",  sub: "EFF, Mar 2024",       color: "green" },
];

export const DEBT_BARS = [
  { label: "Debt cap", value: 94.3, color: "#8b2e2e" },
  { label: "Target",   value: 90,   color: "#c8873a" },
];

export const FISCAL_TEXT = `Egypt's fiscal position remains the primary medium-term credit risk.
Interest payments absorbing ~87% of tax revenue leaves almost no discretionary space — any revenue
shortfall or rate shock directly pressures the primary balance. The debt ceiling law (94.3% of GDP cap,
with a 90% target) provides a nominal anchor but doesn't resolve the structural imbalance between
debt service costs and the revenue base. The IMF EFF ($8bn, March 2024) has forced consolidation and
provided a credibility anchor for the market: the programme frames fiscal slippage as politically
costly in a way that bilateral commitments historically haven't. The SOE divestment programme is the
other side of this equation — it is both a revenue source and a signal of structural reform intent —
but delivery has been slow. The military economy (estimated 1.5–2% of GDP, undisclosed) remains off
the consolidated fiscal account and limits the full picture.`;

// ── 5. BANKING SYSTEM ────────────────────────────────────────────
export const BANKING_STATS = [
  { label: "Banking NFA",    value: "Positive", sub: "$23.7bn+ (Nov 2025)",     color: "green" },
  { label: "Prior trough",   value: "Negative", sub: "Deep deficit 2022–23",    color: "red"   },
  { label: "SOE Share (fin.)", value: "~25%",   sub: "of investment via banks", color: "gold"  },
];

export const BANKING_TEXT = `The banking sector is the transmission mechanism for Egypt's wider
sovereign stress. During the FX crisis of 2022–23, the banking system's net foreign asset position
turned sharply negative as banks absorbed the quasi-fiscal cost of a controlled exchange rate —
effectively internalising the sovereign's balance of payments gap. The managed float and subsequent
IMF programme have reversed that: NFA recovered to +$23.7bn+ by November 2025. T-bill demand from
domestic banks (incentivised by high real rates) remains a key funding pillar for the sovereign,
creating a bank-sovereign nexus that would tighten sharply under any programme disruption.
Dollarisation risk remains embedded in the system given the recent FX history, though deposit
conversion pressure has eased with currency stability.`;

// ── 6. GOVERNANCE & INSTITUTIONS ─────────────────────────────────
export const WGI_SCORES = [
  { label: "Control of Corruption", egypt: -0.82, worldAvg: -0.03 },
  { label: "Rule of Law",           egypt: -0.18, worldAvg: -0.04 },
  { label: "Gov't Effectiveness",   egypt: -0.24, worldAvg:  0.00 },
  { label: "Regulatory Quality",    egypt: -0.31, worldAvg:  0.00 },
];

export const GOVERNANCE_STATS = [
  { label: "WJP Rule of Law",     value: "~135th", sub: "of 142 countries",         color: "red"  },
  { label: "Control of Corruption", value: "-0.82", sub: "vs -0.03 world avg",      color: "red"  },
  { label: "CBE Independence",    value: "Partial", sub: "Managed float post-2024", color: "gold" },
];

export const GOVERNANCE_TEXT = `Institutional quality is Egypt's most persistent structural credit
weakness. WGI scores rank Egypt in the bottom quartile globally on corruption control (-0.82 vs -0.03
world average) and rule of law (-0.18 vs -0.04), and WJP places Egypt at approximately 135th out of
142 countries. For a bondholder, the practical translation is: legal recourse under Egyptian law is
unreliable, data quality depends heavily on official sources with limited independent verification,
and SOE reform is subject to discretionary reversal. The CBE gained de facto independence through
the 2024 managed float — markets interpret rate decisions as more technically driven than previously
— but the institutional framework has not been formally restructured. The IMF programme partially
substitutes for weak domestic institutions by providing an external monitoring framework with
disbursement conditionality.`;

// ── 7. POLITICAL & GEOPOLITICAL ───────────────────────────────────
export const GEO_EVENTS = [
  { date: "Oct 2023",  label: "Gaza war begins",              severity: "high"   },
  { date: "Jan 2024",  label: "Red Sea Houthi attacks",       severity: "high"   },
  { date: "Mar 2024",  label: "IMF EFF $8bn agreed",          severity: "positive" },
  { date: "Apr 2026",  label: "Ratings affirmed (all stable/pos)", severity: "positive" },
  { date: "Feb–Jul 2026", label: "Iran conflict (US/Israel strikes, Khamenei killed)", severity: "high" },
];

export const GEO_TEXT = `Geopolitical risk is the dominant near-term credit variable. The 2026 Iran
conflict — US/Israeli strikes beginning February 28, 2026, including the killing of Khamenei — has
introduced Strait of Hormuz disruption risk at a scale that structurally pressures Egypt's external
accounts: Suez Canal revenues (direct FX earner), Gulf remittances (largest remittance source),
and tourism flows are all exposed. Gaza war continuation compounds the regional risk environment.
Egypt's position as a negotiating intermediary between Hamas and Israel gives it diplomatic leverage
but also entangles it in an unresolved conflict on its border. President Sisi's third term runs to
2030; the 2023 election (90% margin, 67% turnout) reflects managed rather than competitive politics.
The concentration of decision-making reduces policy unpredictability on a day-to-day basis but
increases tail risk around any political transition.`;

// ── 8. STRUCTURAL RISKS ───────────────────────────────────────────
export const STRUCTURAL_STATS = [
  { label: "Water per capita",  value: "~500m³", sub: "UN scarcity threshold: 1,000m³", color: "red"  },
  { label: "Wheat imports",     value: "~13m t", sub: "World's largest importer",        color: "red"  },
  { label: "Population",        value: "~120m",  sub: "Median age 24.7",                 color: "gold" },
  { label: "Nile corridor",     value: "95%",    sub: "of population on <5% of land",    color: "gold" },
];

export const STRUCTURAL_TEXT = `Egypt's structural risk profile is dominated by water. At ~500m³
per capita per year, Egypt is well below the UN absolute scarcity threshold of 1,000m³, and the
Grand Ethiopian Renaissance Dam (GERD) dispute remains unresolved — Ethiopia has continued
filling without a binding agreement on minimum downstream flows. Any sustained GERD restriction
compounds existing water stress and feeds through to agricultural output (~11–14% of GDP) and
food import costs. Wheat import dependence (~13m tonnes/year as the world's largest importer)
creates a direct fiscal and FX exposure to global commodity price shocks, as demonstrated during
the Russia-Ukraine war period. Demographically, 95% of 120m people live on less than 5% of
the land (Nile corridor), creating acute density pressure and concentration of infrastructure
risk. The young median age (24.7) is a long-run growth asset but a near-term pressure on job
creation, housing, and public services.`;
