# PhytoSense AI / PhytoHydra: Digital Twin & Field Platform

> **Plant Hydraulic Intelligence Platform for Arecanut Palms (*Areca catechu*)**  
> *TRL 3 Research Prototype & Software Digital Twin*

```text
┌────────────────────────────────────────────────────────────────────────┐
│ PHYTOSENSE AI                     SIMULATION MODE                      │
│ Plant Hydraulic Intelligence       NOT EXPERIMENTALLY VALIDATED (TRL 3)│
├────────────────────────────────────────────────────────────────────────┤
│ • 4 Stem Bands (N1–N4)  • 8 Electrode Pods (Sides A & B)               │
│ • Cole Bioimpedance     • Multisine Transfer H(f)   • PZT Cavitation   │
│ • Micro-Dendrometry     • Per-Palm Diurnal Baseline • 0–100 HSI Index  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. What is PhytoSense AI & PhytoHydra?

**PhytoSense AI** is a plant-centric physiological monitoring platform designed to detect internal water stress in arecanut palms days before visible symptoms appear. 

Today, plantation growers irrigate using fixed calendar rules or single-point soil moisture probes. However, soil moisture only indicates water presence in one soil pocket—it does not indicate whether palm roots are actively taking that water up, whether sapwood conduits are under destructive tension, or whether cavitation has occurred.

**PhytoHydra** is the stem-mounted sensor node. Instead of drilling invasive probes into the monocot trunk, PhytoHydra straps four flexible bands ($N1$ to $N4$) carrying eight titanium micro-pin electrode pods across two opposing trunk sides (Sides A and B), two ultrasonic acoustic sentinels, an invar micro-dendrometer, and canopy/context sensors. The system learns each palm's healthy diurnal baseline and computes a 0–100 **Hydraulic State Index (HSI)** with spatial localization along the trunk.

> [!CAUTION]
> **SCIENTIFIC HONESTY MANDATE:**  
> This software prototype operates on a biophysical **Sensor Simulator**. Every chart, prediction, and forecast is visibly marked with:  
> **`SIMULATION / NOT EXPERIMENTALLY VALIDATED`**  
> Early-detection lead times ($\ge 12$h earlier than soil moisture) and water savings (20–30%) are research hypotheses under validation in planned 24-seedling trials.

---

## 2. System Architecture & Monorepo Layout

The repository is organized as a clean, modular monorepo:

```text
/
├── apps/
│   └── web/                   # Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts
├── services/
│   ├── api/                   # FastAPI backend, routing, authentication, Supabase persistence
│   ├── simulator/             # Biophysical synthetic multi-sensor generator (Cole, Hawkes AE, VPD)
│   └── ml/                    # Quality Gate, Cole fitting, Diurnal Baselines, Fusion, HSI, Forecasting
├── packages/
│   ├── shared/                # Universal formulas (VPD, Cole equations, unit conversions)
│   └── types/                 # Pydantic schemas and TypeScript type definitions
├── data/
│   ├── simulated/             # Benchmark scenario datasets (Drought, Root-Side, Sensor Fail)
│   └── schemas/               # PostgreSQL DDL migrations and seed files
├── docs/                      # Complete technical and physiological documentation suite
│   ├── 00_index.md            # Documentation Map & Executive Summary
│   ├── 01_system_architecture.md
│   ├── 02_sensor_simulator_specification.md
│   ├── 03_signal_processing_and_quality_gate.md
│   ├── 04_feature_extraction_and_baseline_engine.md
│   ├── 05_multimodal_fusion_and_hydraulic_state_model.md
│   ├── 06_forecasting_and_recommendation_engine.md
│   ├── 07_web_dashboard_and_ux_specification.md
│   ├── 08_data_schemas_and_api_contracts.md
│   ├── 09_hardware_progression_and_adapter_interface.md
│   ├── 10_research_validation_and_ground_truth_protocol.md
│   └── plans/                 # Architectural design specs & TDD implementation plans
├── scripts/                   # Local orchestration, database seeding & simulation runners
├── .env.example               # Environment variables template
├── ORIGINAL_REQUEST.md        # Formal user requirements contract
└── README.md                  # This file
```

---

## 3. How the AI Pipeline Works

PhytoSense AI prioritizes **deterministic, interpretable physics-informed modeling** over premature deep neural networks:

```text
Raw Ingested Sweep
       │
       ▼
┌─────────────────────────┐
│   Sensor Quality Gate   │ ──> Drop bad contact (>8 kΩ), rain shunting, or drift
└──────────┬──────────────┘
           │ (GOOD / WARNING status only)
           ▼
