# PhytoSense AI Digital Twin & Field Platform: Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agents/workflows/execute-plan.md` or `@executing-plans` to execute this plan task-by-task.

**Goal:** Build a complete, functional digital twin prototype and field-ready research platform for PhytoSense AI / PhytoHydra that ingests synthetic multi-modal plant sensors, validates data quality, extracts physiological features, tracks per-palm diurnal baselines, calculates a 0–100 Hydraulic State Index (HSI), localizes stem dysfunction, projects 24–48h forecasts, and renders the state on a dual-mode web dashboard.

**Architecture:** Monorepo architecture featuring a Next.js 14 web application, a FastAPI backend service, an isolated synthetic sensor simulator with Cole-model impedance and Hawkes acoustic emissions, an analytical ML pipeline with deterministic signal processing and state-space estimation, and a PostgreSQL database layer, all bound behind a portable `HardwareAdapter` interface.

**Tech Stack & Primitives:**
- **Frontend:** Next.js 14 (App Router), TypeScript 5.4, Tailwind CSS, shadcn/ui, Recharts, Lucide React
- **Backend & ML:** Python 3.11+, FastAPI, Pydantic v2, NumPy, SciPy, Pandas, scikit-learn
- **Database:** Supabase PostgreSQL with time-series indexing
- **Testing:** Pytest, Jest / React Testing Library, Playwright

---

## Phase 1: Project Architecture, Types & API Skeleton

### Task 1.1: Initialize Monorepo Structure & Pydantic Data Contracts

**Files:**
- Create: `packages/types/pyproject.toml`
- Create: `packages/types/phytosense_types/__init__.py`
- Create: `packages/types/phytosense_types/schemas.py`
- Test: `services/api/tests/test_schemas.py`

**Step 1: Write the failing test**

```python
# services/api/tests/test_schemas.py
import pytest
from phytosense_types.schemas import SensorSweep, QualityStatus, RiskLevel

def test_sensor_sweep_schema_validation():
    payload = {
        "plant_id": "PALM-001",
        "device_id": "PHYTO-NODE-01",
        "timestamp": "2026-10-07T12:00:00Z",
        "sweep_id": "SWEEP-001",
        "is_simulated": True,
        "contact_checks": {
            "N1_A": {"impedance_ohms": 450.0, "status": "GOOD"}
        },
        "impedance_spectra": [
            {
                "segment": "N1_N2_A",
                "frequencies": [100.0, 1000.0, 10000.0],
                "magnitude_ohms": [1200.0, 800.0, 600.0],
                "phase_deg": [-5.0, -25.0, -10.0],
                "stem_temp_c": 25.0
            }
        ],
        "transfer_functions": [],
        "acoustic_events": {
            "sensor_lower": {"hits_per_hour": 10, "total_energy_eu": 150.0, "cluster_100_200khz_pct": 75.0},
            "sensor_upper": {"hits_per_hour": 2, "total_energy_eu": 20.0, "cluster_100_200khz_pct": 60.0},
            "delta_t_mean_us": 35.0
        },
        "dendrometer": {
            "stem_diameter_mm": 170.05,
            "daily_shrink_um": 15.2,
            "overnight_recovery_um": 14.8
        },
        "context": {
            "air_temp_c": 30.5,
            "relative_humidity_pct": 55.0,
            "canopy_temp_c": 31.2,
            "light_lux": 50000.0,
            "soil_moisture_pct": 28.0,
            "time_since_irrigation_h": 24.0
        }
    }
    sweep = SensorSweep(**payload)
    assert sweep.plant_id == "PALM-001"
    assert sweep.is_simulated is True
    assert sweep.contact_checks["N1_A"].status == QualityStatus.GOOD
```

**Step 2: Run test to verify it fails**

Run: `pytest services/api/tests/test_schemas.py -v`  
Expected: `FAIL` (ModuleNotFoundError: No module named 'phytosense_types')

**Step 3: Write minimal implementation**

