"use client";

import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const GREEN  = "#2d6a4f";
const RED    = "#8b2e2e";
const ACCENT = "#c8873a";
const RULE   = "#d8d4cc";

type Country = {
  name: string;
  iso: string;
  spread: number;
  rating: string;
  stance: string;
  lat: number;
  lng: number;
};

/* ISO numeric codes for highlighting — matches world-atlas dataset */
const ISO_NUMERIC: Record<string, string> = {
  EGY: "818",
  ARE: "784",
  NGA: "566",
  PAK: "586",
  KEN: "404",
  IRQ: "368",
  GHA: "288",
  AGO: "024",
};

export default function WorldMap({
  countries,
  onHover,
  onLeave,
}: {
  countries: Country[];
  onHover: (c: Country, x: number, y: number) => void;
  onLeave: () => void;
}) {
  const coveredNums = new Set(countries.map(c => ISO_NUMERIC[c.iso]));
  const byIso = Object.fromEntries(countries.map(c => [c.iso, c]));
  const byNum = Object.fromEntries(countries.map(c => [ISO_NUMERIC[c.iso], c]));

  const stanceColor = (stance: string) =>
    stance === "bull" ? GREEN : stance === "bear" ? RED : ACCENT;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [30, 15], scale: 220 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const num     = geo.id as string;
                const covered = coveredNums.has(num);
                const country = byNum[num];

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e: React.MouseEvent) => {
                      if (country) onHover(country, e.clientX, e.clientY);
                    }}
                    onMouseLeave={onLeave}
                    style={{
                      default: {
                        fill:   covered ? stanceColor(country!.stance) + "33" : "#e8e4dc",
                        stroke: covered ? stanceColor(country!.stance) : RULE,
                        strokeWidth: covered ? 1.2 : 0.5,
                        outline: "none",
                        transition: "fill 0.2s",
                      },
                      hover: {
                        fill:   covered ? stanceColor(country!.stance) + "66" : "#ddd7cc",
                        stroke: covered ? stanceColor(country!.stance) : "#bbb5aa",
                        strokeWidth: covered ? 1.5 : 0.5,
                        outline: "none",
                        cursor:  covered ? "pointer" : "default",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Dot + label markers for covered countries */}
          {countries.map(c => (
            <Marker
              key={c.iso}
              coordinates={[c.lng, c.lat]}
              onMouseEnter={(e: React.MouseEvent) => onHover(c, e.clientX, e.clientY)}
              onMouseLeave={onLeave}
            >
              {/* Pulse ring */}
              <circle r={10} fill={stanceColor(c.stance) + "22"} style={{ pointerEvents: "none" }} />
              {/* Dot */}
              <circle
                r={5}
                fill={stanceColor(c.stance)}
                stroke="white"
                strokeWidth={1.5}
                style={{ cursor: "pointer" }}
              />
              {/* Country label */}
              <text
                textAnchor="middle"
                y={-12}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 9,
                  fontWeight: 600,
                  fill: "#0f0f0f",
                  letterSpacing: "0.04em",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {c.name}
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