┌─────────────────────────┐
│   Signal Conditioning   │ ──> 50 Hz notch filter, PT1000 temp correction (+2%/°C)
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   Feature Extraction    │ ──> Cole fit (R0, Rinf, alpha, fc), H(f) gain, AE hit clusters
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   Per-Palm Baseline     │ ──> 7-14 day diurnal μ, σ per hour/sensor -> z = (x - μ) / σ
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│    Multimodal Fusion    │ ──> Weighted fusion: Elec 30%, Xfer 20%, AE 20%, Dend 10%, Context 20%
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Hydraulic State Space  │ ──> Tracks W (Hydration), K (Conductance), E (Embolism), R (Refill)
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   0–100 HSI & Forecast  │ ──> 0-20 Healthy | 21-40 Mild | 41-60 Moderate | 61-80 High | 81-100 Critical
└──────────┬──────────────┘
           │
     ┌─────┴──────────────────┐
     ▼                        ▼
Spatial Localization     24–48h Forecast & Counterfactuals
(N1–N4, Side A vs. B)    (Do Nothing vs. Irrigate Now vs. Irrigate Tonight)
```

---

## 4. Quickstart: Local Setup & Running

### Prerequisites
- Node.js 18+ and pnpm / npm
- Python 3.11+
- PostgreSQL or Supabase instance

### 1. Configure Environment
```bash
cp .env.example .env
```

### 2. Run Backend & Simulator
```bash
cd services/api
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 3. Run Web Dashboard
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:3000` to access the PhytoSense dashboard.

---

## 5. Interactive Demo Scenarios

The simulator includes automated demonstration scenarios executable via API or UI floating controls:
1. **Scenario 1 (Drought Stress & Recovery):**
   - 08:00: Healthy baseline
   - 10:00: VPD increases
   - 11:00: Stem electrical impedance rises
   - 12:00: Acoustic cavitation hits increase
   - 12:30: Conduction transfer function drops
   - 13:00: HSI reaches 64 (Warning Alert dispatched)
   - 15:00: Irrigation event triggered
   - 18:00: HSI returns to healthy baseline ($<20$)
2. **Scenario 2 (Root-Side Localization):**
   - Injects localized conduction loss at Band $N1–N2$ on Side A (North).
   - Side B (South) remains normal.
   - Dashboard flags: *"Possible localized dysfunction: Lower Trunk (0.3–0.8 m), Side A"*.
3. **Scenario 3 (Sensor Failure Defense):**
   - Injects detached pin ($>15\,\text{k}\Omega$) or rain-wetted bark.
   - Quality Gate flags `BAD` status.
   - Dashboard displays *"Data quality degraded — stress calculation paused"*, verifying hardware faults are never misdiagnosed as drought stress.

---

## 6. Hardware Progression Roadmap

| Version | Status | Sensor Source | Target Milestone |
| :--- | :--- | :--- | :--- |
| **V0.1** | **Current** | Python Biophysical Simulator | Complete runnable software digital twin |
| **V0.2** | Months 1–3 | CSV Ground Truth Import | Benchtop electrode stability tests on cut trunks |
| **V0.3** | Months 2–4 | Lab Rig: AD5941 + ADS131M08 + RPi 5 | 24-seedling controlled trial in 50 L pots |
| **V0.4** | Months 5–12| PhytoHydra v1 Node (STM32H743 + SX1262 LoRa) | 10 field nodes in Karnataka plantation pilot |

---

## 7. Documentation Index

For deep technical specifications, consult the documents in [`docs/`](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/):
- [00. Documentation Map](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/00_index.md)
- [01. System Architecture](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/01_system_architecture.md)
- [02. Sensor Simulator Specification](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/02_sensor_simulator_specification.md)
- [03. Signal Processing & Quality Gate](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/03_signal_processing_and_quality_gate.md)
- [04. Feature Extraction & Baseline Engine](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/04_feature_extraction_and_baseline_engine.md)
- [05. Multimodal Fusion & Hydraulic State Model](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/05_multimodal_fusion_and_hydraulic_state_model.md)
- [06. Forecasting & Recommendation Engine](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/06_forecasting_and_recommendation_engine.md)
- [07. Web Dashboard & UX Specification](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/07_web_dashboard_and_ux_specification.md)
- [08. Data Schemas & API Contracts](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/08_data_schemas_and_api_contracts.md)
- [09. Hardware Progression & Adapter Interface](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/09_hardware_progression_and_adapter_interface.md)
- [10. Research Validation & Ground Truth Protocol](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/10_research_validation_and_ground_truth_protocol.md)
- [Implementation Plan](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/plans/2026-10-07-phytosense-implementation-plan.md)
- [Task Tracker](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/plans/task.md)
