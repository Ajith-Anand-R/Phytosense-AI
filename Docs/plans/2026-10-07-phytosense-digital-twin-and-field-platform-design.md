# Architectural Specification: PhytoSense AI Digital Twin & Field Platform

**Date:** 2026-10-07  
**Status:** Approved  
**Source Intent:** [ORIGINAL_REQUEST.md](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/ORIGINAL_REQUEST.md)  
**Target TRL Progression:** TRL 3 (Proof of Concept) $\longrightarrow$ TRL 5 (Field-Validated Prototype)  

---

## 1. Problem Statement & Motivation

### The Agricultural & Physiological Context
Arecanut (*Areca catechu*) is a high-value plantation crop spanning over 9.49 lakh hectares across India, with Karnataka alone accounting for 6.76 lakh hectares (producing ~10 lakh tonnes annually valued between ₹39,000 to ₹54,000 per quintal at Shivamogga APMC). Traditional irrigation management relies on fixed calendar rules (175 L per palm every 4–7 days or 16–20 L/day via drip) or point soil moisture probes.

### Critical Limitations of Existing Tools
1. **Wrong Signal:** Soil moisture probes measure water content in a discrete soil pocket, failing to register root uptake impairment, vascular cavitation, or afternoon transpiration tension.
2. **Delayed Visual Symptoms:** Canopy yellowing, frond drooping, and crown nut-drop appear days to weeks after internal hydraulic failure has initiated.
3. **Monocot Anatomy Blindspot:** Unlike dicots (e.g., fruit trees, grapevines), arecanut palms have no secondary cambium ring or concentrated xylem ring; vascular bundles are scattered throughout the fibrous trunk, and mature palms display minimal stem shrinkage ($<50\,\mu\text{m}$).
4. **Drilling Damage:** Commercial stem water potential sensors (e.g., Saturas) require invasive trunk drilling that damages palm vascular integrity and creates pathogen entry vectors.

### The PhytoSense AI Solution
PhytoSense AI introduces **PhytoHydra**: a minimally invasive, multi-band, multi-signal stem monitoring system. By measuring electrical impedance spectroscopy (100 Hz–200 kHz), multi-height electrical transfer functions ($H_{ij}(f)$), ultrasonic acoustic emissions (100–400 kHz cavitation clicks), and micro-dendrometry across 4 heights ($N1$ to $N4$) and 2 trunk sides (A and B), the system learns each palm's diurnal baseline to detect localized hydraulic dysfunction 12–72 hours prior to soil or visual symptoms.

---

## 2. Goals & Explicit Non-Goals

### Primary Goals
- **G1 (Digital Twin Fidelity):** Deliver an end-to-end runnable software platform (Next.js + FastAPI + PostgreSQL) featuring a high-fidelity synthetic sensor simulator implementing Cole relaxation physics, multisine transfer functions, Poisson/Hawkes acoustic emissions, and diurnal context cycles.
- **G2 (Deterministic Intelligence First):** Implement an interpretable, transparent pipeline: Quality Gate $\rightarrow$ Signal Conditioning $\rightarrow$ Cole Fitting & Spectral Features $\rightarrow$ Per-Palm Diurnal Baseline ($z$-scores) $\rightarrow$ Weighted Multimodal Fusion $\rightarrow$ State-Space Hydraulic Estimator ($W, K, E, R$) $\rightarrow$ 0–100 Hydraulic State Index (HSI).
- **G3 (Spatial Localization):** Localize hydraulic resistance increases to specific vertical segments ($N1–N2$, $N2–N3$, $N3–N4$) and azimuthal orientations (Side A vs. Side B), detecting split-root drying or basal dysfunction without declaring unverified disease diagnoses.
- **G4 (Forecasting & Counterfactuals):** Project 6h, 12h, 24h, and 48h HSI trajectories under three operational branches: "Do Nothing", "Irrigate Now", and "Irrigate Tonight".
- **G5 (Strict Data Quality Gating):** Classify all sensor sweeps into `GOOD`, `WARNING`, or `BAD`. Sensor disconnects, electrode polarization jumps, or rain on the trunk must trigger data degradation alerts and never be misdiagnosed as plant stress.
- **G6 (Dual-Persona UX):** Provide a Next.js web application toggling between **Farm Mode** (simplified risk level, actionable irrigation timing, Kannada/English vernacular alerts) and **Research Mode** (Nyquist plots, Bode plots, AE waveform cluster statistics, baseline z-scores, validation ROC metrics).
- **G7 (Clean Hardware Abstraction):** Standardize data ingress behind an abstract `HardwareAdapter` interface, guaranteeing that the simulator can be swapped for V0.2 CSV ingestion, V0.3 Raspberry Pi lab rig, or V0.4 STM32H743 LoRa field nodes without frontend or ML refactoring.

