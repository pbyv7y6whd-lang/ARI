"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

// EM country coordinates [lat, lon]
const EM_COORDS: Record<string, [number, number]> = {
  "egypt":                [30.1, 31.2],
  "jordan":               [31.9, 35.9],
  "morocco":              [34.0, -6.8],
  "tunisia":              [36.8, 10.2],
  "saudi arabia":         [24.7, 46.7],
  "uae":                  [24.5, 54.4],
  "united arab emirates": [24.5, 54.4],
  "qatar":                [25.3, 51.5],
  "bahrain":              [26.2, 50.6],
  "oman":                 [23.6, 58.4],
  "kuwait":               [29.4, 47.5],
  "iraq":                 [33.3, 44.4],
  "lebanon":              [33.9, 35.5],
  "nigeria":              [9.1, 7.5],
  "kenya":                [-1.3, 36.8],
  "ghana":                [5.6, -0.2],
  "senegal":              [14.7, -17.4],
  "zambia":               [-15.4, 28.3],
  "ethiopia":             [9.0, 38.7],
  "south africa":         [-25.7, 28.2],
  "ukraine":              [50.4, 30.5],
  "romania":              [44.4, 26.1],
  "kazakhstan":           [51.2, 71.4],
  "turkey":               [39.9, 32.9],
  "turkiye":              [39.9, 32.9],
  "pakistan":             [33.7, 73.1],
  "india":                [28.6, 77.2],
  "brazil":               [-15.8, -47.9],
  "argentina":            [-34.6, -58.4],
  "mexico":               [19.4, -99.1],
  "colombia":             [4.7, -74.1],
  "peru":                 [-12.0, -77.0],
};

function getCoords(name: string): [number, number] | null {
  const key = name.toLowerCase().trim();
  if (EM_COORDS[key]) return EM_COORDS[key];
  for (const [k, v] of Object.entries(EM_COORDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

function creditColour(view?: string): [number, number, number] {
  if (view === "Positive") return [0.13, 0.77, 0.37];   // emerald
  if (view === "Negative") return [0.94, 0.27, 0.27];   // red
  return [0.96, 0.62, 0.04];                             // amber
}

export type GlobeCountry = {
  id: string;
  name: string;
  creditView?: "Positive" | "Neutral" | "Negative";
  recommendation?: "Overweight" | "Neutral" | "Underweight";
  score?: number;
  region?: string;
};

export default function SovereignGlobe({ countries }: { countries: GlobeCountry[] }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const phiRef     = useRef(0.5);
  const isDragging = useRef(false);
  const lastX      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const markers = countries
      .map(c => {
        const coords = getCoords(c.name);
        if (!coords) return null;
        return {
          location: coords as [number, number],
          size: 0.07,
          color: creditColour(c.creditView),
        };
      })
      .filter(Boolean) as { location: [number, number]; size: number; color: [number, number, number] }[];

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width:  340 * 2,
      height: 340 * 2,
      phi: phiRef.current,
      theta: 0.2,
      dark: 0,                            // 0 = light mode
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor:     [0.96, 0.96, 0.98], // near-white land
      markerColor:   [1, 1, 1],          // base white, per-marker color takes over
      glowColor:     [0.85, 0.82, 0.95], // soft lavender glow
      markers,
    });

    let animId: number;
    function animate() {
      if (!isDragging.current) phiRef.current += 0.003;
      globe.update({ phi: phiRef.current });
      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);

    const onDown = (e: MouseEvent) => { isDragging.current = true; lastX.current = e.clientX; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      phiRef.current += (e.clientX - lastX.current) * 0.005;
      lastX.current = e.clientX;
    };
    const onUp = () => { isDragging.current = false; };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      cancelAnimationFrame(animId);
      globe.destroy();
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [countries]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        style={{ width: 170, height: 170, cursor: "grab" }}
      />
      {/* Legend pills */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {countries.map(c => (
          <div key={c.id} className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium",
            c.creditView === "Positive" ? "border-emerald-400/40 bg-emerald-50 text-emerald-700"
            : c.creditView === "Negative" ? "border-red-400/40 bg-red-50 text-red-600"
            : "border-amber-400/40 bg-amber-50 text-amber-700"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
              c.creditView === "Positive" ? "bg-emerald-400"
              : c.creditView === "Negative" ? "bg-red-400"
              : "bg-amber-400"
            )} />
            {c.name}
            {c.score !== undefined && <span className="opacity-50 font-mono">{c.score}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
