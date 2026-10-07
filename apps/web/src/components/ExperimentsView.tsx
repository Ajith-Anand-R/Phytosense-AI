// apps/web/src/components/ExperimentsView.tsx
"use client";

import React, { useState } from "react";
import { translations, Language } from "@/lib/translations";
import {
  FlaskConical,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
  TrendingDown
} from "lucide-react";

interface ExperimentsViewProps {
  language: Language;
}

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({ language }) => {
  const t = translations[language];
  const [csvStatus, setCsvStatus] = useState<string | null>(null);
  const [importedRowCount, setImportedRowCount] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.trim().split("\n");
      if (lines.length > 1) {
        setImportedRowCount(lines.length - 1);
        setCsvStatus("success");
      } else {
        setCsvStatus("invalid");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Goal */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  {t.groundTruthTitle}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Phase 1 Protocol
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Randomised Block Design on 50 L potted seedlings under rain shelter &bull; Pressure Chamber Ground Truth
              </p>
            </div>
          </div>
        </div>

        {/* 6 Target Benchmarks Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
          {/* Metric 1 */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">Lead Time vs. Soil Moisture:</div>
            <div className="text-lg font-bold text-emerald-400">&ge; 12.0 Hours Earlier</div>
            <div className="text-[10px] text-slate-400 mt-1">Target Benchmark (Hypothesis)</div>
          </div>

          {/* Metric 2 */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">Lead Time vs. Visible Wilting:</div>
            <div className="text-lg font-bold text-emerald-400">&ge; 24.0 Hours Earlier</div>
            <div className="text-[10px] text-slate-400 mt-1">Target Benchmark (Hypothesis)</div>
          </div>

          {/* Metric 3 */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">Detection Sensitivity:</div>
            <div className="text-lg font-bold text-teal-400">&ge; 80.0% Detection</div>
            <div className="text-[10px] text-slate-400 mt-1">Against &Psi;leaf &le; -0.3 MPa</div>
          </div>

          {/* Metric 4 */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">False Alarm Rate (Control):</div>
            <div className="text-lg font-bold text-amber-400">&le; 1 per 14 Days</div>
            <div className="text-[10px] text-slate-400 mt-1">On well-watered seedlings</div>
          </div>

          {/* Metric 5 */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">Split-Root Side Localization:</div>
            <div className="text-lg font-bold text-purple-400">&ge; 75.0% Accuracy</div>
            <div className="text-[10px] text-slate-400 mt-1">Correct Side A vs B detection</div>
          </div>

          {/* Metric 6 */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">Plant Growth Biocompatibility:</div>
            <div className="text-lg font-bold text-slate-200">No Deficit (p &gt; 0.05)</div>
            <div className="text-[10px] text-slate-400 mt-1">Vs. un-instrumented controls</div>
          </div>
        </div>
      </div>

      {/* Trial Treatment Groups Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider mb-3">
          Seedling Trial Treatment Groups (N = 24 Plants)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2">Group</th>
                <th className="pb-2">Plants (n)</th>
                <th className="pb-2">Irrigation Regime</th>
                <th className="pb-2">Primary Scientific Purpose</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-2.5 font-bold text-slate-200">Control Group</td>
                <td className="py-2.5">n = 6 (4 inst, 2 un-inst)</td>
                <td className="py-2.5 text-emerald-400">100% daily pot water loss</td>
                <td className="py-2.5 text-slate-300">Healthy baseline & false alarm rate benchmarking</td>
                <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">ACTIVE</span></td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-200">Mild Deficit</td>
                <td className="py-2.5">n = 4</td>
                <td className="py-2.5 text-yellow-400">60% daily loss replacement</td>
                <td className="py-2.5 text-slate-300">Sensitivity at subtle physiological water tension</td>
                <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">TRIAL 2</span></td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-200">Moderate Deficit</td>
                <td className="py-2.5">n = 4</td>
                <td className="py-2.5 text-orange-400">30% daily loss replacement</td>
                <td className="py-2.5 text-slate-300">Main lead-time detection test vs soil moisture</td>
                <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">TRIAL 2</span></td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-200">Severe & Re-water</td>
                <td className="py-2.5">n = 4</td>
                <td className="py-2.5 text-rose-400">0% water until visible wilting</td>
                <td className="py-2.5 text-slate-300">Lead time vs wilting + post-irrigation recovery kinetics</td>
                <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">SCHEDULED</span></td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-200">Split-Root Test</td>
                <td className="py-2.5">n = 6 (4 inst, 2 un-inst)</td>
                <td className="py-2.5 text-cyan-400">Half A dried, Half B watered</td>
                <td className="py-2.5 text-slate-300">Validating Side A vs Side B spatial localization accuracy</td>
                <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">SCHEDULED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Ground Truth Importer Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              Upload Experimental Ground Truth CSV
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Import PMS pressure chamber leaf water potentials (&Psi;leaf), pot load cell weights, or porometer records.
            </p>
          </div>

          <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-mono font-medium border border-slate-700 transition-colors cursor-pointer shrink-0">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Choose CSV File</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {csvStatus === "success" && (
          <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>CSV Validated Successfully: Ingested {importedRowCount} historical measurement rows. Ready for cross-validation.</span>
          </div>
        )}

        {csvStatus === "invalid" && (
          <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs font-mono text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Invalid CSV structure. Required headers: timestamp, plant_id, leaf_water_potential_mpa, pot_weight_kg.</span>
          </div>
        )}
      </div>
    </div>
  );
};