### Explicit Non-Goals (Out of Scope)
- **NG1 (No Pathogen / Disease Diagnosis):** The platform detects and localizes *hydraulic dysfunction*. It does NOT claim to identify *Ganoderma*, *Phytophthora*, or Yellow Leaf Disease. Diagnostic confirmation requires agronomist inspection.
- **NG2 (No Premature Deep Learning):** No multi-layer neural networks or transformers. With 24 seedlings in planned trials, complex models would overfit. The core architecture uses physics-based Cole models and linear state-space estimation.
- **NG3 (No Computer Vision in Node):** PhytoHydra does not include cameras or on-tree image classification.
- **NG4 (No Unverified Agronomic Claims):** All demo outputs and forecasts carry the mandatory disclaimer: `SIMULATION / NOT EXPERIMENTALLY VALIDATED`. Claims of water savings or early detection lead time remain hypotheses until Phase 1/2 trials conclude.

---

## 3. Architecture & System Boundaries

### System Architecture Diagram

```mermaid
graph TD
    subgraph "Sensing Layer (Hardware Abstraction)"
        SIM[Sensor Simulator Engine] -->|Simulated Telemetry| HA[HardwareAdapter]
        CSV[CSV Ground Truth Uploader] -->|Batch Measurements| HA
        RIG[Lab Rig: AD5941 + ADS131M08 + RPi5] -->|MQTT / HTTP| HA
        NODE[PhytoHydra Node: STM32H743 + SX1262] -->|LoRaWAN / 4G Bridge| HA
    end

    subgraph "Ingestion & Validation Layer (FastAPI API Service)"
        HA --> API_INGEST[POST /api/sensors/ingest]
        API_INGEST --> QG[Quality Gate Module]
        QG -->|Bad Contact / Rain / Saturation| ALERT_SYS[Alert & Diagnostics Engine]
        QG -->|Valid Sweep: GOOD / WARNING| SIG_PROC[Signal Processing Engine]
    end

    subgraph "Analytical & ML Pipeline (Python ML Core)"
        SIG_PROC -->|50Hz Notch, Temp Correct, Detrend| COLE_FIT[Cole Model & Spectral Extractor]
        COLE_FIT --> FEAT_ENG[Feature Extraction Engine]
        FEAT_ENG --> BASELINE[Per-Palm Diurnal Baseline Engine]
        BASELINE -->|Z-Score Deviation Matrix| FUSION[Multimodal Weighted Fusion]
        FUSION --> STATE_EST[Hydraulic State Estimator (W, K, E, R)]
        STATE_EST --> HSI_CALC[0-100 Hydraulic State Index Engine]
        HSI_CALC --> LOC_ENG[Spatial Localization Engine]
        HSI_CALC --> FORECAST[24-48h Forward Forecast & Counterfactual]
        FORECAST --> REC_ENG[Explainable Recommendation Engine]
    end

    subgraph "Storage & State Layer (PostgreSQL / Supabase)"
        QG -.-> DB[(PostgreSQL Database)]
        FEAT_ENG -.-> DB
        BASELINE -.-> DB
        HSI_CALC -.-> DB
        ALERT_SYS -.-> DB
    end

    subgraph "Presentation Layer (Next.js 14+ / TypeScript)"
        API_ENDPOINTS[FastAPI REST API /api/plants, /signals, /state] --> DASH[PhytoSense Web Dashboard]
        DASH --> FARM_VIEW[Farm Mode: Simple Stress, Gauges, Actionable Advice]
        DASH --> RES_VIEW[Research Mode: Spectra, Transfer Functions, AE, Z-Scores]
        DASH --> STEM_3D[Stem Localization Visualizer (N1-N4, Side A/B)]
        DASH --> EXP_VIEW[Experiment & Benchmark Validation Screen]
    end
```

### Component Boundaries & Monorepo Structure

