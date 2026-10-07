// apps/web/src/components/DeviceFleetView.tsx
"use client";

import React, { useState } from "react";
import { DeviceNode } from "@/types";
import { translations, Language } from "@/lib/translations";
import {
  Cpu,
  BatteryCharging,
  Sun,
  Radio,
  ShieldCheck,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  CheckCircle2
} from "lucide-react";

interface DeviceFleetViewProps {
  devices: DeviceNode[];
  language: Language;
}

export const DeviceFleetView: React.FC<DeviceFleetViewProps> = ({ devices, language }) => {
  const t = translations[language];
  const [pingingNode, setPingingNode] = useState<string | null>(null);
  const [testingNode, setTestingNode] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<Record<string, string>>({});

  const handlePing = (deviceId: string) => {
    setPingingNode(deviceId);
    setTimeout(() => {
      setPingingNode(null);
      setActionFeedback((prev) => ({
        ...prev,
        [deviceId]: "Ping OK: 38 ms (SNR: +9.4 dB)",
      }));
    }, 700);
  };

  const handleSelfTest = (deviceId: string) => {
    setTestingNode(deviceId);
    setTimeout(() => {
      setTestingNode(null);
      setActionFeedback((prev) => ({
        ...prev,
        [deviceId]: "10 kHz Contact: 420 Ω (Nominal)",
      }));
    }, 900);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
              PHYTOSENSE HARDWARE NODE MANAGEMENT
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              STM32H743 + SX1262 LoRa
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
            Edge Hub Battery, Solar MPPT, and LoRa Gateway Telemetry
          </h2>
        </div>

        {/* Hardware Architecture Spec Pill */}
        <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-800 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>ADS131M04 24-bit ADC &bull; Murata PZT Sentinel</span>
        </div>
      </div>

      {/* Grid of Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {devices.map((dev) => {
          const isOnline = dev.status === "ONLINE";
          const batteryPct = Math.min(100, Math.max(10, Math.round(((dev.batteryMv - 3400) / 800) * 100)));
          const isPinging = pingingNode === dev.deviceId;
          const isTesting = testingNode === dev.deviceId;
          const feedback = actionFeedback[dev.deviceId];

          return (
            <div
              key={dev.deviceId}
              className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-all"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-teal-400" />
                    <span>{dev.deviceId}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{dev.block}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    isOnline
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {dev.status}
                </span>
              </div>

              {/* Hardware Metrics Gauges */}
              <div className="space-y-2 text-xs font-mono">
                {/* Battery */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                      LiFePO4 Cell:
                    </span>
                    <span className="text-slate-200 font-bold">{dev.batteryMv} mV ({batteryPct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${batteryPct > 40 ? "bg-emerald-400" : "bg-amber-400"}`}
                      style={{ width: `${batteryPct}%` }}
                    />
                  </div>
                </div>

                {/* Solar & LoRa */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-400" />
                      Solar MPPT:
                    </div>
                    <div className="font-bold text-slate-200 mt-0.5">{dev.solarMa} mA</div>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      LoRa RSSI:
                    </div>
                    <div className="font-bold text-slate-200 mt-0.5">{dev.loraRssi} dBm</div>
                  </div>
                </div>

                {/* Interactive Action Feedback */}
                {feedback && (
                  <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{feedback}</span>
                  </div>
                )}
              </div>

              {/* Interactive Edge Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                <button
                  onClick={() => handlePing(dev.deviceId)}
                  disabled={isPinging}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  <Radio className={`w-3 h-3 ${isPinging ? "animate-pulse text-cyan-400" : "text-slate-400"}`} />
                  <span>{isPinging ? "Pinging..." : "Ping"}</span>
                </button>

                <button
                  onClick={() => handleSelfTest(dev.deviceId)}
                  disabled={isTesting}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-teal-300 rounded-lg border border-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  <RefreshCw className={`w-3 h-3 ${isTesting ? "animate-spin text-teal-400" : "text-teal-400"}`} />
                  <span>{isTesting ? "Testing..." : "Self-Test"}</span>
                </button>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>FW: {dev.firmwareVersion}</span>
                <span>Seen: {dev.lastSeen}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
