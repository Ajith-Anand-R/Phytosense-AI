// apps/web/src/lib/translations.ts
// Bilingual English & Kannada (ಕನ್ನಡ) strings for PhytoSense AI

export type Language = "en" | "kn";

export const translations = {
  en: {
    appName: "PHY TOSENSE AI",
    appSubtitle: "Plant Hydraulic Intelligence",
    simulationBanner: "SIMULATION MODE — NOT EXPERIMENTALLY VALIDATED (TRL 3 PROTOTYPE)",
    simulationTooltip: "Data shown is generated via synthetic biophysical simulation models. Sensor hardware and clinical field validation are in development under the GENESIS EIR project.",
    
    // Navigation
    navOverview: "Overview",
    navPlants: "Plants Fleet",
    navMonitoring: "Live Telemetry",
    navForecast: "Forecast & Scenarios",
    navAlerts: "Alerts Center",
    navExperiments: "Research & Trials",
    navDevices: "Hardware & Devices",
    navSettings: "Settings",

    // Persona Modes
    farmMode: "Farm Mode",
    researchMode: "Research Mode",
    farmModeDesc: "Simplified view for growers: risk levels, action recommendations, and vernacular alerts.",
    researchModeDesc: "Scientific view: Cole Nyquist arcs, transfer functions, acoustic clusters, and z-score matrices.",

    // Summary Metrics
    totalPlants: "Monitored Palms",
    healthyCount: "Healthy",
    mildCount: "Mild Stress",
    moderateCount: "Moderate",
    highCount: "High Stress",
    criticalCount: "Critical",
    onlineNodes: "Online Nodes",

    // HSI Gauge
    hsiTitle: "HYDRAULIC STATE INDEX",
    hsiRange: "0 to 100 Scale",
    healthy: "HEALTHY",
    mild: "MILD STRESS",
    moderate: "MODERATE STRESS",
    high: "HIGH STRESS",
    critical: "CRITICAL STRESS",
    confidence: "Confidence",
    trend: "Trend",
    trendImproving: "Improving / Refilling",
    trendStable: "Stable Diurnal Cycle",
    trendDeteriorating: "Deteriorating Tension",

    // Stem Localization
    stemProfileTitle: "STEM HYDRAULIC CONDUCTION PROFILE",
    sideA: "Side A (North)",
    sideB: "Side B (South)",
    heightN4: "N4 (1.8 m)",
    heightN3: "N3 (1.3 m)",
    heightN2: "N2 (0.8 m)",
    heightN1: "N1 (0.3 m)",
    ground: "Base / Soil Level",
    conductionNominal: "Nominal Conduction",
    conductionWarning: "Mild Attenuation",
    conductionAnomaly: "Severe Conduction Loss",

    // Signal Contributions
    contributionsTitle: "MULTIMODAL EVIDENCE DECOMPOSITION",
    contributionsSubtitle: "Contribution of each plant & environmental signal to the HSI score",
    signalElectrical: "Stem Bioimpedance (100 Hz - 200 kHz)",
    signalTransfer: "Multi-Height Transfer Function H(f)",
    signalAcoustic: "Ultrasonic Acoustic Cavitation (PZT)",
    signalDendrometer: "Micro-Dendrometer Shrink/Swell",
    signalThermal: "Canopy-Air Thermal Gap (IR)",
    signalContext: "Soil Moisture (30 cm) & VPD",

    // Actions & Recommendations
    recommendedActionTitle: "ACTIONABLE FIELD ADVISORY",
    urgencyHigh: "HIGH URGENCY",
    urgencyModerate: "SCHEDULED ACTION",
    urgencyLow: "ROUTINE MONITORING",
    triggerIrrigation: "Irrigate Now (40 L)",
    irrigateTonight: "Schedule Tonight",
    dripLineCheck: "Inspect Drip Line",

    // Scenarios
    scenarioTitle: "Active Simulation Scenario",
    scenarioNormal: "Normal Diurnal Rhythm",
    scenarioMild: "Mild Afternoon Dehydration",
    scenarioModerate: "Moderate Water Deficit",
    scenarioSevere: "Severe Vascular Drought",
    scenarioRecovery: "Post-Irrigation Recovery",
    scenarioRootProblem: "Lower Stem (Side A) Dysfunction",
    scenarioSensorFail: "Electrode Detachment Fault",
    scenarioRain: "Monsoon Bark Wetting",

    // Quality Gate
    dataQualityGood: "Nominal Data Quality",
    dataQualityWarning: "Minor Drift / Low Noise",
    dataQualityBad: "Data Quality Degraded — Stress Paused",

    // Ground Truth
    groundTruthTitle: "24-Seedling Research Validation",
    targetVsActual: "Target Benchmark vs. Current Trial",
    leadTimeSoil: "Lead Time vs. Soil Moisture",
    leadTimeWilting: "Lead Time vs. Visible Wilting",
    detectionRate: "Stress Detection Sensitivity",
    falseAlarmRate: "False Alarm Rate",
  },

  kn: {
    appName: "ಫೈಟೋಸೆನ್ಸ್ ಎಐ",
    appSubtitle: "ಅಡಿಕೆ ಮರದ ನೀರಿನ ಸಮತೋಲನ ಬುದ್ಧಿಮತ್ತೆ",
    simulationBanner: "ಸಿಮ್ಯುಲೇಶನ್ ಮೋಡ್ — ಪ್ರಾಯೋಗಿಕವಾಗಿ ಇನ್ನೂ ದೃಢಪಟ್ಟಿಲ್ಲ (TRL 3 ಮಾದರಿ)",
    simulationTooltip: "ಈ ಮಾಹಿತಿಯು ಕಂಪ್ಯೂಟರ್ ಆಧಾರಿತ ಗಣಿತದ ಮಾದರಿಯಾಗಿದೆ. ತೋಟದ ನೈಜ ಪರೀಕ್ಷೆಗಳು ಪ್ರಗತಿಯಲ್ಲಿವೆ.",

    // Navigation
    navOverview: "ಮುಖ್ಯ ಪುಟ",
    navPlants: "ಮರಗಳ ಪಟ್ಟಿ",
    navMonitoring: "ಲೈವ್ ತಪಾಸಣೆ",
    navForecast: "ಮುನ್ಸೂಚನೆ & ಯೋಜನೆ",
    navAlerts: "ಎಚ್ಚರಿಕೆಗಳು",
    navExperiments: "ಸಂಶೋಧನೆ & ಪರೀಕ್ಷೆ",
    navDevices: "ಸೆನ್ಸರ್ ಸಾಧನಗಳು",
    navSettings: "ಸೆಟ್ಟಿಂಗ್ಸ್",

    // Persona Modes
    farmMode: "ರೈತರ ನೋಟ",
    researchMode: "ವಿಜ್ಞಾನಿಗಳ ನೋಟ",
    farmModeDesc: "ರೈತರಿಗಾಗಿ ಸರಳ ಮಾಹಿತಿ: ನೀರಿನ ಒತ್ತಡ ಮಟ್ಟ, ನೀರು ಹಾಯಿಸುವ ಸಲಹೆಗಳು.",
    researchModeDesc: "ವಿಜ್ಞಾನಿಗಳಿಗಾಗಿ ಆಳವಾದ ವಿಶ್ಲೇಷಣೆ: ವಿದ್ಯುತ್ ತರಂಗಗಳು ಮತ್ತು ಅಕೌಸ್ಟಿಕ್ ಸಿಗ್ನಲ್‌ಗಳು.",

    // Summary Metrics
    totalPlants: "ತಪಾಸಣೆಯಲ್ಲಿರುವ ಮರಗಳು",
    healthyCount: "ಆರೋಗ್ಯಕರ",
    mildCount: "ಸ್ವಲ್ಪ ಒತ್ತಡ",
    moderateCount: "ಮಧ್ಯಮ ಒತ್ತಡ",
    highCount: "ಹೆಚ್ಚು ಒತ್ತಡ",
    criticalCount: "ಗಂಭೀರ ಸ್ಥಿತಿ",
    onlineNodes: "ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಸಾಧನಗಳು",

    // HSI Gauge
    hsiTitle: "ನೀರಿನ ಒತ್ತಡ ಸೂಚ್ಯಂಕ (HSI)",
    hsiRange: "೦ ರಿಂದ ೧೦೦ ಪ್ರಮಾಣ",
    healthy: "ಆರೋಗ್ಯಕರ",
    mild: "ಸ್ವಲ್ಪ ಕೊರತೆ",
    moderate: "ಮಧ್ಯಮ ಒತ್ತಡ",
    high: "ಹೆಚ್ಚಿನ ಕೊರತೆ",
    critical: "ತೀವ್ರ ತುರ್ತು ಸ್ಥಿತಿ",
    confidence: "ನಿಖರತೆ",
    trend: "ಬದಲಾವಣೆ ಗತಿ",
    trendImproving: "ಚೇತರಿಸಿಕೊಳ್ಳುತ್ತಿದೆ",
    trendStable: "ಸ್ಥಿರವಾಗಿದೆ",
    trendDeteriorating: "ಒತ್ತಡ ಹೆಚ್ಚುತ್ತಿದೆ",

    // Stem Localization
    stemProfileTitle: "ಕಾಂಡದಲ್ಲಿ ನೀರಿನ ಚಲನೆಯ ಸ್ಥಿತಿ",
    sideA: "ಉತ್ತರ ಭಾಗ (ಎ)",
    sideB: "ದಕ್ಷಿಣ ಭಾಗ (ಬಿ)",
    heightN4: "ಎನ್೪ (೧.೮ ಮೀಟರ್)",
    heightN3: "ಎನ್೩ (೧.೩ ಮೀಟರ್)",
    heightN2: "ಎನ್೨ (೦.೮ ಮೀಟರ್)",
    heightN1: "ಎನ್೧ (೦.೩ ಮೀಟರ್ - ಬುಡ)",
    ground: "ಮರದ ಬುಡ / ಮಣ್ಣಿನ ಮಟ್ಟ",
    conductionNominal: "ಸಹಜ ನೀರಿನ ಚಲನೆ",
    conductionWarning: "ಸ್ವಲ್ಪ ಮಂದಗತಿ",
    conductionAnomaly: "ನೀರಿನ ಚಲನೆ ತಡೆಹಿಡಿಯಲ್ಪಟ್ಟಿದೆ",

    // Signal Contributions
    contributionsTitle: "ವಿವಿಧ ಸೆನ್ಸರ್‌ಗಳ ಪಾಲು",
    contributionsSubtitle: "ಒಟ್ಟಾರೆ ಒತ್ತಡಕ್ಕೆ ಕಾರಣವಾದ ಸಿಗ್ನಲ್‌ಗಳ ವಿವರ",
    signalElectrical: "ಕಾಂಡದ ವಿದ್ಯುತ್ ಪ್ರತಿರೋಧ (Bioimpedance)",
    signalTransfer: "ಎತ್ತರದ ನಡುವಿನ ವಿದ್ಯುತ್ ಚಲನೆ H(f)",
    signalAcoustic: "ಕಾವಿಟೇಶನ್ ಶಬ್ದ ತರಂಗಗಳು (Acoustic)",
    signalDendrometer: "ಕಾಂಡದ ದಪ್ಪ ಕುಗ್ಗುವಿಕೆ (Dendrometer)",
    signalThermal: "ಎಲೆ ಮತ್ತು ಗಾಳಿಯ ಉಷ್ಣತೆಯ ವ್ಯತ್ಯಾಸ",
    signalContext: "ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಹವಮಾನ",

    // Actions & Recommendations
    recommendedActionTitle: "ರೈತರಿಗೆ ಸಲಹೆ",
    urgencyHigh: "ತಕ್ಷಣದ ಕ್ರಮ",
    urgencyModerate: "ಯೋಜಿತ ಕ್ರಮ",
    urgencyLow: "ಸಾಮಾನ್ಯ ನಿಗಾ",
    triggerIrrigation: "ಈಗಲೇ ನೀರು ಹಾಯಿಸಿ (೪೦ ಲೀಟರ್)",
    irrigateTonight: "ಇಂದು ಸಂಜೆ ನೀರು ಹಾಯಿಸಿ",
    dripLineCheck: "ಡ್ರಿಪ್ ಪೈಪ್ ಪರಿಶೀಲಿಸಿ",

    // Scenarios
    scenarioTitle: "ಪರೀಕ್ಷಾರ್ಥ ಸನ್ನಿವೇಶ",
    scenarioNormal: "ಸಾಮಾನ್ಯ ಆರೋಗ್ಯಕರ ಸ್ಥಿತಿ",
    scenarioMild: "ಮಧ್ಯಾಹ್ನದ ಸ್ವಲ್ಪ ನೀರಿನ ಕೊರತೆ",
    scenarioModerate: "ಮಧ್ಯಮ ಪ್ರಮಾಣದ ನೀರಿನ ಅಭಾವ",
    scenarioSevere: "ತೀವ್ರ ನೀರಿನ ಬರ",
    scenarioRecovery: "ನೀರು ಹಾಯಿಸಿದ ನಂತರದ ಚೇತರಿಕೆ",
    scenarioRootProblem: "ಬುಡದ ಒಂದು ಬದಿಯಲ್ಲಿ ತೊಂದರೆ",
    scenarioSensorFail: "ಸೆನ್ಸರ್ ಪಿನ್ ಸಡಿಲಗೊಂಡಿದೆ",
    scenarioRain: "ಮಳೆಯಿಂದ ನೆನೆದ ಮರದ ತೊಗಟೆ",

    // Quality Gate
    dataQualityGood: "ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಡೇಟಾ",
    dataQualityWarning: "ಸ್ವಲ್ಪ ಅಡಚಣೆ",
    dataQualityBad: "ದೋಷಪೂರಿತ ಡೇಟಾ — ಲೆಕ್ಕಾಚಾರ ಸ್ಥಗಿತ",

    // Ground Truth
    groundTruthTitle: "೨೪ ಸಸಿಗಳ ಸಂಶೋಧನಾ ಪರೀಕ್ಷೆ",
    targetVsActual: "ನಿರೀಕ್ಷಿತ ಗುರಿ ಮತ್ತು ಪ್ರಸ್ತುತ ಫಲಿತಾಂಶ",
    leadTimeSoil: "ಮಣ್ಣಿನ ಸೆನ್ಸರ್‌ಗಿಂತ ಎಷ್ಟು ಮುಂಚಿತ",
    leadTimeWilting: "ಎಲೆ ಬಾಡುವ ಮುನ್ನ ಎಷ್ಟು ಮುಂಚಿತ",
    detectionRate: "ಕೊರತೆ ಗುರುತಿಸುವ ಸಾಮರ್ಥ್ಯ",
    falseAlarmRate: "ಸುಳ್ಳು ಎಚ್ಚರಿಕೆಗಳ ಪ್ರಮಾಣ",
  }
};
