"use client";

import React, { useState, memo, useCallback, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ACTIVITY_COLORS = {
  full:    "#111111", // High activity (Black)
  partial: "#555555", // Medium activity (Dark Grey)
  limited: "#aaaaaa", // Low activity (Light Grey)
  none:    "#f4f4f4", // No activity (Off-white)
};

const ACTIVITY_LABELS = {
  full:    "High Volume",
  partial: "Medium Volume",
  limited: "Low Volume",
  none:    "No Logins Yet",
};

interface CountryData {
  countryCode: string;
  connections: number;
  level: "full" | "partial" | "limited" | "none";
  lastActive: string;
}

interface CountryTooltip {
  name: string;
  level: "full" | "partial" | "limited" | "none";
  connections: number;
  lastActive?: string;
  x: number;
  y: number;
}

interface RealWorldMapProps {
  fullPage?: boolean;
}

export const RealWorldMap = memo(function RealWorldMap({
  fullPage = false,
}: RealWorldMapProps) {
  const [tooltip, setTooltip] = useState<CountryTooltip | null>(null);
  const [networkData, setNetworkData] = useState<Record<string, CountryData>>({});
  const [globalStats, setGlobalStats] = useState({ totalLogins: 0, activeRegions: 0 });

  // Fetch real login data from our global-logins API
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const res = await fetch("/api/network/global-logins", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.ok && data.countries) {
          const mapped: Record<string, CountryData> = {};
          // The TopoJSON file uses ISO 3166-1 alpha-3 OR numeric IDs.
          // To make it simple, we'll map by name or properties if needed, but the API 
          // provides ISO-2. We need a mapping or we can search by name.
          // For perfection, we'll match by properties.iso_a2
          data.countries.forEach((c: CountryData) => {
            mapped[c.countryCode] = c;
          });
          setNetworkData(mapped);
          setGlobalStats({
            totalLogins: data.totalLogins,
            activeRegions: data.activeRegions
          });
        }
      } catch (err) {
        console.error("Failed to fetch global network data", err);
      }
    };

    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 15_000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMouseEnter = useCallback(
    (geo: any, evt: React.MouseEvent) => {
      const iso2 = geo.properties?.iso_a2 || "XX";
      const name = geo.properties?.name || "Unknown Territory";
      const data = networkData[iso2] || { level: "none", connections: 0 };

      const rect = (evt.currentTarget as HTMLElement)
        .closest(".rsm-map-wrapper")
        ?.getBoundingClientRect();
      const x = rect ? evt.clientX - rect.left : evt.clientX;
      const y = rect ? evt.clientY - rect.top : evt.clientY;

      setTooltip({
        name,
        level: data.level,
        connections: data.connections,
        lastActive: data.lastActive,
        x,
        y,
      });
    },
    [networkData]
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  return (
    <div
      className={`relative bg-white overflow-hidden ${
        fullPage
          ? "w-full h-full"
          : "w-full rounded-xl border border-black/10 shadow-sm"
      }`}
      style={fullPage ? {} : { aspectRatio: "21/9" }}
    >
      {/* Map area */}
      <div className="rsm-map-wrapper w-full h-full relative">
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 150, center: [10, 10] }}
          style={{ width: "100%", height: "100%", background: "#ffffff" }}
        >
          <ZoomableGroup zoom={1}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const iso2 = geo.properties?.iso_a2 || "XX";
                  const data = networkData[iso2];
                  const fill = ACTIVITY_COLORS[data?.level || "none"];

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(evt) => handleMouseEnter(geo, evt as any)}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        default: {
                          fill,
                          stroke: "#ffffff",
                          strokeWidth: 0.6,
                          outline: "none",
                        },
                        hover: {
                          fill: data?.level ? fill : ACTIVITY_COLORS.none,
                          stroke: "#ffffff",
                          strokeWidth: 0.6,
                          outline: "none",
                          filter: "brightness(1.15)",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Dynamic Data Tooltip */}
        {tooltip && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: Math.min(tooltip.x + 12, (fullPage ? window.innerWidth : 1200) - 260),
              top: Math.max(tooltip.y - 10, 0),
            }}
          >
            <div className="bg-white border border-black/15 shadow-xl rounded-lg p-3 w-[240px]">
              {/* Country name */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-black text-black truncate pr-2">
                  {tooltip.name}
                </span>
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{
                    background: ACTIVITY_COLORS[tooltip.level],
                    color: tooltip.level === "full" || tooltip.level === "partial" ? "#fff" : "#555",
                  }}
                >
                  {ACTIVITY_LABELS[tooltip.level]}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-black/5">
                <div>
                  <span className="text-[9px] font-bold text-black/40 uppercase tracking-wider block mb-0.5">
                    Authentications
                  </span>
                  <span className="text-[14px] font-black text-black font-mono">
                    {tooltip.connections > 0 ? tooltip.connections.toLocaleString() : "0"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-black/40 uppercase tracking-wider block mb-0.5">
                    Status
                  </span>
                  <span className="text-[11px] font-black text-black/70">
                    {tooltip.connections > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      "Dormant"
                    )}
                  </span>
                </div>
              </div>

              {tooltip.connections === 0 && (
                <p className="text-[10px] font-medium text-black/40 mt-2">
                  No verified logins from this region yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-3 border border-black/10 rounded-lg shadow-sm">
          <span className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-2 block">
            Network Activity
          </span>
          <div className="flex flex-col gap-1.5">
            {(["full", "partial", "limited", "none"] as const).map((level) => (
              <div key={level} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ background: ACTIVITY_COLORS[level] }}
                />
                <span className="text-[10px] font-medium text-black/70">
                  {ACTIVITY_LABELS[level]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Live Stats top-left */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-white/95 backdrop-blur px-4 py-3 border border-black/10 rounded-lg shadow-sm text-center min-w-[120px]">
            <span className="text-[24px] font-black text-black leading-none block font-mono">
              {globalStats.totalLogins > 0 ? globalStats.totalLogins.toLocaleString() : "—"}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-black/40 mt-1 block">
              Total Authentications
            </span>
          </div>
          <div className="bg-white/95 backdrop-blur px-4 py-3 border border-black/10 rounded-lg shadow-sm text-center min-w-[120px]">
            <span className="text-[24px] font-black text-black leading-none block font-mono">
              {globalStats.activeRegions > 0 ? globalStats.activeRegions : "—"}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-black/40 mt-1 block">
              Active Regions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

