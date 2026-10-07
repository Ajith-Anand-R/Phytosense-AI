// apps/web/src/types/index.ts
// Comprehensive TypeScript types for PhytoSense AI & PhytoHydra

export type QualityStatus = "GOOD" | "WARNING" | "BAD";

export type RiskLevel = "HEALTHY" | "MILD" | "MODERATE" | "HIGH" | "CRITICAL";

export type TrendDirection = "IMPROVING" | "STABLE" | "DETERIORATING";

export type AlertSeverity = "INFO" | "WARNING" | "HIGH" | "CRITICAL";

export type SimulationScenario =
  | "NORMAL"
  | "MILD_STRESS"
  | "MODERATE_STRESS"
  | "SEVERE_STRESS"
  | "RECOVERY"
  | "ROOT_SIDE_PROBLEM"
  | "SENSOR_FAILURE"
  | "RAIN_EVENT"
  | "HEAT_WAVE"
  | "WATERLOGGING";

export interface ContactCheck {
  impedanceOhms: number;
  status: QualityStatus;
}

export interface ImpedanceSpectrum {
  segment: string;
  frequencies: number[];
  magnitudeOhms: number[];
  phaseDeg: number[];
  stemTempC: number;
  r0Fitted?: number;
  rinfFitted?: number;
  alphaFitted?: number;
  fcHzFitted?: number;
}

export interface TransferFunction {
  channel: string;
  frequencies: number[];
  gainDb: number[];
  phaseDeg: number[];
  coherence: number[];
}

export interface AcousticSummary {
  sensorLower: {
    hitsPerHour: number;
    totalEnergyEu: number;
    cluster100200khzPct: number;
  };
  sensorUpper: {
    hitsPerHour: number;
    totalEnergyEu: number;
    cluster100200khzPct: number;
  };
  deltaTMeanUs: number;
}

export interface DendrometerReading {
  stemDiameterMm: number;
  dailyShrinkUm: number;
  overnightRecoveryUm: number;
  overnightRecoveryPct: number;
}

export interface ContextReading {
  airTempC: number;
  relativeHumidityPct: number;
  vpdKpa: number;
  canopyTempC: number;
  lightLux: number;
  soilMoisturePct: number;
  timeSinceIrrigationH: number;
}

export interface SignalContribution {
  signalKey: string;
  name: string;
  weight: number;
  zScore: number;
  contributionPoints: number;
  status: "NORMAL" | "ELEVATED" | "ANOMALOUS";
}

export interface LocalizationResult {
  hasAnomaly: boolean;
  suspectedHeight: string | null; // "N1_N2", "N2_N3", "N3_N4"
  heightBoundsM: [number, number] | null;
  suspectedSide: "A" | "B" | null;
  confidencePct: number;
  description: string;
  kannadaDescription?: string;
}

export interface HydraulicState {
  plantId: string;
  timestamp: string;
  hydraulicStateIndex: number; // 0 - 100
  riskLevel: RiskLevel;
  confidence: number;
  trend: TrendDirection;
  isSimulated: boolean;
  dataQuality: {
    status: QualityStatus;
    score: number;
    reason: string;
  };
  stateVariables: {
    hydrationW: number;
    conductanceK: number;
    embolismE: number;
    recoveryR: number;
  };
  contributions: SignalContribution[];
  localization: LocalizationResult;
  explanation: string;
  recommendation: {
    action: string;
    urgency: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    kannadaAction: string;
  };
}

export interface ForecastPoint {
  horizonHours: number;
  bestCase: number;
  likely: number;
  worstCase: number;
}

export interface ForecastScenario {
  points: Record<string, ForecastPoint>; // "6h", "12h", "24h", "48h"
  summary: string;
  kannadaSummary: string;
}

export interface ForecastData {
  plantId: string;
  currentHsi: number;
  scenarios: {
    doNothing: ForecastScenario;
    irrigateNow: ForecastScenario;
    irrigateTonight: ForecastScenario;
  };
  recommendedRegime: "doNothing" | "irrigateNow" | "irrigateTonight";
}

export interface AlertItem {
  id: string;
  plantId: string;
  timestamp: string;
  type: string;
  severity: AlertSeverity;
  titleEn: string;
  messageEn: string;
  titleKn: string;
  messageKn: string;
  causeSignals: string[];
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
}

export interface DeviceNode {
  deviceId: string;
  plantId: string;
  block: string;
  batteryMv: number;
  solarMa: number;
  loraRssi: number;
  loraSnr: number;
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  firmwareVersion: string;
  lastSeen: string;
  contactQuality: QualityStatus;
}

export interface PlantSummary {
  plantId: string;
  farmId: string;
  blockId: string;
  variety: string;
  ageYears: number;
  trunkCircumferenceMm: number;
  currentHsi: number;
  riskLevel: RiskLevel;
  trend: TrendDirection;
  lastSeen: string;
  isSentinel: boolean;
  baselineStatus: "LEARNING" | "ACTIVE" | "DEGRADED";
}