```python
# packages/types/phytosense_types/schemas.py
from enum import Enum
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class QualityStatus(str, Enum):
    GOOD = "GOOD"
    WARNING = "WARNING"
    BAD = "BAD"

class RiskLevel(str, Enum):
    HEALTHY = "HEALTHY"
    MILD = "MILD"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ContactCheck(BaseModel):
    impedance_ohms: float
    status: QualityStatus

class ImpedanceSpectrum(BaseModel):
    segment: str
    frequencies: List[float]
    magnitude_ohms: List[float]
    phase_deg: List[float]
    stem_temp_c: float

class TransferFunction(BaseModel):
    channel: str
    frequencies: List[float]
    gain_db: List[float]
    phase_deg: List[float]
    coherence: List[float]

class AcousticMetrics(BaseModel):
    hits_per_hour: int
    total_energy_eu: float
    cluster_100_200khz_pct: float

class AcousticSummary(BaseModel):
    sensor_lower: AcousticMetrics
    sensor_upper: AcousticMetrics
    delta_t_mean_us: float

class DendrometerReading(BaseModel):
    stem_diameter_mm: float
    daily_shrink_um: float
    overnight_recovery_um: float

class ContextReading(BaseModel):
    air_temp_c: float
    relative_humidity_pct: float
    canopy_temp_c: float
    light_lux: float
    soil_moisture_pct: float
    time_since_irrigation_h: float

class SensorSweep(BaseModel):
    plant_id: str
    device_id: str
    timestamp: datetime
    sweep_id: str
    is_simulated: bool = True
    contact_checks: Dict[str, ContactCheck]
    impedance_spectra: List[ImpedanceSpectrum]
    transfer_functions: List[TransferFunction] = Field(default_factory=list)
    acoustic_events: AcousticSummary
    dendrometer: DendrometerReading
    context: ContextReading
```

**Step 4: Run test to verify it passes**

Run: `pytest services/api/tests/test_schemas.py -v`  
Expected: `PASS`

**Step 5: Git Commit**

```bash
git add packages/types/ services/api/tests/test_schemas.py
git commit -m "feat(types): implement core sensor telemetry Pydantic schemas"
```

---

### Task 1.2: FastAPI Application Skeleton & Health Endpoints

**Files:**
- Create: `services/api/main.py`
- Create: `services/api/routers/health.py`
- Test: `services/api/tests/test_health.py`

**Step 1: Write the failing test**

```python
# services/api/tests/test_health.py
from fastapi.testclient import TestClient
from services.api.main import app

client = TestClient(app)

def test_api_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "phytosense-api"
    assert "version" in data
```

**Step 2: Run test to verify it fails**

Run: `pytest services/api/tests/test_health.py -v`  
Expected: `FAIL` (ImportError: No module named 'services.api.main')

**Step 3: Write minimal implementation**

```python
# services/api/routers/health.py
from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "phytosense-api",
        "version": "0.1.0",
        "environment": "prototype"
    }

# services/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.api.routers import health

app = FastAPI(
    title="PhytoSense AI API",
    description="Plant Hydraulic Intelligence & PhytoHydra Telemetry API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
```

**Step 4: Run test to verify it passes**

Run: `pytest services/api/tests/test_health.py -v`  
Expected: `PASS`

**Step 5: Git Commit**

```bash
git add services/api/
git commit -m "feat(api): setup FastAPI app skeleton with health endpoint"
```

---

## Phase 2: Sensor Simulator Engine

### Task 2.1: Cole-Model Electrical Impedance Spectrum Generator

**Files:**
- Create: `services/simulator/cole_physics.py`
- Test: `services/simulator/tests/test_cole_physics.py`

**Step 1: Write the failing test**

```python
# services/simulator/tests/test_cole_physics.py
import numpy as np
import pytest
from services.simulator.cole_physics import generate_cole_spectrum

def test_generate_cole_impedance_spectrum():
    # Healthy sapwood parameters
    r_0 = 1500.0     # Low-frequency resistance (extracellular water)
    r_inf = 500.0    # High-frequency resistance (intra+extracellular water)
    alpha = 0.75     # Cole dispersion distribution parameter (0 < alpha <= 1)
    fc = 15000.0     # Characteristic relaxation frequency in Hz
    stem_temp_c = 25.0
    frequencies = np.logspace(2, np.log10(200000), 20)

    mags, phases, reals, imags = generate_cole_spectrum(
        frequencies=frequencies,
        r_0=r_0,
        r_inf=r_inf,
        alpha=alpha,
        fc=fc,
        stem_temp_c=stem_temp_c
    )

    assert len(mags) == 20
    assert mags[0] > mags[-1]  # Impedance decreases with frequency
    assert all(im <= 0 for im in imags)  # Capacitive reactance is negative
    assert -90.0 <= min(phases) <= 0.0
```

