// apps/web/src/components/ForecastSection.tsx
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
  Legend,
  ReferenceLine
} from "recharts";
import { ForecastData } from "@/types";
import { translations, Language } from "@/lib/translations";
import { TrendingUp, Droplets, Moon, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ForecastSectionProps {
  data: ForecastData;
  language: Language;
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({ data, language }) => {
  const t = translations[language];
  const [selectedRegime, setSelectedRegime] = useState<"compare" | "doNothing" | "irrigateNow" | "irrigateTonight">("compare");

  // Format trajectory data for Recharts
  const chartData = [
    {
      horizon: "Now (0h)",
      doNothing: data.currentHsi,
      irrigateNow: data.currentHsi,
      irrigateTonight: data.currentHsi,
    },
    {
      horizon: "+6h",
      doNothing: data.scenarios.doNothing.points["6h"].likely,
      irrigateNow: data.scenarios.irrigateNow.points["6h"].likely,
      irrigateTonight: data.scenarios.irrigateTonight.points["6h"].likely,
    },
    {
      horizon: "+12h",
      doNothing: data.scenarios.doNothing.points["12h"].likely,
      irrigateNow: data.scenarios.irrigateNow.points["12h"].likely,
      irrigateTonight: data.scenarios.irrigateTonight.points["12h"].likely,
    },
    {
      horizon: "+24h",
      doNothing: data.scenarios.doNothing.points["24h"].likely,
      irrigateNow: data.scenarios.irrigateNow.points["24h"].likely,
      irrigateTonight: data.scenarios.irrigateTonight.points["24h"].likely,
    },
    {
      horizon: "+48h",
      doNothing: data.scenarios.doNothing.points["48h"].likely,
      irrigateNow: data.scenarios.irrigateNow.points["48h"].likely,
      irrigateTonight: data.scenarios.irrigateTonight.points["48h"].likely,
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
              COUNTERFACTUAL IRRIGATION SIMULATOR
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              6h &bull; 12h &bull; 24h &bull; 48h Projections
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
            Compare Irrigation Timings vs. Predicted Hydraulic Stress (HSI)
          </h2>
        </div>

        {/* Regime Filter */}
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono self-start sm:self-auto">
          {[
            { id: "compare", label: "Compare All 3" },
            { id: "doNothing", label: "Do Nothing" },
            { id: "irrigateNow", label: "Irrigate Now" },
            { id: "irrigateTonight", label: "Irrigate Tonight" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedRegime(item.id as any)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedRegime === item.id
                  ? "bg-slate-800 text-emerald-400 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="horizon" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="2 2" />
              <ReferenceLine y={60} stroke="#f97316" strokeDasharray="2 2" />

              {(selectedRegime === "compare" || selectedRegime === "doNothing") && (
                <Line
                  type="monotone"
                  dataKey="doNothing"
                  name="Regime A: Do Nothing (No Irrigation)"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                  dot={{ r: 4 }}
                />
              )}

              {(selectedRegime === "compare" || selectedRegime === "irrigateNow") && (
                <Line
                  type="monotone"
                  dataKey="irrigateNow"
                  name="Regime B: Irrigate Now (Immediate 40 L)"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              )}

              {(selectedRegime === "compare" || selectedRegime === "irrigateTonight") && (
                <Line
                  type="monotone"
                  dataKey="irrigateTonight"
                  name="Regime C: Irrigate Tonight (Optimal Refill)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Three Comparative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Do Nothing */}
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>REGIME A: DO NOTHING</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              {language === "kn"
                ? data.scenarios.doNothing.kannadaSummary
                : data.scenarios.doNothing.summary}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-red-500/20 text-xs font-mono flex justify-between items-center text-rose-300">
            <span>24h Predicted HSI:</span>
            <span className="font-bold text-sm">
              {data.scenarios.doNothing.points["24h"].likely.toFixed(0)} (High Stress)
            </span>
          </div>
        </div>

        {/* Card 2: Irrigate Now */}
        <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold mb-1">
              <Droplets className="w-4 h-4" />
              <span>REGIME B: IRRIGATE NOW</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              {language === "kn"
                ? data.scenarios.irrigateNow.kannadaSummary
                : data.scenarios.irrigateNow.summary}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-blue-500/20 text-xs font-mono flex justify-between items-center text-blue-300">
            <span>24h Predicted HSI:</span>
            <span className="font-bold text-sm">
              {data.scenarios.irrigateNow.points["24h"].likely.toFixed(0)} (Recovered)
            </span>
          </div>
        </div>

        {/* Card 3: Irrigate Tonight (Recommended) */}
        <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-xl p-4 flex flex-col justify-between relative shadow-lg shadow-emerald-950/30">
          <div className="absolute top-3 right-3 text-[10px] font-mono bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
            Recommended
          </div>
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold mb-1">
              <Moon className="w-4 h-4" />
              <span>REGIME C: IRRIGATE TONIGHT</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              {language === "kn"
                ? data.scenarios.irrigateTonight.kannadaSummary
                : data.scenarios.irrigateTonight.summary}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-500/30 text-xs font-mono flex justify-between items-center text-emerald-300">
            <span>24h Predicted HSI:</span>
            <span className="font-bold text-sm">
              {data.scenarios.irrigateTonight.points["24h"].likely.toFixed(0)} (Optimal)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