```text
/
├── apps/
│   └── web/                   # Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts
├── services/
│   ├── api/                   # FastAPI REST backend, routing, auth, persistence
│   ├── simulator/             # Standalone Python synthetic sensor generator & scenario injector
│   └── ml/                    # Signal processing, Cole fitting, baselines, fusion, state-space
├── packages/
│   ├── shared/                # Shared utilities, constants, formulas (VPD, Cole equations)
│   └── types/                 # TypeScript & Pydantic contract definitions
├── data/
│   ├── simulated/             # Pre-generated scenario datasets (Drought, Root Problem, Sensor Fail)
│   └── schemas/               # PostgreSQL DDL migrations, JSON schemas
├── docs/                      # Comprehensive system documentation
│   └── plans/                 # Architectural specifications, implementation plans, task tracking
├── scripts/                   # Local setup, database seeding, demo execution scripts
├── .env.example               # Environment configuration template
└── README.md                  # Unified developer & researcher setup guide
```

---

## 4. Multi-Lens Architectural Evaluation (Perspective Multiplication)

Before locking component choices, the system architecture was evaluated across four stakeholder lenses:

| Architectural Component | 👤 End-User / Farmer / Agronomist | 🛡️ Security & Field Infrastructure | 📈 Product & Business Value | 🔧 Maintainer & Software Engineer |
| :--- | :--- | :--- | :--- | :--- |
| **Ingestion Protocol** | Fast, reliable updates; vernacular push/SMS alerts in Kannada & English. | Low attack surface; API key authentication on ingestion; TLS encryption. | Low telecom data costs; works seamlessly across poor 2G/4G plantation connectivity. | Unified Pydantic schemas; strict validation; clear payload contracts. |
| **Edge vs. Cloud Division** | Immediate on-tree alerts even if internet drops for 48 hours. | Tamper-proof localized processing; minimal radio transmission window. | Reduced cloud server and database hosting costs. | Clear separation between TinyML/C-firmware and Python cloud analytics. |
| **Model Architecture** | High explainability; reasons for stress alerts are clearly articulated. | Bounded memory consumption; deterministic execution; no infinite loops. | Low barrier to entry; no massive labeled dataset required to deploy V0.1. | Extremely testable; unit testable math; zero black-box neural unpredictability. |
| **Dashboard Interface** | Intuitive visual gauges; simple action prompts; zero cognitive overload. | Role-based access control (Admin vs. Researcher vs. Field Worker). | High investor & grant appeal; showcases scientific rigor without overwhelming farmers. | Reusable shadcn/ui components; centralized state; typed API client. |

---

## 5. Failure-Mode Red Teaming (Inversion & Premortem)

To prevent catastrophic failure in field and simulated operations, the 5 core failure vectors were analyzed and hardened:

```text
       FAILURE VECTOR                         ARCHITECTURAL DEFENSE
┌────────────────────────────┐         ┌──────────────────────────────────────┐
│ 1. Concurrency & Race      │ ──────> │ Idempotent Ingestion by (plant_id,   │
│    Conditions in Telemetry │         │ timestamp, sweep_id); UPSERT queries │
├────────────────────────────┤         ├──────────────────────────────────────┤
│ 2. Sensor Noise & Rain     │ ──────> │ Strict Quality Gate: 10 kHz contact  │
│    Swamping (False Alerts) │         │ impedance checks; trunk wetness flag │
├────────────────────────────┤         ├──────────────────────────────────────┤
│ 3. Baseline Drift from     │ ──────> │ Diurnal (hourly) baseline buckets;   │
│    Seasonal Weather        │         │ rolling 14-day exponential decay     │
├────────────────────────────┤         ├──────────────────────────────────────┤
│ 4. Unbounded Telemetry     │ ──────> │ Edge feature extraction (no raw AE   │
│    Data Ingress            │         │ waveforms sent); time-series rollup  │
├────────────────────────────┤         ├──────────────────────────────────────┤
│ 5. Silent Ingestion or     │ ──────> │ Pydantic schema validation errors;   │
│    Pipeline Crash          │         │ structured JSON logging; alert bus   │
└────────────────────────────┘         └──────────────────────────────────────┘
```

1. **Failure 1: Loose Electrode Classified as Lethal Drought Stress**
   - *Risk:* A monkey or wind shakes Pod N1-A, increasing contact resistance by $10\times$. The model interprets this as severe sapwood dehydration and triggers an emergency irrigation alert.
   - *Defense:* The 10 kHz contact impedance check flags contact impedance $>10\,\text{k}\Omega$ or a $>30\%$ step change between consecutive sweeps. Quality status immediately switches to `BAD (CONTACT_RESISTANCE_JUMP)`. The HSI calculation is frozen for segment N1-A, and a diagnostic hardware maintenance alert is raised.