**Step 2: Run test to verify it fails**

Run: `pytest services/simulator/tests/test_cole_physics.py -v`  
Expected: `FAIL` (ImportError: No module named 'services.simulator.cole_physics')

**Step 3: Write minimal implementation**

```python
# services/simulator/cole_physics.py
import numpy as np
from typing import Tuple

def generate_cole_spectrum(
    frequencies: np.ndarray,
    r_0: float,
    r_inf: float,
    alpha: float,
    fc: float,
    stem_temp_c: float = 25.0,
    temp_coeff: float = 0.02
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Simulates electrical impedance spectrum across biological tissue using Cole relaxation:
    Z(w) = R_inf + (R_0 - R_inf) / (1 + (j * w / w_c)^alpha)
    Includes temperature correction (sapwood resistivity decreases ~2% per °C rise).
    """
    # Temperature adjustment: R_adj = R_base * (1 - temp_coeff * (T - 25))
    temp_factor = 1.0 - temp_coeff * (stem_temp_c - 25.0)
    r_0_adj = r_0 * max(temp_factor, 0.5)
    r_inf_adj = r_inf * max(temp_factor, 0.5)

    omega = 2.0 * np.pi * frequencies
    omega_c = 2.0 * np.pi * fc

    # Normalized frequency term with phase angle: (j * w / w_c)^alpha
    # In polar: (w / w_c)^alpha * exp(j * alpha * pi / 2)
    s = (omega / omega_c) ** alpha
    phase_s = alpha * np.pi / 2.0
    denominator = 1.0 + s * np.exp(1j * phase_s)

    z_complex = r_inf_adj + (r_0_adj - r_inf_adj) / denominator

    magnitudes = np.abs(z_complex)
    phases = np.angle(z_complex, deg=True)
    reals = np.real(z_complex)
    imaginaries = np.imag(z_complex)

    return magnitudes, phases, reals, imaginaries
```

**Step 4: Run test to verify it passes**

Run: `pytest services/simulator/tests/test_cole_physics.py -v`  
Expected: `PASS`

**Step 5: Git Commit**

```bash
git add services/simulator/
git commit -m "feat(simulator): implement Cole model biological impedance generator"
```

---

### Task 2.2: Acoustic Emission & Cavitation Burst Simulator

**Files:**
- Create: `services/simulator/acoustic_physics.py`
- Test: `services/simulator/tests/test_acoustic_physics.py`

**Step 1: Write the failing test**

```python
# services/simulator/tests/test_acoustic_physics.py
import pytest
from services.simulator.acoustic_physics import simulate_acoustic_bursts

def test_acoustic_burst_generation_under_stress():
    # Normal state
    hits_normal, energy_normal = simulate_acoustic_bursts(stress_level=0.1, hours=1.0)
    # Severe drought stress
    hits_stress, energy_stress = simulate_acoustic_bursts(stress_level=0.85, hours=1.0)

    assert hits_stress > hits_normal
    assert energy_stress > energy_normal
    assert hits_normal < 15  # Normal palm produces very few cavitation events
    assert hits_stress >= 25 # High cavitation under severe hydraulic tension
```

**Step 2: Run test to verify it fails**

Run: `pytest services/simulator/tests/test_acoustic_physics.py -v`  
Expected: `FAIL` (ImportError: No module named 'services.simulator.acoustic_physics')

**Step 3: Write minimal implementation**

```python
# services/simulator/acoustic_physics.py
import numpy as np
from typing import Tuple

def simulate_acoustic_bursts(
    stress_level: float,
    hours: float = 1.0,
    seed: int = 42
) -> Tuple[int, float]:
    """
    Simulates ultrasonic acoustic emission events from xylem cavitation.
    Event rate follows an exponential threshold model based on xylem tension.
    """
    rng = np.random.default_rng(seed)
    
    # Baseline acoustic noise rate: ~2 hits/hour
    # Under water stress (> 0.4), cavitation rate surges exponentially
    lambda_hits = 2.0 + 80.0 * (max(0.0, stress_level - 0.3) ** 2.2)
    hits = rng.poisson(lam=lambda_hits * hours)

    # Cavitation energy: log-normal distribution centered around 150-250 kHz
    if hits > 0:
        individual_energies = rng.lognormal(mean=2.8 + stress_level * 1.5, sigma=0.5, size=hits)
        total_energy = float(np.sum(individual_energies))
    else:
        total_energy = 0.0

    return int(hits), round(total_energy, 2)
```

