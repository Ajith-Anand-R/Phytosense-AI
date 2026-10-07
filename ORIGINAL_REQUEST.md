# ORIGINAL_REQUEST: PhytoSense AI / PhytoHydra Digital Twin & Field Platform

**Date Captured:** 2026-10-07  
**Project:** PhytoSense AI (Hardware node: PhytoHydra)  
**Status:** Approved for Architecture & Specification  
**Current Readiness:** TRL 3 (Proof of Concept; hardware design intent exists, physical field nodes not yet manufactured)  

---

## 1. Executive Summary & User Prompt

The primary objective is to build a fully functional **"Digital PhytoHydra"** software prototype and research platform that:
1. Ingests simulated sensor data reflecting the physical PhytoHydra architecture (4 stem bands, 2 sides, multi-frequency electrical impedance spectroscopy, multi-height electrical transfer functions, ultrasonic acoustic emissions, micro-dendrometry, canopy & stem temperature, ambient meteorology, soil moisture).
2. Processes readings through a deterministic, explainable AI pipeline:
   $$\text{Quality Gate} \longrightarrow \text{Signal Processing} \longrightarrow \text{Feature Extraction} \longrightarrow \text{Per-Palm Baseline} \longrightarrow \text{Multimodal Fusion} \longrightarrow \text{State Estimation} \longrightarrow \text{Forecasting / Recommendation}$$
3. Generates a **Hydraulic State Index (HSI)** on a 0–100 scale with explicit spatial localization along the trunk ($N1$ to $N4$, Sides A & B).
4. Provides a 24–48 hour forecast with counterfactual irrigation simulations ("Do nothing" vs. "Irrigate now" vs. "Irrigate tonight").
5. Renders the real-time operational state on a dual-mode web dashboard (**Farm Mode** for growers in Kannada/English, **Research Mode** for plant physiologists with raw spectra and feature distributions).
6. Establishes a strict **Hardware Abstraction Layer (`HardwareAdapter`)** allowing seamless transition from V0.1 Digital Simulator $\rightarrow$ V0.2 CSV Ingestion $\rightarrow$ V0.3 Lab Rig (AD5941 + ADS131M08 + RPi 5) $\rightarrow$ V0.4 Physical PhytoHydra Node (STM32H743 + SX1262 LoRa).

---

## 2. Core Operational Constraints & Scientific Honesty Mandate

> [!CAUTION]
> **MANDATORY BANNER:** Every screen, chart, and export in the digital prototype MUST clearly and prominently display:  
> `SIMULATION MODE — NOT EXPERIMENTALLY VALIDATED`

1. **Anti-Premature Scientific Claims:**
   - Never claim: "Plant disease detected", "20–30% water savings achieved", or "Stress detected 72 hours early".
   - Use strictly qualified terminology: "Potential hydraulic dysfunction", "Model estimate", "Simulation", "Target benchmark", "Research prototype".
2. **Data Quality Integrity:**
   - A sensor failure, bad electrode contact, or rain event on the trunk must **NEVER** be classified as plant stress.
   - Faulty readings must trigger `Data quality degraded — plant stress estimate temporarily unavailable` and drop into `WARNING` or `BAD` quality flags.
3. **No Premature Deep Learning Bloat:**
   - Phase 1 involves only 24 seedlings and Phase 2 involves 10 field palms. A giant deep neural network would violently overfit.
   - The intelligence architecture must begin with **deterministic, interpretable physics-informed primitives**: Cole-model relaxation fitting, diurnal baseline z-scoring, transparent weighted fusion, and a lightweight state-space tracking model.

---

## 3. High-Level Pipeline Architecture

