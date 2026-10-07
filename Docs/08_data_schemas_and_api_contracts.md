# 08. Data Schemas & API Contracts

**Document:** 08_data_schemas_and_api_contracts.md  
**Scope:** OpenAPI REST Endpoint Specifications, Pydantic Contract Models, PostgreSQL Schema DDL, and CSV Formats  
**Target Backend:** FastAPI + Supabase PostgreSQL  

---

## 1. REST API Specification (OpenAPI Endpoints)

### 1.1 Plant & Telemetry Endpoints
- **`GET /api/plants`**
  - Query params: `farm_id` (optional), `risk_level` (optional), `page` (default 1), `limit` (default 20)
  - Returns list of active sentinel palms, current HSI, risk level, battery status, and last seen timestamp.
- **`GET /api/plants/{plant_id}`**
  - Returns detailed metadata for a single palm (farm, block, planting year, trunk circumference, baseline status, device ID).
- **`GET /api/plants/{plant_id}/signals`**
  - Query params: `start_time`, `end_time`, `resolution` (`10m`, `1h`, `1d`)
  - Returns synchronized time-series data for HSI, Cole parameters, transfer gains, acoustic hits, dendrometry, and context.
- **`GET /api/plants/{plant_id}/features`**
  - Returns the latest extracted physiological feature vector and diurnal $z$-score deviation matrix.
- **`GET /api/plants/{plant_id}/state`**
  - Returns current HSI, risk level, confidence score, state-space variables ($W, K, E, R$), signal contributions, and spatial localization.
- **`GET /api/plants/{plant_id}/forecast`**
  - Returns 6h, 12h, 24h, and 48h forward trajectories under "Do Nothing", "Irrigate Now", and "Irrigate Tonight" regimes.
- **`GET /api/plants/{plant_id}/baseline`**
  - Returns 24-hour diurnal baseline curves ($\mu$ and $\sigma$ per hour) for all features.

### 1.2 Ingestion & Hardware Interface Endpoints
- **`POST /api/sensors/ingest`**
  - Accepts a complete 10-minute multi-modal `SensorSweep` payload from the field gateway or simulator.
  - Returns sweep ID, quality status (`GOOD`/`WARNING`/`BAD`), and processing latency.
- **`GET /api/devices`**
  - Lists all field nodes, firmware versions, battery voltages, solar charging currents, LoRa RSSI/SNR, and last packet timestamps.

### 1.3 Simulation & Event Control Endpoints
- **`POST /api/simulation/start`**
  - Body: `{"scenario": "MODERATE_STRESS", "speed": 10.0, "plant_id": "PALM-001"}`
- **`POST /api/simulation/stop`**
  - Halts the running background simulator loop.
- **`POST /api/simulation/event`**
  - Injects ad-hoc events: `{"event_type": "RAIN_SQUALL" | "ELECTRODE_DISCONNECT" | "HEAT_SPIKE"}`
- **`POST /api/irrigation/event`**
  - Records an irrigation action: `{"plant_id": "PALM-001", "volume_liters": 40.0, "duration_minutes": 45, "timestamp": "..."}`

### 1.4 Research & Experimentation Endpoints
- **`GET /api/research/metrics`**
  - Returns benchmark lead-time metrics vs. soil moisture and visible symptoms for the 24-seedling experiment.
- **`POST /api/data/import`**
  - Multipart form upload of ground-truth CSV files with automated schema validation.
- **`GET /api/data/export`**
  - Query params: `plant_id`, `format` (`csv` / `json`), `include_raw` (`true` / `false`).

---

