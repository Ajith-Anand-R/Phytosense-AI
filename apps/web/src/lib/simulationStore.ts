// apps/web/src/lib/simulationStore.ts
// Interactive biophysical client-side digital twin simulation store

import {
  HydraulicState,
  SimulationScenario,
  ForecastData,
  AlertItem,
  DeviceNode,
  PlantSummary,
  QualityStatus,
  RiskLevel
} from "@/types";

export interface TimeSeriesPoint {
  time: string;
  hsi: number;
  r0Ohms: number;
  rinfOhms: number;
  aeHits: number;
  dendrometerUm: number;
  soilMoisturePct: number;
  vpdKpa: number;
  tempGapC: number;
}

export interface SimulationState {
  scenario: SimulationScenario;
  speed: number;
  isPaused: boolean;
  activePlantId: string;
  selectedPersona: "farm" | "research";
  language: "en" | "kn";
  currentState: HydraulicState;
  forecastData: ForecastData;
  timeSeries: TimeSeriesPoint[];
  alerts: AlertItem[];
  devices: DeviceNode[];
  plants: PlantSummary[];
  lastSweepTimestamp: string;
}

class SimulationManager {
  private state: SimulationState;
  private listeners: Set<(state: SimulationState) => void> = new Set();
  private intervalId: NodeJS.Timeout | null = null;
  private tickCount: number = 0;

  constructor() {
    this.state = this.createInitialState();
    this.startLoop();
  }

  private createInitialState(): SimulationState {
    const now = new Date();
    const state = this.computeStateForScenario("MODERATE_STRESS", now, 64.2);

    return {
      scenario: "MODERATE_STRESS",
      speed: 1,
      isPaused: false,
      activePlantId: "PALM-001",
      selectedPersona: "farm",
      language: "en",
      currentState: state,
      forecastData: this.computeForecast(64.2),
      timeSeries: this.generateInitialTimeSeries(),
      alerts: this.generateInitialAlerts(),
      devices: this.generateInitialDevices(),
      plants: this.generateInitialPlants(),
      lastSweepTimestamp: now.toISOString(),
    };
  }

  public getState(): SimulationState {
    return this.state;
  }

