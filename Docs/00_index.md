# PhytoSense AI / PhytoHydra: Complete Documentation Suite

**Product Name:** PhytoSense AI  
**Hardware Node:** PhytoHydra  
**Core Purpose:** Stem-Internal Plant Hydraulic Intelligence & Early Water Stress Localization for Arecanut Palms (*Areca catechu*)  
**Current Status:** TRL 3 (Proof of Concept; CAD & electronics architecture defined; digital twin prototype under active construction)  
**Target Milestone:** TRL 5 (Field-validated prototype on 10 mature arecanut palms in Karnataka)  

> [!CAUTION]
> **MANDATORY SCIENTIFIC HONESTY DISCLAIMER:**  
> The software platform documented herein operates initially on a high-fidelity synthetic sensor simulator. Every simulated dataset, dashboard chart, and predictive index must be visibly marked as:  
> **`SIMULATION / NOT EXPERIMENTALLY VALIDATED`**  
> Never claim disease diagnosis, guaranteed water savings, or unvalidated early-detection hours until empirical ground-truth trials in Phase 1 and Phase 2 conclude.

---

## 1. Documentation Map & Navigation

This documentation suite provides a complete, production-grade technical specification for the PhytoSense AI software platform, covering both the digital twin simulation prototype and the future field hardware deployment.

```text
docs/
├── 00_index.md                                    # Master documentation index and executive summary (This File)
├── 01_system_architecture.md                      # End-to-end software architecture, monorepo layout & data flows
├── 02_sensor_simulator_specification.md           # Physics-based synthetic simulator for all 9 sensor modalities
├── 03_signal_processing_and_quality_gate.md       # 10 kHz contact checks, rain defense, notch filtering & Cole fitting
├── 04_feature_extraction_and_baseline_engine.md   # Physiological features & 7-14 day diurnal baseline learning
├── 05_multimodal_fusion_and_hydraulic_state_model.md # Weighted fusion, state-space model, 0-100 HSI & stem localization
├── 06_forecasting_and_recommendation_engine.md    # 24-48h forecast, counterfactual irrigation & Kannada alerts
├── 07_web_dashboard_and_ux_specification.md       # Next.js UI/UX spec (Farm Mode vs Research Mode & 3D Stem view)
├── 08_data_schemas_and_api_contracts.md           # Pydantic schemas, FastAPI endpoints & PostgreSQL DDL migrations
├── 09_hardware_progression_and_adapter_interface.md # V0.1 -> V0.4 roadmap, HardwareAdapter & electronics BOM
├── 10_research_validation_and_ground_truth_protocol.md # 24 seedling trial, pressure chamber truth & lead-time KPIs
└── plans/
    ├── 2026-10-07-phytosense-digital-twin-and-field-platform-design.md # Formal architectural design spec
    ├── 2026-10-07-phytosense-implementation-plan.md                   # Bite-sized TDD implementation plan
    └── task.md                                                        # Live implementation progress tracker
```

---

## 2. Document Summaries

### [01. System Architecture](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/01_system_architecture.md)
Comprehensive system architecture detailing the monorepo design (`apps/web`, `services/api`, `services/simulator`, `services/ml`), edge-versus-cloud compute division, pipeline topology from sensor ingestion to web dashboard, and the abstract `HardwareAdapter` interface.

### [02. Sensor Simulator Specification](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/02_sensor_simulator_specification.md)
Detailed physical and mathematical specifications for the 9 simulated sensors: multi-frequency electrical impedance spectroscopy (100 Hz–200 kHz) via Cole relaxation, multi-height transfer functions ($H_{12}, H_{13}, H_{14}$), Poisson/Hawkes acoustic emission cavitation bursts (100–400 kHz), micro-dendrometry stem shrinkage, ambient context (air temp, RH, VPD, PAR light, soil moisture), and simulation event injection.

### [03. Signal Processing & Quality Gate](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/03_signal_processing_and_quality_gate.md)
The strict data quality validation layer that prevents hardware failures, detached electrodes, or rain-soaked bark from masquerading as plant drought stress. Details 10 kHz contact impedance gating, 50 Hz notch filters, PT1000 sapwood temperature compensation (+2%/°C), and non-linear Cole model parameter fitting ($R_0, R_\infty, \alpha, f_c$).

