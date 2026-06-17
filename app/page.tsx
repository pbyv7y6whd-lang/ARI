"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const PAPER        = "#fafaf8";
const PAPER2       = "#f4f0e8";
const INK          = "#0f0f0f";
const ACCENT       = "#c8873a";
const MUTED        = "#6b6b6b";
const RULE         = "#d8d4cc";
const GREEN        = "#2d6a4f";
const RED          = "#8b2e2e";

const EM_COUNTRIES = [
  { name: "Egypt",    lat: 26.8, lng: 30.8,  spread: 480,  rating: "B−",   stance: "bull" },
  { name: "UAE",      lat: 23.4, lng: 53.8,  spread: 65,   rating: "AA−",  stance: "neut" },
  { name: "Nigeria",  lat: 9.1,  lng: 8.7,   spread: 700,  rating: "B−",   stance: "neut" },
  { name: "Pakistan", lat: 30.4, lng: 69.3,  spread: 1100, rating: "CCC+", stance: "neut" },
  { name: "Kenya",    lat: -0.0, lng: 37.9,  spread: 560,  rating: "B",    stance: "neut" },
  { name: "Iraq",     lat: 33.2, lng: 43.7,  spread: 750,  rating: "B−",   stance: "bear" },
  { name: "Ghana",    lat: 7.9,  lng: -1.0,  spread: 900,  rating: "SD",   stance: "bear" },
  { name: "Angola",   lat: -11.2,lng: 17.9,  spread: 580,  rating: "B−",   stance: "neut" },
];

const ARTICLES = [
  {
    tag: "Trade Journal · June 2026",
    title: "My First Macro Trade: Shorting Oil Through a War",
    deck: "Right on direction. Survived a $117 spike. Barely made money. Here is everything I learned about process, instruments, and the gap between being right and making money.",
    date: "Jun 2026",
    readTime: "18 min",
    href: "/research#oil-trade",
    live: true,
  },
  {
    tag: "Sovereign Credit",
    title: "Egypt's IMF Tightrope",
    deck: "FX liberalisation, external debt dynamics, and what spread compression tells us about reform credibility.",
    date: "Coming soon",
    readTime: "",
    href: "/research#sovereign",
    live: false,
  },
  {
    tag: "EM Macro",
    title: "Dollar Dominance and EM Debt Dynamics",
    deck: "How USD strength transmits into sovereign credit quality and why carry trades create fragility at the wrong moments.",
    date: "Coming soon",
    readTime: "",
    href: "/research",
    live: false,
  },
];

