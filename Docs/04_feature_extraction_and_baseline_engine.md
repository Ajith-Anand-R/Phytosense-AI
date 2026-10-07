# 04. Feature Extraction & Per-Palm Baseline Engine

**Document:** 04_feature_extraction_and_baseline_engine.md  
**Scope:** Physiological Feature Vector Definition, Diurnal Baseline Calibration, and $z$-Score Deviation Normalization  
**Status:** Core Differentiator of PhytoSense AI  

> [!IMPORTANT]
> **THE PER-PALM LEARNING PHILOSOPHY:**  
> Palms vary widely in age, trunk girth, soil depth, and sun exposure. A single absolute impedance threshold (e.g., "$1,200\,\Omega$ is stressed") will fail across different farms.  
> Instead, PhytoSense AI tracks each sentinel palm's **own healthy diurnal rhythm** over a 7–14 day calibration window, evaluating water stress as a statistical deviation ($z$-score) from that palm's expected baseline at that specific time of day.

---

## 1. Physiological Feature Matrix

From every 10-minute sensor sweep, the feature extraction engine distills 18 normalized physiological features across 6 signal modalities:

| Signal Modality | Feature Key | Mathematical Definition | Physiological Significance |
| :--- | :--- | :--- | :--- |
| **Electrical Impedance** | `feat_r0_norm` | Extracellular resistance $R_0$ normalized to $25^\circ\text{C}$ | Apoplastic water column volume |
| | `feat_r_ratio` | $\frac{R_0}{R_\infty}$ ratio from Cole fit | Membrane intactness & extracellular vs intracellular water partition |
| | `feat_alpha` | Cole dispersion parameter $\alpha$ | Heterogeneity of sapwood cell structure |
| | `feat_phase_10k` | Impedance phase angle at $10\,\text{kHz}$ | Capacitive energy storage in vascular membranes |
| **Transfer Function** | `feat_h_gain_n1n2` | Average gain $|H_{12}(f)|$ in $50\,\text{Hz}–5\,\text{kHz}$ band | Longitudinal sapwood conduction between $0.3\,\text{m}$ and $0.8\,\text{m}$ |
| | `feat_h_gain_n2n3` | Average gain $|H_{23}(f)|$ | Conduction between $0.8\,\text{m}$ and $1.3\,\text{m}$ |
| | `feat_h_gain_n3n4` | Average gain $|H_{34}(f)|$ | Conduction between $1.3\,\text{m}$ and $1.8\,\text{m}$ |
| | `feat_asymmetry_ab` | $\frac{|H_{\text{seg}, A}| - |H_{\text{seg}, B}|}{|H_{\text{seg}, A}| + |H_{\text{seg}, B}|}$ | Azimuthal asymmetry (North vs South trunk conduction) |
| **Acoustic Emission** | `feat_ae_hits_hr` | Detected acoustic hits per hour | Direct count of cavitation ruptures under xylem tension |
| | `feat_ae_energy` | Integrated acoustic energy in arbitrary energy units (eu) | Magnitude of acoustic release events |
| | `feat_ae_cluster_ratio`| Fraction of hits with spectral peak in $100–200\,\text{kHz}$ | Differentiates cavitation clicks from mechanical trunk sway |
| | `feat_ae_spatial_delta`| $\Delta t$ arrival time difference between lower and upper sentinels | Identifies vertical locus of cavitation onset |
| **Micro-Dendrometry** | `feat_dend_shrink` | Daily trunk shrinkage amplitude ($\mu\text{m}$) | Depletion of internal stem water storage during daytime |
| | `feat_dend_recovery`| Overnight trunk diameter expansion ($\mu\text{m}$) | Overnight root pressure refilling efficacy |
| **Thermal Response** | `feat_canopy_delta_t`| $T_{\text{canopy}} - T_{\text{air}}$ ($^\circ\text{C}$) | Loss of transpirational cooling due to stomatal closure |
| **Environmental Context**| `feat_vpd_kpa` | Vapor Pressure Deficit ($\text{kPa}$) | Atmospheric evaporative demand pulling water through crown |
| | `feat_soil_deficit` | Reference field capacity minus soil moisture at $30\,\text{cm}$ | Soil matrix water availability |
| | `feat_time_irrigation`| Hours elapsed since last confirmed irrigation event | Depletion duration timeline |

