// apps/web/src/components/ActionableAdvisory.tsx
"use client";

import React, { useState } from "react";
import { HydraulicState } from "@/types";
import { translations, Language } from "@/lib/translations";
import { simulationStore } from "@/lib/simulationStore";
import { AlertCircle, CheckCircle2, Droplet, Wrench, ShieldAlert, Clock, ArrowRight, Check, X, Send } from "lucide-react";

interface ActionableAdvisoryProps {
  state: HydraulicState;
  language: Language;
}

export const ActionableAdvisory: React.FC<ActionableAdvisoryProps> = ({ state, language }) => {
  const t = translations[language];
  const rec = state.recommendation;
  const isHigh = rec.urgency === "HIGH" || rec.urgency === "CRITICAL";

  const [selectedLiters, setSelectedLiters] = useState<number>(40);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  const handleIrrigate = () => {
    simulationStore.triggerIrrigation();
    showToast(
      language === "kn"
        ? `ಹನಿ ನೀರಾವರಿ (${selectedLiters}L) ಆರಂಭಗೊಂಡಿದೆ. ಮರದ ಚೇತರಿಕೆಯ ಗತಿ ದಾಖಲಾಗುತ್ತಿದೆ.`
        : `Drip irrigation (${selectedLiters} L) initiated. Post-watering recovery kinetics active.`
    );
  };

  const handleDispatchMaintenance = () => {
    showToast(
      language === "kn"
        ? "ಡ್ರಿಪ್ ಲೈನ್ ಪರಿಶೀಲನಾ ವಿನಂತಿಯನ್ನು ತೋಟದ ವ್ಯವಸ್ಥಾಪಕರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ (ಟಿಕೆಟ್ #4092)."
        : "Drip line inspection work-order dispatched to Field Manager: Ramesh K. (Ticket #4092)."
    );
  };

  return (
    <div
      className={`glass-panel rounded-2xl p-6 border transition-all relative flex flex-col justify-between ${
        isHigh
          ? "border-orange-500/50 bg-gradient-to-br from-orange-950/20 via-slate-900/60 to-slate-950"
          : "border-slate-800"
      }`}
    >
      {/* Toast Banner */}
      {toastMessage && (
        <div className="absolute top-3 left-4 right-4 z-20 bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-mono shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div>
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
      </div>

      {/* Action Controls & Irrigation Volume Selector */}
      <div className="space-y-3 pt-2">
        {/* Volume Selector */}
        <div className="flex items-center justify-between text-xs font-mono bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400">Target Dose Volume:</span>
          <div className="flex items-center gap-1.5">
            {[20, 40, 60].map((liters) => (
              <button
                key={liters}
                onClick={() => setSelectedLiters(liters)}
                className={`px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  selectedLiters === liters
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200 bg-slate-800"
                }`}
              >
                {liters} L
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Calculated: {new Date(state.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleIrrigate}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl font-semibold transition-colors cursor-pointer shadow-md shadow-emerald-950/50"
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>{language === "kn" ? `ಈಗಲೇ ನೀರು ಹಾಯಿಸಿ (${selectedLiters}L)` : `Irrigate Now (${selectedLiters} L)`}</span>
            </button>

            <button
              onClick={handleDispatchMaintenance}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-slate-300" />
              <span>{t.dripLineCheck}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

