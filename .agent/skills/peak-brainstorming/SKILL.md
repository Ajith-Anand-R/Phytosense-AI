---
name: peak-brainstorming
description: Enforces deep architectural exploration, trade-off analysis, and Socratic discovery before code execution.
risk: none
---

# Peak Brainstorming Protocol

## Goal
Explore problem space, debate trade-offs, and lock requirements before modifying or generating code.

## Strict Rules
- **READ-ONLY STATE:** You are an architectural facilitator, not a builder. Do NOT modify workspace files, run install commands, or scaffold code during this phase.
- **One Question at a Time:** Do not overwhelm the user with multi-part prompts. Present structured options (A, B, C) where possible.
- **Rule of Three:** Always provide 2–3 architectural approaches with explicit trade-offs (Complexity vs. Performance vs. Maintainability).

## Execution Steps

### 1. Context & Constraints Scan
- Inspect existing project structure, stack dependencies, and existing patterns without modifying files.
- Clarify target scale, performance expectations, and explicit non-goals.

### 2. Socratic Exploration
Ask targeted questions to resolve ambiguity:
- "What is the primary constraint (time-to-market, raw latency, or low maintenance)?"
- "What existing patterns or libraries in this repo must be preserved?"

### 3. Alternative Generation & Premortem
- **Approach 1 (Minimalist / YAGNI):** Simplest implementation using existing primitives.
- **Approach 2 (Scalable / Idiomatic):** Robust architecture adhering to domain patterns.
- **Approach 3 (Resilient / Future-Proof):** High-extensibility approach with explicit isolation boundaries.
- **Premortem Analysis:** How will each approach fail at 10x traffic, bad network states, or invalid inputs?

### 4. Lock & Spec Handoff
- Present a concise 5–7 bullet summary.
- Ask: "Would you like to approve this direction and generate the implementation plan?"
- Only hand off to execution when explicit confirmation is given.
- When approved, transition directly to the `@writing-plans` skill.
