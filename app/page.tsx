"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

/* ─── lazy-load the map so SSR doesn't break ─── */
const WorldMap = dynamic(() => import("../components/WorldMap"), { ssr: false });

const PAPER  = "#fafaf8";
const PAPER2 = "#f4f0e8";
const INK    = "#0f0f0f";
const ACCENT = "#c8873a";
const MUTED  = "#6b6b6b";
const RULE   = "#d8d4cc";
const GREEN  = "#2d6a4f";
const RED    = "#8b2e2e";

export const EM_COUNTRIES = [
  { name:"Egypt",    iso:"EGY", spread:281,  rating:"B",    stance:"bull", lat:26.8,  lng:30.8, active:true  },
  { name:"UAE",      iso:"ARE", spread:35,   rating:"AA",   stance:"neut", lat:23.4,  lng:53.8, active:true  },
  { name:"Pakistan", iso:"PAK", spread:379,  rating:"CCC+", stance:"neut", lat:30.4,  lng:69.3, active:true  },
];

const ARTICLES = [
  { tag:"Trade Journal · June 2026",    title:"My First Macro Trade: Shorting Oil Through a War",  deck:"Right on direction. Survived a $117 spike. Barely made money. Here is everything I learned about process, instruments, and the gap between being right and making money.", date:"Jun 2026", readTime:"18 min", href:"/research#oil-trade",                              live:true },
  { tag:"Sovereign Credit · June 2026", title:"Egypt: LONG Eurobonds at 281bps CDS",               deck:"Post-Hormuz deterioration reflects a transitory external shock, not a structural breakdown. IMF anchor holds through Dec 2026. I target spread compression to 220–240bps by year-end.",                                                                                    date:"Jun 2026", readTime:"9 min",  href:"/egypt-sovereign-credit-note-june-2026.pdf", live:true },
  { tag:"Credit Framework · July 2026", title:"When Does a Guarantee Actually Transfer Sovereign Risk?", deck:"A framework for pricing quasi-sovereign issuance. Direction, sovereign ceiling, governing law, immunity waiver — with Egypt case studies: CIB ceiling compression and the AfDB-guaranteed samurai bond.", date:"Jul 2026", readTime:"", href:"/research#guarantee-framework", live:true },
];

/* ── TILT CARD ─────────────────────────────────────────────── */
function TiltCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width  - 0.5;
    const y  = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform  = `perspective(700px) rotateY(${x*9}deg) rotateX(${-y*6}deg) translateZ(5px)`;
    el.style.boxShadow  = `${-x*10}px ${-y*6}px 20px rgba(0,0,0,0.07)`;
  };
  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "";
    e.currentTarget.style.boxShadow = "";
  };
  return (
    <div onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition:"transform 0.18s ease, box-shadow 0.18s ease", ...style }}>
      {children}
    </div>
  );
}

/* ── COUNTER ───────────────────────────────────────────────── */
function Counter({ to, suffix="" }: { to:number; suffix?:string }) {
  const [v, setV] = useState(0);
  const started   = useState(false);
  const ref       = (el: HTMLSpanElement | null) => {
    if (!el || started[0]) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      (started as [boolean, React.Dispatch<React.SetStateAction<boolean>>])[1](true);
      let n = 0;
      const go = () => { n += Math.ceil((to-n)/8)||1; setV(Math.min(n,to)); if(n<to) requestAnimationFrame(go); };
      requestAnimationFrame(go);
    });
    obs.observe(el);
  };
  return <span ref={ref}>{v}{suffix}</span>;
}