2. **Failure 2: Monsoon Downpour Flooding Stem Electrodes**
   - *Risk:* Rain trickles down the fibrous trunk bark, creating an external conductive path that drops stem impedance to near zero.
   - *Defense:* Context sensor detects ambient humidity $>95\%$ and rain event trigger; transfer function phase collapses. Quality Gate tags sweep with `RAIN_CONTAMINATION`. Stress calculation switches to holding mode; the system displays: *"Data quality degraded by trunk surface water — stress calculation paused."*
3. **Failure 3: Database Overwhelmed by Raw Acoustic Waveforms**
   - *Risk:* A cavitation burst generates 5,000 acoustic hits/minute sampled at 2 MSPS. Ingesting raw audio crashes the database and exhausts bandwidth.
   - *Defense:* Raw waveforms are processed strictly at the edge (MCU/Simulator). The edge extracts 5 summary metrics per 10-minute window (hit count, total energy, 100–200 kHz cluster fraction, rise time, upper/lower arrival time delta) and discards the raw audio buffer.
4. **Failure 4: Cold Morning Resistivity Shift False Positive**
   - *Risk:* Palm sapwood resistivity naturally increases by ~2% per °C drop. A cold 14°C Western Ghats morning mimics dehydration resistance.
   - *Defense:* Every electrode pod incorporates an integrated PT1000 RTD sensor measuring local stem wood temperature. All impedance measurements are normalized to $25^\circ\text{C}$ reference resistivity before feature extraction.

---

## 6. System Interfaces & Data Contracts

### 6.1 Data Ingestion Contract (`POST /api/sensors/ingest`)

```json
{
  "plant_id": "PALM-001",
  "device_id": "PHYTO-NODE-01",
  "timestamp": "2026-10-07T12:00:00Z",
  "sweep_id": "SWEEP-98234",
  "is_simulated": true,
  "contact_checks": {
    "N1_A": {"impedance_ohms": 450.0, "status": "GOOD"},
    "N1_B": {"impedance_ohms": 480.0, "status": "GOOD"},
    "N2_A": {"impedance_ohms": 510.0, "status": "GOOD"},
    "N2_B": {"impedance_ohms": 490.0, "status": "GOOD"},
    "N3_A": {"impedance_ohms": 530.0, "status": "GOOD"},
    "N3_B": {"impedance_ohms": 520.0, "status": "GOOD"},
    "N4_A": {"impedance_ohms": 560.0, "status": "GOOD"},
    "N4_B": {"impedance_ohms": 550.0, "status": "GOOD"}
  },
  "impedance_spectra": [
    {
      "segment": "N1_N2_A",
      "frequencies": [100.0, 200.0, 500.0, 1000.0, 2000.0, 5000.0, 10000.0, 20000.0, 50000.0, 100000.0, 200000.0],
      "magnitude_ohms": [1420.0, 1380.0, 1310.0, 1220.0, 1100.0, 950.0, 810.0, 720.0, 650.0, 610.0, 590.0],
      "phase_deg": [-4.2, -6.1, -11.5, -18.2, -24.8, -28.1, -26.4, -20.5, -14.2, -9.1, -5.8],
      "stem_temp_c": 26.4
    }
  ],
  "transfer_functions": [
    {
      "channel": "H12_A",
      "frequencies": [50.0, 100.0, 250.0, 500.0, 1000.0, 2000.0, 3500.0, 5000.0],
      "gain_db": [-3.2, -3.5, -4.1, -5.2, -6.8, -8.9, -11.4, -13.6],
      "phase_deg": [-12.0, -18.5, -32.1, -55.0, -82.4, -118.0, -152.0, -178.5],
      "coherence": [0.99, 0.98, 0.99, 0.97, 0.96, 0.94, 0.91, 0.88]
    }
  ],
  "acoustic_events": {
    "sensor_lower": {"hits_per_hour": 14, "total_energy_eu": 320.0, "cluster_100_200khz_pct": 82.5},
    "sensor_upper": {"hits_per_hour": 4, "total_energy_eu": 75.0, "cluster_100_200khz_pct": 65.0},
    "delta_t_mean_us": 42.0
  },
  "dendrometer": {
    "stem_diameter_mm": 170.042,
    "daily_shrink_um": 18.5,
    "overnight_recovery_um": 17.8
  },
  "context": {
    "air_temp_c": 31.8,
    "relative_humidity_pct": 52.0,
    "canopy_temp_c": 33.1,
    "light_lux": 68000.0,
    "soil_moisture_pct": 24.5,
    "time_since_irrigation_h": 46.0
  }
}
```

### 6.2 Hydraulic State Assessment Contract (`GET /api/plants/{plant_id}/state`)