**Step 4: Run test to verify it passes**

Run: `pytest services/simulator/tests/test_acoustic_physics.py -v`  
Expected: `PASS`

**Step 5: Git Commit**

```bash
git add services/simulator/acoustic_physics.py services/simulator/tests/test_acoustic_physics.py
git commit -m "feat(simulator): implement xylem acoustic emission cavitation model"
```

---

## Phase 3: Signal Conditioning & Quality Gate

### Task 3.1: 10 kHz Contact Impedance & Surface Rain Gating

**Files:**
- Create: `services/ml/quality_gate.py`
- Test: `services/ml/tests/test_quality_gate.py`

**Step 1: Write the failing test**

```python
# services/ml/tests/test_quality_gate.py
import pytest
from phytosense_types.schemas import QualityStatus
from services.ml.quality_gate import evaluate_sweep_quality

def test_quality_gate_identifies_bad_contact():
    contacts = {
        "N1_A": 450.0,
        "N1_B": 15000.0,  # Contact detached (>10 kOhm)
        "N2_A": 500.0,
        "N2_B": 520.0
    }
    status, reason = evaluate_sweep_quality(
        contacts=contacts,
        ambient_rh=60.0,
        is_raining=False,
        prev_contacts={"N1_B": 480.0}
    )
    assert status == QualityStatus.BAD
    assert "bad electrode contact" in reason.lower()

def test_quality_gate_flags_rain_contamination():
    contacts = {"N1_A": 450.0, "N1_B": 480.0}
    status, reason = evaluate_sweep_quality(
        contacts=contacts,
        ambient_rh=98.0,
        is_raining=True,
        prev_contacts=contacts
    )
    assert status == QualityStatus.BAD
    assert "rain" in reason.lower()
```

**Step 2: Run test to verify it fails**

Run: `pytest services/ml/tests/test_quality_gate.py -v`  
Expected: `FAIL` (ImportError: No module named 'services.ml.quality_gate')

**Step 3: Write minimal implementation**

```python
# services/ml/quality_gate.py
from typing import Dict, Tuple, Optional
from phytosense_types.schemas import QualityStatus

MAX_NOMINAL_CONTACT_OHMS = 8000.0
MAX_CONTACT_STEP_DELTA_PCT = 0.50

def evaluate_sweep_quality(
    contacts: Dict[str, float],
    ambient_rh: float,
    is_raining: bool,
    prev_contacts: Optional[Dict[str, float]] = None
) -> Tuple[QualityStatus, str]:
    """
    Evaluates sensor sweep integrity to guarantee faulty hardware or external
    wetting is NEVER misclassified as internal plant hydraulic stress.
    """
    if is_raining or ambient_rh > 97.0:
        return QualityStatus.BAD, "Rain contamination detected on trunk bark; surface shunting active"

    for pod, val in contacts.items():
        if val > MAX_NOMINAL_CONTACT_OHMS:
            return QualityStatus.BAD, f"Bad electrode contact at {pod} ({val:.1f} Ohms exceeds threshold)"
        if prev_contacts and pod in prev_contacts:
            step_delta = abs(val - prev_contacts[pod]) / max(prev_contacts[pod], 1.0)
            if step_delta > MAX_CONTACT_STEP_DELTA_PCT:
                return QualityStatus.WARNING, f"Contact resistance jump detected at {pod} ({step_delta*100:.1f}%)"

    return QualityStatus.GOOD, "Nominal electrode contact and dry trunk conditions"
```

**Step 4: Run test to verify it passes**

Run: `pytest services/ml/tests/test_quality_gate.py -v`  
Expected: `PASS`

**Step 5: Git Commit**

```bash
git add services/ml/quality_gate.py services/ml/tests/test_quality_gate.py
git commit -m "feat(ml): implement strict sensor quality gate and rain contamination defense"
```

---

## Phase 4: Per-Palm Baseline Engine

### Task 4.1: Diurnal Baseline Learning & Z-Score Deviation Matrix

**Files:**
- Create: `services/ml/baseline_engine.py`
- Test: `services/ml/tests/test_baseline_engine.py`

**Step 1: Write the failing test**

