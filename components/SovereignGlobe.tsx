"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { cn } from "@/lib/utils";

// Natural Earth topojson hosted by react-simple-maps
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ISO-3 numeric → country name lookup (for matching tracked countries)
// Maps lowercase country name → ISO-3 numeric code used in the topojson
const NAME_TO_ISO3: Record<string, string> = {
  // MENA
  "egypt":                  "818",
  "jordan":                 "400",
  "morocco":                "504",
  "tunisia":                "788",
  "saudi arabia":           "682",
  "uae":                    "784",
  "united arab emirates":   "784",
  "qatar":                  "634",
  "bahrain":                "048",
  "oman":                   "512",
  "kuwait":                 "414",
  "iraq":                   "368",
  "lebanon":                "422",
  "israel":                 "376",
  "iran":                   "364",
  // Sub-Saharan Africa
  "nigeria":                "566",
  "kenya":                  "404",
  "ghana":                  "288",
  "ivory coast":            "384",
  "cote d'ivoire":          "384",
  "senegal":                "686",
  "zambia":                 "894",
  "ethiopia":               "231",
  "angola":                 "024",
  "mozambique":             "508",
  "tanzania":               "834",
  "south africa":           "710",
  "cameroon":               "120",
  "rwanda":                 "646",
  "uganda":                 "800",
  "zimbabwe":               "716",
  "namibia":                "516",
  // Eastern Europe / CIS
  "ukraine":                "804",
  "romania":                "642",
  "hungary":                "348",
  "poland":                 "616",
  "serbia":                 "688",
  "croatia":                "191",
  "bulgaria":               "100",
  "georgia":                "268",
  "armenia":                "051",
  "azerbaijan":             "031",
  "kazakhstan":             "398",
  "uzbekistan":             "860",
  "turkey":                 "792",
  "turkiye":                "792",
  // Asia
  "pakistan":               "586",
  "bangladesh":             "050",
  "vietnam":                "704",
  "indonesia":              "360",
  "mongolia":               "496",
  "sri lanka":              "144",
  "india":                  "356",
  "china":                  "156",
  // LatAm
  "brazil":                 "076",
  "argentina":              "032",
  "mexico":                 "484",
  "colombia":               "170",
  "peru":                   "604",
  "chile":                  "152",
  "ecuador":                "218",
  "panama":                 "591",
  "costa rica":             "188",
  "uruguay":                "858",
  "venezuela":              "862",
  "dominican republic":     "214",
  "jamaica":                "388",
  "bolivia":                "068",
  "paraguay":               "600",
  "el salvador":            "222",
  "guatemala":              "320",
  "honduras":               "340",
};

// Country capitals / key city coordinates for markers
const COUNTRY_MARKER: Record<string, [number, number]> = {
  "818": [31.2, 30.1],   // Egypt - Cairo
  "400": [35.9, 31.9],   // Jordan - Amman
  "504": [-6.8, 34.0],   // Morocco - Rabat
  "788": [10.2, 36.8],   // Tunisia - Tunis
  "682": [46.7, 24.7],   // Saudi Arabia - Riyadh
  "784": [54.4, 24.5],   // UAE - Abu Dhabi
  "634": [51.5, 25.3],   // Qatar - Doha
  "048": [50.6, 26.2],   // Bahrain - Manama
  "512": [58.4, 23.6],   // Oman - Muscat
  "414": [47.5, 29.4],   // Kuwait - Kuwait City
  "368": [44.4, 33.3],   // Iraq - Baghdad
  "422": [35.5, 33.9],   // Lebanon - Beirut
  "566": [7.5, 9.1],     // Nigeria - Abuja
  "404": [36.8, -1.3],   // Kenya - Nairobi
  "288": [-0.2, 5.6],    // Ghana - Accra
  "384": [-5.3, 6.4],    // Ivory Coast - Abidjan
  "686": [-17.4, 14.7],  // Senegal - Dakar
  "894": [28.3, -15.4],  // Zambia - Lusaka
  "231": [38.7, 9.0],    // Ethiopia - Addis Ababa
  "710": [28.2, -25.7],  // South Africa - Pretoria
  "804": [30.5, 50.4],   // Ukraine - Kyiv
  "642": [26.1, 44.4],   // Romania - Bucharest
  "398": [71.4, 51.2],   // Kazakhstan - Astana
  "792": [32.9, 39.9],   // Turkey - Ankara
  "586": [73.1, 33.7],   // Pakistan - Islamabad
  "356": [77.2, 28.6],   // India - New Delhi
  "076": [-47.9, -15.8], // Brazil - Brasilia
  "032": [-58.4, -34.6], // Argentina - Buenos Aires
  "484": [-99.1, 19.4],  // Mexico - Mexico City
  "170": [-74.1, 4.7],   // Colombia - Bogota
  "604": [-77.0, -12.0], // Peru - Lima
};

