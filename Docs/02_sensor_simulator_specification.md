# 02. Sensor Simulator Specification: Digital PhytoHydra

**Document:** 02_sensor_simulator_specification.md  
**Scope:** Mathematical & Biophysical Foundations of the Synthetic Multi-Sensor Generator  
**Status:** Mandatory V0.1 Component (Software Digital Twin)  

> [!IMPORTANT]
> **SIMULATION FIDELITY PRINCIPLE:**  
> The simulator is not a simplistic random-number generator. It implements biophysical models grounded in plant physiology literature (Cole relaxation in sapwood, multisine bio-impedance transfer, Poisson/Hawkes acoustic cavitation bursts, invar dendrometer daily shrinkage, and Penman-Monteith/VPD atmospheric demand).

---

## 1. Physical Sensor Geometry & Configuration

The simulator mirrors the physical rev A CAD assembly of PhytoHydra installed on a mature arecanut palm (~170 mm trunk diameter):

```text
Elevation (Trunk z-axis):
========================================================================
N4 Stem Band : z = 1800 mm (1.8 m)  ── 2 Pods (N4-A: North, N4-B: South)
Acoustic High: z = 1550 mm (1.55 m) ── Ultrasonic Sentinel 2 (Spring 12N)
N3 Stem Band : z = 1300 mm (1.3 m)  ── 2 Pods (N3-A: North, N3-B: South)
Dendrometer  : z = 1180 mm (1.18 m) ── Invar Band + AS5311 Magnetic
Edge Hub Box : z = 1050 mm (1.05 m) ── IP67 Enclosure + 6W Solar Arm
N2 Stem Band : z =  800 mm (0.8 m)  ── 2 Pods (N2-A: North, N2-B: South)
Acoustic Low : z =  550 mm (0.55 m) ── Ultrasonic Sentinel 1 (Spring 12N)
N1 Stem Band : z =  300 mm (0.3 m)  ── 2 Pods (N1-A: North, N1-B: South)
Ground Level : z =    0 mm (0.0 m)  ── Soil Probe at 30 cm depth
========================================================================
Seedling Rig (Phase 1): N1-N4 at 50 mm, 150 mm, 250 mm, 350 mm in 50 L pots.
```

---

## 2. Sensor 1: Stem Electrical Impedance Spectroscopy

### Biophysical Mechanism
Living plant stems conduct alternating current through extracellular electrolyte fluid (apoplast) and intracellular symplast across semi-permeable cell membranes. At low frequencies ($<1\,\text{kHz}$), cell membrane capacitance blocks current, forcing it through extracellular pathways. At high frequencies ($>50\,\text{kHz}$), membrane capacitance is bypassed, allowing current to traverse both intracellular and extracellular fluids.

### Mathematical Formulation: The Cole-Cole Model
The complex electrical impedance $\hat{Z}(\omega)$ across frequency $\omega = 2\pi f$ is modeled by:

$$\hat{Z}(\omega) = R_\infty + \frac{R_0 - R_\infty}{1 + \left(j \frac{\omega}{\omega_c}\right)^\alpha}$$

Where:
- $R_0$: Extracellular sapwood resistance at zero frequency ($\Omega$). Rises significantly during dehydration as extracellular pathways contract.
- $R_\infty$: Combined intracellular and extracellular resistance at infinite frequency ($\Omega$).
- $f_c = \frac{\omega_c}{2\pi}$: Characteristic relaxation frequency of living cell membranes ($\sim 10\,\text{kHz}$ to $25\,\text{kHz}$).
- $\alpha$: Distribution parameter of relaxation times ($0 < \alpha \le 1$, typically $0.70$ to $0.85$ in woody monocot tissue).

### Temperature Correction
Woody tissue resistivity decreases with temperature due to increased ion mobility (~2% per °C):

$$R_{\text{corrected}}(25^\circ\text{C}) = \frac{R_{\text{measured}}(T)}{1 - 0.02 \times (T_{\text{stem}} - 25.0)}$$

### Synthetic Frequency Grid
The simulator computes 20 logarithmically spaced frequencies:
$$f \in [100\,\text{Hz}, 200\,\text{kHz}]$$

