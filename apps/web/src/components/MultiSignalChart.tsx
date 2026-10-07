// apps/web/src/components/MultiSignalChart.tsx
"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
  Legend
} from "recharts";
import { TimeSeriesPoint } from "@/lib/simulationStore";
import { translations, Language } from "@/lib/translations";
import { Clock, TrendingUp, Layers } from "lucide-react";

interface MultiSignalChartProps {
  data: TimeSeriesPoint[];
  language: Language;
}

export const MultiSignalChart: React.FC<MultiSignalChartProps> = ({ data, language }) => {
  const t = translations[language];
  const [selectedRange, setSelectedRange] = useState<"6h" | "24h" | "7d" | "30d">("24h");
  const [selectedTrack, setSelectedTrack] = useState<"all" | "hsi" | "impedance" | "acoustic" | "context">("all");

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs font-mono">
          <p className="text-slate-400 font-bold mb-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Time: {label}</span>
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}:</span>
                </span>
                <span className="font-bold text-slate-100">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Header with Title and Range Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
              SYNCHRONIZED MULTI-SIGNAL TIME-SERIES
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              24-Hour Continuous
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
            Internal Plant Dynamics vs. Soil & Atmosphere
          </h2>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Track Filter */}
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            {(["all", "hsi", "impedance", "acoustic", "context"] as const).map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                  selectedTrack === track
                    ? "bg-slate-800 text-emerald-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {track}
              </button>
            ))}
          </div>

          {/* Time Horizon Filter */}
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            {(["6h", "24h", "7d", "30d"] as const).map((rng) => (
              <button
                key={rng}
                onClick={() => setSelectedRange(rng)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedRange === rng
                    ? "bg-emerald-600 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {rng}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TRACK 1: Hydraulic State Index (0-100) */}
      {(selectedTrack === "all" || selectedTrack === "hsi") && (
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Hydraulic State Index (HSI 0–100) & Stress Thresholds
            </span>
            <span className="text-slate-400">Normal Range: 0–20</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="2 2" label={{ value: "Healthy", fill: "#22c55e", fontSize: 10 }} />
                <ReferenceLine y={40} stroke="#eab308" strokeDasharray="2 2" label={{ value: "Mild", fill: "#eab308", fontSize: 10 }} />
                <ReferenceLine y={60} stroke="#f97316" strokeDasharray="2 2" label={{ value: "Moderate", fill: "#f97316", fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="2 2" label={{ value: "Critical", fill: "#ef4444", fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="hsi"
                  name="HSI"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#34d399" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TRACK 2: Electrical Impedance (Cole Parameters R0 & Rinf) */}
      {(selectedTrack === "all" || selectedTrack === "impedance") && (
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Sapwood Cole Resistances: R0 (Extracellular) vs. R&infin; (Total Fluid) [&Omega;]
            </span>
            <span className="text-slate-400">Temp Normalized to 25&deg;C</span>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                <Line
                  type="monotone"
                  dataKey="r0Ohms"
                  name="R0 (Extracellular)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="rinfOhms"
                  name="R_inf (High Freq)"
                  stroke="#6366f1"
                  strokeWidth={1.8}
                  strokeDasharray="4 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TRACK 3: Acoustic Emission (Cavitation Hits / Hour) */}
      {(selectedTrack === "all" || selectedTrack === "acoustic") && (
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              Ultrasonic Acoustic Emission (100–400 kHz Cavitation Hits / Hour)
            </span>
            <span className="text-slate-400">Threshold: &gt;15 hits = Tension Alert</span>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={15} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Warning Threshold", fill: "#f59e0b", fontSize: 10 }} />
                <Bar dataKey="aeHits" name="Cavitation Hits/hr" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TRACK 4: Environmental Driving Force (Soil Moisture % vs. VPD kPa) */}
      {(selectedTrack === "all" || selectedTrack === "context") && (
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              Environmental Boundary: Soil Moisture at 30 cm [%] vs. Atmospheric VPD [kPa]
            </span>
            <span className="text-slate-400">Notice: HSI rises while soil remains moist</span>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#3b82f6" tick={{ fontSize: 10 }} unit="%" />
                <YAxis yAxisId="right" orientation="right" stroke="#f97316" tick={{ fontSize: 10 }} unit=" kPa" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="soilMoisturePct"
                  name="Soil Moisture (30 cm)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="vpdKpa"
                  name="Vapor Pressure Deficit (VPD)"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
