---
name: first-principles-decomp
description: "Ruthless YAGNI & Primitive Stripping. Breaks complex requirements down to fundamental primitives, removing library bloat, over-abstractions, and unnecessary external dependencies to find the simplest viable architecture."
risk: none
---

# First-Principles Decomposition Protocol

## Goal
Prevent premature over-engineering, dependency bloat, and architectural complexity by deconstructing problems down to their **irreducible physical and computational primitives**.

---

## Operating Philosophy
Modern software engineering frequently defaults to adding third-party libraries, complex design patterns, and multi-tier architectures before understanding the true computational requirements.

Every external package adds:
- Security attack surface (supply-chain vulnerabilities)
- Maintenance drag (breaking version upgrades)
- Bundle size & cold-start latency
- Cognitive overhead for future maintainers

The First-Principles Decomposition protocol asks:
> *"What is the simplest primitive data structure, native runtime API, or operating system call needed to solve this problem?"*

---

## Strict Rules
- **READ-ONLY GATE:** Do not install packages, edit configs, or write code during decomposition.
- **Dependency Defense:** Any proposed third-party library must be rigorously justified against a native standard-library alternative.
- **YAGNI Enforcement:** Ruthlessly eliminate speculative future-proofing ("We might need microservices later" -> Build a single clean function now).

---

## The 4 Deconstruction Stages

### 1. 🔍 Isolate the Irreducible Invariant
Strip away domain jargon, framework abstractions, and marketing buzzwords. Express the problem in raw computational terms:
- *Over-engineered:* "We need a distributed reactive message bus with event-sourcing and CQRS."
- *First Principles:* "We need an in-memory FIFO queue that dispatches payloads to subscriber callbacks."

### 2. 🧱 Primitive Stripping (The Standard-Library Audit)
Examine native language primitives before considering any library:
- **State Storage:** Can this be solved with a native `Map`, `Set`, array, or flat SQLite/JSON file?
- **Concurrency:** Can this be handled with language async/await, worker threads, or simple locks?
- **Networking & Parsing:** Can native `fetch`, standard `crypto`, and built-in JSON/RegExp suffice?
- **Data Validation:** Can simple guard clauses and type assertions replace a 200KB schema validator?

### 3. ⏱️ The "50-Line Prototype" Benchmark
Challenge the architectural design:
- Can the core mechanics of this requirement be implemented in fewer than 50 lines of readable, vanilla code?
- If yes, **start with the 50-line primitive**. Only add abstractions when real, non-speculative constraints force complexity.

### 4. ✂️ The YAGNI Pruning Protocol
Systematically audit requirements against the "Rule of Three":
- Do NOT create a generic interface or plugin architecture until there are at least 3 distinct concrete implementations.
- Do NOT create a multi-tenant database abstraction when there is only one tenant.
- Do NOT write custom caching middleware if query latency is under 5ms.

---

## Deliverables & Output Format

When applying `@first-principles-decomp`, provide:

### 1. The Minimal Primitive Model
A concise description of the simplest zero-dependency implementation using only standard library features.

### 2. Dependency Tax Audit
A clear evaluation of any packages under consideration:
- Proposed library name
- Bundle size & transitive dependency count
- Native alternative approach
- Verdict (Keep / Eliminate / Replace with native primitive)

### 3. Boundary of Escalation
The exact quantitative threshold at which the minimal primitive would no longer be sufficient (e.g., "This in-memory cache is sufficient up to 50,000 items / 100MB RAM. Beyond that, escalate to Redis").

---

## Chaining & Handoff
- Ideal for providing the "Approach 1 (Minimalist / YAGNI)" in `@peak-brainstorming` or `@brainstorming`.
- Feed the pruned, lightweight design into `@writing-plans` to ensure fast, clean, zero-bloat implementation.
