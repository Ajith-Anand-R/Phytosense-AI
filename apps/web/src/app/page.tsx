// apps/web/src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { simulationStore, SimulationState } from "@/lib/simulationStore";
import { Header } from "@/components/Header";
import { HsiGauge } from "@/components/HsiGauge";
import { StemVisualizer } from "@/components/StemVisualizer";
import { SignalContributions } from "@/components/SignalContributions";
import { MultiSignalChart } from "@/components/MultiSignalChart";
import { ForecastSection } from "@/components/ForecastSection";
import { ActionableAdvisory } from "@/components/ActionableAdvisory";
import { AlertsTable } from "@/components/AlertsTable";
import { ResearchSpectra } from "@/components/ResearchSpectra";
import { ExperimentsView } from "@/components/ExperimentsView";
import { DeviceFleetView } from "@/components/DeviceFleetView";
import { PlantsFleetTable } from "@/components/PlantsFleetTable";
import { SimulationControls } from "@/components/SimulationControls";
import { translations } from "@/lib/translations";
import {
  Activity,
  Layers,
  Clock,
  Compass,
  AlertTriangle,
  FlaskConical,
  Cpu,
  Droplet,
  Trees,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";

export default function DashboardPage() {
  const [simState, setSimState] = useState<SimulationState>(simulationStore.getState());
  const [activeTab, setActiveTab] = useState<
    "overview" | "plants" | "forecast" | "alerts" | "research" | "devices"
  >("overview");

  useEffect(() => {
    const unsubscribe = simulationStore.subscribe((newState) => {
      setSimState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const t = translations[simState.language];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col pb-24 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Universal Top Header & Warning Banner */}
      <Header state={simState} />

      {/* 2. Secondary Sub-Nav Tabs */}
      <nav className="border-b border-slate-800/80 bg-slate-950/40 px-4 lg:px-8 py-2 sticky top-[73px] z-30 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: "overview", label: t.navOverview, icon: Activity },
              { id: "plants", label: t.navPlants, icon: Trees },
              { id: "forecast", label: t.navForecast, icon: TrendingUp },
              { id: "alerts", label: t.navAlerts, icon: AlertTriangle },
              { id: "research", label: t.navExperiments, icon: FlaskConical },
              { id: "devices", label: t.navDevices, icon: Cpu },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Active Plant Pill */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
            <span>Spotlight Palm:</span>
            <span className="font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {simState.activePlantId}
            </span>
            <span className="text-emerald-400 font-bold">&bull; HSI {simState.currentState.hydraulicStateIndex.toFixed(0)}</span>
          </div>
        </div>
      </nav>

      {/* 3. Main Dynamic Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* TAB 1: OVERVIEW & LIVE SPOTLIGHT */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Top Grid: Gauge & Actionable Advisory */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 flex">
                <div className="w-full">
                  <HsiGauge state={simState.currentState} language={simState.language} />
                </div>
              </div>
              <div className="lg:col-span-7 flex">
                <div className="w-full">
                  <ActionableAdvisory state={simState.currentState} language={simState.language} />
                </div>
              </div>
            </div>

            {/* Mid Grid: Stem Visualizer (N1-N4) & Signal Contributions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 flex">
                <div className="w-full">
                  <StemVisualizer state={simState.currentState} language={simState.language} />
                </div>
              </div>
              <div className="lg:col-span-6 flex">
                <div className="w-full">
                  <SignalContributions state={simState.currentState} language={simState.language} />
                </div>
              </div>
            </div>

            {/* Synchronized Multi-Signal Time Series */}
            <div>
              <MultiSignalChart data={simState.timeSeries} language={simState.language} />
            </div>

            {/* If Research Mode Selected in Header, show Research Spectra directly */}
            {simState.selectedPersona === "research" && (
              <div>
                <ResearchSpectra state={simState.currentState} language={simState.language} />
              </div>
            )}

            {/* Quick 24-48h Forecast Preview */}
            <div>
              <ForecastSection data={simState.forecastData} language={simState.language} />
            </div>
          </div>
        )}

        {/* TAB 2: PLANTS FLEET OVERVIEW */}
        {activeTab === "plants" && (
          <div className="space-y-8">
            <PlantsFleetTable
              plants={simState.plants}
              activePlantId={simState.activePlantId}
              language={simState.language}
            />
            {/* Spotlight on selected palm */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <HsiGauge state={simState.currentState} language={simState.language} />
              </div>
              <div className="lg:col-span-6">
                <StemVisualizer state={simState.currentState} language={simState.language} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FORECAST & SCENARIOS */}
        {activeTab === "forecast" && (
          <div className="space-y-8">
            <ForecastSection data={simState.forecastData} language={simState.language} />
            <ActionableAdvisory state={simState.currentState} language={simState.language} />
          </div>
        )}

        {/* TAB 4: ALERTS CENTER */}
        {activeTab === "alerts" && (
          <div className="space-y-8">
            <AlertsTable alerts={simState.alerts} language={simState.language} />
          </div>
        )}

        {/* TAB 5: RESEARCH & 24-SEEDLING VALIDATION */}
        {activeTab === "research" && (
          <div className="space-y-8">
            <ResearchSpectra state={simState.currentState} language={simState.language} />
            <ExperimentsView language={simState.language} />
          </div>
        )}

        {/* TAB 6: HARDWARE & FIELD DEVICES */}
        {activeTab === "devices" && (
          <div className="space-y-8">
            <DeviceFleetView devices={simState.devices} language={simState.language} />
          </div>
        )}
      </main>

      {/* 4. Persistent Bottom Floating Controls */}
      <SimulationControls state={simState} language={simState.language} />
    </div>
  );
}
