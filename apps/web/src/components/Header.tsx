// apps/web/src/components/Header.tsx
"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Globe,
  Layers,
  Sparkles,
  Info,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Droplet
} from "lucide-react";
import { simulationStore, SimulationState } from "@/lib/simulationStore";
import { translations } from "@/lib/translations";
import { SimulationScenario } from "@/types";

interface HeaderProps {
  state: SimulationState;
}

export const Header: React.FC<HeaderProps> = ({ state }) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const t = translations[state.language];

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    simulationStore.setScenario(e.target.value as SimulationScenario);
  };

  const handlePersonaToggle = () => {
    const next = state.selectedPersona === "farm" ? "research" : "farm";
    simulationStore.setPersona(next);
  };

  const handleLanguageToggle = () => {
    const next = state.language === "en" ? "kn" : "en";
    simulationStore.setLanguage(next);
  };

  return (
    <>
      {/* 1. Mandatory Scientific Honesty / Simulation Disclaimer Banner */}
      <div className="bg-amber-950/70 border-b border-amber-600/30 text-amber-200 px-4 py-1.5 text-xs font-mono flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span className="font-semibold tracking-wider">{t.simulationBanner}</span>
        </div>
        <button
          onClick={() => setShowInfoModal(true)}
          className="flex items-center gap-1 text-amber-300 hover:text-amber-100 underline decoration-amber-500/50 cursor-pointer text-[11px]"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Research Dossier & Limits</span>
        </button>
      </div>

      {/* 2. Main Navigation Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-slate-800/80 px-4 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-slate-100">
                  {t.appName}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Digital Twin
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {t.appSubtitle} &bull; <span className="font-mono text-emerald-400/90">PhytoHydra Sentinel v1</span>
              </p>
            </div>
          </div>

          {/* Center Fleet Metrics (Quick status at a glance) */}
          <div className="hidden xl:flex items-center gap-4 text-xs font-mono bg-slate-900/60 py-1.5 px-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">{t.totalPlants}:</span>
              <span className="font-bold text-slate-200">24</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>17 {t.healthyCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>4 {t.moderateCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>2 {t.highCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>1 {t.criticalCount}</span>
            </div>
          </div>

          {/* Right Action Controls: Scenario Selector, Persona Toggle, Language */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Scenario Quick Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                value={state.scenario}
                onChange={handleScenarioChange}
                className="bg-transparent text-slate-200 font-medium outline-none cursor-pointer pr-1"
                aria-label="Simulation Scenario"
              >
                <option value="NORMAL" className="bg-slate-900 text-slate-100">Normal Healthy Baseline</option>
                <option value="MILD_STRESS" className="bg-slate-900 text-slate-100">Mild Water Deficit</option>
                <option value="MODERATE_STRESS" className="bg-slate-900 text-slate-100">Moderate Drought Stress</option>
                <option value="SEVERE_STRESS" className="bg-slate-900 text-slate-100">Severe Cavitation Stress</option>
                <option value="RECOVERY" className="bg-slate-900 text-slate-100">Post-Irrigation Recovery</option>
                <option value="ROOT_SIDE_PROBLEM" className="bg-slate-900 text-slate-100">Root-Side A Conduction Defect</option>
                <option value="SENSOR_FAILURE" className="bg-slate-900 text-slate-100">Electrode Detachment (Quality Gate)</option>
                <option value="RAIN_EVENT" className="bg-slate-900 text-slate-100">Monsoon Bark Wetting (Rain Gate)</option>
              </select>
            </div>

            {/* Farm Mode vs Research Mode Toggle */}
            <button
              onClick={handlePersonaToggle}
              title={state.selectedPersona === "farm" ? t.farmModeDesc : t.researchModeDesc}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                state.selectedPersona === "research"
                  ? "bg-purple-950/50 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-900/40"
                  : "bg-emerald-950/50 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-900/40"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{state.selectedPersona === "farm" ? t.farmMode : t.researchMode}</span>
            </button>

            {/* Language Toggle (EN / ಕನ್ನಡ) */}
            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-800 transition-colors cursor-pointer"
              title="Toggle English / Kannada (ಕನ್ನಡ)"
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-mono">{state.language === "en" ? "KN" : "EN"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Info Modal: Scientific Limitations & TRL 3 Roadmap */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Info className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">
                  PhytoSense AI: Scientific Transparency & TRL 3 Statement
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-100 text-lg cursor-pointer px-2"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3 bg-amber-950/40 border border-amber-600/30 rounded-xl text-amber-200">
                <p className="font-semibold mb-1">Notice to Evaluators and Agronomists:</p>
                <p>
                  This digital prototype runs on synthetic multi-modal sensors. Physical PhytoHydra field nodes (STM32H743 + SX1262 LoRa) are in active design intent. All thresholds and early lead-time claims are hypotheses subject to empirical validation in the 24-seedling controlled trial.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-100 mb-1">What this system measures:</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li>Stem electrical impedance spectroscopy (100 Hz to 200 kHz) via Cole-model relaxation.</li>
                  <li>Multi-height electrical transfer function (H12, H13, H14) across Bands N1–N4.</li>
                  <li>Ultrasonic acoustic emission cavitation clicks (100 to 400 kHz) via piezoelectric sentinels.</li>
                  <li>Diurnal trunk micro-shrinkage and overnight recovery refilling.</li>
                  <li>Canopy-air infrared temperature differential and atmospheric VPD.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-100 mb-1">Validation Targets (Phase 1 Benchmarks):</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li>Lead time vs. soil moisture: <span className="text-emerald-400 font-mono">Median &ge; 12 hours earlier</span></li>
                  <li>Lead time vs. visible wilting: <span className="text-emerald-400 font-mono">Median &ge; 24 hours earlier</span></li>
                  <li>Stress detection sensitivity: <span className="text-emerald-400 font-mono">&ge; 80%</span></li>
                  <li>False alarm rate: <span className="text-emerald-400 font-mono">&le; 1 per plant per 14 days</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
