// apps/web/src/components/SimulationControls.tsx
"use client";

import React from "react";
import {
  Play,
  Pause,
  Droplet,
  CloudRain,
  AlertTriangle,
  RotateCcw,
  Zap,
  Sliders,
  FastForward,
  CheckCircle2
} from "lucide-react";
import { simulationStore, SimulationState } from "@/lib/simulationStore";
import { SimulationScenario } from "@/types";
import { translations, Language } from "@/lib/translations";

interface SimulationControlsProps {
  state: SimulationState;
  language: Language;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({ state, language }) => {
  const t = translations[language];

  const scenarios: { id: SimulationScenario; label: string; icon: any; color: string }[] = [
    { id: "NORMAL", label: "Healthy", icon: CheckCircle2, color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/40" },
    { id: "MILD_STRESS", label: "Mild Deficit", icon: Sliders, color: "text-yellow-400 border-yellow-500/30 bg-yellow-950/40" },
    { id: "MODERATE_STRESS", label: "Moderate Stress", icon: AlertTriangle, color: "text-orange-400 border-orange-500/30 bg-orange-950/40" },
    { id: "SEVERE_STRESS", label: "Severe Stress", icon: Zap, color: "text-rose-400 border-rose-500/30 bg-rose-950/40" },
    { id: "ROOT_SIDE_PROBLEM", label: "Root-Side A", icon: AlertTriangle, color: "text-red-400 border-red-500/30 bg-red-950/40" },
    { id: "SENSOR_FAILURE", label: "Pin Fault (Gate)", icon: Sliders, color: "text-purple-400 border-purple-500/30 bg-purple-950/40" },
    { id: "RAIN_EVENT", label: "Bark Rain (Gate)", icon: CloudRain, color: "text-blue-400 border-blue-500/30 bg-blue-950/40" },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-5xl">
      <div className="glass-panel rounded-2xl p-3 border border-slate-700/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Play/Pause, Speed, Irrigation Quick Trigger */}
        <div className="flex items-center gap-2">
          {/* Play / Pause Button */}
          <button
            onClick={() => simulationStore.togglePause()}
            className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              state.isPaused
                ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                : "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
            }`}
            title={state.isPaused ? "Resume Live Simulation" : "Pause Simulation"}
          >
            {state.isPaused ? <Play className="w-4 h-4 fill-amber-300" /> : <Pause className="w-4 h-4 fill-emerald-300" />}
            <span className="hidden sm:inline">{state.isPaused ? "Paused" : "Live (3s)"}</span>
          </button>

          {/* Speed Multiplier */}
          <div className="flex items-center bg-slate-900 px-1 py-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            <FastForward className="w-3.5 h-3.5 text-slate-400 mr-1 ml-1" />
            {[1, 5, 20].map((spd) => (
              <button
                key={spd}
                onClick={() => simulationStore.setSpeed(spd)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  state.speed === spd
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Quick Action: Inject Irrigation */}
          <button
            onClick={() => simulationStore.triggerIrrigation()}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-900/40 transition-all cursor-pointer"
          >
            <Droplet className="w-3.5 h-3.5 fill-white" />
            <span>{t.triggerIrrigation}</span>
          </button>
        </div>

        {/* Center / Right: Scenario Direct Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isSelected = state.scenario === sc.id;

            return (
              <button
                key={sc.id}
                onClick={() => simulationStore.setScenario(sc.id)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? `${sc.color} ring-1 ring-white/20 font-bold scale-105 shadow-md`
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