### [04. Feature Extraction & Baseline Engine](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/04_feature_extraction_and_baseline_engine.md)
Specifications for the per-palm learning engine. Explains how the platform establishes each palm's healthy diurnal rhythm over a 7–14 day calibration window, accounts for diurnal transpiration curves by hour of day, and calculates normalized $z$-score deviations across all sensor channels.

### [05. Multimodal Fusion & Hydraulic State Model](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/05_multimodal_fusion_and_hydraulic_state_model.md)
The core analytical intelligence: transparent weighted fusion across electrical (30%), transfer (20%), acoustic (20%), dendrometer (10%), thermal (10%), and context (10%) signals. Details the linear state-space hydraulic estimator tracking hidden physiological states ($W, K, E, R$), the 0–100 Hydraulic State Index (HSI), spatial localization along $N1–N4$ and Sides A/B, and explainable natural language rationale generation.

### [06. Forecasting & Recommendation Engine](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/06_forecasting_and_recommendation_engine.md)
Forward trajectory forecasting over 6h, 12h, 24h, and 48h with best/likely/worst envelopes. Features the counterfactual irrigation simulator allowing growers to compare "Do Nothing" vs. "Irrigate Now" vs. "Irrigate Tonight", coupled with an alert debounce engine and bilingual (Kannada and English) agronomic advisory generation.

### [07. Web Dashboard & UX Specification](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/07_web_dashboard_and_ux_specification.md)
Frontend design system built with Next.js 14, Tailwind CSS, shadcn/ui, and Recharts. Outlines the dual-persona interface: **Farm Mode** for simplified grower operations and **Research Mode** for deep physiological analysis. Includes the interactive 3D/2D Stem Localization visualizer and mandatory simulation warning badges.

### [08. Data Schemas & API Contracts](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/08_data_schemas_and_api_contracts.md)
Complete OpenAPI REST contracts for FastAPI, typed Pydantic models, PostgreSQL schema definitions with TimescaleDB-ready indexes, foreign keys, and batch CSV import/export schemas.

### [09. Hardware Progression & Adapter Interface](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/09_hardware_progression_and_adapter_interface.md)
The phased transition from pure software to physical plantation deployment: V0.1 Digital Twin $\rightarrow$ V0.2 CSV Ingestion $\rightarrow$ V0.3 Raspberry Pi Lab Rig $\rightarrow$ V0.4 PhytoHydra v1 Field Node (STM32H743 + SX1262 LoRa). Contains complete Bill of Materials (BOM), sensor pinouts, and the `HardwareAdapter` interface contract.

### [10. Research Validation & Ground Truth Protocol](file:///c:/Users/ajith/Desktop/PhytoSense%20AI/docs/10_research_validation_and_ground_truth_protocol.md)
The scientific proof-of-concept trial protocol: 24 two-year-old arecanut seedlings in 50 L pots under a rain shelter evaluated against PMS 1000 pressure chamber leaf water potential ($\Psi_{leaf}$) and continuous pot load-cell transpiration. Formalizes target validation KPIs: $\ge 12$h lead time over soil moisture, $\ge 24$h lead time over visible wilting, $\ge 80\%$ detection sensitivity, and $\le 1$ false alarm per plant per fortnight.

---

## 3. Guiding Architectural Principles

1. **Physics-Informed Determinism Before Opaque Neural Networks:**
   With 24 seedlings in planned trials and 10 field palms in the pilot, a deep neural network would violently overfit. The platform uses biophysical Cole equations, diurnal statistical baselines, and interpretable state-space estimation.
2. **Strict Quality Gating Before Diagnostic Inference:**
   No sensor reading enters the fusion engine without passing contact impedance, temperature sanity, and bark rain-wetting checks. Hardware faults are flagged as hardware alerts, never as plant water stress.
3. **Pluggable Ingestion via Hardware Abstraction:**
   The entire analytics, ML, and dashboard stack is completely decoupled from the sensor source via `HardwareAdapter`. Changing from simulated sweeps to field LoRa uplinks requires zero changes to the analytical core.