For each frequency, the simulator returns:
- Magnitude: $|Z| = \sqrt{\text{Re}(Z)^2 + \text{Im}(Z)^2}$
- Phase Angle: $\theta = \arctan2(\text{Im}(Z), \text{Re}(Z))$ in degrees
- Real Component: $Z' = \text{Re}(Z)$
- Imaginary Component: $Z'' = \text{Im}(Z)$

---

## 3. Sensor 2: Multi-Height Electrical Transfer Function

### Physical Purpose & Definition
Injecting an 8-tone multisine excitation ($50\,\text{Hz}$ to $5\,\text{kHz}$) at band $N1$ while simultaneously capturing voltages at bands $N2$, $N3$, and $N4$ with the synchronized 24-bit ADS131M08 ADC produces the multi-segment transfer function:

$$H_{ij}(f, t) = \frac{V_j(f, t)}{V_i(f, t)}$$

### Parameters Generated
For each height pair ($H_{12}, H_{13}, H_{14}$) and each side (A and B):
1. **Gain ($|H(f)|$):** Attenuation in decibels along the stem segment.
2. **Phase Shift ($\angle H(f)$):** Phase delay caused by reactive tissue capacitance.
3. **Coherence ($\gamma^2(f)$):** Linearity metric ($0 \le \gamma^2 \le 1$). Dropping below $0.85$ indicates contact noise or mechanical instability.
4. **Group Delay ($\tau_g = -\frac{d\theta}{d\omega}$):** Propagation latency across vascular bundles.

### Localized Problem Simulation
In a **`ROOT_SIDE_PROBLEM`** scenario:
- **Side A:** Root uptake or vascular constriction between $N1$ and $N2$ causes $H_{12,A}$ gain to attenuate by $-6\,\text{dB}$ and phase delay to increase by $45^\circ$.
- **Side B:** Conduction remains within $\pm 0.5\,\text{dB}$ of healthy baseline.

---

## 4. Sensor 3: Ultrasonic Acoustic Emission (Cavitation Sentinel)

### Biophysical Mechanism
When xylem tension exceeds the cavitation threshold, the liquid water column under negative pressure ruptures, releasing microscopic acoustic shockwaves. Piezoelectric PZT discs resonant between $150\,\text{kHz}$ and $200\,\text{kHz}$ clamped with $12\,\text{N}$ spring force record these pulses.

### Stochastic Generation Model
Acoustic hit arrivals are modeled as an inhomogeneous Poisson process with a self-exciting Hawkes component (cavitation clusters trigger neighboring conduits):

$$\lambda_{\text{hits}}(t) = \lambda_0 + \alpha_{\text{stress}} \cdot \max(0, \text{Stress}(t) - \theta_{\text{cavitation}})^2 + \sum_{t_i < t} \beta e^{-\gamma (t - t_i)}$$

### Extracted Feature Metrics
1. **Hits Per Hour ($N_{\text{hits}}$):** Healthy palms exhibit $<5$ hits/hour; severe drought triggers $>50$ hits/hour.
2. **Total Acoustic Energy ($E_{\text{total}}$):** Integrated energy across detected waveforms.
3. **100–200 kHz Cluster Percentage:** Cavitation pulses concentrate in the $100–200\,\text{kHz}$ window; mechanical wind or insect noise sits $<50\,\text{kHz}$.
4. **Upper vs. Lower Sentinel Ratio:** Comparing arrivals between Sentinel 1 ($550\,\text{mm}$) and Sentinel 2 ($1550\,\text{mm}$) pinpoints vertical origin via time-of-flight difference $\Delta t$:
   $$\Delta t = \frac{z_{\text{event}} - z_{\text{sensor}}}{v_{\text{acoustic}}}$$
   (where $v_{\text{acoustic}} \approx 1200\,\text{m/s}$ in fibrous monocot wood).

---

## 5. Sensor 4: Micro-Dendrometer (Stem Shrinkage)

### Biophysical Mechanism
Stems contract during peak afternoon transpiration as xylem water storage depletes, and re-expand overnight as root pressure refills vascular reserves. In mature arecanut palms, diameter variations are minute ($10\,\mu\text{m}$ to $40\,\mu\text{m}$).