---

## 2. Diurnal Baseline Calibration Protocol

### 2.1 The Need for Diurnal Bucketing
Transpiration follows an intrinsic solar cycle:
- **06:00 to 11:00:** Stomata open; sap flow accelerates; stem water tension rises.
- **11:00 to 15:00:** Peak solar radiation and VPD; stem reaches maximum daily contraction and highest electrical impedance.
- **15:00 to 20:00:** Transpiration drops; recovery refilling commences.
- **20:00 to 06:00:** Stomata closed; night recovery reaches equilibrium.

Comparing an afternoon reading against an early morning reading produces false alarms. Therefore, baselines are maintained independently for each hour of the day:
$$\text{Hour } h \in \{0, 1, 2, \dots, 23\}$$

### 2.2 Calibration Stages
Every instrumented palm tracks its lifecycle status:

```text
┌──────────────────────┐      7-14 Days Well-Watered      ┌──────────────────────┐
│  STATUS: LEARNING    │ ───────────────────────────────> │   STATUS: ACTIVE     │
│ Insufficient history │                                  │ Nominal z-score eval │
└──────────────────────┘                                  └──────────┬───────────┘
           │                                                         │
           │ Sensor Replaced / Girth Reset                           │ Sudden Drift
           ▼                                                         ▼
┌──────────────────────┐                                  ┌──────────────────────┐
│   STATUS: RESET      │                                  │ STATUS: DEGRADED     │
└──────────────────────┘                                  └──────────────────────┘
```

1. **`LEARNING` (Days 1 to 7–14):**
   - The palm is kept well-watered by the grower (100% transpiration replacement).
   - The engine logs feature values into hourly buckets: $\mathcal{H}_{p, f, h}$.
   - Minimum sample requirement: At least 5 sweeps per hourly bucket before transitioning to `ACTIVE`.
2. **`ACTIVE`:**
   - The engine computes baseline mean $\mu_{p, f, h}$ and standard deviation $\sigma_{p, f, h}$.
   - Evaluates live incoming sweeps against the calibrated diurnal profile.
3. **`INSUFFICIENT_DATA`:**
   - If power loss or offline periods interrupt calibration, the palm falls back to fleet-wide cultivar averages with a reduced confidence penalty.

---

## 3. Mathematical Normalization: $z$-Score Deviation

For any incoming feature measurement $x_{p, f}(t)$ on palm $p$, feature $f$, at hour $h = \text{hour}(t)$:

$$z_{p, f}(t) = \frac{x_{p, f}(t) - \mu_{p, f}(h)}{\max(\sigma_{p, f}(h), \sigma_{\min})}$$

Where:
- $\mu_{p, f}(h)$: Calibrated mean of feature $f$ on palm $p$ at hour $h$.
- $\sigma_{p, f}(h)$: Calibrated standard deviation.
- $\sigma_{\min}$: Minimum variance floor to prevent division-by-zero on ultra-stable channels.

### Interpretation of $z$-Scores
- $|z| < 1.0$: Within normal diurnal variation (Healthy).
- $1.0 \le z < 2.0$: Mild physiological deviation.
- $2.0 \le z < 3.5$: Moderate to severe stress deviation (Statistically significant anomaly, $p < 0.05$).
- $z \ge 3.5$: Extreme acute stress or localized vascular blockage.

---

## 4. Adaptive Rolling Baseline Updates

To accommodate gradual seasonal transitions (e.g., dry winter $\to$ hot summer) without requiring manual recalibration, the baseline updates adaptively using an Exponentially Weighted Moving Average (EWMA), but **only on sweeps classified as non-stressed (HSI $< 30$)**:

$$\mu_{\text{new}}(h) = (1 - \lambda) \cdot \mu_{\text{old}}(h) + \lambda \cdot x(t)$$

$$\sigma_{\text{new}}^2(h) = (1 - \lambda) \cdot \sigma_{\text{old}}^2(h) + \lambda \cdot (x(t) - \mu_{\text{new}}(h))^2$$

Where adaptation rate $\lambda = 0.05$ (corresponding to a roughly 20-day half-life). Stressed sweeps are strictly excluded from baseline adaptation to prevent the model from normalizing to chronic dehydration.