```json
{
  "plant_id": "PALM-001",
  "timestamp": "2026-10-07T12:00:00Z",
  "hydraulic_state_index": 67.4,
  "risk_level": "HIGH",
  "confidence": 0.86,
  "trend": "DETERIORATING",
  "is_simulated": true,
  "validation_disclaimer": "SIMULATION / NOT EXPERIMENTALLY VALIDATED",
  "data_quality": {
    "status": "GOOD",
    "score": 0.95,
    "reason": "All electrode contacts nominal; temperature compensation active."
  },
  "state_variables": {
    "stem_hydration_w": 0.62,
    "hydraulic_conductance_k": 0.58,
    "embolism_load_e": 0.44,
    "recovery_capacity_r": 0.72
  },
  "signal_contributions": [
    {"signal": "electrical_impedance", "weight": 0.30, "z_score": 2.45, "contribution_points": 21.5},
    {"signal": "transfer_function", "weight": 0.20, "z_score": 2.10, "contribution_points": 16.2},
    {"signal": "acoustic_emission", "weight": 0.20, "z_score": 2.80, "contribution_points": 18.4},
    {"signal": "dendrometer", "weight": 0.10, "z_score": 0.65, "contribution_points": 4.1},
    {"signal": "thermal_canopy_gap", "weight": 0.10, "z_score": 1.10, "contribution_points": 4.8},
    {"signal": "soil_and_vpd_context", "weight": 0.10, "z_score": 0.85, "contribution_points": 2.4}
  ],
  "localization": {
    "has_anomaly": true,
    "suspected_height": "N1_N2",
    "height_bounds_m": [0.3, 0.8],
    "suspected_side": "A",
    "confidence_pct": 78.5,
    "description": "Possible localized hydraulic dysfunction detected near lower trunk (0.3 to 0.8 m) on Side A."
  },
  "explanation": "Multiple plant-level signals indicate escalating hydraulic stress: electrical transfer conduction has dropped by 2.1 sigma along lower Side A, corroborated by elevated acoustic cavitation events, while soil moisture (24.5%) remains within normal range.",
  "recommendation": {
    "action": "Inspect drip lateral feeding Block B for blockages. Consider 45-minute irrigation after 5:00 PM.",
    "urgency": "MODERATE_HIGH",
    "kannada_summary": "ಬ್ಲಾಕ್ ಬಿ ಸಾಲಿನ ಮರಗಳಲ್ಲಿ ನೀರಿನ ಕೊರತೆಯ ಲಕ್ಷಣ ಕಂಡುಬಂದಿದೆ. ಡ್ರಿಪ್ ಪೈಪ್ ಪರಿಶೀಲಿಸಿ, ಸಂಜೆ 5 ಗಂಟೆಯ ನಂತರ ನೀರು ಹಾಯಿಸಿ."
  }
}
```

---

## 7. Delivery Milestones & Verification Strategy

| Milestone | Deliverable | Verification Gate |
| :--- | :--- | :--- |
| **M1: Architecture & Data Schemas** | Monorepo layout, Pydantic schemas, PostgreSQL DDL migrations | Schema validation tests pass; PostgreSQL migration runs clean. |
| **M2: Sensor Simulator Engine** | Synthetic multi-sensor generator with 8 operational scenarios | Unit tests verify Cole model curves, Hawkes burst counts, VPD formulas. |
| **M3: Quality Gate & Preprocessing** | 10 kHz contact check, notch filter, temp correction, Cole fitting | Tests verify bad contacts and rain flags drop sweeps into `BAD` status without stress alerts. |
| **M4: Baseline & Multimodal Fusion** | Diurnal baseline engine, z-score matrix, state-space tracker, HSI | Baseline z-scores match expected distributions; HSI bounded strictly between 0 and 100. |
| **M5: Forecasting & Recommendations** | 24–48h forward projector, irrigation counterfactuals, alert engine | Best/likely/worst trajectories correctly branch upon simulated irrigation injection. |
| **M6: Web Dashboard & UX** | Next.js app with Farm Mode, Research Mode, 3D Stem Visualizer | Browser rendering verified; mandatory unvalidated banner confirmed visible. |
| **M7: Research Validation & Benchmarks**| CSV upload, ground truth correlation view, lead-time metrics | Seedling trial mock CSV imports cleanly; target lead-time cards render correctly. |
| **M8: Hardware Adapter & End-to-End** | `HardwareAdapter` interface, complete local demo flow verified | Automated E2E test runs scenario: Healthy $\rightarrow$ Drought $\rightarrow$ HSI Rise $\rightarrow$ Alert $\rightarrow$ Irrigate $\rightarrow$ Recovery. |