  public subscribe(listener: (state: SimulationState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public setScenario(scenario: SimulationScenario) {
    this.state.scenario = scenario;
    this.recalculateCurrent();
  }

  public setSpeed(speed: number) {
    this.state.speed = speed;
    this.restartLoop();
  }

  public togglePause() {
    this.state.isPaused = !this.state.isPaused;
    this.notify();
  }

  public setPersona(persona: "farm" | "research") {
    this.state.selectedPersona = persona;
    this.notify();
  }

  public setLanguage(lang: "en" | "kn") {
    this.state.language = lang;
    this.notify();
  }

  public setActivePlant(plantId: string) {
    this.state.activePlantId = plantId;
    this.recalculateCurrent();
  }

  public triggerIrrigation() {
    this.setScenario("RECOVERY");
    const newAlert: AlertItem = {
      id: `ALT-${Date.now()}`,
      plantId: this.state.activePlantId,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "IRRIGATION_RESPONSE",
      severity: "INFO",
      titleEn: "Irrigation Triggered (40 L)",
      messageEn: "Drip irrigation cycle initiated. Recovery kinetics tracking started.",
      titleKn: "ನೀರು ಹಾಯಿಸುವಿಕೆ ಆರಂಭಗೊಂಡಿದೆ (೪೦ ಲೀಟರ್)",
      messageKn: "ಹನಿ ನೀರಾವರಿ ಆರಂಭಿಸಲಾಗಿದೆ. ಮರದ ಚೇತರಿಕೆಯ ಪ್ರಮಾಣವನ್ನು ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ.",
      causeSignals: ["irrigation_event"],
      status: "ACTIVE",
    };
    this.state.alerts = [newAlert, ...this.state.alerts];
    this.notify();
  }

  public acknowledgeAlert(id: string) {
    this.state.alerts = this.state.alerts.map((a) =>
      a.id === id ? { ...a, status: "ACKNOWLEDGED" } : a
    );
    this.notify();
  }

  public resolveAlert(id: string) {
    this.state.alerts = this.state.alerts.map((a) =>
      a.id === id ? { ...a, status: "RESOLVED" } : a
    );
    this.notify();
  }

  private startLoop() {
    const delay = Math.max(500, 3000 / this.state.speed);
    this.intervalId = setInterval(() => this.tick(), delay);
  }

  private restartLoop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.startLoop();
  }

  private tick() {
    if (this.state.isPaused) return;

    this.tickCount++;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Gradual drift based on scenario
    let targetHsi = this.state.currentState.hydraulicStateIndex;
    switch (this.state.scenario) {
      case "NORMAL":
        targetHsi = Math.max(10, Math.min(18, targetHsi * 0.95 + 12 * 0.05));
        break;
      case "MILD_STRESS":
        targetHsi = Math.max(25, Math.min(38, targetHsi * 0.95 + 34 * 0.05));
        break;
      case "MODERATE_STRESS":
        targetHsi = Math.max(45, Math.min(62, targetHsi * 0.96 + 58 * 0.04));
        break;
      case "SEVERE_STRESS":
        targetHsi = Math.max(70, Math.min(88, targetHsi * 0.96 + 82 * 0.04));
        break;
      case "RECOVERY":
        targetHsi = Math.max(14, targetHsi - 2.5);
        if (targetHsi <= 18) this.state.scenario = "NORMAL";
        break;
      case "ROOT_SIDE_PROBLEM":
        targetHsi = 54.0;
        break;
      case "SENSOR_FAILURE":
      case "RAIN_EVENT":
        // Frozen or masked
        break;
    }

    this.state.currentState = this.computeStateForScenario(
      this.state.scenario,
      now,
      targetHsi
    );
    this.state.forecastData = this.computeForecast(targetHsi);

    // Append to time series
    const newPoint: TimeSeriesPoint = {
      time: timeStr,
      hsi: targetHsi,
      r0Ohms: 1200 + targetHsi * 8.5,
      rinfOhms: 500 + targetHsi * 2.0,
      aeHits: Math.round(2 + (targetHsi > 40 ? (targetHsi - 40) * 1.2 : 0)),
      dendrometerUm: 170.0 - targetHsi * 0.25,
      soilMoisturePct: Math.max(14, 30.0 - (this.tickCount * 0.05)),
      vpdKpa: 1.5 + (targetHsi / 40.0),
      tempGapC: (targetHsi - 35) * 0.06,
    };

    this.state.timeSeries = [...this.state.timeSeries.slice(-23), newPoint];
    this.state.lastSweepTimestamp = now.toISOString();

    // Update active plant summary in plants array
    this.state.plants = this.state.plants.map((p) =>
      p.plantId === this.state.activePlantId
        ? {
            ...p,
            currentHsi: targetHsi,
            riskLevel: this.state.currentState.riskLevel,
            trend: this.state.currentState.trend,
            lastSeen: "Just now",
          }
        : p
    );

    this.notify();
  }

  private recalculateCurrent() {
    let target = 14;
    if (this.state.scenario === "MILD_STRESS") target = 32;
    if (this.state.scenario === "MODERATE_STRESS") target = 56;
    if (this.state.scenario === "SEVERE_STRESS") target = 78;
    if (this.state.scenario === "ROOT_SIDE_PROBLEM") target = 54;
    if (this.state.scenario === "RECOVERY") target = 45;

    this.state.currentState = this.computeStateForScenario(
      this.state.scenario,
      new Date(),
      target
    );
    this.state.forecastData = this.computeForecast(target);
    this.notify();
  }

  private computeStateForScenario(
    scenario: SimulationScenario,
    time: Date,
    hsiVal: number
  ): HydraulicState {
    let qualityStatus: QualityStatus = "GOOD";
    let qualityReason = "All electrode contacts nominal; temperature compensation active.";
    let qualityScore = 0.98;

    if (scenario === "SENSOR_FAILURE") {
      qualityStatus = "BAD";
      qualityReason = "Electrode Pod N1-B detached (contact impedance > 15 kOhm). Stress estimate paused.";
      qualityScore = 0.2;
    } else if (scenario === "RAIN_EVENT") {
      qualityStatus = "BAD";
      qualityReason = "Monsoon bark surface wetting detected (RH 99%). External shunting active.";
      qualityScore = 0.35;
    }

    let riskLevel: RiskLevel = "HEALTHY";
    if (hsiVal > 20) riskLevel = "MILD";
    if (hsiVal > 40) riskLevel = "MODERATE";
    if (hsiVal > 60) riskLevel = "HIGH";
    if (hsiVal > 80) riskLevel = "CRITICAL";

    // Localization
    const isRootProblem = scenario === "ROOT_SIDE_PROBLEM";
    const localization = {
      hasAnomaly: isRootProblem,
      suspectedHeight: isRootProblem ? "N1_N2" : null,
      heightBoundsM: isRootProblem ? ([0.3, 0.8] as [number, number]) : null,
      suspectedSide: isRootProblem ? ("A" as const) : null,
      confidencePct: isRootProblem ? 84.5 : 0,
      description: isRootProblem
        ? "Localized conduction loss detected near lower trunk (0.3 to 0.8 m) on Side A (North)."
        : "Hydraulic conduction is uniform across all monitored segments.",
      kannadaDescription: isRootProblem
        ? "ಮರದ ಕೆಳಭಾಗದ ಕಾಂಡದಲ್ಲಿ (ಉತ್ತರ ಭಾಗ ಎ) ನೀರಿನ ಚಲನೆ ತಡೆಹಿಡಿಯಲ್ಪಟ್ಟಿದೆ."
        : "ಕಾಂಡದ ಎಲ್ಲಾ ಭಾಗಗಳಲ್ಲಿ ನೀರಿನ ಚಲನೆ ಸಮತೋಲನವಾಗಿದೆ.",
    };

    // Signal contributions
    const zElec = Math.max(0.1, (hsiVal / 30.0) + (isRootProblem ? 0.8 : 0));
    const zXfer = Math.max(0.1, (hsiVal / 32.0) + (isRootProblem ? 1.6 : 0));
    const zAe = Math.max(0.0, (hsiVal > 35 ? (hsiVal - 35) / 14.0 : 0.2));
    const zDend = Math.max(0.1, hsiVal / 50.0);
    const zTherm = Math.max(0.1, (hsiVal - 20) / 40.0);
    const zCtx = Math.max(0.1, hsiVal / 45.0);

    const contributions = [
      {
        signalKey: "electrical",
        name: "Stem Bioimpedance",
        weight: 0.3,
        zScore: Number(zElec.toFixed(2)),
        contributionPoints: Number((zElec * 8.5).toFixed(1)),
        status: (zElec > 2 ? "ANOMALOUS" : zElec > 1 ? "ELEVATED" : "NORMAL") as any,
      },
      {
        signalKey: "transfer",
        name: "Transfer Function H(f)",
        weight: 0.2,
        zScore: Number(zXfer.toFixed(2)),
        contributionPoints: Number((zXfer * 7.8).toFixed(1)),
        status: (zXfer > 2 ? "ANOMALOUS" : zXfer > 1 ? "ELEVATED" : "NORMAL") as any,
      },
      {
        signalKey: "acoustic",
        name: "Acoustic Cavitation (PZT)",
        weight: 0.2,
        zScore: Number(zAe.toFixed(2)),
        contributionPoints: Number((zAe * 7.2).toFixed(1)),
        status: (zAe > 2 ? "ANOMALOUS" : zAe > 1 ? "ELEVATED" : "NORMAL") as any,
      },
      {
        signalKey: "dendrometer",
        name: "Micro-Dendrometer",
        weight: 0.1,
        zScore: Number(zDend.toFixed(2)),
        contributionPoints: Number((zDend * 3.4).toFixed(1)),
        status: (zDend > 1.5 ? "ELEVATED" : "NORMAL") as any,
      },
      {
        signalKey: "thermal",
        name: "Canopy Thermal Gap",
        weight: 0.1,
        zScore: Number(zTherm.toFixed(2)),
        contributionPoints: Number((zTherm * 3.1).toFixed(1)),
        status: (zTherm > 1.5 ? "ELEVATED" : "NORMAL") as any,
      },
      {
        signalKey: "context",
        name: "Soil Moisture & VPD",
        weight: 0.1,
        zScore: Number(zCtx.toFixed(2)),
        contributionPoints: Number((zCtx * 2.8).toFixed(1)),
        status: (zCtx > 1.5 ? "ELEVATED" : "NORMAL") as any,
      },
    ];

    let actionEn = "Routine monitoring. Palm hydraulic state is balanced.";
    let actionKn = "ಸಾಮಾನ್ಯ ನಿಗಾ. ಮರದ ನೀರಿನ ಸಮತೋಲನ ಸ್ಥಿರವಾಗಿದೆ.";
    let urgency: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";

    if (hsiVal > 60) {
      actionEn = "Inspect drip lateral in Block B for emitter clogging. Consider 45-minute irrigation after 5:00 PM.";
      actionKn = "ಬ್ಲಾಕ್ ಬಿ ಸಾಲಿನ ಡ್ರಿಪ್ ಪೈಪ್ ಪರಿಶೀಲಿಸಿ. ಸಂಜೆ ೫ ಗಂಟೆಯ ನಂತರ ೪೫ ನಿಮಿಷ ನೀರು ಹಾಯಿಸಿ.";
      urgency = "HIGH";
    } else if (hsiVal > 40) {
      actionEn = "Schedule standard evening irrigation. Stem tissue water content is contracting.";
      actionKn = "ಇಂದು ಸಂಜೆಯ ನಿಗದಿತ ನೀರು ಹಾಯಿಸಿ. ಕಾಂಡದಲ್ಲಿ ನೀರಿನ ಅಂಶ ಕಡಿಮೆಯಾಗುತ್ತಿದೆ.";
      urgency = "MODERATE";
    }

    if (isRootProblem) {
      actionEn = "Check lower trunk (Side A/North) and root collar for mechanical injury or weeping lesions.";
      actionKn = "ಬುಡದ ಉತ್ತರ ಭಾಗದ ಕಾಂಡ ಮತ್ತು ಬೇರುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.";
      urgency = "HIGH";
    }

    return {
      plantId: this.state?.activePlantId || "PALM-001",
      timestamp: time.toISOString(),
      hydraulicStateIndex: Number(hsiVal.toFixed(1)),
      riskLevel,
      confidence: qualityScore * 0.9,
      trend: hsiVal > 50 ? "DETERIORATING" : hsiVal < 25 ? "IMPROVING" : "STABLE",
      isSimulated: true,
      dataQuality: {
        status: qualityStatus,
        score: qualityScore,
        reason: qualityReason,
      },
      stateVariables: {
        hydrationW: Number(Math.max(0.2, 1.0 - hsiVal / 100).toFixed(2)),
        conductanceK: Number(Math.max(0.15, 1.0 - (hsiVal * 1.1) / 100).toFixed(2)),
        embolismE: Number(Math.min(0.9, hsiVal / 110).toFixed(2)),
        recoveryR: Number(Math.max(0.3, 0.95 - hsiVal / 180).toFixed(2)),
      },
      contributions,
      localization,
      explanation: isRootProblem
        ? "Conduction transfer drop (-6.5 dB) isolated to segment N1-N2 on Side A indicates localized vascular resistance near trunk base."
        : `Plant-internal bioimpedance and acoustic cavitation signals reflect ${riskLevel.toLowerCase()} tension while soil moisture remains within typical limits.`,
      recommendation: {
        action: actionEn,
        urgency,
        kannadaAction: actionKn,
      },
    };
  }

  private computeForecast(currentHsi: number): ForecastData {
    return {
      plantId: this.state?.activePlantId || "PALM-001",
      currentHsi,
      scenarios: {
        doNothing: {
          points: {
            "6h": { horizonHours: 6, bestCase: currentHsi + 2, likely: currentHsi + 5, worstCase: currentHsi + 9 },
            "12h": { horizonHours: 12, bestCase: currentHsi + 1, likely: currentHsi + 6, worstCase: currentHsi + 12 },
            "24h": { horizonHours: 24, bestCase: currentHsi + 4, likely: currentHsi + 10, worstCase: currentHsi + 18 },
            "48h": { horizonHours: 48, bestCase: currentHsi + 8, likely: currentHsi + 18, worstCase: currentHsi + 28 },
          },
          summary: "Tension escalates. Cavitation risk increases during peak afternoon VPD.",
          kannadaSummary: "ನೀರು ಹಾಯಿಸದಿದ್ದರೆ ಮಧ್ಯಾಹ್ನದ ವೇಳೆಗೆ ನೀರಿನ ಕೊರತೆ ತೀವ್ರಗೊಳ್ಳುತ್ತದೆ.",
        },
        irrigateNow: {
          points: {
            "6h": { horizonHours: 6, bestCase: Math.max(10, currentHsi - 8), likely: Math.max(15, currentHsi - 5), worstCase: currentHsi },
            "12h": { horizonHours: 12, bestCase: 12, likely: Math.max(15, currentHsi - 18), worstCase: Math.max(20, currentHsi - 10) },
            "24h": { horizonHours: 24, bestCase: 10, likely: 18, worstCase: 24 },
            "48h": { horizonHours: 48, bestCase: 8, likely: 14, worstCase: 20 },
          },
          summary: "Immediate daytime relief, though partial water loss through crown evaporation occurs.",
          kannadaSummary: "ಈಗಲೇ ನೀರು ಹಾಯಿಸಿದರೆ ತಕ್ಷಣದ ಪರಿಹಾರ ದೊರೆಯುತ್ತದೆ.",
        },
        irrigateTonight: {
          points: {
            "6h": { horizonHours: 6, bestCase: currentHsi + 1, likely: currentHsi + 3, worstCase: currentHsi + 6 },
            "12h": { horizonHours: 12, bestCase: 10, likely: 14, worstCase: 20 },
            "24h": { horizonHours: 24, bestCase: 8, likely: 12, worstCase: 18 },
            "48h": { horizonHours: 48, bestCase: 7, likely: 11, worstCase: 16 },
          },
          summary: "Optimal water efficiency: complete overnight vascular refilling with zero heat evaporation loss.",
          kannadaSummary: "ಅತ್ಯುತ್ತಮ ವಿಧಾನ: ರಾತ್ರಿ ನೀರು ಹಾಯಿಸಿದರೆ ಮರವು ಪೂರ್ಣವಾಗಿ ಚೇತರಿಸಿಕೊಳ್ಳುತ್ತದೆ.",
        },
      },
      recommendedRegime: currentHsi > 70 ? "irrigateNow" : "irrigateTonight",
    };
  }

  private generateInitialTimeSeries(): TimeSeriesPoint[] {
    const list: TimeSeriesPoint[] = [];
    const baseHour = 8;
    for (let i = 0; i < 24; i++) {
      const h = (baseHour + i) % 24;
      const timeStr = `${h.toString().padStart(2, "0")}:00`;
      const diurnalFactor = Math.sin((h / 24) * Math.PI * 2 - Math.PI / 2);
      const hsi = Math.max(12, Math.min(68, 38 + diurnalFactor * 26 + (i > 16 ? 10 : 0)));

      list.push({
        time: timeStr,
        hsi: Number(hsi.toFixed(1)),
        r0Ohms: Number((1150 + hsi * 8).toFixed(0)),
        rinfOhms: Number((480 + hsi * 1.8).toFixed(0)),
        aeHits: Math.round(Math.max(1, (hsi - 30) * 0.9)),
        dendrometerUm: Number((170.0 - hsi * 0.22).toFixed(2)),
        soilMoisturePct: Number((28.5 - i * 0.35).toFixed(1)),
        vpdKpa: Number((1.2 + Math.max(0, diurnalFactor * 2.2)).toFixed(2)),
        tempGapC: Number(((hsi - 30) * 0.05).toFixed(1)),
      });
    }
    return list;
  }

  private generateInitialAlerts(): AlertItem[] {
    return [
      {
        id: "ALT-001",
        plantId: "PALM-001",
        timestamp: "12:10 PM",
        type: "LOCALIZED_ANOMALY",
        severity: "WARNING",
        titleEn: "Lower Stem (Side A) Conduction Drop",
        messageEn: "Transfer function H12 on Side A is 2.1 sigma below baseline while Side B remains normal.",
        titleKn: "ಬುಡದ ಕಾಂಡದಲ್ಲಿ (ಉತ್ತರ ಭಾಗ) ನೀರಿನ ಚಲನೆ ಮಂದಗತಿ",
        messageKn: "ಕಾಂಡದ ಎ ಭಾಗದಲ್ಲಿ ನೀರಿನ ಚಲನೆ ಕಡಿಮೆಯಾಗಿದೆ. ಬಿ ಭಾಗವು ಸಹಜವಾಗಿದೆ.",
        causeSignals: ["transfer_function", "acoustic_emission"],
        status: "ACTIVE",
      },
      {
        id: "ALT-002",
        plantId: "PALM-004",
        timestamp: "10:30 AM",
        type: "HYDRAULIC_STRESS",
        severity: "HIGH",
        titleEn: "Moderate Hydraulic Stress Emerging",
        messageEn: "HSI crossed 60 threshold. Elevated acoustic cavitation recorded.",
        titleKn: "ಮಧ್ಯಮ ಪ್ರಮಾಣದ ನೀರಿನ ಅಭಾವ",
        messageKn: "ನೀರಿನ ಒತ್ತಡ ಸೂಚಿ ೬೦ ದಾಟಿದೆ. ಕಾವಿಟೇಶನ್ ಶಬ್ದ ಹೆಚ್ಚಾಗಿದೆ.",
        causeSignals: ["electrical_impedance", "acoustic_emission"],
        status: "ACKNOWLEDGED",
      },
      {
        id: "ALT-003",
        plantId: "PALM-012",
        timestamp: "Yesterday",
        type: "RECOVERY_DETECTED",
        severity: "INFO",
        titleEn: "Post-Irrigation Full Recovery",
        messageEn: "Overnight diameter recovery reached 94% of baseline.",
        titleKn: "ಪೂರ್ಣ ಚೇತರಿಕೆ ದಾಖಲಾಗಿದೆ",
        messageKn: "ರಾತ್ರಿ ನೀರು ಹಾಯಿಸಿದ ನಂತರ ಮರವು ಶೇಕಡಾ ೯೪ ರಷ್ಟು ಚೇತರಿಸಿಕೊಂಡಿದೆ.",
        causeSignals: ["dendrometer"],
        status: "RESOLVED",
      },
    ];
  }

  private generateInitialDevices(): DeviceNode[] {
    return [
      {
        deviceId: "NODE-001",
        plantId: "PALM-001",
        block: "Block A (Sentinel 1)",
        batteryMv: 4120,
        solarMa: 480,
        loraRssi: -82,
        loraSnr: 9.2,
        status: "ONLINE",
        firmwareVersion: "v0.9.4",
        lastSeen: "2 mins ago",
        contactQuality: "GOOD",
      },
      {
        deviceId: "NODE-002",
        plantId: "PALM-002",
        block: "Block A (Sentinel 2)",
        batteryMv: 3980,
        solarMa: 420,
        loraRssi: -88,
        loraSnr: 7.4,
        status: "ONLINE",
        firmwareVersion: "v0.9.4",
        lastSeen: "5 mins ago",
        contactQuality: "GOOD",
      },
      {
        deviceId: "NODE-003",
        plantId: "PALM-003",
        block: "Block B (Sentinel 1)",
        batteryMv: 4050,
        solarMa: 510,
        loraRssi: -79,
        loraSnr: 10.1,
        status: "ONLINE",
        firmwareVersion: "v0.9.4",
        lastSeen: "1 min ago",
        contactQuality: "GOOD",
      },
      {
        deviceId: "NODE-004",
        plantId: "PALM-004",
        block: "Block B (Sentinel 2)",
        batteryMv: 3740,
        solarMa: 150,
        loraRssi: -95,
        loraSnr: 4.8,
        status: "DEGRADED",
        firmwareVersion: "v0.9.3",
        lastSeen: "18 mins ago",
        contactQuality: "WARNING",
      },
    ];
  }

  private generateInitialPlants(): PlantSummary[] {
    return [
      {
        plantId: "PALM-001",
        farmId: "FARM-SHIVAMOGGA-1",
        blockId: "Block A",
        variety: "Mangala",
        ageYears: 12,
        trunkCircumferenceMm: 534,
        currentHsi: 64.2,
        riskLevel: "HIGH",
        trend: "DETERIORATING",
        lastSeen: "Just now",
        isSentinel: true,
        baselineStatus: "ACTIVE",
      },
      {
        plantId: "PALM-002",
        farmId: "FARM-SHIVAMOGGA-1",
        blockId: "Block A",
        variety: "Mangala",
        ageYears: 12,
        trunkCircumferenceMm: 540,
        currentHsi: 16.4,
        riskLevel: "HEALTHY",
        trend: "STABLE",
        lastSeen: "4 mins ago",
        isSentinel: true,
        baselineStatus: "ACTIVE",
      },
      {
        plantId: "PALM-003",
        farmId: "FARM-SHIVAMOGGA-1",
        blockId: "Block B",
        variety: "Sumangala",
        ageYears: 10,
        trunkCircumferenceMm: 512,
        currentHsi: 34.0,
        riskLevel: "MILD",
        trend: "STABLE",
        lastSeen: "1 min ago",
        isSentinel: true,
        baselineStatus: "ACTIVE",
      },
      {
        plantId: "PALM-004",
        farmId: "FARM-SHIVAMOGGA-1",
        blockId: "Block B",
        variety: "Sumangala",
        ageYears: 10,
        trunkCircumferenceMm: 520,
        currentHsi: 58.5,
        riskLevel: "MODERATE",
        trend: "DETERIORATING",
        lastSeen: "8 mins ago",
        isSentinel: true,
        baselineStatus: "ACTIVE",
      },
    ];
  }
}

export const simulationStore = new SimulationManager();
