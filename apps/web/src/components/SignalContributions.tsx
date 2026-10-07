// apps/web/src/components/SignalContributions.tsx
"use client";

import React from "react";
import { SignalContribution, HydraulicState } from "@/types";
import { translations, Language } from "@/lib/translations";
import { Activity, Radio, Volume2, Maximize2, Thermometer, Droplets } from "lucide-react";

interface SignalContributionsProps {
  state: HydraulicState;
  language: Language;
}

export const SignalContributions: React.FC<SignalContributionsProps> = ({ state, language }) => {
  const t = translations[language];

  const getSignalIcon = (key: string) => {
    switch (key) {
      case "electrical":
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case "transfer":
        return <Radio className="w-4 h-4 text-cyan-400" />;
      case "acoustic":
        return <Volume2 className="w-4 h-4 text-indigo-400" />;
      case "dendrometer":
        return <Maximize2 className="w-4 h-4 text-yellow-400" />;
      case "thermal":
        return <Thermometer className="w-4 h-4 text-rose-400" />;
      case "context":
      default:
        return <Droplets className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusBadge = (status: "NORMAL" | "ELEVATED" | "ANOMALOUS") => {
    if (status === "ANOMALOUS") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
          ANOMALY
        </span>
      );
    }
    if (status === "ELEVATED") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          ELEVATED
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        NOMINAL
      </span>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
      {/* Header */}
      <div className="mb-4">
        <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
          {t.contributionsTitle}
        </span>
        <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
          {t.contributionsSubtitle}
        </h2>
      </div>

      {/* Signal Contributions List */}
      <div className="space-y-3">
        {state.contributions.map((item) => {
          const maxPoints = item.weight * 100;
          const pct = Math.min(100, Math.max(5, (item.contributionPoints / maxPoints) * 100));

          return (
            <div
              key={item.signalKey}
              className="bg-slate-900/50 hover:bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  {getSignalIcon(item.signalKey)}
                  <span>{item.name}</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ({(item.weight * 100).toFixed(0)}% wt)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-300">
                    z = {item.zScore > 0 ? `+${item.zScore}` : item.zScore}&sigma;
                  </span>
                  <span className="font-mono font-bold text-xs text-slate-100">
                    +{item.contributionPoints.toFixed(1)} pts
                  </span>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.status === "ANOMALOUS"
                      ? "bg-rose-500"
                      : item.status === "ELEVATED"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Aggregated Summary */}
      <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Total Fused Stress Contribution:</span>
        <span className="text-base font-bold text-emerald-400">
          {state.hydraulicStateIndex.toFixed(1)} / 100 HSI
        </span>
      </div>
    </div>
  );
};