/* ── PAGE ──────────────────────────────────────────────────── */
export default function HomePage() {
  const [tooltip, setTooltip] = useState<typeof EM_COUNTRIES[0] | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  return (
    <div style={{ background:PAPER, color:INK, fontFamily:"'Inter',sans-serif", fontWeight:300, minHeight:"100vh" }}>

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, borderBottom:`1px solid ${RULE}`, background:"rgba(250,250,248,0.93)", backdropFilter:"blur(10px)", padding:"0 40px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", height:52, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:14, fontWeight:700, letterSpacing:"-0.01em" }}>Suleiman Ashraf</span>
            <span style={{ color:RULE }}>·</span>
            <span style={{ fontSize:12, color:MUTED }}>EM Credit &amp; Macro</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:28 }}>
            {[["#research","Research"]].map(([h,l]) => (
              <a key={l} href={h} style={{ fontSize:12, color:MUTED, textDecoration:"none" }}>{l}</a>
            ))}
            <Link href="/about"    style={{ fontSize:12, color:MUTED, textDecoration:"none" }}>About</Link>
            <Link href="/dashboard" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:ACCENT, border:`1px solid ${ACCENT}`, padding:"6px 14px", textDecoration:"none" }}>
              EMI Platform ↗
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", alignItems:"center", paddingTop:52, borderBottom:`2px solid ${INK}` }}>

        {/* Left text */}
        <div style={{ padding:"80px 56px 80px 48px" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:MUTED, marginBottom:28 }}>
            EM Credit &amp; Macro Research · LSE MSc Finance
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(36px,4vw,56px)", fontWeight:700, lineHeight:1.07, letterSpacing:"-0.025em", marginBottom:28 }}>
            EM Credit<br /><span style={{ color:ACCENT }}>Research.</span>
          </h1>
          <p style={{ fontSize:16, lineHeight:1.8, color:MUTED, maxWidth:440, marginBottom:40, borderLeft:`3px solid ${ACCENT}`, paddingLeft:20, fontFamily:"'Playfair Display',Georgia,serif", fontStyle:"italic" }}>
            Tracking sovereign risk, external financing conditions, and commodity price transmission into EM fiscal dynamics — with first-hand market experience.
          </p>

          {/* Stats */}
          <div style={{ display:"flex", gap:36, marginBottom:44, paddingBottom:44, borderBottom:`1px solid ${RULE}` }}>
            {[{to:1,sfx:"",label:"Sovereign Tracked"},{to:281,sfx:"bps",label:"Egypt 5Y CDS"},{to:1,sfx:"",label:"Corporate Tracked"}].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, color:ACCENT, lineHeight:1, letterSpacing:"-0.02em" }}>
                  <Counter to={s.to} suffix={s.sfx} />
                </div>
                <div style={{ fontSize:10, color:MUTED, letterSpacing:"0.1em", textTransform:"uppercase", marginTop:6 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <Link href="/research" style={{ display:"inline-flex", alignItems:"center", gap:8, background:INK, color:PAPER, padding:"11px 24px", fontSize:12, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", textDecoration:"none" }}>
              View Research →
            </Link>
            <Link href="/dashboard" style={{ display:"inline-flex", alignItems:"center", border:`1px solid ${RULE}`, color:MUTED, padding:"11px 24px", fontSize:12, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", textDecoration:"none" }}>
              AI EMI Platform →
            </Link>
          </div>
        </div>

        {/* Right: SVG map */}
        <div style={{ borderLeft:`1px solid ${RULE}`, height:"100vh", position:"relative", overflow:"hidden", background:PAPER2 }}>
          <WorldMap
            countries={EM_COUNTRIES}
            onHover={(c, x, y) => { setTooltip(c); setTooltipPos({ x, y }); }}
            onLeave={() => setTooltip(null)}
          />

          {/* Tooltip */}
          {tooltip && (
            <div style={{
              position:"absolute", left:tooltipPos.x + 12, top:tooltipPos.y - 10,
              background:INK, color:PAPER, padding:"10px 14px", fontSize:12, pointerEvents:"none",
              boxShadow:"0 4px 16px rgba(0,0,0,0.15)", zIndex:10, minWidth:160,
            }}>
              <div style={{ fontWeight:700, marginBottom:4 }}>{tooltip.name}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:6 }}>{tooltip.rating}</div>
              <div style={{ fontSize:18, fontWeight:700, color:ACCENT, lineHeight:1 }}>{tooltip.spread} <span style={{ fontSize:11, fontWeight:400, color:"rgba(255,255,255,0.4)" }}>bps</span></div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:6 }}>5Y CDS</div>
              <div style={{
                fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
                color: tooltip.stance==="bull" ? "#4caf7d" : tooltip.stance==="bear" ? "#cf6679" : ACCENT,
              }}>
                {tooltip.stance==="bull" ? "● Bullish" : tooltip.stance==="bear" ? "● Cautious" : "● Neutral"}
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{ position:"absolute", bottom:24, right:20, display:"flex", gap:14, fontSize:10, color:MUTED, letterSpacing:"0.08em" }}>
            {[[GREEN,"Bullish"],[ACCENT,"Neutral"],[RED,"Cautious"]].map(([c,l]) => (
              <div key={l as string} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:c as string }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESEARCH ─────────────────────────────────────── */}
      <section id="research" style={{ padding:"96px 48px", borderBottom:`1px solid ${RULE}` }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:52 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:ACCENT, marginBottom:12 }}>Writing &amp; Analysis</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, letterSpacing:"-0.02em", lineHeight:1.1 }}>Research &amp; Trade Journals</h2>
            </div>
            <Link href="/research" style={{ fontSize:12, color:MUTED, textDecoration:"none" }}>View all →</Link>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:RULE }}>
            {ARTICLES.map((art, i) => (
              <TiltCard key={art.title} style={{ background:PAPER }}>
                <Link href={art.live ? art.href : "#"} target={art.href.endsWith(".pdf") ? "_blank" : undefined} rel={art.href.endsWith(".pdf") ? "noopener noreferrer" : undefined} style={{ textDecoration:"none", color:"inherit", display:"block", height:"100%", pointerEvents:art.live?"auto":"none" }}>
                  <div style={{ padding:"40px 36px", background:PAPER, height:"100%", minHeight:300, opacity:art.live?1:0.5 }}>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:ACCENT, marginBottom:14 }}>{art.tag}</div>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:i===0?22:20, fontWeight:700, lineHeight:1.25, letterSpacing:"-0.01em", marginBottom:12, color:INK }}>{art.title}</h3>
                    <p style={{ fontSize:13, color:MUTED, lineHeight:1.7, marginBottom:20 }}>{art.deck}</p>
                    <div style={{ display:"flex", justifyContent:"space-between", borderTop:`1px solid ${RULE}`, paddingTop:14 }}>
                      <span style={{ fontSize:11, color:MUTED }}>{art.date}</span>
                      {art.live
                        ? <span style={{ fontSize:11, color:ACCENT, fontWeight:500 }}>Read →</span>
                        : <span style={{ fontSize:11, color:RULE }}>Coming soon</span>}
                    </div>
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
          <p style={{ marginTop:20, fontSize:12, color:MUTED }}>More coming soon.</p>
        </div>
      </section>

      {/* ── SOVEREIGN COVERAGE ───────────────────────────── */}

      {/* ── ABOUT ────────────────────────────────────────── */}
      <section style={{ padding:"96px 48px", borderBottom:`1px solid ${RULE}`, background:PAPER2 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:ACCENT, marginBottom:16 }}>About</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.02em", marginBottom:20 }}>Suleiman Ashraf</h2>
            <ul style={{ fontSize:14, color:MUTED, lineHeight:2, marginBottom:20, listStyle:"none", padding:0 }}>
              <li><span style={{ color:INK, fontWeight:600 }}>22 · London</span></li>
              <li><span style={{ color:INK, fontWeight:600 }}>MSc Finance</span> — London School of Economics (2026)</li>
              <li><span style={{ color:INK, fontWeight:600 }}>BSc Finance, First Class</span> — Bayes Business School (2025)</li>
            </ul>
            <p style={{ fontSize:14, color:MUTED, lineHeight:1.85, marginBottom:14 }}>Prior experience as a Research &amp; Policy Analyst at the Quoted Companies Alliance, working across UK small and mid-cap public equity markets alongside fund managers, market makers and listed company executives.</p>
            <p style={{ fontSize:14, color:MUTED, lineHeight:1.85, marginBottom:32 }}>This platform — built since May 2026 — is a working attempt to apply a systematic credit research framework across EM sovereigns and corporates.</p>
            <div style={{ display:"flex", gap:10 }}>
              <a href="https://www.linkedin.com/in/suleiman-ashraf/" target="_blank" rel="noopener" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", border:`1px solid ${RULE}`, padding:"9px 18px", color:INK, textDecoration:"none" }}>LinkedIn ↗</a>
              <a href="mailto:suleimanashraf@outlook.com" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", border:`1px solid ${RULE}`, padding:"9px 18px", color:INK, textDecoration:"none" }}>Email</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ padding:"24px 48px", borderTop:`2px solid ${INK}` }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", fontSize:11, color:MUTED }}>
          <span>Suleiman Ashraf · EM Credit Research · 2026</span>
          <span>Not investment advice. For research and informational purposes only.</span>
        </div>
      </footer>
    </div>
  );
}