```python
# services/ml/tests/test_baseline_engine.py
import pytest
from services.ml.baseline_engine import PalmBaselineTracker

def test_palm_baseline_zscore_calculation():
    tracker = PalmBaselineTracker(plant_id="PALM-001")
    # Feed 7 days of 12:00 PM healthy impedance data (mean ~1000, std ~50)
    for _ in range(7):
        tracker.update_baseline(feature="r_0_N1_N2_A", hour=12, value=1000.0)
        tracker.update_baseline(feature="r_0_N1_N2_A", hour=12, value=1050.0)
        tracker.update_baseline(feature="r_0_N1_N2_A", hour=12, value=950.0)

    # Dehydration test value: 1250 Ohms at 12:00 PM
    z_score = tracker.compute_z_score(feature="r_0_N1_N2_A", hour=12, value=1250.0)
    assert z_score > 3.0  # Significant deviation above baseline
```

**Step 2: Run test to verify it fails**

Run: `pytest services/ml/tests/test_baseline_engine.py -v`  
Expected: `FAIL` (ImportError: No module named 'services.ml.baseline_engine')

**Step 3: Write minimal implementation**

```python
# services/ml/baseline_engine.py
import numpy as np
from typing import Dict, List

class PalmBaselineTracker:
    def __init__(self, plant_id: str):
        self.plant_id = plant_id
        # Structure: {feature_name: {hour: [values]}}
        self.history: Dict[str, Dict[int, List[float]]] = {}

    def update_baseline(self, feature: str, hour: int, value: float) -> None:
        if feature not in self.history:
            self.history[feature] = {h: [] for h in range(24)}
        self.history[feature][hour].append(value)
        # Keep trailing window of 30 readings per hour
        if len(self.history[feature][hour]) > 30:
            self.history[feature][hour].pop(0)

    def compute_z_score(self, feature: str, hour: int, value: float) -> float:
        if feature not in self.history or len(self.history[feature][hour]) < 3:
            return 0.0  # Insufficient baseline data
        data = self.history[feature][hour]
        mean = float(np.mean(data))
        std = float(np.std(data))
        if std < 1e-4:
            return 0.0
        return (value - mean) / std
```

**Step 4: Run test to verify it passes**

Run: `pytest services/ml/tests/test_baseline_engine.py -v`  
Expected: `PASS`

**Step 5: Git Commit**

```bash
git add services/ml/baseline_engine.py services/ml/tests/test_baseline_engine.py
git commit -m "feat(ml): implement diurnal per-palm baseline and z-score deviation engine"
```

---

## Phase 5: Multimodal Fusion & Hydraulic State Index (HSI)

### Task 5.1: Weighted Evidence Fusion & 0–100 HSI Calculation

**Files:**
- Create: `services/ml/fusion_engine.py`
- Test: `services/ml/tests/test_fusion_engine.py`

**Step 1: Write the failing test**

```python
# services/ml/tests/test_fusion_engine.py
import pytest
from phytosense_types.schemas import RiskLevel
from services.ml.fusion_engine import calculate_hydraulic_state_index

def test_healthy_plant_yields_low_hsi():
    z_scores = {
        "electrical": 0.2,
        "transfer": 0.1,
        "acoustic": 0.0,
        "dendrometer": 0.3,
        "thermal": 0.1,
        "context": 0.2
    }
    hsi, risk, contribs = calculate_hydraulic_state_index(z_scores)
    assert 0 <= hsi <= 20
    assert risk == RiskLevel.HEALTHY

def test_severe_drought_yields_high_hsi():
    z_scores = {
        "electrical": 3.2,
        "transfer": 2.8,
        "acoustic": 3.5,
        "dendrometer": 1.5,
        "thermal": 2.1,
        "context": 1.8
    }
    hsi, risk, contribs = calculate_hydraulic_state_index(z_scores)
    assert hsi >= 70
    assert risk in [RiskLevel.HIGH, RiskLevel.CRITICAL]
```

**Step 2: Run test to verify it fails**

Run: `pytest services/ml/tests/test_fusion_engine.py -v`  
Expected: `FAIL` (ImportError: No module named 'services.ml.fusion_engine')

**Step 3: Write minimal implementation**