## 2. PostgreSQL Relational Database Schema (DDL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Farms & Management Units
CREATE TABLE farms (
    farm_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    location_district VARCHAR(64) NOT NULL, -- e.g., 'Shivamogga', 'Dakshina Kannada'
    total_area_ha NUMERIC(8, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blocks (
    block_id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) REFERENCES farms(farm_id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    soil_type VARCHAR(64),                  -- e.g., 'Laterite', 'Red Sandy Loam'
    irrigation_type VARCHAR(64),            -- e.g., 'Drip', 'Hose Basin'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Plants & Field Hardware
CREATE TABLE plants (
    plant_id VARCHAR(64) PRIMARY KEY,
    block_id VARCHAR(64) REFERENCES blocks(block_id) ON DELETE CASCADE,
    species VARCHAR(64) DEFAULT 'Areca catechu',
    variety VARCHAR(64) DEFAULT 'Mangala',  -- e.g., 'Mangala', 'Sumangala', 'Mohitnagar'
    age_years INT,
    trunk_circumference_mm INT DEFAULT 534, -- dia ~170 mm
    is_sentinel BOOLEAN DEFAULT TRUE,
    baseline_status VARCHAR(32) DEFAULT 'LEARNING', -- 'LEARNING', 'ACTIVE', 'DEGRADED'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE devices (
    device_id VARCHAR(64) PRIMARY KEY,
    plant_id VARCHAR(64) REFERENCES plants(plant_id) ON DELETE SET NULL,
    hardware_version VARCHAR(32) DEFAULT 'PhytoHydra-v1.0',
    firmware_version VARCHAR(32) DEFAULT '0.9.2',
    battery_voltage_mv INT,
    solar_current_ma INT,
    lora_rssi INT,
    lora_snr NUMERIC(4, 1),
    status VARCHAR(32) DEFAULT 'ONLINE',    -- 'ONLINE', 'DEGRADED', 'OFFLINE'
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ingested Multi-Modal Sweeps (Time-Series Core)
CREATE TABLE sensor_sweeps (
    sweep_id VARCHAR(64) PRIMARY KEY,
    plant_id VARCHAR(64) REFERENCES plants(plant_id) ON DELETE CASCADE,
    device_id VARCHAR(64) REFERENCES devices(device_id),
    timestamp TIMESTAMPTZ NOT NULL,
    is_simulated BOOLEAN DEFAULT TRUE,
    quality_status VARCHAR(32) NOT NULL,    -- 'GOOD', 'WARNING', 'BAD'
    quality_score NUMERIC(4, 2) NOT NULL,   -- 0.0 to 1.0
    quality_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sweeps_plant_time ON sensor_sweeps (plant_id, timestamp DESC);

-- 4. Impedance Spectra & Transfer Functions
CREATE TABLE impedance_spectra (
    id BIGSERIAL PRIMARY KEY,
    sweep_id VARCHAR(64) REFERENCES sensor_sweeps(sweep_id) ON DELETE CASCADE,
    segment VARCHAR(32) NOT NULL,           -- e.g., 'N1_N2_A', 'N2_N3_B'
    stem_temp_c NUMERIC(4, 2) NOT NULL,
    r0_fitted NUMERIC(8, 2),
    rinf_fitted NUMERIC(8, 2),
    alpha_fitted NUMERIC(4, 3),
    fc_hz_fitted NUMERIC(10, 2),
    raw_frequencies JSONB NOT NULL,
    raw_magnitudes JSONB NOT NULL,
    raw_phases JSONB NOT NULL
);

CREATE INDEX idx_impedance_sweep ON impedance_spectra (sweep_id);

CREATE TABLE transfer_functions (
    id BIGSERIAL PRIMARY KEY,
    sweep_id VARCHAR(64) REFERENCES sensor_sweeps(sweep_id) ON DELETE CASCADE,
    channel VARCHAR(32) NOT NULL,           -- e.g., 'H12_A', 'H14_B'
    mean_gain_db NUMERIC(6, 2) NOT NULL,
    mean_phase_deg NUMERIC(6, 2) NOT NULL,
    mean_coherence NUMERIC(4, 3) NOT NULL,
    raw_gain_vector JSONB,
    raw_phase_vector JSONB
);

-- 5. Acoustic & Mechanical Signals
CREATE TABLE acoustic_summaries (
    id BIGSERIAL PRIMARY KEY,
    sweep_id VARCHAR(64) REFERENCES sensor_sweeps(sweep_id) ON DELETE CASCADE,
    sensor_location VARCHAR(16) NOT NULL,   -- 'LOWER', 'UPPER'
    hits_per_hour INT NOT NULL,
    total_energy_eu NUMERIC(10, 2) NOT NULL,
    cluster_100_200khz_pct NUMERIC(5, 2) NOT NULL
);

CREATE TABLE dendrometer_readings (
    id BIGSERIAL PRIMARY KEY,
    sweep_id VARCHAR(64) REFERENCES sensor_sweeps(sweep_id) ON DELETE CASCADE,
    stem_diameter_mm NUMERIC(8, 4) NOT NULL,
    daily_shrink_um NUMERIC(6, 2) NOT NULL,
    overnight_recovery_um NUMERIC(6, 2) NOT NULL
);

CREATE TABLE context_readings (
    id BIGSERIAL PRIMARY KEY,
    sweep_id VARCHAR(64) REFERENCES sensor_sweeps(sweep_id) ON DELETE CASCADE,
    air_temp_c NUMERIC(4, 2) NOT NULL,
    relative_humidity_pct NUMERIC(5, 2) NOT NULL,
    vpd_kpa NUMERIC(4, 2) NOT NULL,
    canopy_temp_c NUMERIC(4, 2) NOT NULL,
    light_lux NUMERIC(8, 1) NOT NULL,
    soil_moisture_pct NUMERIC(5, 2) NOT NULL,
    time_since_irrigation_h NUMERIC(6, 1) NOT NULL
);

-- 6. Analytical Output & State Estimation
CREATE TABLE hydraulic_states (
    id BIGSERIAL PRIMARY KEY,
    sweep_id VARCHAR(64) REFERENCES sensor_sweeps(sweep_id) ON DELETE CASCADE,
    plant_id VARCHAR(64) REFERENCES plants(plant_id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    hydraulic_state_index NUMERIC(5, 2) NOT NULL, -- 0.0 to 100.0
    risk_level VARCHAR(32) NOT NULL,              -- 'HEALTHY', 'MILD', 'MODERATE', 'HIGH', 'CRITICAL'
    confidence NUMERIC(4, 2) NOT NULL,            -- 0.0 to 1.0
    trend VARCHAR(32) NOT NULL,                   -- 'IMPROVING', 'STABLE', 'DETERIORATING'
    hydration_w NUMERIC(4, 3),
    conductance_k NUMERIC(4, 3),
    embolism_e NUMERIC(4, 3),
    recovery_r NUMERIC(4, 3),
    localization_anomaly BOOLEAN DEFAULT FALSE,
    localization_height VARCHAR(32),
    localization_side VARCHAR(8),
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hsi_plant_time ON hydraulic_states (plant_id, timestamp DESC);

-- 7. Alerts & Events
CREATE TABLE alerts (
    alert_id VARCHAR(64) PRIMARY KEY,
    plant_id VARCHAR(64) REFERENCES plants(plant_id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    alert_type VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,          -- 'INFO', 'WARNING', 'HIGH', 'CRITICAL'
    title_en VARCHAR(256) NOT NULL,
    message_en TEXT NOT NULL,
    title_kn VARCHAR(256),
    message_kn TEXT,
    status VARCHAR(32) DEFAULT 'ACTIVE',    -- 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Ground Truth (Research Validation)
CREATE TABLE ground_truth_readings (
    id BIGSERIAL PRIMARY KEY,
    plant_id VARCHAR(64) REFERENCES plants(plant_id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    leaf_water_potential_mpa NUMERIC(5, 2), -- PMS pressure chamber reading
    pot_weight_kg NUMERIC(6, 3),            -- Transpiration load cell
    stomatal_conductance_mmol NUMERIC(6, 2),-- Porometer reading
    visible_wilting_score INT,              -- 0 (none) to 5 (severe wilting)
    operator_name VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. CSV Ground Truth Import Schema

For manual data import from the 24-seedling controlled experiments (Phase 1), the system accepts CSV files following this verified header specification:

```csv
timestamp,plant_id,leaf_water_potential_mpa,pot_weight_kg,stomatal_conductance,visible_symptom_score,soil_moisture_30cm,air_temp_c,rh_pct,notes
2026-10-15T12:00:00Z,SEEDLING-001,-0.65,48.250,185.4,0,32.4,31.2,54.0,Control group baseline
2026-10-15T12:00:00Z,SEEDLING-007,-1.45,44.120,62.1,1,18.2,31.5,52.5,Moderate deficit trial Day 4
```
