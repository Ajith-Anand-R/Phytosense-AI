# 09. Hardware Progression & Adapter Interface

**Document:** 09_hardware_progression_and_adapter_interface.md  
**Scope:** Phased Hardware Roadmap (V0.1 $\to$ V0.4), Electronics Architecture, Bill of Materials, and Mechanical Interface  
**Reference CAD:** `PH-ME-001 rev A` (Drawings & OpenSCAD models in `Docs/cad/`)  

---

## 1. The 4-Stage Software-to-Hardware Progression

To decouple software and analytical development from long physical manufacturing lead times, PhytoSense AI evolves through four strict version gates:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   PHYTOSENSE HARDWARE ROADMAP                          │
├────────────────────────────────────────────────────────────────────────┤
│ V0.1: Digital Simulator (Current Prototype)                            │
│ ├── Pure synthetic Python engine                                      │
│ ├── Cole-model impedance + Hawkes acoustic bursts + diurnal context    │
│ └── Delivers: Runnable end-to-end cloud, API, and web dashboard        │
├────────────────────────────────────────────────────────────────────────┤
│ V0.2: Real Data Ingestion (Months 1–3)                                 │
│ ├── Manual CSV upload from benchtop tests & cut trunk dehydration      │
│ ├── Evaluates Cole parameter fitting on real arecanut sapwood          │
│ └── Proves: Electrode contact impedance stability (<10% drift / 14 d) │
├────────────────────────────────────────────────────────────────────────┤
│ V0.3: Lab Electronics Rig (Months 2–4)                                 │
│ ├── Analog Devices AD5941 + TI ADS131M08 Evaluation Boards + RPi 5    │
│ ├── Benchtop reference PZT acoustic sensor + load cell balances        │
│ └── Instrumenting: 24 arecanut seedlings in 50 L pots (Phase 1 trial)  │
├────────────────────────────────────────────────────────────────────────┤
│ V0.4: PhytoHydra v1 Field Node (Months 5–12)                           │
│ ├── Custom 4-layer PCB: STM32H743 MCU + SX1262 LoRa (865–867 MHz)      │
│ ├── 4 TPU Stem Bands (N1-N4) + 8 Titanium Pin Pods + 2 Sentinels       │
│ └── Deployment: 10 field nodes in an irrigated plantation in Karnataka│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Hardware Abstraction Interface (`HardwareAdapter`)

The `HardwareAdapter` interface ensures that when the physical electronics become operational, the upstream analytical, ML, database, and dashboard systems require **zero modifications**:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from phytosense_types.schemas import SensorSweep

class HardwareAdapter(ABC):
    """
    Unified abstract interface connecting PhytoSense AI to
    either the synthetic digital twin or physical field hardware.
    """
    @abstractmethod
    async def read_telemetry(self, plant_id: str) -> SensorSweep:
        """
        Retrieves or generates a complete 10-minute sensor sweep.
        Must return normalized SensorSweep schema.
        """
        pass

    @abstractmethod
    async def run_contact_diagnostics(self, plant_id: str) -> Dict[str, float]:
        """
        Executes a 10 kHz contact impedance check across all 8 electrode pins.
        Returns mapping of pod ID -> contact impedance in Ohms.
        """
        pass

    @abstractmethod
    async def calibrate_analog_front_end(self, plant_id: str) -> bool:
        """
        Switches internal precision RC network to verify ADC and AFE calibration.
        """
        pass