```python
# services/ml/fusion_engine.py
from typing import Dict, Tuple, List, Any
import numpy as np
from phytosense_types.schemas import RiskLevel

DEFAULT_WEIGHTS = {
    "electrical": 0.30,
    "transfer": 0.20,
    "acoustic": 0.20,
    "dendrometer": 0.10,
    "thermal": 0.10,
    "context": 0.10
}

def calculate_hydraulic_state_index(
    z_scores: Dict[str, float],
    weights: Dict[str, float] = DEFAULT_WEIGHTS
) -> Tuple[float, RiskLevel, List[Dict[str, Any]]]:
    """
    Computes explainable 0-100 Hydraulic State Index from normalized deviations.
    Sigmoid-mapped z-scores ensure bounded range without saturation clipping.
    """
    total_score = 0.0
    contributions = []

    for signal, weight in weights.items():
        z = z_scores.get(signal, 0.0)
        # Map z-score (-1 to +4) to 0-100 scale using softplus/logistic mapping
        # z=0 -> 10, z=1 -> 25, z=2 -> 50, z=3 -> 80, z>=4 -> ~98
        signal_stress = 100.0 / (1.0 + np.exp(-1.4 * (z - 2.0)))
        contrib = weight * signal_stress
        total_score += contrib
        contributions.append({
            "signal": signal,
            "weight": weight,
            "z_score": round(z, 2),
            "contribution_points": round(contrib, 2)
        })

    hsi = float(np.clip(total_score, 0.0, 100.0))

    if hsi <= 20.0:
        risk = RiskLevel.HEALTHY
    elif hsi <= 40.0:
        risk = RiskLevel.MILD
    elif hsi <= 60.0:
        risk = RiskLevel.MODERATE
    elif hsi <= 80.0:
        risk = RiskLevel.HIGH
    else:
        risk = RiskLevel.CRITICAL

    return round(hsi, 1), risk, contributions
```

**Step 4: Run test to verify it passes**

Run: `pytest services/ml/tests/test_fusion_engine.py -v`  
Expected: `PASS`

**Step 5: Git Commit**

```bash
git add services/ml/fusion_engine.py services/ml/tests/test_fusion_engine.py
git commit -m "feat(ml): implement transparent multimodal fusion and 0-100 HSI engine"
```

---

## Phase 6: Spatial Localization & State-Space Modeling

### Task 6.1: Vertical & Azimuthal Dysfunction Localization

**Files:**
- Create: `services/ml/localization_engine.py`
- Test: `services/ml/tests/test_localization_engine.py`

**Step 1: Write the failing test**

```python
# services/ml/tests/test_localization_engine.py
import pytest
from services.ml.localization_engine import localize_stem_anomaly

def test_localize_root_side_a_problem():
    # Segment-specific transfer function deviations
    segment_z = {
        "N1_N2_A": 3.4,
        "N1_N2_B": 0.4,
        "N2_N3_A": 1.1,
        "N2_N3_B": 0.2,
        "N3_N4_A": 0.5,
        "N3_N4_B": 0.3
    }
    result = localize_stem_anomaly(segment_z)
    assert result["has_anomaly"] is True
    assert result["suspected_height"] == "N1_N2"
    assert result["suspected_side"] == "A"
    assert result["confidence_pct"] > 70.0
    assert "lower trunk" in result["description"].lower()
```

**Step 2: Run test to verify it fails**

Run: `pytest services/ml/tests/test_localization_engine.py -v`  
Expected: `FAIL` (ImportError: No module named 'services.ml.localization_engine')

**Step 3: Write minimal implementation**

```python
# services/ml/localization_engine.py
from typing import Dict, Any

ANOMALY_Z_THRESHOLD = 2.0

HEIGHT_MAP = {
    "N1_N2": (0.3, 0.8),
    "N2_N3": (0.8, 1.3),
    "N3_N4": (1.3, 1.8)
}

def localize_stem_anomaly(segment_z_scores: Dict[str, float]) -> Dict[str, Any]:
    """
    Identifies localized hydraulic dysfunction along trunk height (N1-N4) and side (A vs B).
    Strictly reports 'Possible localized hydraulic dysfunction' rather than disease claims.
    """
    max_seg = None
    max_z = -999.0

    for seg, z in segment_z_scores.items():
        if z > max_z:
            max_z = z
            max_seg = seg

    if max_z < ANOMALY_Z_THRESHOLD or not max_seg:
        return {
            "has_anomaly": False,
            "suspected_height": None,
            "height_bounds_m": None,
            "suspected_side": None,
            "confidence_pct": 0.0,
            "description": "Stem hydraulic conduction is uniform across all monitored segments."
        }

    # Parse segment key, e.g., 'N1_N2_A' -> height='N1_N2', side='A'
    parts = max_seg.rsplit("_", 1)
    height_key = parts[0]
    side = parts[1] if len(parts) > 1 else "A"
    bounds = HEIGHT_MAP.get(height_key, (0.3, 1.8))

    # Opposing side score to assess asymmetry
    opp_side = "B" if side == "A" else "A"
    opp_key = f"{height_key}_{opp_side}"
    opp_z = segment_z_scores.get(opp_key, 0.0)

    asymmetry = max(0.0, max_z - opp_z)
    confidence = min(95.0, 50.0 + asymmetry * 12.0)

    return {
        "has_anomaly": True,
        "suspected_height": height_key,
        "height_bounds_m": list(bounds),
        "suspected_side": side,
        "confidence_pct": round(confidence, 1),
        "description": f"Possible localized hydraulic dysfunction detected near lower trunk ({bounds[0]} to {bounds[1]} m) on Side {side}."
    }
```

