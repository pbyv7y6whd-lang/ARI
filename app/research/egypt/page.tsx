"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import s from "../research.module.css";
import {
  META, RATINGS, SUMMARY_STATS,
  GROWTH_BARS, IMF_FORECASTS, GDP_COMPOSITION, INVESTMENT_SHIFT, MACRO_DETAIL, MACRO_TEXT,
  INFLATION_PATH, PRICES_STATS, PRICES_TEXT,
  EXTERNAL_STATS, TRADE_STATS, CAPITAL_SOURCES, EXTERNAL_WATCH, EXTERNAL_TEXT,
  FISCAL_STATS, FISCAL_TEXT,
  BANKING_STATS, BANKING_TEXT,
  WGI_SCORES, GOVERNANCE_STATS, GOVERNANCE_TEXT,
  GEO_EVENTS, BILATERAL, GEO_TEXT,
  STRUCTURAL_STATS, INFRA_ITEMS, SOCIAL_ITEMS, STRUCTURAL_TEXT,
} from "./data";

const SECTIONS = [
  { id: "macro",        label: "Macro Momentum"        },
  { id: "prices",       label: "Price Stability"        },
  { id: "external",     label: "External Position"      },
  { id: "fiscal",       label: "Fiscal & Debt"          },
  { id: "banking",      label: "Banking System"         },
  { id: "governance",   label: "Governance"             },
  { id: "geopolitical", label: "Geopolitical Risk"      },
  { id: "structural",   label: "Structural Risk"        },
];

/* ── CHART PRIMITIVES ─────────────────────────────────────────── */

