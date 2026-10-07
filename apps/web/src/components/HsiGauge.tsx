// apps/web/src/components/HsiGauge.tsx
"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, ArrowRight, ShieldCheck, AlertCircle, HelpCircle } from "lucide-react";
import { HydraulicState, RiskLevel } from "@/types";
import { translations, Language } from "@/lib/translations";

interface HsiGaugeProps {
  state: HydraulicState;
  language: Language;
}

export const HsiGauge: React.FC<HsiGaugeProps> = ({ state, language }) => {
  const t = translations[language];
  const hsi = state.hydraulicStateIndex;
  const isHealthy = state.riskLevel === "HEALTHY";
  const isMild = state.riskLevel === "MILD";
  const isModerate = state.riskLevel === "MODERATE";
  const isHigh = state.riskLevel === "HIGH";
  const isCritical = state.riskLevel === "CRITICAL";

  // Angle calculations for 180-degree semi-circle gauge (-90 to +90 deg)
  const angle = -90 + (hsi / 100) * 180;

  // Arc stroke color and glow styling
  const getColor = () => {
    if (hsi <= 20) return { stroke: "#22c55e", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", label: t.healthy };
    if (hsi <= 40) return { stroke: "#eab308", text: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", label: t.mild };
    if (hsi <= 60) return { stroke: "#f97316", text: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", label: t.moderate };
    if (hsi <= 80) return { stroke: "#f43f5e", text: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", label: t.high };
    return { stroke: "#ef4444", text: "text-red-500", bg: "bg-red-500/20 border-red-500/40", label: t.critical };
  };

  const colorMeta = getColor();

  const getTrendIcon = () => {
    if (state.trend === "DETERIORATING") {
      return (
        <span className="flex items-center gap-1 text-rose-400 font-medium">
          <ArrowUpRight className="w-4 h-4" />
          <span>{t.trendDeteriorating}</span>
        </span>
      );
    }
    if (state.trend === "IMPROVING") {
      return (
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <ArrowDownRight className="w-4 h-4" />
          <span>{t.trendImproving}</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-slate-400 font-medium">
        <ArrowRight className="w-4 h-4" />
        <span>{t.trendStable}</span>
      </span>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 relative flex flex-col justify-between overflow-hidden">
      {/* Background radial gradient glow */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: colorMeta.stroke }}
      />

      {/* Header Title */}
      <div className="flex items-start justify-between relative z-10 mb-2">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
            {t.hsiTitle}
          </span>
          <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
            {state.plantId} &bull; Sentinel Block A
          </h2>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>{t.confidence}: {(state.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Radial Semi-Circle SVG Gauge */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg viewBox="0 0 200 120" className="w-56 sm:w-64 overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="25%" stopColor="#84cc16" />
              <stop offset="45%" stopColor="#eab308" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Track Arc (Radius: 80, Center: 100, 100) */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Calibrated Color Arc Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Subtle tick markers for 0, 20, 40, 60, 80, 100 */}
          {[0, 20, 40, 60, 80, 100].map((val) => {
            const tickAngle = -Math.PI + (val / 100) * Math.PI;
            const x1 = 100 + 68 * Math.cos(tickAngle);
            const y1 = 100 + 68 * Math.sin(tickAngle);
            const x2 = 100 + 72 * Math.cos(tickAngle);
            const y2 = 100 + 72 * Math.sin(tickAngle);
            return (
              <line
                key={val}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#64748b"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Indicator Needle */}
          <g
            transform={`rotate(${angle}, 100, 100)`}
            className="transition-transform duration-700 ease-out"
            filter="url(#needleGlow)"
          >
            <polygon points="98,100 102,100 100,24" fill="#f8fafc" />
            <circle cx="100" cy="100" r="7" fill="#f8fafc" />
            <circle cx="100" cy="100" r="3" fill="#0f172a" />
          </g>
        </svg>

        {/* Center Digital Readout */}
        <div className="text-center -mt-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${colorMeta.text}`}>
              {hsi.toFixed(0)}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>

          <div className="mt-1 flex items-center justify-center">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border ${colorMeta.bg} ${colorMeta.text}`}
            >
              {colorMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Status Ribbon: Trend + Quality Indicator */}
      <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">{t.trend}:</span>
          {getTrendIcon()}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <span className={`w-2 h-2 rounded-full ${state.dataQuality.status === "GOOD" ? "bg-emerald-400" : state.dataQuality.status === "WARNING" ? "bg-amber-400" : "bg-red-400 animate-ping"}`} />
          <span>{state.dataQuality.status}</span>
        </div>
      </div>
    </div>
  );
};
