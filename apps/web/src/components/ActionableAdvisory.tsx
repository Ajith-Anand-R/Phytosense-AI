// apps/web/src/components/ActionableAdvisory.tsx
"use client";

import React from "react";
import { HydraulicState } from "@/types";
import { translations, Language } from "@/lib/translations";
import { simulationStore } from "@/lib/simulationStore";
import { AlertCircle, CheckCircle2, Droplet, Wrench, ShieldAlert, Clock, ArrowRight } from "lucide-react";

interface ActionableAdvisoryProps {
  state: HydraulicState;
  language: Language;
}

export const ActionableAdvisory: React.FC<ActionableAdvisoryProps> = ({ state, language }) => {
  const t = translations[language];
  const rec = state.recommendation;
  const isHigh = rec.urgency === "HIGH" || rec.urgency === "CRITICAL";

  return (
    <div
      className={`glass-panel rounded-2xl p-6 border transition-all ${
        isHigh
          ? "border-orange-500/50 bg-gradient-to-br from-orange-950/20 via-slate-900/60 to-slate-950"
          : "border-slate-800"
      }`}
    >
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isHigh ? (
            <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0 animate-bounce" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <h3 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
            {t.recommendedActionTitle}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              isHigh
                ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {isHigh ? t.urgencyHigh : t.urgencyLow}
          </span>
        </div>
      </div>

      {/* Main Advisory Text in Selected Language */}
      <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 mb-4">
        <p className="text-sm font-medium text-slate-200 leading-relaxed">
          {language === "kn" ? rec.kannadaAction : rec.action}
        </p>

        {/* Explainability Sub-reasoning */}
        <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/60 flex items-start gap-1.5 leading-normal">
          <span className="font-semibold text-slate-300">Physiological Rationale:</span>
          <span>{state.explanation}</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span>Calculated: {new Date(state.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => simulationStore.triggerIrrigation()}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer shadow-md shadow-emerald-950/50"
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>{t.triggerIrrigation}</span>
          </button>

          <button
            onClick={() => alert("Maintenance notification dispatched to local field manager via SMS.")}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-300" />
            <span>{t.dripLineCheck}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