/* ── GLOBE (light-adapted) ───────────────────────────────────── */
function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const mouseRef  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, R = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      R = Math.min(W, H) * 0.4;
    };
    resize();
    window.addEventListener("resize", resize);

    canvas.addEventListener("mousemove", e => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left - W / 2) / R,
        y: (e.clientY - rect.top  - H / 2) / R,
      };
    });

    let rotY = 0.3, rotX = 0.15;

    const toXYZ = (lat: number, lng: number) => {
      const phi   = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;
      return {
        x: -Math.sin(phi) * Math.cos(theta),
        y:  Math.cos(phi),
        z:  Math.sin(phi) * Math.sin(theta),
      };
    };

    const rotate = (p: {x:number,y:number,z:number}, ry: number, rx: number) => {
      let {x, y, z} = p;
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const x1 = x * cosY + z * sinY; z = -x * sinY + z * cosY; x = x1;
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const y1 = y * cosX - z * sinX; const z2 = y * sinX + z * cosX;
      return { x, y: y1, z: z2 };
    };

    const gridDots: {lat:number,lng:number}[] = [];
    for (let lat = -80; lat <= 80; lat += 12)
      for (let lng = -180; lng < 180; lng += 12)
        gridDots.push({ lat, lng });

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const tY = rotY + mouseRef.current.x * 0.03;
      const tX = rotX - mouseRef.current.y * 0.02;
      rotY += (tY - rotY) * 0.02 + 0.003;
      rotX += (tX - rotX) * 0.02;

      const cx = W / 2, cy = H / 2;

      /* subtle shadow ring */
      ctx.strokeStyle = RULE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      /* grid dots — ink coloured, soft */
      gridDots.forEach(({ lat, lng }) => {
        const r = rotate(toXYZ(lat, lng), rotY, rotX);
        if (r.z < 0) return;
        const alpha = 0.06 + r.z * 0.12;
        ctx.fillStyle = `rgba(15,15,15,${alpha})`;
        ctx.beginPath();
        ctx.arc(cx + r.x * R, cy - r.y * R, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      /* EM country dots */
      EM_COUNTRIES.forEach(c => {
        const r = rotate(toXYZ(c.lat, c.lng), rotY, rotX);
        if (r.z < -0.1) return;
        const x = cx + r.x * R, y = cy - r.y * R;
        const visible = r.z > 0;

        if (visible) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 14);
          const gc = c.stance === "bull" ? "45,106,79" : c.stance === "bear" ? "139,46,46" : "200,135,58";
          glow.addColorStop(0, `rgba(${gc},0.2)`);
          glow.addColorStop(1, `rgba(${gc},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        const col = c.stance === "bull" ? GREEN : c.stance === "bear" ? RED : ACCENT;
        ctx.fillStyle = col + (visible ? "ff" : "55");
        ctx.beginPath();
        ctx.arc(x, y, visible ? 4.5 : 2, 0, Math.PI * 2);
        ctx.fill();

        if (visible && r.z > 0.3) {
          ctx.fillStyle = MUTED;
          ctx.font = "500 10px Inter, sans-serif";
          ctx.fillText(c.name, x + 7, y + 4);
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}

/* ── TILT CARD ───────────────────────────────────────────────── */
function TiltCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x*10}deg) rotateX(${-y*7}deg) translateZ(6px)`;
    el.style.boxShadow = `${-x*12}px ${-y*8}px 24px rgba(0,0,0,0.08)`;
  };
  const onLeave = () => {
    if (ref.current) { ref.current.style.transform = ""; ref.current.style.boxShadow = ""; }
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: "transform 0.18s ease, box-shadow 0.18s ease", ...style }}>
      {children}
    </div>
  );
}

/* ── COUNTER ─────────────────────────────────────────────────── */
function Counter({ to, suffix="" }: { to:number; suffix?:string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let n = 0;
      const go = () => { n += Math.ceil((to-n)/8)||1; setV(Math.min(n,to)); if(n<to) requestAnimationFrame(go); };
      requestAnimationFrame(go);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

/* ── PAGE ────────────────────────────────────────────────────── */
export default function HomePage() {
  const [hovered, setHovered] = useState<string|null>(null);

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: "'Inter',sans-serif", fontWeight: 300, minHeight: "100vh" }}>

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: `1px solid ${RULE}`,
        background: "rgba(250,250,248,0.92)", backdropFilter: "blur(10px)",
        padding: "0 40px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: INK }}>Suleiman Ashraf</span>
            <span style={{ color: RULE, fontSize: 14 }}>·</span>
            <span style={{ fontSize: 12, color: MUTED }}>EM Credit &amp; Macro</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[["#research","Research"],["#coverage","Coverage"],["#trades","Trade Log"]].map(([h,l]) => (
              <a key={l} href={h} style={{ fontSize: 12, color: MUTED, textDecoration: "none" }}>{l}</a>
            ))}
            <Link href="/research"  style={{ fontSize: 12, color: MUTED, textDecoration: "none" }}>Portfolio</Link>
            <Link href="/about"     style={{ fontSize: 12, color: MUTED, textDecoration: "none" }}>About</Link>
            <Link href="/dashboard" style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              color: ACCENT, border: `1px solid ${ACCENT}`, padding: "6px 14px", textDecoration: "none",
            }}>ARI Platform ↗</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr",
        alignItems: "center", paddingTop: 52,
        borderBottom: `2px solid ${INK}`,
      }}>
        {/* Left */}
        <div style={{ padding: "80px 56px 80px 48px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED, marginBottom: 28 }}>
            EM Credit &amp; Macro Research · LSE MSc Finance
          </div>

          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(36px,4vw,56px)", fontWeight: 700, lineHeight: 1.07, letterSpacing: "-0.025em", marginBottom: 28 }}>
            Emerging Markets<br />
            <span style={{ color: ACCENT }}>Credit Research.</span>
          </h1>

          <p style={{
            fontSize: 16, lineHeight: 1.8, color: MUTED, maxWidth: 440, marginBottom: 40,
            borderLeft: `3px solid ${ACCENT}`, paddingLeft: 20,
            fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic",
          }}>
            Tracking sovereign risk, external financing conditions, and commodity
            price transmission into EM fiscal dynamics — with first-hand market experience.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 36, marginBottom: 44, paddingBottom: 44, borderBottom: `1px solid ${RULE}` }}>
            {[
              { to: 8,   sfx: "",    label: "Sovereigns Tracked" },
              { to: 480, sfx: "bps", label: "Egypt EMBI Spread"  },
              { to: 20,  sfx: "+",   label: "Months Live Trading" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: ACCENT, lineHeight: 1, letterSpacing: "-0.02em" }}>
                  <Counter to={s.to} suffix={s.sfx} />
                </div>
                <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 6 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/research" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: INK, color: PAPER, padding: "11px 24px",
              fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              textDecoration: "none",
            }}>
              View Research →
            </Link>
            <a href="#coverage" style={{
              display: "inline-flex", alignItems: "center",
              border: `1px solid ${RULE}`, color: MUTED, padding: "11px 24px",
              fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              textDecoration: "none",
            }}>
              Country Coverage
            </a>
          </div>
        </div>

        {/* Right: globe */}
        <div style={{ height: "100vh", borderLeft: `1px solid ${RULE}`, position: "relative" }}>
          <Globe />
          <div style={{ position: "absolute", bottom: 32, right: 24, display: "flex", gap: 16, fontSize: 10, color: MUTED, letterSpacing: "0.08em" }}>
            {[[GREEN,"Bullish"],[ACCENT,"Neutral"],[RED,"Cautious"]].map(([c,l]) => (
              <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c as string }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESEARCH ─────────────────────────────────────────── */}
      <section id="research" style={{ padding: "96px 48px", borderBottom: `1px solid ${RULE}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 52 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>
                Writing &amp; Analysis
              </div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Research &amp; Trade Journals
              </h2>
            </div>
            <Link href="/research" style={{ fontSize: 12, color: MUTED, textDecoration: "none" }}>View all →</Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 1, background: RULE }}>
            {ARTICLES.map((art, i) => (
              <TiltCard key={art.title} style={{ background: PAPER }}>
                <Link href={art.href} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
                  <div style={{
                    padding: i === 0 ? "40px 36px" : "28px 24px",
                    background: PAPER, height: "100%",
                    opacity: art.live ? 1 : 0.55,
                    minHeight: i === 0 ? 320 : undefined,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ACCENT, marginBottom: 14 }}>
                      {art.tag}
                    </div>
                    <h3 style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: i === 0 ? 22 : 16, fontWeight: 700,
                      lineHeight: 1.25, letterSpacing: "-0.01em", marginBottom: 12, color: INK,
                    }}>
                      {art.title}
                    </h3>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: 20 }}>
                      {art.deck}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${RULE}`, paddingTop: 14 }}>
                      <span style={{ fontSize: 11, color: MUTED }}>{art.date}</span>
                      {art.live
                        ? <span style={{ fontSize: 11, color: ACCENT, fontWeight: 500 }}>{art.readTime} read →</span>
                        : <span style={{ fontSize: 11, color: RULE }}>Coming soon</span>
                      }
                    </div>
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOVEREIGN COVERAGE ───────────────────────────────── */}
      <section id="coverage" style={{ padding: "96px 48px", borderBottom: `1px solid ${RULE}`, background: PAPER2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 52 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>
              Sovereign Coverage
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
              EM Country Monitor
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: RULE }}>
            {EM_COUNTRIES.map(c => (
              <TiltCard key={c.name} style={{ background: hovered === c.name ? "#eee8d8" : PAPER }}>
                <div
                  onMouseEnter={() => setHovered(c.name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ padding: "22px 20px", background: "inherit", transition: "background 0.2s" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.06em" }}>{c.rating}</div>
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      padding: "3px 7px", border: "1px solid",
                      color:        c.stance==="bull" ? GREEN : c.stance==="bear" ? RED : ACCENT,
                      borderColor:  c.stance==="bull" ? GREEN : c.stance==="bear" ? RED : ACCENT,
                    }}>
                      {c.stance==="bull" ? "Bullish" : c.stance==="bear" ? "Cautious" : "Neutral"}
                    </div>
                  </div>

                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: ACCENT, lineHeight: 1, marginBottom: 4 }}>
                    {c.spread}
                    <span style={{ fontSize: 13, fontWeight: 400, color: MUTED, marginLeft: 4 }}>bps</span>
                  </div>
                  <div style={{ fontSize: 9, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>EMBI Spread</div>

                  <div style={{ height: 2, background: RULE, borderRadius: 1 }}>
                    <div style={{
                      height: "100%", borderRadius: 1,
                      background: c.stance==="bull" ? GREEN : c.stance==="bear" ? RED : ACCENT,
                      width: `${Math.min((c.spread/1200)*100, 100)}%`,
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
          <div style={{ marginTop: 16, textAlign: "right", fontSize: 11, color: MUTED }}>
            Spreads indicative · For research purposes only
          </div>
        </div>
      </section>

      {/* ── TRADE LOG ────────────────────────────────────────── */}
      <section id="trades" style={{ padding: "96px 48px", borderBottom: `1px solid ${RULE}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>Trade Log</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>Live Position Journal</h2>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${INK}` }}>
                {["Instrument","Dir","Entry","Current","P&L","Status","Thesis"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, paddingBottom: 14 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { inst:"3BRL (3x Brent Long)", dir:"LONG",  dc:GREEN, entry:"~$16.50", cur:"Exited Dec '25", pnl:"~Breakeven", plc:MUTED,  status:"Closed", thesis:"Conflict premium underpriced at $73 oil" },
                { inst:"SBRT (1x Brent Short)",dir:"SHORT", dc:RED,   entry:"~$9.13",  cur:"$9.58",         pnl:"+4.71%",    plc:GREEN,  status:"Open",   thesis:"$100 structural ceiling · IEA 3.7m b/d surplus" },
              ].map((r,i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${RULE}` }}>
                  <td style={{ padding:"14px 16px", fontWeight:500 }}>{r.inst}</td>
                  <td style={{ padding:"14px 16px", fontWeight:700, color:r.dc }}>{r.dir}</td>
                  <td style={{ padding:"14px 16px", color:MUTED, fontFamily:"monospace" }}>{r.entry}</td>
                  <td style={{ padding:"14px 16px", color:MUTED, fontFamily:"monospace" }}>{r.cur}</td>
                  <td style={{ padding:"14px 16px", fontWeight:600, color:r.plc }}>{r.pnl}</td>
                  <td style={{ padding:"14px 16px" }}>
                    <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", padding:"3px 8px", background: r.status==="Open" ? "rgba(200,135,58,0.12)" : "rgba(0,0,0,0.05)", color: r.status==="Open" ? ACCENT : MUTED }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding:"14px 16px", color:MUTED, fontSize:12 }}>{r.thesis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <section style={{ padding: "96px 48px", borderBottom: `1px solid ${RULE}`, background: PAPER2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, marginBottom: 16 }}>About</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 20 }}>Suleiman Ashraf</h2>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.85, marginBottom: 14 }}>
              MSc Finance student at the London School of Economics, with prior experience in UK public markets and governance research.
            </p>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.85, marginBottom: 32 }}>
              Primary research focus: EM sovereign credit — the intersection of sovereign risk, external financing conditions, and commodity price transmission into EM fiscal dynamics.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                ["https://www.linkedin.com/in/suleiman-ashraf/","LinkedIn ↗", true],
                ["mailto:suleimanashraf@outlook.com","Email", false],
              ].map(([h,l,ext]) => (
                <a key={l as string} href={h as string} {...(ext ? {target:"_blank",rel:"noopener"} : {})}
                  style={{ fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", border:`1px solid ${RULE}`, padding:"9px 18px", color:INK, textDecoration:"none" }}>
                  {l}
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: RULE }}>
            {[
              ["Focus",      "EM Sovereign Credit · Macro Strategy"],
              ["Education",  "MSc Finance · LSE"],
              ["Background", "UK Public Markets · Governance"],
              ["Trading",    "Oil · ETP Mechanics · Live Positions"],
            ].map(([label, val]) => (
              <div key={label} style={{ background: PAPER2, padding: "20px 18px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 12, color: INK, lineHeight: 1.6 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ padding: "24px 48px", borderTop: `2px solid ${INK}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", fontSize: 11, color: MUTED }}>
          <span>Suleiman Ashraf · EM Credit Research · 2026</span>
          <span>Not investment advice. For research and informational purposes only.</span>
        </div>
      </footer>

    </div>
  );
}
