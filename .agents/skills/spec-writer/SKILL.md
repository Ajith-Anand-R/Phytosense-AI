---
name: spec-writer
description: "Artifact Materialization & Formal Specification. Converts brainstorming outputs into durable, comprehensive specifications (ORIGINAL_REQUEST.md, docs/plans/YYYY-MM-DD-design.md) with explicit milestones and validation gates."
risk: none
---

# Spec Writer Protocol

## Overview

Convert unstructured ideation and brainstorming sessions into durable, formal system specifications and architecture documents. The specification serves as the contract between design and execution phases.

**Primary Artifacts Produced:**
1. `ORIGINAL_REQUEST.md`: Preserves user intent, original prompts, business context, and explicit non-goals.
2. `docs/plans/YYYY-MM-DD-<topic>-design.md`: Technical architectural design document with component boundaries and data flows.
3. Milestone breakdowns linked to `@writing-plans`.

---

## Operating Mode
- **READ-ONLY STATE:** You are authoring documentation and system specifications. Do NOT modify source code or run scaffolding during spec drafting.
- **Completeness & Traceability:** Every requirement must link back to a stated goal or stakeholder lens.

---

## Specification Template (`docs/plans/YYYY-MM-DD-<topic>-design.md`)

```markdown
# Architectural Specification: [Feature / System Name]

**Date:** YYYY-MM-DD  
**Status:** [Draft | Approved | Deprecated]  
**Source Intent:** [Link to ORIGINAL_REQUEST.md]  

---

## 1. Problem Statement & Motivation
- What problem are we solving?
- Who is the end user?
- What happens if we do nothing?

## 2. Goals & Explicit Non-Goals
### Goals
- [Measurable goal 1]
- [Measurable goal 2]

### Non-Goals (Out of Scope)
- [Explicit item we will NOT build now]
- [Edge cases deliberately postponed]

## 3. Architecture & System Boundaries
- High-level topology diagram or data flow
- Component boundaries and responsibilities
- External interfaces and dependencies

## 4. Interfaces & Data Contracts
- Data structures and schemas
- API endpoints / Function signatures with types
- Error definitions and response payloads

## 5. Security & Failure Defenses
- Input validation and authentication bounds
- Circuit breakers, timeouts, and fallback modes
- Idempotency and recovery strategy

## 6. Milestones & Verification
- Milestone 1: Core primitives & schemas
- Milestone 2: Service logic & tests
- Milestone 3: End-to-end integration & documentation
```

---

## Handoff Contract
Once the specification is written and accepted:
1. Commit the specification file to the repo.
2. Invoke `@writing-plans` to convert the milestones into bite-sized execution tasks.
