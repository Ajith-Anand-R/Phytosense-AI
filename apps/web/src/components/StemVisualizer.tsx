// apps/web/src/components/StemVisualizer.tsx
"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle, Radio, Zap, Volume2, Compass, Layers, Activity, RefreshCw } from "lucide-react";
import { LocalizationResult, HydraulicState } from "@/types";
import { translations, Language } from "@/lib/translations";

interface StemVisualizerProps {
  state: HydraulicState;
  language: Language;
}

export const StemVisualizer: React.FC<StemVisualizerProps> = ({ state, language }) => {
  const t = translations[language];
  const [activeSegment, setActiveSegment] = useState<string>("N1_N2_A");
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const loc = state.localization;

  // Segment statuses based on localization output
  const isLowerAAnomalous = loc.hasAnomaly && loc.suspectedHeight === "N1_N2" && loc.suspectedSide === "A";

  const getSegmentColor = (segmentKey: string) => {
    const isSelected = activeSegment === segmentKey;
    if (isLowerAAnomalous && segmentKey === "N1_N2_A") {
      return {
        bg: isSelected
          ? "bg-red-500/35 border-red-400 text-red-200 ring-2 ring-red-400 shadow-lg shadow-red-950/60"
          : "bg-red-500/25 border-red-500/80 text-red-300",
        pill: "bg-red-500/20 text-red-300 border-red-500/50",
        label: "Anomaly (-6.5 dB)",
      };
    }
    if (state.hydraulicStateIndex > 65) {
      return {
        bg: isSelected
          ? "bg-orange-500/35 border-orange-400 text-orange-200 ring-2 ring-orange-400 shadow-lg"
          : "bg-orange-500/20 border-orange-500/60 text-orange-300",
        pill: "bg-orange-500/20 text-orange-300 border-orange-500/40",
        label: "Tension (-3.2 dB)",
      };
    }
    if (state.hydraulicStateIndex > 40) {
      return {
        bg: isSelected
          ? "bg-amber-500/30 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-lg"
          : "bg-amber-500/15 border-amber-500/50 text-amber-300",
        pill: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        label: "Mild (-1.5 dB)",
      };
    }
    return {
      bg: isSelected
        ? "bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 shadow-lg"
        : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
      pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      label: "Nominal (0 dB)",
    };
  };

  const segN3N4_A = getSegmentColor("N3_N4_A");
  const segN3N4_B = getSegmentColor("N3_N4_B");
  const segN2N3_A = getSegmentColor("N2_N3_A");
  const segN2N3_B = getSegmentColor("N2_N3_B");
  const segN1N2_A = getSegmentColor("N1_N2_A");
  const segN1N2_B = getSegmentColor("N1_N2_B");

  // Telemetry details for inspected segment
  const getInspectedTelemetry = (key: string) => {
    const isAnom = isLowerAAnomalous && key === "N1_N2_A";
    const hsi = state.hydraulicStateIndex;

    const metadata: Record<string, { name: string; bounds: string; side: string; azimuth: string }> = {
      N3_N4_A: { name: "Segment N3–N4 (A)", bounds: "1.3 m – 1.8 m", side: "Side A", azimuth: "North Azimuth (0°)" },
      N3_N4_B: { name: "Segment N3–N4 (B)", bounds: "1.3 m – 1.8 m", side: "Side B", azimuth: "South Azimuth (180°)" },
      N2_N3_A: { name: "Segment N2–N3 (A)", bounds: "0.8 m – 1.3 m", side: "Side A", azimuth: "North Azimuth (0°)" },
      N2_N3_B: { name: "Segment N2–N3 (B)", bounds: "0.8 m – 1.3 m", side: "Side B", azimuth: "South Azimuth (180°)" },
      N1_N2_A: { name: "Segment N1–N2 (A)", bounds: "0.3 m – 0.8 m", side: "Side A", azimuth: "North Azimuth (0°)" },
      N1_N2_B: { name: "Segment N1–N2 (B)", bounds: "0.3 m – 0.8 m", side: "Side B", azimuth: "South Azimuth (180°)" },
    };

    const meta = metadata[key] || metadata["N1_N2_A"];
    const r0 = isAnom ? 2180 : Math.round(1350 + hsi * 8.2);
    const rinf = isAnom ? 690 : Math.round(510 + hsi * 1.8);
    const gainDb = isAnom ? -6.5 : hsi > 60 ? -3.2 : hsi > 35 ? -1.5 : 0.0;
    const contactCheckOhms = isAnom ? 540 : 420;
    const aeCount = isAnom ? 18 : hsi > 50 ? 12 : 2;

    return { ...meta, isAnom, r0, rinf, gainDb, contactCheckOhms, aeCount };
  };

  const inspected = getInspectedTelemetry(activeSegment);

  const handleChirpSweep = () => {
    setIsSweeping(true);
    setTimeout(() => setIsSweeping(false), 900);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between relative overflow-hidden space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
              {t.stemProfileTitle}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              4 Bands &bull; 8 Pods
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
            Trunk Spatial Conduction (170 mm dia)
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1 text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>North (A) / South (B)</span>
          </span>
        </div>
      </div>

      {/* Main Trunk Diagram Visualizer */}
      <div className="relative py-1 flex items-center justify-center">
        {/* Trunk Axis Column */}
        <div className="w-full max-w-md bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 relative">
          {/* Side A / Side B Header Indicator */}
          <div className="grid grid-cols-2 text-center text-xs font-mono pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t.sideA}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{t.sideB}</span>
            </div>
          </div>

          {/* Vertical Trunk Assembly */}
          <div className="relative flex flex-col gap-1.5 font-mono text-xs">
            {/* Band N4 (1.8 m) */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200 shadow-sm">
              <span className="font-bold text-slate-300">POD N4-A</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {t.heightN4}
              </span>
              <span className="font-bold text-slate-300">POD N4-B</span>
            </div>

            {/* Segment N3 -> N4 */}
            <div className="grid grid-cols-2 gap-2 my-0.5">
              <button
                onClick={() => setActiveSegment("N3_N4_A")}
                className={`p-2 rounded-lg border transition-all text-center cursor-pointer ${segN3N4_A.bg}`}
              >
                <div className="text-[10px] text-slate-400">Segment N3–N4 (A)</div>
                <div className="font-bold text-xs mt-0.5">{segN3N4_A.label}</div>
              </button>
              <button
                onClick={() => setActiveSegment("N3_N4_B")}
                className={`p-2 rounded-lg border transition-all text-center cursor-pointer ${segN3N4_B.bg}`}
              >
                <div className="text-[10px] text-slate-400">Segment N3–N4 (B)</div>
                <div className="font-bold text-xs mt-0.5">{segN3N4_B.label}</div>
              </button>
            </div>

            {/* Upper Acoustic Sentinel Sensor (1550 mm) */}
            <div className="flex items-center justify-center py-0.5">
              <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-[11px] shadow-sm">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upper Acoustic Sentinel (1.55 m) &bull; 4 hits/hr</span>
              </div>
            </div>

            {/* Band N3 (1.3 m) */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200 shadow-sm">
              <span className="font-bold text-slate-300">POD N3-A</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {t.heightN3}
              </span>
              <span className="font-bold text-slate-300">POD N3-B</span>
            </div>

            {/* Segment N2 -> N3 */}
            <div className="grid grid-cols-2 gap-2 my-0.5">
              <button
                onClick={() => setActiveSegment("N2_N3_A")}
                className={`p-2 rounded-lg border transition-all text-center cursor-pointer ${segN2N3_A.bg}`}
              >
                <div className="text-[10px] text-slate-400">Segment N2–N3 (A)</div>
                <div className="font-bold text-xs mt-0.5">{segN2N3_A.label}</div>
              </button>
              <button
                onClick={() => setActiveSegment("N2_N3_B")}
                className={`p-2 rounded-lg border transition-all text-center cursor-pointer ${segN2N3_B.bg}`}
              >
                <div className="text-[10px] text-slate-400">Segment N2–N3 (B)</div>
                <div className="font-bold text-xs mt-0.5">{segN2N3_B.label}</div>
              </button>
            </div>

            {/* Invar Dendrometer Band (1180 mm) & Hub Saddle (1050 mm) */}
            <div className="flex items-center justify-between px-2 py-1 bg-slate-900/40 rounded-lg border border-slate-800/60 text-[10px] text-slate-400">
              <span className="text-yellow-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                Micro-Dendrometer (1.18 m): -18.5 &mu;m
              </span>
              <span className="text-slate-400">Edge Hub (1.05 m)</span>
            </div>

            {/* Band N2 (0.8 m) */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200 shadow-sm">
              <span className="font-bold text-slate-300">POD N2-A</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {t.heightN2}
              </span>
              <span className="font-bold text-slate-300">POD N2-B</span>
            </div>

            {/* Lower Acoustic Sentinel Sensor (550 mm) */}
            <div className="flex items-center justify-center py-0.5">
              <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-[11px] shadow-sm">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lower Acoustic Sentinel (0.55 m) &bull; {state.hydraulicStateIndex > 50 ? "18 hits/hr (Active)" : "2 hits/hr"}</span>
              </div>
            </div>

            {/* Segment N1 -> N2 (KEY ANOMALY ZONE IN ROOT PROBLEM) */}
            <div className="grid grid-cols-2 gap-2 my-0.5">
              <button
                onClick={() => setActiveSegment("N1_N2_A")}
                className={`p-2.5 rounded-lg border transition-all text-center cursor-pointer ${segN1N2_A.bg} relative ${isLowerAAnomalous ? "ring-2 ring-red-400/80 animate-pulse" : ""}`}
              >
                <div className="text-[10px] text-slate-300 font-semibold flex items-center justify-center gap-1">
                  <span>Segment N1–N2 (A)</span>
                  {isLowerAAnomalous && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                </div>
                <div className="font-bold text-xs mt-0.5">{segN1N2_A.label}</div>
              </button>
              <button
                onClick={() => setActiveSegment("N1_N2_B")}
                className={`p-2.5 rounded-lg border transition-all text-center cursor-pointer ${segN1N2_B.bg}`}
              >
                <div className="text-[10px] text-slate-400">Segment N1–N2 (B)</div>
                <div className="font-bold text-xs mt-0.5">{segN1N2_B.label}</div>
              </button>
            </div>

            {/* Band N1 (0.3 m) */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200 shadow-sm">
              <span className="font-bold text-slate-300">POD N1-A</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {t.heightN1}
              </span>
              <span className="font-bold text-slate-300">POD N1-B</span>
            </div>

            {/* Base / Soil Line */}
            <div className="text-center text-[10px] text-slate-400 py-1 border-t border-slate-800 mt-1 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>{t.ground} &bull; Soil Sensor at 30 cm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Segment Detailed Diagnostics Card */}
      <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">{inspected.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {inspected.bounds}
            </span>
          </div>

          <button
            onClick={handleChirpSweep}
            disabled={isSweeping}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-[11px] transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3 h-3 ${isSweeping ? "animate-spin text-teal-400" : ""}`} />
            <span>{isSweeping ? "Scanning..." : "Active Chirp"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Cole R0 / R&infin;</span>
            <span className="font-bold text-slate-200">{inspected.r0} &Omega; / {inspected.rinf} &Omega;</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Transfer Gain |H(f)|</span>
            <span className={`font-bold ${inspected.gainDb < -4 ? "text-red-400" : "text-emerald-400"}`}>
              {inspected.gainDb.toFixed(1)} dB
            </span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">10 kHz Contact</span>
            <span className="font-bold text-slate-200">{inspected.contactCheckOhms} &Omega; (OK)</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">Acoustic Hits</span>
            <span className={`font-bold ${inspected.aeCount > 10 ? "text-orange-400" : "text-slate-200"}`}>
              {inspected.aeCount} hits/hr
            </span>
          </div>
        </div>
      </div>

      {/* Localization Diagnosis Callout Banner */}
      <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
        loc.hasAnomaly
          ? "bg-red-950/40 border-red-500/40 text-red-200"
          : "bg-slate-900/60 border-slate-800 text-slate-300"
      }`}>
        <div className="flex items-start gap-2">
          {loc.hasAnomaly ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold">
              {language === "kn" && loc.kannadaDescription ? loc.kannadaDescription : loc.description}
            </span>
            {loc.hasAnomaly && (
              <span className="ml-2 font-mono text-[11px] text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                Confidence: {loc.confidencePct}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

