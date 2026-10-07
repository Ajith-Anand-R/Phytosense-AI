# Implementation Task Tracker: PhytoSense AI Digital Twin & Field Platform

> **Status:** Active Planning & Specification  
> **Target Framework:** Next.js (Web), FastAPI (API), Python/NumPy/SciPy (ML/Simulator), PostgreSQL/Supabase (Database)  
> **Workflow:** `.agents/workflows/execute-plan.md` / `@executing-plans`  

---

## 1. Master Task Overview

| Phase # | Phase / Module | Deliverable Components | Status | Target Files |
| :---: | :--- | :--- | :---: | :--- |
| **01** | **Monorepo & API Skeleton** | Monorepo layout, Pydantic contracts, FastAPI routing, healthcheck | [ ] Pending | `packages/types/`, `services/api/main.py` |
| **02** | **Database Schema & Migrations** | PostgreSQL DDL migrations, tables, indexes, Supabase connection | [ ] Pending | `data/schemas/001_initial_schema.sql`, `services/api/db.py` |
| **03** | **Sensor Simulator Engine** | Cole impedance, transfer functions, Poisson/Hawkes AE, context cycles | [ ] Pending | `services/simulator/engine.py`, `services/simulator/scenarios.py` |
| **04** | **Data Ingestion & HardwareAdapter**| Abstract `HardwareAdapter`, Ingestion API endpoint, sweep receiver | [ ] Pending | `services/api/adapters/`, `services/api/routers/sensors.py` |
| **05** | **Quality Gate Module** | 10 kHz contact check, rain/trunk contamination, calibration drift gate | [ ] Pending | `services/ml/quality_gate.py` |
| **06** | **Signal Processing Engine** | 50 Hz notch filter, PT1000 temperature compensation, Cole model fitting | [ ] Pending | `services/ml/signal_processing.py`, `services/ml/cole_model.py` |
| **07** | **Feature Extraction Engine** | Spectral impedance, H(f) transfer, AE clusters, dendrometer, thermal gap | [ ] Pending | `services/ml/features.py` |
| **08** | **Per-Palm Baseline Engine** | 7-14 day diurnal baseline (μ, σ by hour/height/side), z-scores | [ ] Pending | `services/ml/baseline.py` |
| **09** | **Multimodal Fusion & State Space**| Weighted evidence fusion, state-space tracker (W, K, E, R), 0-100 HSI | [ ] Pending | `services/ml/fusion.py`, `services/ml/state_estimator.py` |
| **10** | **Spatial Localization Engine** | Height (N1-N4) & side (A/B) anomaly detection, uncertainty scoring | [ ] Pending | `services/ml/localization.py` |
| **11** | **Forecasting & Counterfactuals** | 6h/12h/24h/48h best/likely/worst trajectories, irrigation counterfactuals | [ ] Pending | `services/ml/forecasting.py` |
| **12** | **Alert & Recommendation Engine** | Threshold evaluation, cooldown debouncing, Kannada/English advice | [ ] Pending | `services/api/routers/alerts.py`, `services/ml/recommendation.py` |
| **13** | **Next.js Web Application** | Farm Mode, Research Mode, 3D Stem Visualizer, Recharts time series | [ ] Pending | `apps/web/app/`, `apps/web/components/` |
| **14** | **Experiment & Ground Truth Suite**| CSV import/export, 24-seedling research validation dashboard | [ ] Pending | `apps/web/app/experiments/`, `services/api/routers/research.py` |

---

## 2. Execution Checkpoints & Milestones

- [ ] **Checkpoint A (Core Simulator & Math Verified):** Synthetic sweeps generate physically realistic Cole arcs and acoustic event bursts.
- [ ] **Checkpoint B (Quality Gate & Ingestion Verified):** Bad electrode contacts and rain events are flagged as `BAD` data, explicitly preventing false stress alerts.
- [ ] **Checkpoint C (Baseline & HSI Verified):** Per-palm baseline successfully learns diurnal rhythms and computes accurate 0–100 HSI scores.
- [ ] **Checkpoint D (Full Demo Scenario Verified):** Complete scenario running: Healthy $\rightarrow$ Drought Stress $\rightarrow$ HSI Rise $\rightarrow$ Alert $\rightarrow$ Irrigation Injection $\rightarrow$ Recovery trajectory verified in web dashboard.
- [ ] **Checkpoint E (Hardware Portability Verified):** `HardwareAdapter` interface validated with mock hardware replacement.