### Mathematical Model
$$D(t) = D_{\text{base}} - A_{\text{shrink}} \cdot \sin\left(\frac{\pi (t - t_{\text{sunrise}})}{t_{\text{sunset}} - t_{\text{sunrise}}}\right) \cdot \text{VPD}(t) + R_{\text{recovery}}(t)$$

- **Healthy Palm:** Nighttime recovery refills $\ge 95\%$ of daily shrinkage.
- **Water-Stressed Palm:** Nighttime recovery falls below $70\%$, resulting in a cumulative downward diameter drift.

---

## 6. Context Sensors & Meteorological Modeling

### 1. Vapor Pressure Deficit (VPD)
Calculated from SHT45 air temperature ($T_{\text{air}}$) and relative humidity ($\text{RH}$):

$$e_s(T) = 0.61078 \times \exp\left(\frac{17.27 \times T_{\text{air}}}{T_{\text{air}} + 237.3}\right) \quad (\text{kPa})$$

$$e_a = e_s \times \left(\frac{\text{RH}}{100}\right) \quad (\text{kPa})$$

$$\text{VPD} = e_s - e_a \quad (\text{kPa})$$

### 2. Canopy vs. Air Temperature Gap ($\Delta T$)
Measured via MLX90614 infrared radiometer aimed at upper fronds:
- Well-watered palm: Transpirational evaporative cooling keeps canopy $1.0^\circ\text{C}$ to $2.5^\circ\text{C}$ cooler than ambient air ($T_{\text{canopy}} < T_{\text{air}}$).
- Stressed palm: Stomatal closure suppresses transpiration, causing canopy temperature to exceed air temperature ($T_{\text{canopy}} > T_{\text{air}}$).

### 3. Soil Moisture (30 cm Probe)
Modeled with slow capacitive soil drying dynamics, demonstrating that internal stem stress manifests before deep root soil moisture depletion registers.

---

## 7. Supported Simulation Scenarios

The simulator includes 10 deterministic operational scenarios for interactive testing:

| Scenario Code | Simulated Physiological & Environmental Behavior | Expected AI Pipeline Response |
| :--- | :--- | :--- |
| `NORMAL` | Diurnal solar and VPD cycle; stable Cole parameters; hits $<5$/hr; overnight recovery $>95\%$. | HSI: 5–18 (Healthy); Quality: `GOOD`; Localization: Uniform. |
| `MILD_STRESS` | Afternoon impedance rises slightly; AE hits ~12/hr; dendrometer recovery 85%. | HSI: 25–38 (Mild Stress); Quality: `GOOD`; Trend: Warning. |
| `MODERATE_STRESS` | $R_0/R_\infty$ shifts by $+25\%$; AE hits ~28/hr; canopy temp exceeds air temp by $+0.8^\circ\text{C}$. | HSI: 45–58 (Moderate Stress); Advisory: Schedule irrigation. |
| `SEVERE_STRESS` | Marked impedance increase; acoustic bursts $>65$/hr; overnight recovery $<50\%$. | HSI: 72–88 (High/Critical); High urgency alert dispatched. |
| `RECOVERY` | Post-irrigation injection; impedance decays toward baseline; AE ceases; full stem swell. | HSI drops by 30–50 points within 6–12h; Log: "Intervention worked". |
| `ROOT_SIDE_PROBLEM` | Asymmetric conduction loss on Side A at $N1–N2$; Side B remains healthy. | HSI: 52; Localization: "N1-N2, Side A, 82% confidence". |
| `SENSOR_FAILURE` | Pod $N1\text{-}B$ contact impedance jumps to $18\,\text{k}\Omega$ ($>8\,\text{k}\Omega$ threshold). | Quality: `BAD`; Stress calculation paused; Hardware alert raised. |
| `RAIN_EVENT` | RH reaches 99%; surface trunk bark wetted; impedance drops artificially. | Quality: `BAD (RAIN_CONTAMINATION)`; Stress paused. |
| `HEAT_WAVE` | Ambient temp reaches $39^\circ\text{C}$; VPD exceeds $3.5\,\text{kPa}$; high transpirational pull. | HSI rises smoothly; Thermal contribution increases. |
| `WATERLOGGING` | Extended soil saturation ($>42\%$); root anoxia cuts active water transport. | Conduction drops despite saturated soil moisture. |
