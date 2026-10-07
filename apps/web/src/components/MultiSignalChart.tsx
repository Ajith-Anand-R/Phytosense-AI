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

  const displayedData = React.useMemo(() => {
    if (selectedRange === "6h") {
      return data.slice(-6);
    }
    if (selectedRange === "24h") {
      return data;
    }
    if (selectedRange === "7d") {
      return [
        { time: "Day -6", hsi: 14.2, r0Ohms: 1320, rinfOhms: 530, aeHits: 1, dendrometerUm: 168.0, soilMoisturePct: 34.0, vpdKpa: 1.2, tempGapC: 0.1 },
        { time: "Day -5", hsi: 16.5, r0Ohms: 1345, rinfOhms: 535, aeHits: 2, dendrometerUm: 166.5, soilMoisturePct: 31.5, vpdKpa: 1.4, tempGapC: 0.2 },
        { time: "Day -4", hsi: 22.8, r0Ohms: 1390, rinfOhms: 545, aeHits: 3, dendrometerUm: 164.0, soilMoisturePct: 28.0, vpdKpa: 1.8, tempGapC: 0.4 },
        { time: "Day -3", hsi: 34.1, r0Ohms: 1490, rinfOhms: 570, aeHits: 6, dendrometerUm: 161.2, soilMoisturePct: 24.5, vpdKpa: 2.1, tempGapC: 0.7 },
        { time: "Day -2", hsi: 48.6, r0Ohms: 1620, rinfOhms: 600, aeHits: 11, dendrometerUm: 157.8, soilMoisturePct: 21.0, vpdKpa: 2.5, tempGapC: 1.1 },
        { time: "Yesterday", hsi: 58.2, r0Ohms: 1710, rinfOhms: 620, aeHits: 16, dendrometerUm: 154.5, soilMoisturePct: 18.2, vpdKpa: 2.8, tempGapC: 1.4 },
        { time: "Today", hsi: data.length > 0 ? data[data.length - 1].hsi : 64.2, r0Ohms: data.length > 0 ? data[data.length - 1].r0Ohms : 1750, rinfOhms: data.length > 0 ? data[data.length - 1].rinfOhms : 630, aeHits: data.length > 0 ? data[data.length - 1].aeHits : 18, dendrometerUm: data.length > 0 ? data[data.length - 1].dendrometerUm : 153.0, soilMoisturePct: data.length > 0 ? data[data.length - 1].soilMoisturePct : 16.5, vpdKpa: data.length > 0 ? data[data.length - 1].vpdKpa : 3.1, tempGapC: 1.6 },
      ];
    }
    return [
      { time: "Week 1", hsi: 12.0, r0Ohms: 1300, rinfOhms: 520, aeHits: 1, dendrometerUm: 170.0, soilMoisturePct: 35.0, vpdKpa: 1.1, tempGapC: 0.0 },
      { time: "Week 2", hsi: 21.5, r0Ohms: 1380, rinfOhms: 540, aeHits: 3, dendrometerUm: 165.0, soilMoisturePct: 29.0, vpdKpa: 1.6, tempGapC: 0.3 },
      { time: "Week 3", hsi: 42.0, r0Ohms: 1560, rinfOhms: 580, aeHits: 8, dendrometerUm: 159.0, soilMoisturePct: 22.0, vpdKpa: 2.3, tempGapC: 0.9 },
      { time: "Week 4", hsi: data.length > 0 ? data[data.length - 1].hsi : 62.0, r0Ohms: data.length > 0 ? data[data.length - 1].r0Ohms : 1720, rinfOhms: data.length > 0 ? data[data.length - 1].rinfOhms : 625, aeHits: data.length > 0 ? data[data.length - 1].aeHits : 16, dendrometerUm: 154.0, soilMoisturePct: 17.0, vpdKpa: 2.9, tempGapC: 1.5 },
    ];
  }, [data, selectedRange]);

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
              {selectedRange === "6h" ? "6 Hours Zoom" : selectedRange === "24h" ? "24-Hour Continuous" : selectedRange === "7d" ? "7-Day Diurnal Cycle" : "30-Day Historical Trend"}
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
              <LineChart data={displayedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
              <LineChart data={displayedData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
              <BarChart data={displayedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
              <LineChart data={displayedData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
