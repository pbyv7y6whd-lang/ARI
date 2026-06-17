"use client";

import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

// ── Country coordinate lookup ─────────────────────────────────────────────────
const COUNTRY_COORDS: Record<string, [number, number]> = {
  // MENA
  egypt:        [26.82,  30.80],
  jordan:       [30.59,  36.24],
  morocco:      [31.79,  -7.09],
  tunisia:      [33.89,   9.54],
  "saudi arabia":[23.89, 45.08],
  uae:          [23.42,  53.85],
  qatar:        [25.35,  51.18],
  bahrain:      [26.07,  50.55],
  oman:         [21.51,  55.92],
  kuwait:       [29.31,  47.48],
  iraq:         [33.22,  43.68],
  lebanon:      [33.85,  35.86],
  // Sub-Saharan Africa
  nigeria:      [ 9.08,   8.68],
  kenya:        [ 0.02,  37.91],
  ghana:        [ 7.95,  -1.02],
  "ivory coast":[ 7.54,  -5.55],
  "cote d'ivoire":[ 7.54, -5.55],
  senegal:      [14.50, -14.45],
  zambia:       [-13.13, 27.85],
  ethiopia:     [ 9.15,  40.49],
  angola:       [-11.20, 17.87],
  mozambique:   [-18.67, 35.53],
  cameroon:     [ 3.85,  11.50],
  tanzania:     [ -6.37, 34.89],
  rwanda:       [ -1.94, 29.87],
  "south africa":[-30.56, 22.94],
  // Eastern Europe / CIS
  ukraine:      [48.38,  31.17],
  romania:      [45.94,  24.97],
  hungary:      [47.16,  19.50],
  poland:       [51.92,  19.14],
  serbia:       [44.02,  21.01],
  croatia:      [45.10,  15.20],
  bulgaria:     [42.73,  25.48],
  georgia:      [42.32,  43.36],
  armenia:      [40.07,  45.04],
  azerbaijan:   [40.14,  47.58],
  kazakhstan:   [48.02,  66.92],
  uzbekistan:   [41.38,  64.59],
  // Asia
  pakistan:     [30.38,  69.35],
  bangladesh:   [23.68,  90.36],
  vietnam:      [14.06, 108.28],
  indonesia:    [-0.79, 113.92],
  mongolia:     [46.86, 103.85],
  "sri lanka":  [ 7.87,  80.77],
  // LatAm
  brazil:       [-14.24, -51.93],
  argentina:    [-38.42, -63.62],
  mexico:       [23.63, -102.55],
  colombia:     [ 4.57,  -74.30],
  peru:         [-9.19,  -75.02],
  chile:        [-35.68,  -71.54],
  ecuador:      [-1.83,  -78.18],
  panama:       [ 8.54,  -80.78],
  "costa rica": [ 9.75,  -83.75],
  uruguay:      [-32.52,  -55.77],
  paraguay:     [-23.44,  -58.44],
  "el salvador":[ 13.79,  -88.90],
  guatemala:    [15.78,  -90.23],
  honduras:     [15.20,  -86.24],
  nicaragua:    [12.87,  -85.21],
  bolivia:      [-16.29,  -63.59],
  venezuela:    [ 6.42,  -66.59],
  jamaica:      [18.11,  -77.30],
  "dominican republic": [18.74, -70.16],
  "trinidad and tobago": [10.69, -61.22],
  barbados:     [13.19,  -59.54],
  belize:       [17.19,  -88.50],
  guyana:       [ 4.86,  -58.93],
  suriname:     [ 3.92,  -56.03],
};

function getCoords(name: string): [number, number] | null {
  const key = name.toLowerCase().trim();
  if (COUNTRY_COORDS[key]) return COUNTRY_COORDS[key];
  // Partial match
  for (const [k, v] of Object.entries(COUNTRY_COORDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

// ── Types ──────────────────────────────────────────────────────────────────────
export type GlobeCountry = {
  id:   string;
  name: string;
  creditView?: "Positive" | "Neutral" | "Negative";
  recommendation?: "Overweight" | "Neutral" | "Underweight";
  score?: number;
  region?: string;
};

// ── Globe component ────────────────────────────────────────────────────────────
export default function SovereignGlobe({ countries }: { countries: GlobeCountry[] }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const phiRef     = useRef(0.4);
  const isDragging = useRef(false);
  const lastX      = useRef(0);
  const [hovered, setHovered] = useState<GlobeCountry | null>(null);

  const markers = countries
    .map(c => ({ country: c, coords: getCoords(c.name) }))
    .filter((m): m is { country: GlobeCountry; coords: [number, number] } => m.coords !== null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const size   = canvas.offsetWidth;

    let width  = size;
    let animId = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width:  width  * 2,
      height: width  * 2,
      phi:    phiRef.current,
      theta:  0.2,
      dark:   1,
      diffuse: 1.1,
      scale:  1,
      mapSamples:   20000,
      mapBrightness: 4.5,
      baseColor:    [0.08, 0.04, 0.16],   // very dark purple
      markerColor:  [0.36, 0.13, 0.71],   // #5b21b6 purple
      glowColor:    [0.22, 0.08, 0.42],   // purple glow
      markers: markers.map(m => ({
        location: m.coords,
        size: 0.055,
      })),
      onRender(state) {
        if (!isDragging.current) phiRef.current += 0.003;
        state.phi   = phiRef.current;
        state.width  = width  * 2;
        state.height = width  * 2;
      },
    });

    // Resize observer
    const ro = new ResizeObserver(entries => {
      width = entries[0].contentRect.width;
      canvas.width  = width  * 2;
      canvas.height = width  * 2;
    });
    ro.observe(canvas);

    return () => {
      globe.destroy();
      ro.disconnect();
      cancelAnimationFrame(animId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - lastX.current;
    phiRef.current -= delta * 0.005;
    lastX.current = e.clientX;
  };
  const handleMouseUp = () => { isDragging.current = false; };

  return (
    <div className="relative w-full aspect-square max-w-[340px] mx-auto select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ borderRadius: "50%" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Marker legend overlay — positioned around the globe */}
      {markers.length > 0 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+8px)] w-full">
          <div className="flex flex-wrap justify-center gap-2">
            {markers.map(({ country }) => (
              <div key={country.id}
                onMouseEnter={() => setHovered(country)}
                onMouseLeave={() => setHovered(null)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium cursor-default transition-colors"
                style={{
                  borderColor: country.creditView === "Positive" ? "rgba(34,197,94,0.3)"
                             : country.creditView === "Negative" ? "rgba(248,113,113,0.3)"
                             : "rgba(245,158,11,0.3)",
                  background:  country.creditView === "Positive" ? "rgba(34,197,94,0.08)"
                             : country.creditView === "Negative" ? "rgba(248,113,113,0.08)"
                             : "rgba(245,158,11,0.08)",
                  color:       country.creditView === "Positive" ? "#4ade80"
                             : country.creditView === "Negative" ? "#f87171"
                             : "#fbbf24",
                }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                  background: country.creditView === "Positive" ? "#4ade80"
                            : country.creditView === "Negative" ? "#f87171"
                            : "#fbbf24",
                }} />
                {country.name}
                {country.score !== undefined && (
                  <span className="opacity-60 font-mono">{country.score}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