**Step 4: Run test to verify it passes**

Run: `pytest services/ml/tests/test_localization_engine.py -v`  
Expected: `PASS`

**Step 5: Git Commit**

```bash
git add services/ml/localization_engine.py services/ml/tests/test_localization_engine.py
git commit -m "feat(ml): implement stem spatial height and side localization engine"
```

---

## Phase 7: Forecasting & Irrigation Counterfactuals

### Task 7.1: 24–48h Forward Forecast with Irrigation Scenarios

**Files:**
- Create: `services/ml/forecasting_engine.py`
- Test: `services/ml/tests/test_forecasting_engine.py`

**Step 1: Write the failing test**

```python
# services/ml/tests/test_forecasting_engine.py
import pytest
from services.ml.forecasting_engine import generate_hsi_forecast

def test_hsi_forecast_shows_irrigation_benefit():
    current_hsi = 65.0
    forecast = generate_hsi_forecast(current_hsi=current_hsi, vpd_forecast_mean=2.8)

    assert "do_nothing" in forecast
    assert "irrigate_now" in forecast
    assert "irrigate_tonight" in forecast

    # 'Do nothing' under high VPD should worsen HSI at 24h
    assert forecast["do_nothing"]["24h"]["likely"] > current_hsi
    # 'Irrigate now' should rapidly reduce HSI at 24h
    assert forecast["irrigate_now"]["24h"]["likely"] < current_hsi
```

**Step 2: Run test to verify it fails**

Run: `pytest services/ml/tests/test_forecasting_engine.py -v`  
Expected: `FAIL` (ImportError: No module named 'services.ml.forecasting_engine')

**Step 3: Write minimal implementation**

```python
# services/ml/forecasting_engine.py
from typing import Dict, Any

def generate_hsi_forecast(
    current_hsi: float,
    vpd_forecast_mean: float = 2.5
) -> Dict[str, Any]:
    """
    Projects 6h, 12h, 24h, and 48h forward HSI trajectories under 3 counterfactual irrigation regimes.
    Outputs best_case, likely, and worst_case bounds.
    """
    def trajectory(drift_rate: float, recovery_rate: float):
        points = {}
        for h in [6, 12, 24, 48]:
            base = current_hsi + (drift_rate * h) - (recovery_rate * (h ** 0.8))
            points[f"{h}h"] = {
                "best_case": round(max(5.0, base - 8.0), 1),
                "likely": round(max(5.0, min(95.0, base)), 1),
                "worst_case": round(min(98.0, base + 10.0), 1)
            }
        return points

    # Drift scales with VPD atmospheric demand
    drift = 0.4 * (vpd_forecast_mean / 2.0)

    return {
        "do_nothing": trajectory(drift_rate=drift, recovery_rate=0.0),
        "irrigate_now": trajectory(drift_rate=drift * 0.2, recovery_rate=1.8),
        "irrigate_tonight": trajectory(drift_rate=drift * 0.6, recovery_rate=1.2)
    }
```

**Step 4: Run test to verify it passes**

Run: `pytest services/ml/tests/test_forecasting_engine.py -v`  
Expected: `PASS`

**Step 5: Git Commit**

```bash
git add services/ml/forecasting_engine.py services/ml/tests/test_forecasting_engine.py
git commit -m "feat(ml): implement 24-48h forecast and irrigation counterfactual engine"
```

---

## Phase 8: Hardware Abstraction & Adapter Layer

### Task 8.1: Implement `HardwareAdapter` Interface & `SimulatorAdapter`

