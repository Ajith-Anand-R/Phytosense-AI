# 07. Web Dashboard & UX Specification

**Document:** 07_web_dashboard_and_ux_specification.md  
**Scope:** Frontend Architecture, Visual Design System, Persona Views (Farm vs. Research Mode), 3D Stem Localization, and Charts  
**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, Lucide React  

---

## 1. Visual Aesthetics & Design System

The PhytoSense AI interface is designed as a **scientific, professional agricultural intelligence dashboard**. It purposefully avoids generic SaaS templates, excessive neon gradients, and gaming UI tropes, delivering a crisp, high-density, research-grade experience.

### Design Tokens & Palette
- **Canvas / Background:** Deep Slate / Off-Black (`#0b0f12`) in dark mode; Clean Surgical Warm Grey (`#f8fafc`) in light mode.
- **Surface Cards:** Dark Carbon with border stroke (`#12181f`, border: `#1e293b`).
- **Primary Brand Ink:** Deep Forest Emerald (`#10b981` / `#059669`).
- **Accent Signals:**
  - Healthy State: Botanical Green (`#22c55e`)
  - Warning / Mild: Harvest Gold (`#eab308`)
  - Moderate / High: Burnt Ochre (`#f97316`)
  - Critical Stress: Crimson Alert (`#ef4444`)
  - Sensor Fault / Hardware: Muted Violet (`#8b5cf6`)
- **Typography:**
  - Primary UI & Numbers: Inter / Geist Sans
  - Scientific Labels & Code: JetBrains Mono / Geist Mono

> [!CAUTION]
> **MANDATORY SIMULATION BANNER:**  
> Every screen across both Farm and Research modes MUST feature an unmissable top header banner:  
> `SIMULATION MODE — NOT EXPERIMENTALLY VALIDATED (TRL 3 CONCEPT)`

---

## 2. Navigation Architecture & Routes

The application features 12 dedicated views organized under App Router:

```text
apps/web/app/
├── layout.tsx                    # Root layout with top status header & sidebar navigation
├── page.tsx                      # Overview Dashboard (farm stats, stress distribution, fleet map)
├── plants/
│   ├── page.tsx                  # Sentinel Plants Grid & Filters
│   └── [plantId]/
│       ├── page.tsx              # Plant Detail: HSI Gauge, Stem Visualizer, Contributions
│       └── signals/page.tsx      # Multi-Signal Synchronized Time-Series
├── live/page.tsx                 # Real-time WebSocket live monitoring & sweep feed
├── alerts/page.tsx               # Alert Center (table, acknowledgment, resolution history)
├── forecast/page.tsx             # 24-48h forecast & counterfactual irrigation simulator
├── irrigation/page.tsx           # Irrigation event manager & recovery curve tracker
├── experiments/page.tsx          # 24-seedling controlled drought trial screen
├── research/page.tsx             # Research Mode: Nyquist plots, Bode plots, AE clusters
├── devices/page.tsx              # PhytoHydra node fleet health, LoRa RSSI, battery
├── reports/page.tsx              # Automated PDF/CSV summary reports for FPOs
└── settings/page.tsx             # Weight configuration, alert thresholds, API keys
```

---

## 3. Dual-Persona Interface: Farm Mode vs. Research Mode

The top header provides an instant toggle between two distinct operational personas:

### 3.1 🌾 Farm Mode (Grower & Agronomist Persona)
Focused on rapid cognitive assessment, clear alerts, and actionable field guidance:
- **Hero Element:** Radial **0–100 HSI Gauge** with color-coded risk band and trend arrow.
- **Stress Summary:** Large text: *"Moderate Hydraulic Stress (HSI 64) — Rising"*.
- **Localized Anomaly Pill:** *"Check Lower Trunk (North Side)"*.
- **Action Card:** *"Recommended Action: Inspect Drip Line B for clogged emitters. Consider 45-minute irrigation after 5:00 PM."*
- **Vernacular Toggle:** Instantly switches alert and recommendation text between English and Kannada.
- **Hidden Complexity:** Raw frequency spectra, complex numbers, and regression loss curves are hidden.

