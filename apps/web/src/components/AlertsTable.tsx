// apps/web/src/components/AlertsTable.tsx
"use client";

import React, { useState } from "react";
import { AlertItem } from "@/types";
import { translations, Language } from "@/lib/translations";
import { simulationStore } from "@/lib/simulationStore";
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Info,
  Clock,
  Check,
  ShieldCheck,
  Filter
} from "lucide-react";

interface AlertsTableProps {
  alerts: AlertItem[];
  language: Language;
}

export const AlertsTable: React.FC<AlertsTableProps> = ({ alerts, language }) => {
  const t = translations[language];
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === "ALL") return true;
    return a.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            HIGH
          </span>
        );
      case "WARNING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARNING
          </span>
        );
      case "INFO":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Info className="w-3 h-3 text-blue-400" />
            INFO
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
              PHYSIOLOGICAL ALERTS & NOTIFICATIONS
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              6h Cooldown Active
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
            Active Alerts, Root-Side Anomalies & Equipment Diagnostics
          </h2>
        </div>

        {/* Severity Filter Buttons */}
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono self-start sm:self-auto">
          {["ALL", "CRITICAL", "HIGH", "WARNING", "INFO"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterSeverity === sev
                  ? "bg-slate-800 text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-2 font-medium">Time</th>
              <th className="pb-2 font-medium">Plant ID</th>
              <th className="pb-2 font-medium">Severity</th>
              <th className="pb-2 font-medium">Alert & Diagnosis</th>
              <th className="pb-2 font-medium">Contributing Signals</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  No alerts match the selected filter.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 text-slate-400 whitespace-nowrap">{alert.timestamp}</td>
                  <td className="py-3 font-bold text-slate-200 whitespace-nowrap">{alert.plantId}</td>
                  <td className="py-3 whitespace-nowrap">{getSeverityBadge(alert.severity)}</td>
                  <td className="py-3 max-w-sm">
                    <div className="font-semibold text-slate-100 font-sans text-xs">
                      {language === "kn" ? alert.titleKn : alert.titleEn}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 font-sans">
                      {language === "kn" ? alert.messageKn : alert.messageEn}
                    </div>
                  </td>
                  <td className="py-3 text-[11px] text-slate-400 whitespace-nowrap">
                    {alert.causeSignals.join(", ")}
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.status === "ACTIVE"
                          ? "bg-red-950 text-red-300 border border-red-800"
                          : alert.status === "ACKNOWLEDGED"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    {alert.status === "ACTIVE" && (
                      <button
                        onClick={() => simulationStore.acknowledgeAlert(alert.id)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 mr-1 cursor-pointer"
                      >
                        Ack
                      </button>
                    )}
                    {alert.status !== "RESOLVED" && (
                      <button
                        onClick={() => simulationStore.resolveAlert(alert.id)}
                        className="text-xs bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-700/60 cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
