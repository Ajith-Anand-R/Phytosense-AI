// apps/web/src/components/DeviceFleetView.tsx
"use client";

import React from "react";
import { DeviceNode } from "@/types";
import { translations, Language } from "@/lib/translations";
import { Cpu, BatteryCharging, Sun, Radio, ShieldCheck, AlertTriangle, Wifi, WifiOff } from "lucide-react";

interface DeviceFleetViewProps {
  devices: DeviceNode[];
  language: Language;
}

export const DeviceFleetView: React.FC<DeviceFleetViewProps> = ({ devices, language }) => {
  const t = translations[language];

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
      </div>

      {/* Grid of Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {devices.map((dev) => {
          const isOnline = dev.status === "ONLINE";
          const batteryPct = Math.min(100, Math.max(10, Math.round(((dev.batteryMv - 3400) / 800) * 100)));

          return (
            <div
              key={dev.deviceId}
              className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-4"
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
                      Li-ion Battery:
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
                      Solar:
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
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Firmware: {dev.firmwareVersion}</span>
                <span>Seen: {dev.lastSeen}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