```text
                    PHYTOSENSE AI
                         │
                         ▼
              ┌─────────────────────┐
              │   Sensor Simulator   │
              │                     │
              │ Impedance (100Hz-200kHz)
              │ Transfer Function (H12-H14)
              │ Acoustic Emission (PZT)
              │ Dendrometer (Invar) │
              │ Temperature (Air/Stem/Canopy)
              │ Humidity / VPD       │
              │ Light (PAR proxy)   │
              │ Soil Moisture (30cm)│
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   Data Ingestion    │
              │     FastAPI         │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │    Quality Gate     │
              │                     │
              │ Contact check 10 kHz│
              │ Calibration drift   │
              │ Rain / trunk wetness│
              │ Outlier / Missing   │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Feature Extraction  │
              │                     │
              │ Cole R0, Rinf, alpha│
              │ H(f) gain/phase/delay│
              │ AE hits/energy/cluster│
              │ Dendrometer shrink  │
              │ Thermal canopy-air  │
              │ VPD & Soil deficit  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Per-Palm Baseline   │
              │                     │
              │ 7-14 day diurnal μ,σ│
              │ z-score deviation   │
              │ Adaptive tracking   │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Multimodal Fusion   │
              │                     │
              │ Electrical (30%)    │
              │ Transfer (20%)      │
              │ Acoustic (20%)      │
              │ Dendrometer (10%)   │
              │ Thermal (10%)       │
              │ Context (10%)       │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Hydraulic State     │
              │ Estimator           │
              │                     │
              │ Hydration (W)       │
              │ Conductance (K)     │
              │ Embolism (E)        │
              │ Recovery (R)        │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Hydraulic State     │
              │ Index 0–100         │
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       24–48 h Forecast       Recommendation
      (Best/Likely/Worst)     (Actionable & Kannada/EN)
              │                     │
              └──────────┬──────────┘
                         ▼
              ┌─────────────────────┐
              │   PhytoSense Web    │
              │  Dashboard (Next.js)│
              └─────────────────────┘
```

---

## 4. Hardware Progression (V0.1 to V0.4)

| Stage | Version | Physical Reality | Ingestion Method | Model Progression |
| :--- | :--- | :--- | :--- | :--- |
| **V0.1** | Digital Twin | Pure Synthetic Simulation (9 sensors, Cole physics, Hawkes AE) | Internal Simulator Engine via FastAPI | Stage 1: Baseline z-scores + rule fusion |
| **V0.2** | Ground Truth CSV | 24 Seedling trial data (pot load cells, PMS pressure chamber $\Psi_{leaf}$) | Batch CSV Upload & Validation API | Stage 2: Supervised regression against $\Psi_{leaf}$ |
| **V0.3** | Lab Rig | AD5941 + ADS131M08 Eval Boards + RPi 5 Host + Bench PZT | MQTT / HTTP Edge Ingestion | Stage 3: Extended Kalman Filter state space |
| **V0.4** | PhytoHydra v1 Node | Custom 4-layer PCB (STM32H743) + SX1262 LoRa + 4 Stem Bands + 2 Sentinels | LoRaWAN Gateway $\rightarrow$ 4G Cloud Bridge | Stage 4: 24–48h forward counterfactual forecasting |

---

## 5. Scope & Explicit Non-Goals

### Goals
- Deliver a comprehensive, production-grade monorepo containing the Next.js web application, FastAPI API service, synthetic sensor simulator, and analytical ML pipeline.
- Implement exact mathematical models for Cole-impedance relaxation, acoustic emission Poisson/Hawkes burst clustering, diurnal dendrometry, and vapor pressure deficit calculations.
- Support interactive simulation controls (triggering drought, root-side conduction failure, sensor disconnects, rain events, irrigation flushes).
- Ensure 100% adherence to clean architectural boundaries via `HardwareAdapter`.

### Explicit Non-Goals (Out of Scope for Initial Release)
- **NO Image Classification or Computer Vision:** PhytoSense is a stem-internal physiological monitoring system, not a canopy drone camera tool.
- **NO Disease Etiology Claims:** The platform detects hydraulic dysfunction and localization, not microscopic pathogens (*Phytophthora*, *Ganoderma*). Pathogen diagnosis remains the domain of certified agronomists.
- **NO Unsubstantiated Marketing Claims:** Any references to water savings (20–30%) or lead times (12–72 hours) are framed as experimental hypotheses under test.