```

---

## 3. Physical Node Architecture (PhytoHydra v1)

### 3.1 Subsystem Specifications
- **Impedance Front-End:** Analog Devices AD5941 (100 Hz to 200 kHz, 4-wire tetrapolar excitation, $<10\,\mu\text{A}$ RMS safe AC current).
- **Synchronous ADC:** Texas Instruments ADS131M08 (8 channels sampled simultaneously at 24-bit resolution, up to $32\,\text{kSPS}$) for real-time multisine transfer functions $H_{ij}(f)$.
- **Electrode Multiplexer:** Dual ADG1609/ADG1208 low-charge-injection analog switches.
- **Acoustic Sentinels (2 Units):** $10\,\text{mm}$ PZT piezoelectric discs resonant at $\sim 150–200\,\text{kHz}$; custom $40\,\text{dB}$ low-noise preamplifier; $100–400\,\text{kHz}$ bandpass filter; comparator wake-up interrupt to MCU.
- **Stem Micro-Dendrometer:** Invar temperature-compensated band + ams AS5311 magnetic linear encoder (sub-micrometer resolution).
- **Context Sensors:** Sensirion SHT45 (Air T/RH), Vishay VEML7700 (Light / PAR proxy), Melexis MLX90614 (Frond canopy IR thermometer), RS-485 capacitive soil moisture probe at $30\,\text{cm}$.
- **Edge MCU:** STMicroelectronics STM32H743 (ARM Cortex-M7 at $480\,\text{MHz}$, dual 16-bit ADCs up to $3.6\,\text{MSPS}$) running TinyML and edge feature reduction.
- **Telemetry Radio:** Semtech SX1262 LoRa transceiver operating on India's $865–867\,\text{MHz}$ band.
- **Power Subsystem:** $2\times 18650$ Li-ion cells ($6.8\,\text{Ah}$ total), MPPT solar charger, and a $6\,\text{W}$ monocrystalline solar panel tilted $25^\circ$. Delivers $\sim 28$ days of autonomous operation without sunlight.
- **Enclosure & Mechanical:** IP67 UV-resistant polycarbonate box ($160 \times 110 \times 68\,\text{mm}$) clamped via stainless steel straps to trunk saddle; shielded PUR cables with M12 circular connectors.

---

## 4. Bill of Materials (BOM) & Unit Economics

| Item Description | Qty per Node | Prototype Build (10 Units), ₹ | Production Build (1,000 Units), ₹ |
| :--- | :---: | :---: | :---: |
| Main MCU STM32H743 (+ Crystal, Flash) | 1 | 1,100 | 650 |
| Impedance AFE AD5941 + Precision RC Network | 1 | 1,200 | 600 |
| Synchronous 24-Bit ADC ADS131M08 | 1 | 900 | 520 |
| Analog Switch Matrix ADG1609 ($\times 2$) | 1 set | 800 | 450 |
| Main PCB (4-Layer, Immersion Gold) + Assembly | 1 | 2,500 | 700 |
| Electrode Pods ($\times 8$, INA Buffer, PT1000, M8) | 8 | 6,000 | 2,640 |
| Titanium Grade 2 Micro-Pin Electrodes (1 mm dia) | 10 | 800 | 400 |
| Flexible TPU Stem Straps + Over-Centre Buckles | 4 | 1,000 | 360 |
| Acoustic Sentinels (PZT Disc, Spring 12N, Preamp) | 2 | 3,600 | 1,400 |
| Micro-Dendrometer (Invar Band + AS5311 Encoder) | 1 | 1,900 | 1,000 |
| Context Sensor Pack (SHT45, VEML7700, MLX90614) | 1 set | 1,700 | 850 |
| RS-485 Capacitive Soil Moisture Probe (30 cm) | 1 | 3,200 | 1,600 |
| Semtech SX1262 LoRa Module + Antenna | 1 | 1,000 | 450 |
| Battery Pack ($2\times 18650$, BMS, MPPT Charger) | 1 | 1,400 | 800 |
| 6 W Solar Panel + Mounting Arm | 1 | 1,100 | 650 |
| IP67 Polycarbonate Enclosure + Trunk Saddle | 1 | 1,500 | 700 |
| M12 Connectors (6 Pairs) + Shielded PUR Cabling | 1 set | 3,300 | 1,300 |
| Breather Vent, Desiccant, Conformal Coating | 1 | 500 | 250 |
| **Total BOM per Field Node** | | **₹33,500** | **₹15,320** |

### Commercial Pricing Model
- **Farm Node Sale:** ₹22,000 one-time purchase + ₹6,000/year monitoring subscription per hectare.
- **Farm Node Lease:** ₹12,000/year (3-year term, zero upfront cost, replacement warranty included).
- **Research Platform Kit:** ₹45,000/node (includes dendrometer, raw waveform access, and high-frequency CSV export).