function BarChart({ data, unit = "%", maxVal }: {
  data: { label: string; value: number; color?: string }[];
  unit?: string;
  maxVal?: number;
}) {
  const max = maxVal ?? Math.max(...data.map(d => d.value)) * 1.15;
  const H = 100; const barW = 36; const gap = 20;
  const total = data.length * (barW + gap) - gap;
  return (
    <svg viewBox={`0 0 ${total + 20} ${H + 40}`} style={{ width: "100%", maxWidth: total + 20, overflow: "visible" }}>
      {data.map((d, i) => {
        const h = Math.max(2, (d.value / max) * H);
        const x = i * (barW + gap);
        const col = d.color ?? "#c8873a";
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={barW} height={h} fill={col} opacity={0.82} />
            <text x={x + barW / 2} y={H - h - 5} textAnchor="middle" fontSize={10} fill="#6b6b6b" fontFamily="Inter,sans-serif">
              {d.value}{unit}
            </text>
            <text x={x + barW / 2} y={H + 16} textAnchor="middle" fontSize={9} fill="#9a9590" fontFamily="Inter,sans-serif">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, unit = "%" }: {
  data: { label: string; value: number; dashed?: boolean }[];
  unit?: string;
}) {
  const W = 520; const H = 100; const padL = 8; const padR = 8;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals) * 0.85;
  const max = Math.max(...vals) * 1.1;
  const xs = data.map((_, i) => padL + (i / (data.length - 1)) * (W - padL - padR));
  const ys = data.map(d => H - ((d.value - min) / (max - min)) * H);
  const solid = data.filter(d => !d.dashed);
  const solidXs = solid.map((_, i) => padL + (i / (data.length - 1)) * (W - padL - padR));
  const solidYs = solid.map(d => H - ((d.value - min) / (max - min)) * H);
  const path = solidXs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${solidYs[i]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H + 44}`} style={{ width: "100%", overflow: "visible" }}>
      <path d={path} fill="none" stroke="#c8873a" strokeWidth={2} />
      {data.map((d, i) => (
        <g key={i}>
          {d.dashed
            ? <line x1={xs[i]} y1={ys[i] - 6} x2={xs[i]} y2={H} stroke="#2d6a4f" strokeWidth={1} strokeDasharray="4,3" />
            : <circle cx={xs[i]} cy={ys[i]} r={3} fill="#c8873a" />}
          <text x={xs[i]} y={H + 14} textAnchor="middle" fontSize={9} fill="#9a9590" fontFamily="Inter,sans-serif">{d.label}</text>
          <text x={xs[i]} y={ys[i] - (d.dashed ? 12 : 10)} textAnchor="middle" fontSize={9} fill={d.dashed ? "#2d6a4f" : "#6b6b6b"} fontFamily="Inter,sans-serif">
            {d.value}{unit}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StackedBar({ data }: { data: { year: string; private: number; public: number }[] }) {
  const barH = 28; const gap = 10; const labelW = 72;
  const W = 360;
  return (
    <svg viewBox={`0 0 ${W + labelW + 8} ${data.length * (barH + gap) + 32}`} style={{ width: "100%", overflow: "visible" }}>
      <text x={labelW + (W * 0.475)} y={14} textAnchor="middle" fontSize={9} fill="#c8873a" fontFamily="Inter,sans-serif" fontWeight={600}>Private</text>
      <text x={labelW + (W * 0.475) + 60} y={14} textAnchor="middle" fontSize={9} fill="#1a0a2e" fontFamily="Inter,sans-serif" fontWeight={600}>Public</text>
      {data.map((d, i) => {
        const y = 24 + i * (barH + gap);
        const privW = (d.private / 100) * W;
        const pubW = (d.public / 100) * W;
        return (
          <g key={i}>
            <text x={labelW - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={10} fill="#6b6b6b" fontFamily="Inter,sans-serif">{d.year}</text>
            <rect x={labelW} y={y} width={privW} height={barH} fill="#c8873a" opacity={0.8} />
            <text x={labelW + privW / 2} y={y + barH / 2 + 4} textAnchor="middle" fontSize={9} fill="white" fontFamily="Inter,sans-serif">{d.private}%</text>
            <rect x={labelW + privW} y={y} width={pubW} height={barH} fill="#1a0a2e" opacity={0.75} />
            <text x={labelW + privW + pubW / 2} y={y + barH / 2 + 4} textAnchor="middle" fontSize={9} fill="white" fontFamily="Inter,sans-serif">{d.public}%</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const cx = 90; const cy = 90; const r = 70; const inner = 42;
  let cumulative = 0;
  const total = data.reduce((s, d) => s + d.value, 0);
  const slices = data.map(d => {
    const start = cumulative / total * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const end = cumulative / total * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start); const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);   const y2 = cy + r * Math.sin(end);
    const xi1 = cx + inner * Math.cos(start); const yi1 = cy + inner * Math.sin(start);
    const xi2 = cx + inner * Math.cos(end);   const yi2 = cy + inner * Math.sin(end);
    const large = (end - start) > Math.PI ? 1 : 0;
    return { ...d, path: `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${inner},${inner} 0 ${large},0 ${xi1},${yi1} Z` };
  });
  return (
    <svg viewBox="0 0 300 180" style={{ width: "100%", maxWidth: 300 }}>
      {slices.map((sl, i) => <path key={i} d={sl.path} fill={sl.color} opacity={0.85} />)}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={11} fill="#1a1a1a" fontFamily="Inter,sans-serif" fontWeight={600}>GDP</text>
      <text x={cx} y={cx + 8} textAnchor="middle" fontSize={11} fill="#6b6b6b" fontFamily="Inter,sans-serif">mix</text>
      {data.map((d, i) => (
        <g key={i}>
          <rect x={196} y={18 + i * 30} width={10} height={10} fill={d.color} opacity={0.85} />
          <text x={210} y={27 + i * 30} fontSize={10} fill="#1a1a1a" fontFamily="Inter,sans-serif">{d.label}</text>
          <text x={210} y={38 + i * 30} fontSize={9} fill="#9a9590" fontFamily="Inter,sans-serif">{d.value}%</text>
        </g>
      ))}
    </svg>
  );
}

function HBarChart({ data }: { data: { label: string; egypt: number; worldAvg: number }[] }) {
  const W = 200; const barH = 12; const gap = 22; const labelW = 160;
  const min = -1.2; const max = 0.4; const range = max - min;
  const toX = (v: number) => ((v - min) / range) * W;
  const zero = toX(0);
  return (
    <svg viewBox={`0 0 ${labelW + W + 60} ${data.length * (barH + gap) + 40}`} style={{ width: "100%", overflow: "visible" }}>
      <line x1={labelW + zero} y1={0} x2={labelW + zero} y2={data.length * (barH + gap) + 12} stroke="#d8d4cc" strokeWidth={1} />
      <text x={labelW + zero} y={data.length * (barH + gap) + 26} textAnchor="middle" fontSize={9} fill="#9a9590" fontFamily="Inter,sans-serif">0</text>
      {data.map((d, i) => {
        const y = 8 + i * (barH + gap);
        const ex = toX(d.egypt); const wx = toX(d.worldAvg);
        return (
          <g key={i}>
            <text x={labelW - 6} y={y + barH - 1} textAnchor="end" fontSize={10} fill="#6b6b6b" fontFamily="Inter,sans-serif">{d.label}</text>
            <rect x={labelW + Math.min(ex, zero)} y={y} width={Math.abs(ex - zero)} height={barH} fill="#8b2e2e" opacity={0.7} />
            <circle cx={labelW + wx} cy={y + barH / 2} r={4} fill="#d8d4cc" stroke="#6b6b6b" strokeWidth={1} />
            <text x={labelW + ex + (d.egypt < 0 ? -4 : 4)} y={y + barH - 1} textAnchor={d.egypt < 0 ? "end" : "start"} fontSize={9} fill="#8b2e2e" fontFamily="Inter,sans-serif">{d.egypt}</text>
          </g>
        );
      })}
      <g>
        <rect x={labelW + W + 8} y={8} width={8} height={8} fill="#8b2e2e" opacity={0.7} />
        <text x={labelW + W + 20} y={16} fontSize={9} fill="#6b6b6b" fontFamily="Inter,sans-serif">Egypt</text>
        <circle cx={labelW + W + 12} cy={26} r={4} fill="#d8d4cc" stroke="#6b6b6b" strokeWidth={1} />
        <text x={labelW + W + 20} y={30} fontSize={9} fill="#6b6b6b" fontFamily="Inter,sans-serif">World avg</text>
      </g>
    </svg>
  );
}

function StatStrip({ stats }: { stats: { label: string; value: string; sub: string; color: string }[] }) {
  const colorMap: Record<string, string> = { green: "#2d6a4f", red: "#8b2e2e", gold: "#c8873a" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc", margin: "24px 0", flexWrap: "wrap" }}>
      {stats.map((st, i) => (
        <div key={i} style={{ background: "#fafaf8", padding: "18px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590", marginBottom: 6 }}>{st.label}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: colorMap[st.color] ?? "#0f0f0f", lineHeight: 1 }}>{st.value}</div>
          <div style={{ fontSize: 10, color: "#9a9590", marginTop: 5 }}>{st.sub}</div>
        </div>
      ))}
    </div>
  );
}

function MiniStatGrid({ items }: { items: { label: string; value: string; sub?: string; color?: string }[] }) {
  const colorMap: Record<string, string> = { green: "#2d6a4f", red: "#8b2e2e", gold: "#c8873a" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc", margin: "20px 0" }}>
      {items.map((d, i) => (
        <div key={i} style={{ background: "#fafaf8", padding: "14px 16px" }}>
          <div style={{ fontSize: 10, color: "#9a9590", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{d.label}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: colorMap[d.color ?? ""] ?? "#0f0f0f", marginBottom: d.sub ? 2 : 0 }}>{d.value}</div>
          {d.sub && <div style={{ fontSize: 10, color: "#9a9590" }}>{d.sub}</div>}
        </div>
      ))}
    </div>
  );
}

function WatchGrid({ items }: { items: { label: string; status: string; detail: string; color: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc", margin: "16px 0" }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: "#fafaf8", padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0f0f0f" }}>{item.label}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: item.color }}>{item.status}</div>
          </div>
          <div style={{ fontSize: 11, color: "#6b6b6b", lineHeight: 1.5 }}>{item.detail}</div>
        </div>
      ))}
    </div>
  );
}

function GeoTimeline({ events }: { events: typeof GEO_EVENTS }) {
  const colorMap: Record<string, string> = { high: "#8b2e2e", positive: "#2d6a4f" };
  return (
    <div style={{ margin: "24px 0", borderLeft: "2px solid #d8d4cc", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      {events.map((ev, i) => (
        <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: colorMap[ev.severity] ?? "#d8d4cc", marginTop: 4, flexShrink: 0, marginLeft: -25 }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590", marginBottom: 2 }}>{ev.date}</div>
            <div style={{ fontSize: 13, color: "#1a1a1a", lineHeight: 1.5 }}>{ev.label}</div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 10, color: "#9a9590", marginTop: 4, display: "flex", gap: 16 }}>
        <span><span style={{ color: "#8b2e2e", fontWeight: 700 }}>●</span> High risk</span>
        <span><span style={{ color: "#2d6a4f", fontWeight: 700 }}>●</span> Positive</span>
      </div>
    </div>
  );
}

function BilateralTable({ rows }: { rows: typeof BILATERAL }) {
  const typeColor: Record<string, string> = {
    Strategic: "#1a0a2e", Capital: "#c8873a", Programme: "#2d6a4f",
    Trade: "#6b6b6b", "Energy/Infra": "#5b21b6", Fraught: "#8b2e2e",
    Dispute: "#8b2e2e", Investment: "#6b6b6b",
  };
  return (
    <div style={{ margin: "20px 0", border: "1px solid #d8d4cc" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 90px 1fr", gap: 0, borderBottom: i < rows.length - 1 ? "1px solid #e8e4dc" : "none", background: i % 2 === 0 ? "#fafaf8" : "#f5f3ef" }}>
          <div style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: "#0f0f0f", borderRight: "1px solid #e8e4dc" }}>{r.partner}</div>
          <div style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: typeColor[r.type] ?? "#6b6b6b", borderRight: "1px solid #e8e4dc", alignSelf: "center" }}>{r.type}</div>
          <div style={{ padding: "10px 14px", fontSize: 11, color: "#6b6b6b", lineHeight: 1.5 }}>{r.detail}</div>
        </div>
      ))}
    </div>
  );
}

/* ── PAGE ─────────────────────────────────────────────────────── */

export default function EgyptPage() {
  const [active, setActive] = useState("macro");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <div className={s.root}>

      {/* ── SIDEBAR ─── */}
      <button className={s.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
        <span /><span /><span />
      </button>

      <nav className={`${s.sidebar} ${menuOpen ? s.open : ""}`}>
        <div className={s.sidebarTop}>
          <div className={s.sidebarName}>Suleiman Ashraf</div>
          <div className={s.sidebarTitle}>EM Credit Research<br />MSc Finance · LSE</div>
        </div>

        <div className={s.sidebarNav}>
          <div className={s.navGroupHeader}>Egypt · Sovereign Risk</div>
          {SECTIONS.map(sec => (
            <button key={sec.id} className={`${s.navSubLink} ${active === sec.id ? s.active : ""}`} onClick={() => scrollTo(sec.id)}>
              {sec.label}
            </button>
          ))}
        </div>

        <div className={s.sidebarBottom}>
          <Link href="/" className={s.sidebarBackLink}>← EMI</Link>
        </div>
      </nav>

      {/* ── MAIN ─── */}
      <main className={s.main}>
        <div className={s.contentWrap}>

          {/* ── HERO ─── */}
          <div className={s.hero}>

            <h1 className={s.heroName}>Egypt</h1>
            <p className={s.heroRole}>Arab Republic of Egypt · B/Caa1/B · Last updated {META.lastUpdated}</p>

            {/* Ratings strip */}
            <div style={{ display: "flex", gap: 0, margin: "20px 0", border: "1px solid #d8d4cc", width: "fit-content" }}>
              {RATINGS.map((r, i) => (
                <div key={i} style={{ padding: "10px 20px", borderRight: i < RATINGS.length - 1 ? "1px solid #d8d4cc" : "none", textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9a9590", marginBottom: 4 }}>{r.agency}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#0f0f0f", lineHeight: 1 }}>{r.rating}</div>
                  <div style={{ fontSize: 10, color: r.outlook === "Positive" ? "#2d6a4f" : "#6b6b6b", marginTop: 3 }}>{r.outlook} · {r.date}</div>
                </div>
              ))}
            </div>

            {/* Risk flag */}
            <div style={{ background: "#1a0a2e", padding: "14px 20px", maxWidth: 580, marginTop: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#c8873a", marginBottom: 6 }}>Live risk flag</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{META.riskFlag}</div>
            </div>

            {/* Summary stats */}
            <div className={s.heroStats} style={{ marginTop: 28, flexWrap: "wrap", gap: 0 }}>
              {SUMMARY_STATS.map((st, i) => {
                const colMap: Record<string, string> = { green: "#2d6a4f", red: "#8b2e2e", gold: "#c8873a" };
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center" }}>
                    <div className={s.heroStat}>
                      <div className={s.heroStatNum} style={{ color: colMap[st.color], fontSize: 22 }}>{st.value}</div>
                      <div className={s.heroStatLabel}>{st.label}</div>
                      <div style={{ fontSize: 10, color: "#9a9590" }}>{st.sub}</div>
                    </div>
                    {i < SUMMARY_STATS.length - 1 && <div className={s.heroStatDivider} style={{ margin: "0 20px" }} />}
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: 11, color: "#9a9590", marginTop: 20 }}>Position: <span style={{ color: "#c8873a", fontWeight: 600 }}>{META.position}</span></div>
          </div>

          {/* ── 1. MACRO MOMENTUM ─── */}
          <section id="macro" className={s.section}>
            <div className={s.sectionLabel}>Risk Theme 1</div>
            <h2 className={s.sectionTitle}>Growth & Macro Momentum</h2>
            <p className={s.sectionSub}>Recovery underway; private-sector inflection is the structural signal.</p>

            <StatStrip stats={[
              { label: "FY24/25 Growth",  value: "4.4%",   sub: "Real GDP",          color: "green" },
              { label: "H1 FY25/26",      value: "5.3%",   sub: "Accelerating",      color: "green" },
              { label: "10yr CAGR",       value: "~5.5%",  sub: "Current below trend", color: "gold" },
              { label: "Investment rate", value: "~13%",   sub: "Down from 18.2% FY18/19", color: "red" },
            ]} />

            <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>Real GDP Growth (%)</div>
            <BarChart data={GROWTH_BARS} />

            <div style={{ marginTop: 32, marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>Investment Composition — Private vs Public (%)</div>
            <StackedBar data={INVESTMENT_SHIFT} />

            <div style={{ marginTop: 32, marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>GDP Composition FY2024/25</div>
            <DonutChart data={GDP_COMPOSITION} />

            <div style={{ marginTop: 24, marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>IMF Growth Forecasts (%)</div>
            <BarChart data={IMF_FORECASTS} />

            <div style={{ marginTop: 24, marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>Key Macro Indicators</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc", marginBottom: 20 }}>
              {MACRO_DETAIL.map((d, i) => (
                <div key={i} style={{ background: "#fafaf8", padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: "#9a9590", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#0f0f0f", marginBottom: 2 }}>{d.value}</div>
                  <div style={{ fontSize: 10, color: "#9a9590" }}>{d.sub}</div>
                </div>
              ))}
            </div>

            <div className={s.prose}>
              <p>{MACRO_TEXT}</p>
            </div>
          </section>

          {/* ── 2. PRICE STABILITY ─── */}
          <section id="prices" className={s.section}>
            <div className={s.sectionLabel}>Risk Theme 2</div>
            <h2 className={s.sectionTitle}>Price Stability & Monetary Policy</h2>
            <p className={s.sectionSub}>Disinflation on track but last-mile gap to CBE target is wide — actual tracking 16–17% vs 7% goal.</p>

            <StatStrip stats={PRICES_STATS} />

            <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>Inflation Trajectory — Urban CPI (%) with CBE Target</div>
            <LineChart data={INFLATION_PATH} />

            <div style={{ marginTop: 24 }}>
              <div style={{ background: "#fff8f0", border: "1px solid #e8d4b0", padding: "14px 18px", marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8873a", marginBottom: 6 }}>CBE Inflation Targets</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display',serif", color: "#8b2e2e" }}>7% ± 2</div>
                    <div style={{ fontSize: 11, color: "#6b6b6b" }}>End-2026 target — actual ~16–17%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display',serif", color: "#c8873a" }}>5% ± 2</div>
                    <div style={{ fontSize: 11, color: "#6b6b6b" }}>End-2028 medium-term anchor</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={s.prose} style={{ marginTop: 8 }}>
              <p>{PRICES_TEXT}</p>
            </div>
          </section>

          {/* ── 3. EXTERNAL POSITION ─── */}
          <section id="external" className={s.section}>
            <div className={s.sectionLabel}>Risk Theme 3</div>
            <h2 className={s.sectionTitle}>External Position & FX Resilience</h2>
            <p className={s.sectionSub}>Reserves rebuilt and remittances at record; Suez and Gulf exposure are the live risks.</p>

            <StatStrip stats={EXTERNAL_STATS} />

            <div style={{ marginTop: 8, marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>Trade & Capital Structure</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc", marginBottom: 20 }}>
              {TRADE_STATS.map((d, i) => (
                <div key={i} style={{ background: "#fafaf8", padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: "#9a9590", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#0f0f0f", marginBottom: 2 }}>{d.value}</div>
                  <div style={{ fontSize: 10, color: "#9a9590" }}>{d.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>Capital Inflow Sources</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {CAPITAL_SOURCES.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #d8d4cc", background: "#fafaf8" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0f0f0f" }}>{d.value}%</span>
                  <span style={{ fontSize: 11, color: "#6b6b6b" }}>{d.label}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>FX Earner & Vulnerability Watch</div>
            <WatchGrid items={EXTERNAL_WATCH} />

            <div className={s.prose} style={{ marginTop: 8 }}>
              <p>{EXTERNAL_TEXT}</p>
            </div>
          </section>

          {/* ── 4. FISCAL & DEBT ─── */}
          <section id="fiscal" className={s.section}>
            <div className={s.sectionLabel}>Risk Theme 4</div>
            <h2 className={s.sectionTitle}>Fiscal Space & Debt Sustainability</h2>
            <p className={s.sectionSub}>Interest burden at 87% of tax revenue — the primary medium-term credit risk.</p>

            <StatStrip stats={FISCAL_STATS} />

            <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>Interest Payments as % of Tax Revenue</div>
            <div style={{ margin: "16px 0", position: "relative", height: 48 }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 28, background: "#f4f0e8", border: "1px solid #d8d4cc" }} />
              <div style={{ position: "absolute", top: 0, left: 0, width: "87%", height: 28, background: "#8b2e2e", opacity: 0.75, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>87% consumed by interest</span>
              </div>
              <div style={{ position: "absolute", top: 32, left: "87%", fontSize: 10, color: "#9a9590", transform: "translateX(-50%)" }}>87%</div>
              <div style={{ position: "absolute", top: 32, right: 0, fontSize: 10, color: "#2d6a4f" }}>13% discretionary</div>
            </div>

            <div style={{ marginTop: 32, marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>SOE Footprint</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc" }}>
              {[
                { label: "Share of Output",  value: "~16%" },
                { label: "Share of Invest.", value: "~25%" },
                { label: "Share of Employ.", value: "~6%"  },
              ].map((d, i) => (
                <div key={i} style={{ background: "#fafaf8", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#9a9590", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{d.label}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#c8873a" }}>{d.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, background: "#fff8f0", border: "1px solid #e8d4b0", padding: "14px 18px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8873a", marginBottom: 6 }}>FY2025/26 Budget Risks</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "+186%", detail: "Jump in planned external borrowing vs prior year" },
                  { label: "1 day",  detail: "Parliamentary budget debate — thin oversight" },
                  { label: "Dec 2025", detail: "Fiscal Risks Management Unit established (IMF conditionality)" },
                  { label: "94.3%", detail: "New statutory debt ceiling (% of GDP); any breach requires parliamentary approval" },
                ].map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#8b2e2e", minWidth: 70 }}>{d.label}</div>
                    <div style={{ fontSize: 12, color: "#6b6b6b", lineHeight: 1.5, paddingTop: 2 }}>{d.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={s.prose} style={{ marginTop: 20 }}>
              <p>{FISCAL_TEXT}</p>
            </div>
          </section>

          {/* ── 5. BANKING SYSTEM ─── */}
          <section id="banking" className={s.section}>
            <div className={s.sectionLabel}>Risk Theme 5</div>
            <h2 className={s.sectionTitle}>Banking System & Financial Sector</h2>
            <p className={s.sectionSub}>NFA recovered; asset quality improved; bank-sovereign nexus is the key transmission risk.</p>

            <StatStrip stats={BANKING_STATS} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc", margin: "24px 0" }}>
              {[
                { period: "2022–23 (crisis)",     nfa: "Deeply negative", note: "Banks absorbed FX gap quasi-fiscally",   color: "#8b2e2e" },
                { period: "Nov 2025 (recovered)", nfa: "+$23.7bn+",       note: "$20.3bn improvement over 2025 alone",   color: "#2d6a4f" },
              ].map((d, i) => (
                <div key={i} style={{ background: "#fafaf8", padding: "20px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590", marginBottom: 6 }}>{d.period}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: d.color, marginBottom: 4 }}>{d.nfa}</div>
                  <div style={{ fontSize: 12, color: "#6b6b6b", lineHeight: 1.5 }}>{d.note}</div>
                </div>
              ))}
            </div>

            <div className={s.prose} style={{ marginTop: 8 }}>
              <p>{BANKING_TEXT}</p>
            </div>
          </section>

          {/* ── 6. GOVERNANCE ─── */}
          <section id="governance" className={s.section}>
            <div className={s.sectionLabel}>Risk Theme 6</div>
            <h2 className={s.sectionTitle}>Governance, Institutions & Policy Credibility</h2>
            <p className={s.sectionSub}>Bottom-quartile institutional scores; IMF programme partially substitutes as external anchor.</p>

            <StatStrip stats={GOVERNANCE_STATS} />

            <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>World Governance Indicators — Egypt vs World Average</div>
            <HBarChart data={WGI_SCORES} />

            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc" }}>
              {[
                { label: "Rule of Law trend", value: "-0.27 → -0.18", sub: "2022 to 2023 — only improving WGI score", color: "#2d6a4f" },
                { label: "WJP ranking",        value: "~135th / 142",  sub: "Rule of Law Index 2024",                  color: "#8b2e2e" },
                { label: "Freedom House",      value: "Not Free",      sub: "Press, assembly, dissent restricted",      color: "#8b2e2e" },
                { label: "IMF anchor",         value: "Active",        sub: "Programme conditionality as proxy oversight", color: "#c8873a" },
              ].map((d, i) => {
                const colorMap: Record<string, string> = { green: "#2d6a4f", red: "#8b2e2e", gold: "#c8873a" };
                return (
                  <div key={i} style={{ background: "#fafaf8", padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, color: "#9a9590", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: colorMap[d.color] ?? "#0f0f0f", marginBottom: 2 }}>{d.value}</div>
                    <div style={{ fontSize: 10, color: "#9a9590" }}>{d.sub}</div>
                  </div>
                );
              })}
            </div>

            <div className={s.prose} style={{ marginTop: 24 }}>
              <p>{GOVERNANCE_TEXT}</p>
            </div>
          </section>

          {/* ── 7. GEOPOLITICAL ─── */}
          <section id="geopolitical" className={s.section}>
            <div className={s.sectionLabel}>Risk Theme 7</div>
            <h2 className={s.sectionTitle}>Political & Geopolitical Risk</h2>
            <p className={s.sectionSub}>2026 Iran conflict is the dominant live variable; Gaza and Red Sea attacks compound exposure.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc", margin: "24px 0" }}>
              {[
                { label: "Sisi third term",    value: "To 2030",  detail: "2023 election: 90% margin, 67% turnout",           color: "gold" },
                { label: "Hormuz disruption",  value: "Live",     detail: "US/Israeli strikes on Iran from 28 Feb 2026",       color: "red"  },
                { label: "Gaza war",           value: "Ongoing",  detail: "Border conflict; Egypt as primary intermediary",    color: "red"  },
                { label: "Red Sea attacks",    value: "Ongoing",  detail: "Houthi shipping attacks since Jan 2024",            color: "red"  },
              ].map((d, i) => {
                const colMap: Record<string, string> = { gold: "#c8873a", red: "#8b2e2e" };
                return (
                  <div key={i} style={{ background: "#fafaf8", padding: "16px 18px" }}>
                    <div style={{ fontSize: 10, color: "#9a9590", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: colMap[d.color], marginBottom: 4 }}>{d.value}</div>
                    <div style={{ fontSize: 11, color: "#6b6b6b", lineHeight: 1.5 }}>{d.detail}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>Event Sequence</div>
            <GeoTimeline events={GEO_EVENTS} />

            <div style={{ marginTop: 24, marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>Bilateral Relationships</div>
            <BilateralTable rows={BILATERAL} />

            <div className={s.prose} style={{ marginTop: 8 }}>
              <p>{GEO_TEXT}</p>
            </div>
          </section>

          {/* ── 8. STRUCTURAL ─── */}
          <section id="structural" className={s.section}>
            <div className={s.sectionLabel}>Risk Theme 8</div>
            <h2 className={s.sectionTitle}>Structural, Resource & Demographic Risk</h2>
            <p className={s.sectionSub}>Water scarcity and food import dependence are the long-run sovereign liabilities.</p>

            <StatStrip stats={STRUCTURAL_STATS} />

            <div style={{ marginTop: 4, marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>Infrastructure Indicators</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc", marginBottom: 20 }}>
              {INFRA_ITEMS.map((d, i) => {
                const colorMap: Record<string, string> = { green: "#2d6a4f", red: "#8b2e2e" };
                return (
                  <div key={i} style={{ background: "#fafaf8", padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, color: "#9a9590", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: colorMap[d.color] ?? "#0f0f0f", marginBottom: 2 }}>{d.value}</div>
                    <div style={{ fontSize: 10, color: "#9a9590" }}>{d.sub}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9590" }}>Social & Demographic Indicators</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc", marginBottom: 20 }}>
              {SOCIAL_ITEMS.map((d, i) => {
                const colorMap: Record<string, string> = { green: "#2d6a4f", red: "#8b2e2e", gold: "#c8873a" };
                return (
                  <div key={i} style={{ background: "#fafaf8", padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, color: "#9a9590", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: colorMap[d.color ?? ""] ?? "#0f0f0f", marginBottom: 2 }}>{d.value}</div>
                    <div style={{ fontSize: 10, color: "#9a9590" }}>{d.sub}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#d8d4cc", border: "1px solid #d8d4cc", margin: "8px 0 20px" }}>
              {[
                { label: "GERD Dispute",   status: "UNRESOLVED", detail: "Ethiopia filling without binding agreement on minimum downstream Nile flows", color: "#8b2e2e" },
                { label: "Suez Canal",     status: "CHOKEPOINT", detail: "Critical FX earner; ~12% of global trade; exposed to Red Sea conflict",       color: "#c8873a" },
                { label: "Food Security",  status: "VULNERABLE",  detail: "World's largest wheat importer; gas now net importer (Zohr decline)",         color: "#8b2e2e" },
                { label: "Demographics",   status: "DUAL-EDGED",  detail: "120m population, median 24.7 — growth asset long-run, job pressure near-term", color: "#c8873a" },
              ].map((d, i) => (
                <div key={i} style={{ background: "#fafaf8", padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, color: "#9a9590", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: d.color, marginBottom: 4 }}>{d.status}</div>
                  <div style={{ fontSize: 11, color: "#6b6b6b", lineHeight: 1.5 }}>{d.detail}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#f0faf4", border: "1px solid #b8dcc8", padding: "14px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2d6a4f", marginBottom: 8 }}>Positive Structural Developments</div>
              {[
                "Temsah gas field discovery (~2 trillion cubic feet) announced April 2026 — potential partial offset to Zohr decline",
                "500kV transmission grid expanded from 2,364km (2014) to 8,250km (2024) — significant infrastructure build-out",
                "Renewable capacity reached 8.6GW; government target of 42% of energy mix by 2030",
                "Extreme poverty ($2.15/day) estimated at ~2.4% (2025) — low absolute floor despite high inflation",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <div style={{ color: "#2d6a4f", fontWeight: 700, marginTop: 1, flexShrink: 0 }}>+</div>
                  <div style={{ fontSize: 12, color: "#1a1a1a", lineHeight: 1.5 }}>{item}</div>
                </div>
              ))}
            </div>

            <div className={s.prose}>
              <p>{STRUCTURAL_TEXT}</p>
            </div>

            {/* Locked doc banner */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:32, padding:"18px 28px", background:"#f4f0e8", border:"1px solid #d8d4cc", gap:24, opacity:0.75 }}>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ fontSize:20, color:"#9a9590" }}>🔒</div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"#9a9590", marginBottom:4 }}>Full Analysis · Private</div>
                  <div style={{ fontSize:15, fontWeight:600, color:"#6b6b6b", letterSpacing:"-0.01em" }}>Egypt: Structural Features</div>
                  <div style={{ fontSize:11, color:"#9a9590", marginTop:3 }}>Infrastructure · Demographics · Water · Energy · Social indicators · Long-run sovereign risk</div>
                </div>
              </div>
              <a href="mailto:suleimanashraf@outlook.com" style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#9a9590", whiteSpace:"nowrap", border:"1px solid #d8d4cc", padding:"7px 14px", textDecoration:"none" }}>Request → suleimanashraf@outlook.com</a>
            </div>
          </section>

          {/* ── FOOTER ─── */}
          <footer className={s.footer}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9a9590", marginBottom: 10 }}>Sources & Methodology</div>
            <p className={s.footerText}>
              {META.sources}. All data as of {META.lastUpdated} unless otherwise noted.
              GDP and fiscal figures use Egyptian fiscal year (July–June). Growth rates are real.
              WGI scores sourced from World Bank Worldwide Governance Indicators database (2023 vintage).
              Credit ratings and outlooks as of April 2026 rating actions. This page reflects
              independent analysis and does not reproduce or adapt any third-party analytical framework.
            </p>
            <div style={{ fontSize: 11, color: "#9a9590", marginTop: 16, paddingTop: 16, borderTop: "1px solid #d8d4cc" }}>
              Last updated: <strong>{META.lastUpdated}</strong> · <Link href="/research" style={{ color: "#c8873a", textDecoration: "none" }}>← All Research</Link>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}