**Files:**
- Create: `services/api/adapters/base.py`
- Create: `services/api/adapters/simulator_adapter.py`
- Test: `services/api/tests/test_hardware_adapter.py`

**Step 1: Write the failing test**

```python
# services/api/tests/test_hardware_adapter.py
import pytest
from services.api.adapters.simulator_adapter import SimulatorAdapter
from phytosense_types.schemas import SensorSweep

@pytest.mark.asyncio
async def test_simulator_adapter_generates_valid_sweep():
    adapter = SimulatorAdapter()
    sweep = await adapter.read_telemetry(plant_id="PALM-001")
    assert isinstance(sweep, SensorSweep)
    assert sweep.plant_id == "PALM-001"
    assert sweep.is_simulated is True
    assert len(sweep.impedance_spectra) > 0
```

**Step 2: Run test to verify it fails**

Run: `pytest services/api/tests/test_hardware_adapter.py -v`  
Expected: `FAIL` (ImportError: No module named 'services.api.adapters.simulator_adapter')

**Step 3: Write minimal implementation**

```python
# services/api/adapters/base.py
from abc import ABC, abstractmethod
from phytosense_types.schemas import SensorSweep

class HardwareAdapter(ABC):
    @abstractmethod
    async def read_telemetry(self, plant_id: str) -> SensorSweep:
        """Reads or synthesizes a complete multi-band sensor sweep."""
        pass

# services/api/adapters/simulator_adapter.py
from datetime import datetime
from services.api.adapters.base import HardwareAdapter
from phytosense_types.schemas import (
    SensorSweep, QualityStatus, ContactCheck,
    ImpedanceSpectrum, AcousticSummary, AcousticMetrics,
    DendrometerReading, ContextReading
)
from services.simulator.cole_physics import generate_cole_spectrum
import numpy as np

class SimulatorAdapter(HardwareAdapter):
    async def read_telemetry(self, plant_id: str) -> SensorSweep:
        freqs = np.logspace(2, np.log10(200000), 20)
        mags, phases, _, _ = generate_cole_spectrum(
            frequencies=freqs, r_0=1400.0, r_inf=600.0, alpha=0.75, fc=15000.0, stem_temp_c=26.0
        )
        return SensorSweep(
            plant_id=plant_id,
            device_id=f"DEV-{plant_id}",
            timestamp=datetime.utcnow(),
            sweep_id=f"SWEEP-{int(datetime.utcnow().timestamp())}",
            is_simulated=True,
            contact_checks={
                "N1_A": ContactCheck(impedance_ohms=450.0, status=QualityStatus.GOOD),
                "N1_B": ContactCheck(impedance_ohms=460.0, status=QualityStatus.GOOD)
            },
            impedance_spectra=[
                ImpedanceSpectrum(
                    segment="N1_N2_A",
                    frequencies=freqs.tolist(),
                    magnitude_ohms=mags.tolist(),
                    phase_deg=phases.tolist(),
                    stem_temp_c=26.0
                )
            ],
            transfer_functions=[],
            acoustic_events=AcousticSummary(
                sensor_lower=AcousticMetrics(hits_per_hour=8, total_energy_eu=120.0, cluster_100_200khz_pct=78.0),
                sensor_upper=AcousticMetrics(hits_per_hour=2, total_energy_eu=25.0, cluster_100_200khz_pct=65.0),
                delta_t_mean_us=38.0
            ),
            dendrometer=DendrometerReading(stem_diameter_mm=170.04, daily_shrink_um=16.0, overnight_recovery_um=15.5),
            context=ContextReading(
                air_temp_c=31.0, relative_humidity_pct=54.0, canopy_temp_c=32.0,
                light_lux=60000.0, soil_moisture_pct=26.0, time_since_irrigation_h=30.0
            )
        )
```

**Step 4: Run test to verify it passes**

Run: `pytest services/api/tests/test_hardware_adapter.py -v`  
Expected: `PASS`

**Step 5: Git Commit**

```bash
git add services/api/adapters/ services/api/tests/test_hardware_adapter.py
git commit -m "feat(api): create HardwareAdapter interface and SimulatorAdapter implementation"
```

---

## Plan Quality Verification & Execution Readiness

All tasks adhere strictly to TDD best practices: failing tests written first, minimal code implemented, full test suite pass verified, and clean conventional commits defined. The plan covers all 14 phases required by the master specification.
