"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ── EM country dots for the globe [lat, lng] ── */
const EM_COUNTRIES = [
  { name: "Egypt",    lat: 26.8, lng: 30.8,  spread: 480, rating: "B−",   stance: "bull" },
  { name: "UAE",      lat: 23.4, lng: 53.8,  spread: 65,  rating: "AA−",  stance: "neut" },
  { name: "Nigeria",  lat: 9.1,  lng: 8.7,   spread: 700, rating: "B−",   stance: "neut" },
  { name: "Pakistan", lat: 30.4, lng: 69.3,  spread: 1100,rating: "CCC+", stance: "neut" },
  { name: "Kenya",    lat: -0.0, lng: 37.9,  spread: 560, rating: "B",    stance: "neut" },
  { name: "Iraq",     lat: 33.2, lng: 43.7,  spread: 750, rating: "B−",   stance: "bear" },
  { name: "Ghana",    lat: 7.9,  lng: -1.0,  spread: 900, rating: "SD",   stance: "bear" },
  { name: "Angola",   lat: -11.2,lng: 17.9,  spread: 580, rating: "B−",   stance: "neut" },
];

const ARTICLES = [
  {
    id: "oil-trade",
    tag: "Trade Journal",
    title: "My First Macro Trade: Shorting Oil Through a War",
    deck: "Right on direction. Survived a $117 spike. Barely made money. Here is everything I learned.",
    date: "Jun 2026",
    readTime: "18 min",
    href: "/research#oil-trade",
    highlight: true,
  },
  {
    id: "egypt-imf",
    tag: "Sovereign Credit",
    title: "Egypt's IMF Tightrope",
    deck: "FX liberalisation, external debt dynamics, and what the spread compression tells us about reform credibility.",
    date: "Coming soon",
    readTime: "—",
    href: "/research#sovereign",
    highlight: false,
  },
  {
    id: "em-fx",
    tag: "EM Macro",
    title: "Dollar Dominance and EM Debt Dynamics",
    deck: "How USD strength transmits into sovereign credit quality and why carry trades create fragility.",
    date: "Coming soon",
    readTime: "—",
    href: "/research",
    highlight: false,
  },
];

