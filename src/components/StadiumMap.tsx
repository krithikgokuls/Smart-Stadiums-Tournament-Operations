import React from "react";
import { StadiumZone, Incident } from "../types";
import { ShieldAlert, Accessibility, HeartHandshake, Eye, Landmark, ShoppingBag } from "lucide-react";

interface StadiumMapProps {
  zones: StadiumZone[];
  activeIncidents: Incident[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

export const StadiumMap: React.FC<StadiumMapProps> = ({
  zones,
  activeIncidents,
  selectedZoneId,
  onSelectZone,
}) => {
  // Helper to map zone crowd density status to colors
  const getStatusColor = (status: StadiumZone["densityStatus"]) => {
    switch (status) {
      case "Optimal":
        return {
          fill: "rgba(16, 185, 129, 0.15)",
          stroke: "#10b981",
          hover: "hover:fill-emerald-500/30",
          text: "text-emerald-400",
        };
      case "Moderate":
        return {
          fill: "rgba(245, 158, 11, 0.15)",
          stroke: "#f59e0b",
          hover: "hover:fill-amber-500/30",
          text: "text-amber-400",
        };
      case "Congested":
        return {
          fill: "rgba(239, 68, 68, 0.15)",
          stroke: "#ef4444",
          hover: "hover:fill-rose-500/30",
          text: "text-rose-400",
        };
      default:
        return {
          fill: "rgba(107, 114, 128, 0.15)",
          stroke: "#6b7280",
          hover: "hover:fill-gray-500/30",
          text: "text-gray-400",
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full" id="stadium-map-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Landmark className="h-5 w-5 text-blue-400" />
            Live Arena Digital Twin
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click on stadium zones to inspect real-time densities, gates, and concessions.
          </p>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 block"></span>
            <span className="text-slate-300">Optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 block"></span>
            <span className="text-slate-300">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 block relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            </span>
            <span className="text-slate-300">Congested</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="flex-1 flex items-center justify-center min-h-[300px] relative">
        <svg
          viewBox="0 0 400 400"
          className="w-full max-w-[340px] h-auto drop-shadow-[0_0_15px_rgba(30,41,59,0.5)]"
        >
          {/* Inner Pitch/Field */}
          <rect
            x="150"
            y="130"
            width="100"
            height="140"
            rx="6"
            fill="#065f46"
            stroke="#10b981"
            strokeWidth="2"
            opacity="0.85"
          />
          {/* Pitch lines */}
          <circle cx="200" cy="200" r="25" fill="none" stroke="#10b981" strokeWidth="1.5" />
          <line x1="150" y1="200" x2="250" y2="200" stroke="#10b981" strokeWidth="1.5" />

          {/* ZONE A: North Arc (Top) */}
          {(() => {
            const z = zones.find((item) => item.id === "zone-a")!;
            const style = getStatusColor(z.densityStatus);
            const isSelected = selectedZoneId === "zone-a";
            return (
              <path
                d="M 90 140 A 140 140 0 0 1 310 140 L 260 170 A 80 80 0 0 0 140 170 Z"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={isSelected ? "3" : "1.5"}
                className={`transition-all duration-300 cursor-pointer ${style.hover}`}
                onClick={() => onSelectZone("zone-a")}
              />
            );
          })()}

          {/* ZONE B: East Arc (Right) */}
          {(() => {
            const z = zones.find((item) => item.id === "zone-b")!;
            const style = getStatusColor(z.densityStatus);
            const isSelected = selectedZoneId === "zone-b";
            return (
              <path
                d="M 310 140 A 140 140 0 0 1 310 260 L 260 230 A 80 80 0 0 0 260 170 Z"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={isSelected ? "3" : "1.5"}
                className={`transition-all duration-300 cursor-pointer ${style.hover}`}
                onClick={() => onSelectZone("zone-b")}
              />
            );
          })()}

          {/* ZONE C: South Arc (Bottom) */}
          {(() => {
            const z = zones.find((item) => item.id === "zone-c")!;
            const style = getStatusColor(z.densityStatus);
            const isSelected = selectedZoneId === "zone-c";
            return (
              <path
                d="M 310 260 A 140 140 0 0 1 90 260 L 140 230 A 80 80 0 0 0 260 230 Z"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={isSelected ? "3" : "1.5"}
                className={`transition-all duration-300 cursor-pointer ${style.hover}`}
                onClick={() => onSelectZone("zone-c")}
              />
            );
          })()}

          {/* ZONE D: West Arc (Left) */}
          {(() => {
            const z = zones.find((item) => item.id === "zone-d")!;
            const style = getStatusColor(z.densityStatus);
            const isSelected = selectedZoneId === "zone-d";
            return (
              <path
                d="M 90 260 A 140 140 0 0 1 90 140 L 140 170 A 80 80 0 0 0 140 230 Z"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={isSelected ? "3" : "1.5"}
                className={`transition-all duration-300 cursor-pointer ${style.hover}`}
                onClick={() => onSelectZone("zone-d")}
              />
            );
          })()}

          {/* Text Labels */}
          <text x="200" y="80" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
            ZONE A (North)
          </text>
          <text x="350" y="205" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
            ZONE B (East)
          </text>
          <text x="200" y="330" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
            ZONE C (South)
          </text>
          <text x="50" y="205" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
            ZONE D (West)
          </text>

          {/* Incident Pins */}
          {activeIncidents.map((inc) => {
            let cx = 200;
            let cy = 200;
            // Place indicators on appropriate zone sectors
            if (inc.zone.includes("Zone A")) {
              cx = 200;
              cy = 105;
            } else if (inc.zone.includes("Zone B")) {
              cx = 295;
              cy = 200;
            } else if (inc.zone.includes("Zone C")) {
              cx = 200;
              cy = 295;
            } else if (inc.zone.includes("Zone D")) {
              cx = 105;
              cy = 200;
            }

            const isCritical = inc.severity === "high" || inc.severity === "critical";
            const color = isCritical ? "#ef4444" : "#f59e0b";

            return (
              <g key={inc.id} className="cursor-pointer">
                <circle cx={cx} cy={cy} r="10" fill={color} opacity="0.3" className="animate-ping" />
                <circle cx={cx} cy={cy} r="6" fill={color} stroke="#1e293b" strokeWidth="1" />
                <path
                  d={`M ${cx - 3} ${cy - 3} L ${cx + 3} ${cy + 3} M ${cx + 3} ${cy - 3} L ${cx - 3} ${cy + 3}`}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              </g>
            );
          })}
        </svg>

        {/* Dynamic Map Tip overlay */}
        <div className="absolute bottom-1 right-1 bg-slate-950/80 border border-slate-800 backdrop-blur-md rounded-md py-1 px-2.5 text-[10px] text-slate-400">
          Pulse rings denote active incidents
        </div>
      </div>

      {/* Selected Zone Specs */}
      {selectedZoneId && (
        <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 text-sm transition-all duration-300">
          {(() => {
            const zone = zones.find((z) => z.id === selectedZoneId);
            if (!zone) return null;
            const style = getStatusColor(zone.densityStatus);
            const activeCount = activeIncidents.filter((inc) =>
              inc.zone.toLowerCase().includes(zone.name.split(" - ")[0].toLowerCase())
            ).length;

            return (
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                  <h4 className="font-semibold text-white">{zone.name}</h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${style.fill} ${style.text}`}
                    style={{ borderColor: style.stroke }}
                  >
                    Density: {zone.densityStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Occupancy</span>
                    <span className="font-medium text-slate-200">
                      {zone.currentCrowdCount.toLocaleString()} / {zone.capacity.toLocaleString()}{" "}
                      <span className="text-[10px] text-slate-500">
                        ({Math.round((zone.currentCrowdCount / zone.capacity) * 100)}%)
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Active Safety Tickets</span>
                    <span className={`font-semibold ${activeCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                      {activeCount} incident{activeCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block mt-1">Concessions In Zone</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {zone.features.concessions.map((food, i) => (
                        <span
                          key={i}
                          className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] flex items-center gap-1"
                        >
                          <ShoppingBag className="h-3 w-3 text-slate-500" />
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-3 pt-3 border-t border-slate-900 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Accessibility
                      className={`h-4 w-4 ${
                        zone.features.wheelchairAccess ? "text-sky-400" : "text-slate-600"
                      }`}
                    />
                    {zone.features.wheelchairAccess ? "Wheelchair Ramps" : "Limited Wheelchair Ramps"}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <HeartHandshake
                      className={`h-4 w-4 ${zone.features.firstAid ? "text-rose-400" : "text-slate-600"}`}
                    />
                    {zone.features.firstAid ? "First Aid Station" : "First Aid in adjacent Zone"}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
