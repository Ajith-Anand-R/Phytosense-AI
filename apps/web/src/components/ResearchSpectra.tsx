// apps/web/src/components/ResearchSpectra.tsx
"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { HydraulicState } from "@/types";
import { translations, Language } from "@/lib/translations";
import { Cpu, Activity, Radio, Volume2, Database } from "lucide-react";

interface ResearchSpectraProps {
  state: HydraulicState;
  language: Language;
}

export const ResearchSpectra: React.FC<ResearchSpectraProps> = ({ state, language }) => {
  const t = translations[language];
  const [selectedSpectrumTab, setSelectedSpectrumTab] = useState<"nyquist" | "bode" | "acoustic">("nyquist");

  // Generate synthetic Cole arc points for PALM-001
  // Z(w) = Rinf + (R0 - Rinf) / (1 + (j*w/wc)^alpha)
  const r0 = 1450.0 + state.hydraulicStateIndex * 8.5;
  const rinf = 520.0 + state.hydraulicStateIndex * 2.0;
  const alpha = 0.78;
  const fc = 14500.0;

  const nyquistData = [];
  const logFreqs = [100, 200, 500, 1000, 2500, 5000, 10000, 15000, 25000, 50000, 100000, 200000];
  for (const f of logFreqs) {
    const w = 2 * Math.PI * f;
    const wc = 2 * Math.PI * fc;
    const s = Math.pow(w / wc, alpha);
    const thetaS = alpha * (Math.PI / 2);
    const denomRe = 1 + s * Math.cos(thetaS);
    const denomIm = s * Math.sin(thetaS);
    const denomMagSq = denomRe * denomRe + denomIm * denomIm;

    const deltaR = r0 - rinf;
    const reZ = rinf + (deltaR * denomRe) / denomMagSq;
    const imZ = -(deltaR * denomIm) / denomMagSq;

    nyquistData.push({
      freqHz: f,
      realZ: Math.round(reZ),
      negImagZ: Math.round(-imZ), // -Im(Z) on Y-axis
      isFc: f === 15000,
    });
  }

  // Multisine Bode data (50 Hz - 5 kHz)
  const isAnomalousA = state.localization.hasAnomaly && state.localization.suspectedSide === "A";
  const bodeData = [
    { freq: "50 Hz", gainN1N2_A: isAnomalousA ? -8.2 : -3.2, gainN1N2_B: -3.4, phaseA: -12, phaseB: -14 },
    { freq: "150 Hz", gainN1N2_A: isAnomalousA ? -9.1 : -3.8, gainN1N2_B: -3.9, phaseA: -24, phaseB: -25 },
    { freq: "500 Hz", gainN1N2_A: isAnomalousA ? -11.4 : -5.1, gainN1N2_B: -5.3, phaseA: -52, phaseB: -54 },
    { freq: "1 kHz", gainN1N2_A: isAnomalousA ? -14.2 : -7.2, gainN1N2_B: -7.5, phaseA: -86, phaseB: -88 },
    { freq: "2.5 kHz", gainN1N2_A: isAnomalousA ? -18.5 : -10.8, gainN1N2_B: -11.0, phaseA: -135, phaseB: -138 },
    { freq: "5 kHz", gainN1N2_A: isAnomalousA ? -22.1 : -14.6, gainN1N2_B: -15.1, phaseA: -178, phaseB: -180 },
  ];

  // Acoustic Frequency Clusters
  const acousticClusterData = [
    { band: "0-50 kHz (Wind/Mechanical)", hits: 3, type: "Ambient Noise" },
    { band: "50-100 kHz (Transition)", hits: 5, type: "Transition" },
    { band: "100-150 kHz (Xylem Cavitation)", hits: Math.round(state.hydraulicStateIndex > 50 ? 24 : 4), type: "Cavitation Core" },
    { band: "150-200 kHz (Resonant Peak)", hits: Math.round(state.hydraulicStateIndex > 50 ? 32 : 5), type: "Cavitation Core" },
    { band: "200-300 kHz (High Cavitation)", hits: Math.round(state.hydraulicStateIndex > 50 ? 12 : 2), type: "Cavitation Core" },
    { band: ">300 kHz (Noise/Preamp)", hits: 2, type: "Electronic Noise" },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-purple-900/40 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-purple-400">
              RESEARCH MODE: SPECTRAL & BIOPHYSICAL ANALYSIS
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Raw Waveforms & Model Fits
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
            Cole-Cole Argand Relaxation & Multisine Frequency Transfer
          </h2>
        </div>

        {/* Tab Filter */}
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono self-start sm:self-auto">
          {[
            { id: "nyquist", label: "Cole Nyquist Arc" },
            { id: "bode", label: "Multisine Bode H(f)" },
            { id: "acoustic", label: "AE Frequency Clusters" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSpectrumTab(tab.id as any)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedSpectrumTab === tab.id
                  ? "bg-purple-900/60 text-purple-200 font-semibold border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Cole Nyquist Plot */}
      {selectedSpectrumTab === "nyquist" && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-semibold text-purple-300 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                Argand Diagram: Real Resistance Re(Z) vs. Reactive Capacitance -Im(Z) [&Omega;]
              </span>
              <span className="text-slate-400">
                Fitted: R0 = {r0.toFixed(0)} &Omega;, R&infin; = {rinf.toFixed(0)} &Omega;, &alpha; = {alpha}, fc = 14.5 kHz
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    dataKey="realZ"
                    name="Re(Z)"
                    unit=" Ω"
                    stroke="#64748b"
                    tick={{ fontSize: 10 }}
                    domain={[400, 2200]}
                  />
                  <YAxis
                    type="number"
                    dataKey="negImagZ"
                    name="-Im(Z)"
                    unit=" Ω"
                    stroke="#64748b"
                    tick={{ fontSize: 10 }}
                    domain={[0, 700]}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#475569",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Scatter
                    name="Impedance Sweep (100 Hz - 200 kHz)"
                    data={nyquistData}
                    fill="#a855f7"
                    line={{ stroke: "#c084fc", strokeWidth: 2 }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Extracellular R0:</div>
              <div className="text-purple-300 font-bold text-sm mt-0.5">{r0.toFixed(0)} &Omega;</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Total Fluid R_inf:</div>
              <div className="text-purple-300 font-bold text-sm mt-0.5">{rinf.toFixed(0)} &Omega;</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">R0 / R_inf Ratio:</div>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">{(r0 / rinf).toFixed(2)}</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Membrane Dispersion &alpha;:</div>
              <div className="text-slate-200 font-bold text-sm mt-0.5">{alpha}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multisine Transfer Function Bode Plot */}
      {selectedSpectrumTab === "bode" && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-semibold text-cyan-300 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5" />
                Transfer Function Gain |H12(f)|: Side A (North) vs. Side B (South) [dB]
              </span>
              <span className="text-slate-400">8 Simultaneous Multisine Tones</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bodeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="freq" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis domain={[-25, 0]} stroke="#64748b" tick={{ fontSize: 10 }} unit=" dB" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#475569",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                  <Line
                    type="monotone"
                    dataKey="gainN1N2_A"
                    name="Side A: H12(f) (North)"
                    stroke={isAnomalousA ? "#ef4444" : "#06b6d4"}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gainN1N2_B"
                    name="Side B: H12(f) (South)"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Acoustic Cavitation Clusters */}
      {selectedSpectrumTab === "acoustic" && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-semibold text-indigo-300 flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5" />
                Acoustic Emission Hit Frequency Distribution by Spectral Band
              </span>
              <span className="text-slate-400">100–200 kHz = Cavitation Core</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={acousticClusterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="band" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#475569",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Bar dataKey="hits" name="Hit Frequency (Events / hr)" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
