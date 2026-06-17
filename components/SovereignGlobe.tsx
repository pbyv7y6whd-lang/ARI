"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

// ── Country coordinate lookup ─────────────────────────────────────────────────
const COUNTRY_COORDS: Record<string, [number, number]> = {
  // MENA
  egypt:              [26.82,  30.80],
  jordan:             [30.59,  36.24],
  morocco:            [31.79,  -7.09],
  tunisia:            [33.89,   9.54],
  "saudi arabia":     [23.89,  45.08],
  uae:                [23.42,  53.85],
  qatar:              [25.35,  51.18],
  bahrain:            [26.07,  50.55],
  oman:               [21.51,  55.92],
  kuwait:             [29.31,  47.48],
  iraq:               [33.22,  43.68],
  lebanon:            [33.85,  35.86],
  // Sub-Saharan Africa
  nigeria:            [ 9.08,   8.68],
  kenya:              [ 0.02,  37.91],
  ghana:              [ 7.95,  -1.02],
  "ivory coast":      [ 7.54,  -5.55],
  "cote d'ivoire":    [ 7.54,  -5.55],
  senegal:            [14.50, -14.45],
  zambia:             [-13.13, 27.85],
  ethiopia:           [ 9.15,  40.49],
  angola:             [-11.20, 17.87],
  mozambique:         [-18.67, 35.53],
  tanzania:           [ -6.37, 34.89],
  "south africa":     [-30.56, 22.94],
  cameroon:           [ 3.85,  11.50],
  rwanda:             [ -1.94, 29.87],
  // Eastern Europe / CIS
  ukraine:            [48.38,  31.17],
  romania:            [45.94,  24.97],
  hungary:            [47.16,  19.50],
  poland:             [51.92,  19.14],
  serbia:             [44.02,  21.01],
  croatia:            [45.10,  15.20],
  bulgaria:           [42.73,  25.48],
  georgia:            [42.32,  43.36],
  armenia:            [40.07,  45.04],
  azerbaijan:         [40.14,  47.58],
  kazakhstan:         [48.02,  66.92],
  uzbekistan:         [41.38,  64.59],
  // Asia
  pakistan:           [30.38,  69.35],
  bangladesh:         [23.68,  90.36],
  vietnam:            [14.06, 108.28],
  indonesia:          [-0.79, 113.92],
  mongolia:           [46.86, 103.85],
  "sri lanka":        [ 7.87,  80.77],
  india:              [20.59,  78.96],
  china:              [35.86, 104.20],
  // LatAm
  brazil:             [-14.24, -51.93],
  argentina:          [-38.42, -63.62],
  mexico:             [23.63, -102.55],
  colombia:           [ 4.57,  -74.30],
  peru:               [-9.19,  -75.02],
  chile:              [-35.68,  -71.54],
  ecuador:            [-1.83,  -78.18],
  panama:             [ 8.54,  -80.78],
  "costa rica":       [ 9.75,  -83.75],
  uruguay:            [-32.52,  -55.77],
  venezuela:          [ 6.42,  -66.59],
  "dominican republic":[18.74, -70.16],
  jamaica:            [18.11,  -77.30],
};

function getCoords(name: string): [number, number] | null {
  const key = name.toLowerCase().trim();
  if (COUNTRY_COORDS[key]) return COUNTRY_COORDS[key];
  for (const [k, v] of Object.entries(COUNTRY_COORDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

// Marker colours by credit view (RGB 0-1)
function markerRgb(view?: string): [number, number, number] {
  if (view === "Positive") return [0.27, 0.87, 0.47];  // emerald
  if (view === "Negative") return [0.96, 0.42, 0.42];  // red
  return [0.98, 0.75, 0.15];                            // amber
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type GlobeCountry = {
  id:   string;
  name: string;
  creditView?:     "Positive" | "Neutral" | "Negative";
  recommendation?: "Overweight" | "Neutral" | "Underweight";
  score?:  number;
  region?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function SovereignGlobe({ countries }: { countries: GlobeCountry[] }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const phiRef     = useRef(0.4);
  const isDragging = useRef(false);
  const lastX      = useRef(0);

  const markers = countries
    .map(c => ({ country: c, coords: getCoords(c.name) }))
    .filter((m): m is { country: GlobeCountry; coords: [number, number] } => m.coords !== null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    const size = canvas.offsetWidth || 340;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width:  size * 2,
      height: size * 2,
      phi:    phiRef.current,
      theta:  0.2,
      dark:   1,
      diffuse:       1.4,
      scale:         1,
      mapSamples:    20000,
      mapBrightness: 8,
      baseColor:   [0.05, 0.02, 0.12],   // near-black ocean
      markerColor: [1,    1,    1   ],    // white base so per-marker hues show true
      glowColor:   [0.36, 0.13, 0.71],   // purple glow around edge
      markers: markers.map(m => ({
        location: m.coords,
        size:  0.06,
        color: markerRgb(m.country.creditView),
      })),
    });

    function animate() {
      if (!isDragging.current) phiRef.current += 0.003;
      globe.update({ phi: phiRef.current });
      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);

    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      globe.update({ width: w * 2, height: w * 2 });
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      globe.destroy();
      ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers.length]);

  const onMouseDown = (e: React.MouseEvent) => { isDragging.current = true; lastX.current = e.clientX; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    phiRef.current -= (e.clientX - lastX.current) * 0.005;
    lastX.current = e.clientX;
  };
  const onMouseUp = () => { isDragging.current = false; };

  return (
    <div className="w-full" style={{ paddingBottom: markers.length > 0 ? "3.5rem" : 0 }}>
      <div className="relative w-full aspect-square max-w-[340px] mx-auto select-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ borderRadius: "50%" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>

      {/* Country pills beneath the globe */}
      {markers.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {markers.map(({ country }) => {
            const v = country.creditView;
            return (
              <div key={country.id}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium",
                  v === "Positive" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : v === "Negative" ? "border-red-400/30 bg-red-400/10 text-red-400"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-400"
                )}>
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                  v === "Positive" ? "bg-emerald-400"
                  : v === "Negative" ? "bg-red-400"
                  : "bg-amber-400"
                )} />
                {country.name}
                {country.score !== undefined && (
                  <span className="opacity-60 font-mono ml-0.5">{country.score}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