### 3.2 🔬 Research Mode (Plant Physiologist & Scientific Persona)
Provides raw analytical depth and full transparency into the biophysical models:
- **Cole-Model Nyquist Plot:** Interactive Argand diagram ($-\text{Im}(Z)$ vs. $\text{Re}(Z)$) with fitted semicircle arc and characteristic frequency $f_c$ marker.
- **Bode Diagram:** Multi-height transfer function gain $|H(f)|$ and phase $\angle H(f)$ from $50\,\text{Hz}$ to $5\,\text{kHz}$.
- **Acoustic Event Scatter:** Time-series of acoustic hits with bubble size proportional to energy and color keyed to $100–200\,\text{kHz}$ frequency cluster.
- **$z$-Score Deviation Matrix:** Heatmap showing how each feature deviates from the palm's diurnal baseline for that specific hour.
- **Validation Metrics:** Lead-time comparisons against PMS pressure chamber ground truth and pot load-cell transpiration.

---

## 4. Key UI Components

### 4.1 Stem Localization Visualizer (N1–N4, Sides A & B)
The central visual differentiator of PhytoHydra. Displays a vertical graphic of the trunk with 4 horizontal bands ($N1$ at $0.3\,\text{m}$, $N2$ at $0.8\,\text{m}$, $N3$ at $1.3\,\text{m}$, $N4$ at $1.8\,\text{m}$) split into Side A (left) and Side B (right):

```text
┌────────────────────────────────────────────────────────┐
│ STEM HYDRAULIC CONDUCTION PROFILE                      │
├────────────────────────────────────────────────────────┤
│           SIDE A (North)           SIDE B (South)      │
│  1.8 m ─  [ N4-A: Nominal ]        [ N4-B: Nominal ]   │
│                 │                        │             │
│  1.3 m ─  [ N3-A: Nominal ]        [ N3-B: Nominal ]   │
│                 │                        │             │
│  0.8 m ─  [ N2-A: High Anomaly ]   [ N2-B: Nominal ]   │
│           (Transfer -6 dB)         (Transfer 0 dB)     │
│                 │                        │             │
│  0.3 m ─  [ N1-A: High Anomaly ]   [ N1-B: Nominal ]   │
│  Ground   ──────────────────────────────────────────   │
│  Status:  "Possible dysfunction in lower trunk, Side A"│
└────────────────────────────────────────────────────────┘
```
Each segment is highlighted in real time based on its transfer function deviation:
- Green: Nominal conduction ($|z| < 1.0$)
- Yellow: Slight attenuation ($1.0 \le z < 2.0$)
- Orange/Red: Marked conduction loss ($z \ge 2.0$)

### 4.2 Multi-Signal Synchronized Time-Series Chart
Built with Recharts, presenting synchronized vertical cursors across four stacked time-series:
1. **Track 1:** Hydraulic State Index (0–100) with risk threshold bands.
2. **Track 2:** Sapwood Cole Resistance ($R_0$ and $R_\infty$) normalized to $25^\circ\text{C}$.
3. **Track 3:** Acoustic Cavitation Hits per Hour (histogram bars).
4. **Track 4:** Environmental Context: Soil Moisture (30 cm) and Vapor Pressure Deficit (VPD).

*Time Range Selectors:* 6 Hours, 24 Hours, 7 Days, 30 Days.

### 4.3 Signal Contribution Radar & Waterfall
Breaks down the 0–100 HSI score into individual modality points:
- Electrical Impedance: $+21.5\,\text{pts}$ ($z = 2.45$)
- Transfer Function: $+16.2\,\text{pts}$ ($z = 2.10$)
- Acoustic Emission: $+18.4\,\text{pts}$ ($z = 2.80$)
- Micro-Dendrometry: $+4.1\,\text{pts}$ ($z = 0.65$)
- Thermal Gap: $+4.8\,\text{pts}$ ($z = 1.10$)
- Soil & VPD Context: $+2.4\,\text{pts}$ ($z = 0.85$)
- **Total HSI:** **$67.4$ (High Stress)**

### 4.4 Simulation Control Floating Bar
In development and demonstration modes, a persistent floating bottom toolbar allows the user to:
- Select Scenario: `NORMAL`, `MILD_STRESS`, `SEVERE_STRESS`, `ROOT_SIDE_PROBLEM`, `SENSOR_FAILURE`, `RAIN_EVENT`.
- Inject Event: "Trigger Irrigation (50 L)", "Simulate Rain Squall", "Disconnect Pod N1-B".
- Speed Slider: $1\times$ real-time up to $60\times$ fast-forward.
- Reset Simulation to Day 1.
