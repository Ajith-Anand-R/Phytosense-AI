---
name: inversion-and-premortem
description: "Failure-Mode Brainstorming based on Charlie Munger's Inversion and Red-Teaming. Systematically discovers failure modes (concurrency, data loss, race conditions, edge cases, degradation) before writing code, generating robust architectural defenses."
risk: none
---

# Inversion & Premortem Protocol

## Goal
Build resilient, fault-tolerant architectures by flipping standard optimistic planning upside down. Instead of asking "How will this succeed?", ask **"How will this fail catastrophically in production, and how do we prevent it?"**

---

## Operating Philosophy
> *"Invert, always invert: Turn a situation or problem upside down. What would cause the worst possible outcome, and how do we avoid it?"* — Charlie Munger

Traditional planning suffers from optimism bias. The Inversion & Premortem protocol operates as a dedicated **Red Team**: assume the feature was built, deployed, and suffered a catastrophic failure 6 months later. Work backward to identify root causes and engineer active defenses.

---

## Strict Rules
- **READ-ONLY STATE:** This is an architectural stress-testing protocol. Do NOT write or modify application code during this analysis.
- **No Optimistic Hand-Waving:** Phrases like "this shouldn't happen," "the network is reliable," or "the user will provide valid data" are strictly forbidden.
- **Actionable Defenses:** Every identified failure mode MUST have a corresponding architectural defense, fail-safe, or detection mechanism.

---

## The 5 Core Failure Vectors

### 1. ⚡ Concurrency & Race Conditions
- What happens when 100 identical requests arrive simultaneously?
- Can two parallel workers mutate the same state or file?
- Are there non-atomic read-modify-write cycles?
- Could out-of-order asynchronous events corrupt state?

### 2. 🌐 Network, Timeout & Distributed Fallibility
- What happens when an external API or database hangs for 30 seconds instead of failing fast?
- How does the system behave during partial network partitions or half-open connections?
- Will retry loops cause a "thundering herd" or self-inflicted Denial of Service (DoS)?

### 3. 💾 Data Corruption, Partial Writes & Edge States
- If the process is killed midway through a write, does it leave corrupted, inconsistent state?
- How does the system handle zero/empty payloads, gigantic payloads (100MB+), special unicode, or deeply nested JSON?
- What happens when schemas evolve or backward-incompatible formats arrive?

### 4. 📈 Resource Starvation & Cascading Load
- Can memory leak through unbounded caches, listeners, or unbounded arrays?
- What happens when connection pools or thread pools are exhausted?
- Is there backpressure when downstream processing is slower than upstream ingress?

### 5. 🧑‍💻 Operational, Diagnostic & Silent Failure Hazards
- Can errors fail silently (e.g., swallowed exceptions, empty catch blocks)?
- If an incident occurs at 3 AM, does the log output pinpoint the root cause within 60 seconds, or is it opaque?
- What happens when environment variables or secrets are missing or misconfigured?

---

## Defense Engineering Catalog

For every vulnerability identified above, select an architectural defense:

| Vulnerability | Architectural Defense Pattern |
| :--- | :--- |
| **Duplicate Requests** | Idempotency Keys / Unique Request UUIDs |
| **Cascading Slowdowns** | Circuit Breakers, strict request timeouts, fallback stubs |
| **Resource Exhaustion** | Bounded Queues, rate limiters, backpressure, paging |
| **Partial State Mutation** | Two-phase commit, transactional boundaries, atomic temp-file swaps |
| **Race Conditions** | Optimistic concurrency control (ETags/versions), distributed locks |
| **Silent Failures** | Fail-fast assertions, structured error telemetry, health checks |

---

## Execution Steps

### Step 1: Scenario Inversion
Pose the premortem prompt to the team/user:
> *"Assume our proposed implementation was deployed to production and triggered a critical Sev-1 incident within two weeks. What went wrong?"*

### Step 2: Failure Cataloging
Enumerate the top 3–5 most probable breakdown points across the 5 Failure Vectors.

### Step 3: Hardening Recommendations
Define concrete defensive code requirements that must be incorporated into the design specification and implementation plan.

### Step 4: Premortem Sign-Off
Verify that:
1. All critical failure modes have documented mitigations.
2. Degraded/offline fallback modes are explicitly defined.
3. Health check and error reporting strategies are specified.

---

## Chaining & Handoff
- Run immediately after `@brainstorming` or `@peak-brainstorming` approach exploration.
- Pair with `@first-principles-decomp` to eliminate fragile third-party dependencies.
- Feed concrete defenses into the `@writing-plans` test suites (e.g., specific failure-injection and edge-case tests).