/* ── GLOBE CANVAS ────────────────────────────────────────────── */
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
      R = Math.min(W, H) * 0.38;
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

    let rotY = 0.3;
    let rotX = 0.15;

    /* lat/lng → 3D xyz on unit sphere */
    const toXYZ = (lat: number, lng: number) => {
      const phi   = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180)  * Math.PI / 180;
      return {
        x: -Math.sin(phi) * Math.cos(theta),
        y:  Math.cos(phi),
        z:  Math.sin(phi) * Math.sin(theta),
      };
    };

    /* rotate point around Y then X */
    const rotate = (p: {x:number,y:number,z:number}, ry: number, rx: number) => {
      let {x,y,z} = p;
      // Y rotation
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      x = x1; z = z1;
      // X rotation
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const y1 = y * cosX - z * sinX;
      const z2 = y * sinX + z * cosX;
      return { x, y: y1, z: z2 };
    };

    /* generate grid dots */
    const gridDots: {lat:number,lng:number}[] = [];
    for (let lat = -80; lat <= 80; lat += 12) {
      for (let lng = -180; lng < 180; lng += 12) {
        gridDots.push({ lat, lng });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      /* subtle mouse influence */
      const targetY = rotY + mouseRef.current.x * 0.03;
      const targetX = rotX - mouseRef.current.y * 0.02;
      rotY += (targetY - rotY) * 0.02 + 0.003;
      rotX += (targetX - rotX) * 0.02;

      const cx = W / 2, cy = H / 2;

      /* outer glow */
      const grd = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.15);
      grd.addColorStop(0, "rgba(200,135,58,0.04)");
      grd.addColorStop(1, "rgba(200,135,58,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
      ctx.fill();

      /* rim */
      ctx.strokeStyle = "rgba(200,135,58,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      /* grid dots */
      gridDots.forEach(({ lat, lng }) => {
        const p3 = toXYZ(lat, lng);
        const r  = rotate(p3, rotY, rotX);
        if (r.z < 0) return; // back face
        const x  = cx + r.x * R;
        const y  = cy - r.y * R;
        const alpha = 0.08 + r.z * 0.15;
        ctx.fillStyle = `rgba(200,135,58,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      /* EM country dots */
      EM_COUNTRIES.forEach(country => {
        const p3 = toXYZ(country.lat, country.lng);
        const r  = rotate(p3, rotY, rotX);
        if (r.z < -0.1) return;
        const x  = cx + r.x * R;
        const y  = cy - r.y * R;
        const visible = r.z > 0;
        const size = visible ? 4 : 2;
        const alpha = visible ? 1 : 0.3;

        if (visible) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 12);
          glow.addColorStop(0, "rgba(200,135,58,0.3)");
          glow.addColorStop(1, "rgba(200,135,58,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fill();
        }

        const colour = country.stance === "bull" ? `rgba(45,106,79,${alpha})`
                     : country.stance === "bear" ? `rgba(139,46,46,${alpha})`
                     : `rgba(200,135,58,${alpha})`;
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }}
    />
  );
}

/* ── TILT CARD ───────────────────────────────────────────────── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) translateZ(8px)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transition: "transform 0.15s ease", transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {children}
    </div>
  );
}

/* ── COUNTER ─────────────────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = () => {
        start += Math.ceil((to - start) / 10) || 1;
        setVal(Math.min(start, to));
        if (start < to) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── PAGE ────────────────────────────────────────────────────── */
export default function HomePage() {
  const [hoveredCountry, setHoveredCountry] = useState<typeof EM_COUNTRIES[0] | null>(null);

  return (
    <div style={{ background: "#080808", color: "#e8e8e8", fontFamily: "'Inter', sans-serif", minHeight: "100vh", fontWeight: 300 }}>

      {/* ── NAV ────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(8,8,8,0.85)", backdropFilter: "blur(12px)",
        padding: "0 32px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em" }}>Suleiman Ashraf</span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, marginLeft: 4 }}>EM Credit & Macro</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#research" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Research</a>
            <a href="#coverage" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Coverage</a>
            <Link href="/research" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Portfolio</Link>
            <Link href="/about" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>About</Link>
            <Link href="/dashboard" style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              color: "#c8873a", border: "1px solid rgba(200,135,58,0.3)", padding: "6px 14px", textDecoration: "none",
            }}>ARI Platform ↗</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", paddingTop: 52, gap: 0 }}>

        {/* Left: text */}
        <div style={{ padding: "80px 64px 80px 48px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 28 }}>
            EM Credit & Macro Research · LSE MSc Finance
          </div>

          <h1 style={{ fontSize: "clamp(36px,4vw,58px)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.025em", marginBottom: 28 }}>
            Emerging Markets<br />
            <span style={{ color: "#c8873a" }}>Credit Research.</span>
          </h1>

          <p style={{
            fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.45)",
            maxWidth: 440, marginBottom: 40,
            borderLeft: "2px solid rgba(200,135,58,0.4)", paddingLeft: 18,
          }}>
            Tracking sovereign risk, external financing conditions, and commodity
            price transmission into EM fiscal dynamics — with first-hand market experience.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 40, marginBottom: 48 }}>
            {[
              { value: 8,   suffix: "",   label: "Sovereigns Tracked" },
              { value: 480, suffix: "bps", label: "Egypt EMBI Spread" },
              { value: 20,  suffix: "+",  label: "Months Live Trading" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#c8873a", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 5 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/research" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#c8873a", color: "#080808", padding: "12px 24px",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              textDecoration: "none",
            }}>
              View Research →
            </Link>
            <a href="#coverage" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)",
              padding: "12px 24px", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
              textTransform: "uppercase", textDecoration: "none",
            }}>
              Country Coverage
            </a>
          </div>
        </div>

        {/* Right: globe */}
        <div style={{ position: "relative", height: "100vh" }}>
          <Globe />
          {/* Legend */}
          <div style={{
            position: "absolute", bottom: 40, right: 32, display: "flex", gap: 16,
            fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em",
          }}>
            {[["#2d6a4f","Bullish"],["#c8873a","Neutral"],["#8b2e2e","Cautious"]].map(([c,l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c as string }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESEARCH ───────────────────────────────────────────── */}
      <section id="research" style={{ padding: "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 56 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8873a", marginBottom: 12 }}>
                Writing & Analysis
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Research & Trade Journals
              </h2>
            </div>
            <Link href="/research" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
              View all →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.06)" }}>
            {ARTICLES.map((art, i) => (
              <TiltCard key={art.id}>
                <Link href={art.href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <div style={{
                    background: "#080808", padding: i === 0 ? "40px 36px" : "28px 24px",
                    height: "100%", cursor: "pointer",
                    borderBottom: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    ...(i === 0 ? { minHeight: 340 } : {}),
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#c8873a", marginBottom: 16 }}>
                      {art.tag}
                    </div>
                    <h3 style={{
                      fontSize: i === 0 ? 22 : 15, fontWeight: 700, lineHeight: 1.25,
                      letterSpacing: "-0.01em", marginBottom: 14, color: "#e8e8e8",
                    }}>
                      {art.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65, marginBottom: 24 }}>
                      {art.deck}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{art.date}</span>
                      <span style={{ fontSize: 11, color: "#c8873a" }}>{art.readTime !== "—" ? `${art.readTime} read` : "Coming soon"}</span>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOVEREIGN COVERAGE ─────────────────────────────────── */}
      <section id="coverage" style={{ padding: "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8873a", marginBottom: 12 }}>
              Sovereign Coverage
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>EM Country Monitor</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.06)" }}>
            {EM_COUNTRIES.map(country => (
              <TiltCard key={country.name}>
                <div
                  style={{
                    background: hoveredCountry?.name === country.name ? "#0f0f0f" : "#080808",
                    padding: "24px 22px", cursor: "default",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 3 }}>{country.name}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>{country.rating}</div>
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      padding: "3px 7px", border: "1px solid",
                      color: country.stance === "bull" ? "#2d6a4f" : country.stance === "bear" ? "#8b2e2e" : "#c8873a",
                      borderColor: country.stance === "bull" ? "#2d6a4f" : country.stance === "bear" ? "#8b2e2e" : "rgba(200,135,58,0.4)",
                    }}>
                      {country.stance === "bull" ? "Bullish" : country.stance === "bear" ? "Cautious" : "Neutral"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                      EMBI Spread
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: "#c8873a", letterSpacing: "-0.02em", lineHeight: 1 }}>
                      {country.spread}
                      <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>bps</span>
                    </div>
                  </div>

                  {/* Spread bar */}
                  <div style={{ marginTop: 16, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
                    <div style={{
                      height: "100%", borderRadius: 1,
                      background: country.stance === "bull" ? "#2d6a4f" : country.stance === "bear" ? "#8b2e2e" : "#c8873a",
                      width: `${Math.min((country.spread / 1200) * 100, 100)}%`,
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>

          <div style={{ marginTop: 24, textAlign: "right", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            Spreads indicative · For research purposes only
          </div>
        </div>
      </section>

      {/* ── TRADE LOG ──────────────────────────────────────────── */}
      <section style={{ padding: "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8873a", marginBottom: 12 }}>Trade Log</div>
              <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>Live Position Journal</h2>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Instrument","Direction","Entry","Current","P&L","Status","Thesis"].map(h => (
                  <th key={h} style={{
                    padding: "10px 16px", textAlign: "left", fontWeight: 500,
                    fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.08)",
                    background: "#0d0d0d",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { inst: "3BRL (3x Brent Long)", dir: "LONG",  dc: "#2d6a4f", entry: "~$16.50", cur: "Exited Dec '25", pnl: "~Breakeven", plc: "rgba(255,255,255,0.3)", status: "Closed", thesis: "Conflict premium underpriced at $73 oil" },
                { inst: "SBRT (1x Brent Short)", dir: "SHORT", dc: "#8b2e2e", entry: "~$9.13",  cur: "$9.58",         pnl: "+4.71%",    plc: "#2d6a4f",                status: "Open",   thesis: "$100 structural ceiling · IEA 3.7m b/d surplus" },
              ].map((r,i) => (
                <tr key={i}>
                  {[
                    <td key="inst" style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontWeight: 500, color: "#e8e8e8" }}>{r.inst}</td>,
                    <td key="dir" style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontWeight: 700, color: r.dc }}>{r.dir}</td>,
                    <td key="entry" style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{r.entry}</td>,
                    <td key="cur" style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{r.cur}</td>,
                    <td key="pnl" style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontWeight: 600, color: r.plc }}>{r.pnl}</td>,
                    <td key="status" style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", background: r.status === "Open" ? "rgba(200,135,58,0.15)" : "rgba(255,255,255,0.05)", color: r.status === "Open" ? "#c8873a" : "rgba(255,255,255,0.3)" }}>{r.status}</span>
                    </td>,
                    <td key="thesis" style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{r.thesis}</td>,
                  ]}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── ABOUT STRIP ────────────────────────────────────────── */}
      <section style={{ padding: "80px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0a0a0a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8873a", marginBottom: 16 }}>About</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 20 }}>Suleiman Ashraf</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginBottom: 16 }}>
              MSc Finance, London School of Economics. Prior experience in UK public markets and governance research.
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginBottom: 32 }}>
              Primary research focus: EM sovereign credit — the intersection of sovereign risk, external financing conditions, and commodity price transmission into EM fiscal dynamics.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="https://www.linkedin.com/in/suleiman-ashraf/" target="_blank" rel="noopener" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.12)", padding: "8px 16px", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>LinkedIn ↗</a>
              <a href="mailto:suleimanashraf@outlook.com" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.12)", padding: "8px 16px", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Email</a>
              <Link href="/dashboard" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid rgba(200,135,58,0.3)", padding: "8px 16px", color: "#c8873a", textDecoration: "none" }}>ARI Platform ↗</Link>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,0.06)" }}>
            {[
              ["Focus",      "EM Sovereign Credit · Macro Strategy"],
              ["Education",  "MSc Finance · LSE"],
              ["Background", "UK Public Markets · Governance"],
              ["Trading",    "Oil · ETP Mechanics · Macro Positions"],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#0a0a0a", padding: "20px 18px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{ padding: "24px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          <span>Suleiman Ashraf · EM Credit Research · 2026</span>
          <span>Not investment advice. For research and informational purposes only.</span>
        </div>
      </footer>

    </div>
  );
}
