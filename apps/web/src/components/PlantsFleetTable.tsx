// apps/web/src/components/PlantsFleetTable.tsx
"use client";

import React, { useState } from "react";
import { PlantSummary } from "@/types";
import { translations, Language } from "@/lib/translations";
import { simulationStore } from "@/lib/simulationStore";
import { Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Eye, ShieldCheck } from "lucide-react";

interface PlantsFleetTableProps {
  plants: PlantSummary[];
  activePlantId: string;
  language: Language;
}

export const PlantsFleetTable: React.FC<PlantsFleetTableProps> = ({ plants, activePlantId, language }) => {
  const t = translations[language];
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  const filtered = plants.filter((p) => {
    if (filterRisk === "ALL") return true;
    return p.riskLevel === filterRisk;
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">CRITICAL</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">HIGH</span>;
      case "MODERATE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">MODERATE</span>;
      case "MILD":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">MILD</span>;
      case "HEALTHY":
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">HEALTHY</span>;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
      {/* Header with Title and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
              SENTINEL PALM FLEET OVERVIEW
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {plants.length} Monitored Trees
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
            Arecanut Sentinel Network across Plantation Blocks
          </h2>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono self-start sm:self-auto">
          {["ALL", "HEALTHY", "MODERATE", "HIGH"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterRisk(lvl)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterRisk === lvl
                  ? "bg-slate-800 text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-2 font-medium">Plant ID</th>
              <th className="pb-2 font-medium">Block & Variety</th>
              <th className="pb-2 font-medium">Trunk Dia</th>
              <th className="pb-2 font-medium">HSI Score</th>
              <th className="pb-2 font-medium">Risk Status</th>
              <th className="pb-2 font-medium">Trend</th>
              <th className="pb-2 font-medium">Baseline</th>
              <th className="pb-2 font-medium text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((p) => {
              const isSelected = p.plantId === activePlantId;

              return (
                <tr
                  key={p.plantId}
                  className={`hover:bg-slate-900/40 transition-colors ${
                    isSelected ? "bg-emerald-950/20 border-l-2 border-emerald-500" : ""
                  }`}
                >
                  <td className="py-3 font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{p.plantId}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-sans">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-slate-300">
                    <div>{p.blockId}</div>
                    <div className="text-[10px] text-slate-400">{p.variety} ({p.ageYears} yrs)</div>
                  </td>
                  <td className="py-3 text-slate-400">
                    {(p.trunkCircumferenceMm / Math.PI).toFixed(0)} mm
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-sm text-slate-100">{p.currentHsi.toFixed(1)}</span>
                    <span className="text-slate-400 text-[10px]"> / 100</span>
                  </td>
                  <td className="py-3">{getRiskBadge(p.riskLevel)}</td>
                  <td className="py-3 text-slate-400">
                    {p.trend === "DETERIORATING" ? (
                      <span className="text-rose-400 flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> Rising</span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1"><ArrowDownRight className="w-3.5 h-3.5" /> Stable</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] text-teal-400 font-mono bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/50">
                      {p.baselineStatus}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => simulationStore.setActivePlant(p.plantId)}
                      className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-teal-400" />
                      <span>Select</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