function getIso3(name: string): string | null {
  const key = name.toLowerCase().trim();
  if (NAME_TO_ISO3[key]) return NAME_TO_ISO3[key];
  for (const [k, v] of Object.entries(NAME_TO_ISO3)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

function creditColour(view?: string) {
  if (view === "Positive") return "#22c55e";
  if (view === "Negative") return "#ef4444";
  return "#f59e0b";
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
  const [tooltip, setTooltip] = useState<{ name: string; view?: string; score?: number; x: number; y: number } | null>(null);

  // Build a lookup of ISO3 → country data for fast access
  const tracked = new Map<string, GlobeCountry>();
  for (const c of countries) {
    const iso = getIso3(c.name);
    if (iso) tracked.set(iso, c);
  }

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 147 }}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup center={[20, 10]} zoom={1} minZoom={1} maxZoom={6}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const iso = geo.id as string;
                const country = tracked.get(iso);
                const isTracked = !!country;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={e => {
                      if (!isTracked) return;
                      setTooltip({
                        name:  country!.name,
                        view:  country!.creditView,
                        score: country!.score,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: {
                        fill:   isTracked ? creditColour(country!.creditView) : "#1e293b",
                        stroke: "#0f172a",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill:   isTracked ? creditColour(country!.creditView) : "#334155",
                        stroke: "#0f172a",
                        strokeWidth: 0.5,
                        outline: "none",
                        filter: isTracked ? "brightness(1.2)" : "none",
                        cursor: isTracked ? "pointer" : "default",
                      },
                      pressed: {
                        fill:   isTracked ? creditColour(country!.creditView) : "#1e293b",
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Score markers on tracked countries */}
          {countries.map(c => {
            const iso = getIso3(c.name);
            if (!iso) return null;
            const coords = COUNTRY_MARKER[iso];
            if (!coords) return null;
            const colour = creditColour(c.creditView);
            return (
              <Marker key={c.id} coordinates={coords}>
                <circle r={5} fill={colour} stroke="#0f172a" strokeWidth={1.5} opacity={0.95} />
                {c.score !== undefined && (
                  <text
                    textAnchor="middle"
                    y={-9}
                    style={{ fontFamily: "ui-monospace,monospace", fontSize: "7px", fontWeight: 700, fill: colour }}
                  >
                    {c.score}
                  </text>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-sm border border-[#334155] bg-[#0f172a] px-3 py-2 shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="text-[12px] font-semibold text-white">{tooltip.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {tooltip.view && (
              <span className={cn("text-[10px] font-bold uppercase tracking-wider",
                tooltip.view === "Positive" ? "text-emerald-400"
                : tooltip.view === "Negative" ? "text-red-400"
                : "text-amber-400"
              )}>{tooltip.view}</span>
            )}
            {tooltip.score !== undefined && (
              <span className="text-[10px] font-mono text-slate-400">{tooltip.score}/100</span>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      {countries.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {countries.map(c => (
            <div key={c.id} className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium",
              c.creditView === "Positive" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : c.creditView === "Negative" ? "border-red-400/30 bg-red-400/10 text-red-400"
              : "border-amber-400/30 bg-amber-400/10 text-amber-400"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                c.creditView === "Positive" ? "bg-emerald-400"
                : c.creditView === "Negative" ? "bg-red-400"
                : "bg-amber-400"
              )} />
              {c.name}
              {c.score !== undefined && <span className="opacity-60 font-mono">{c.score}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
