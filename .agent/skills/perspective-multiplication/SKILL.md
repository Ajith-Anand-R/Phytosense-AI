---
name: perspective-multiplication
description: "Stakeholder Emulation & Multi-Lens Evaluation. Forces systematic analysis of architecture and features across 4 distinct lenses (End-User, Security/Infra, Product/Business, and Maintainer) before selecting an implementation path."
risk: none
---

# Perspective Multiplication Protocol

## Goal
Overcome developer tunnel vision, premature architectural convergence, and localized optimization by evaluating any proposed feature, system, or refactor through **4 distinct stakeholder lenses**.

---

## Strict Rules
- **No Unilateral Decisions:** Never evaluate an architectural approach solely from the developer's perspective of "convenience" or "ease of coding."
- **Explicit Conflict Exposure:** When two lenses disagree (e.g., Security demands strict rate limits vs. End-User demands zero-friction onboarding), explicitly surface the conflict rather than quietly picking a side.
- **READ-ONLY GATE:** Do not write code or modify project files while executing perspective multiplication.

---

## The 4 Cognitive Lenses

### 1. 👤 The End-User & Developer Experience Lens
**Primary Priority:** Ergonomics, cognitive load, intuitive APIs, low latency, feedback clarity.
- What is the user's mental model? Does this match standard conventions?
- How painful is error recovery when invalid inputs or failed states happen?
- What is the cognitive load required to understand or consume this API/UI?
- Are defaults sensible and zero-configuration wherever possible?

### 2. 🛡️ The Security & Infrastructure Engineer Lens
**Primary Priority:** Threat modeling, principle of least privilege, resource starvation, blast radius.
- What is the attack surface? Where does untrusted input cross trust boundaries?
- How are secrets, credentials, and sensitive state managed?
- What happens under abnormal spikes or denial-of-service attempts?
- What are the concurrency, memory, and disk footprint upper bounds?
- Is there an audit trail or structured logging for security-relevant operations?

### 3. 📈 The Product & Business Value Lens
**Primary Priority:** Time-to-value, MVP scoping, maintenance cost, opportunity cost, non-goals.
- Does this feature directly solve the primary customer problem, or is it accidental complexity?
- What is the cost of delay (time-to-market)?
- What is the ongoing maintenance overhead (vendor lock-in, recurring operational fees)?
- What items should be ruthlessly cut into a future milestone (YAGNI)?

### 4. 🔧 The Maintainer & Systems Operator Lens
**Primary Priority:** Code navigability, testability, debugging simplicity, observability, dependency debt.
- In 18 months, when a bug strikes at 2 AM, how easily can an on-call engineer diagnose it?
- Can this code be tested without spinning up 5 external Docker containers or heavy mocks?
- How many third-party dependencies does this add? What is their maintenance health?
- Does this introduce architectural drift or diverge from existing patterns in the codebase?

---

## Evaluation Workflow

### Step 1: Candidate Framing
Take the 2–3 architectural approaches generated during `@brainstorming` or `@peak-brainstorming`.

### Step 2: Lens Scorecard (Cross-Perspective Matrix)
Evaluate each candidate against the 4 lenses:

| Architectural Approach | 👤 End-User / DX | 🛡️ Security / Infra | 📈 Product / Business | 🔧 Maintainer / SRE |
| :--- | :--- | :--- | :--- | :--- |
| **Approach A (Minimalist)** | High simplicity; limited features | Minimal attack surface; low footprint | Fastest time to market | Very low maintenance; easy debugging |
| **Approach B (Idiomatic/Framework)** | Standard conventions; good ergonomics | Requires standard middleware & auth | Moderate delivery speed | Dependent on framework versions & conventions |
| **Approach C (High-Scale Distributed)** | Handles massive load; complex UX | Multi-boundary security needed | High infra cost; slowest delivery | High debugging complexity; distributed tracing required |

### Step 3: Conflict Surfacing & Resolution
Identify the top 1–2 tensions between lenses:
- *Example Tension:* "End-User DX prefers in-memory caching for sub-millisecond responses, but Maintainer/Infra flags memory limits on smaller dynos/containers."
- *Resolution:* "Use a bounded LRU cache with an explicit max-item threshold and TTL eviction."

### Step 4: Stakeholder Synthesis
Produce a concise consensus recommendation summarizing:
1. Recommended approach
2. Explicit compromise made (which lens was prioritized and why)
3. Guardrails adopted to appease the opposing lenses

---

## Chaining & Handoff
- Use **before** committing to an architectural direction in `@brainstorming` or `@peak-brainstorming`.
- Hand off to `@inversion-and-premortem` for deep failure-mode analysis.
- Hand off to `@writing-plans` once consensus is achieved.
