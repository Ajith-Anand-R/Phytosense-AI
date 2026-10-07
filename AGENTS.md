# Antigravity Agent Guidelines & Ideation Protocol

## 1. Anti-Premature Implementation Policy
To prevent "premature implementation syndrome" — jumping straight into modifying code before requirements, trade-offs, and architecture are nailed down — agents must operate through structured ideation and planning before writing or editing code.

<HARD-GATE>
Do NOT invoke implementation skills, write code, scaffold projects, or edit workspace files until requirements and designs have been reviewed, verified against trade-offs, and approved.
</HARD-GATE>

---

## 2. Available Ideation & Architecture Skills

| Skill | Trigger | Purpose |
| :--- | :--- | :--- |
| **Peak Brainstorming** | `@peak-brainstorming` | Strict read-only architectural facilitator, Socratic discovery, and Rule of Three approaches. |
| **Brainstorming** | `@brainstorming` | Gold-standard gatekeeping, understanding locks, 1-question-at-a-time discovery, and durable design docs. |
| **Perspective Multiplication** | `@perspective-multiplication` | Stakeholder emulation across 4 distinct lenses (End-User, Security/Infra, Product, Maintainer). |
| **Inversion & Premortem** | `@inversion-and-premortem` | Failure-mode analysis (Charlie Munger inversion & Red-Teaming) to engineer defenses before coding. |
| **First-Principles Decomposition** | `@first-principles-decomp` | Ruthless YAGNI & primitive stripping; evaluates 50-line native alternatives before library bloat. |
| **Writing Plans & Spec Writer** | `@writing-plans` / `@spec-writer` | Artifact materialization into bite-sized TDD implementation plans (`docs/plans/YYYY-MM-DD-*.md`). |
| **Executing Plans** | `@executing-plans` | Controlled batch execution of implementation plans with verification gates. |

---

## 3. Recommended Workflow Chain

```text
[ @peak-brainstorming / @brainstorming ]  ──> Locks tools; unpacks requirements & non-goals
                  │
                  ▼
[ @perspective-multiplication ] ──> Evaluates user, security, business & maintainer lenses
                  │
                  ▼
[ @first-principles-decomp ] ──> Strips bloat, produces minimal zero-dep primitive approach
                  │
                  ▼
[ @inversion-and-premortem ] ──> Red-teams failure vectors & engineers circuit breakers
                  │
                  ▼
[ @spec-writer / @writing-plans ] ──> Generates durable design doc & bite-sized TDD plan
                  │
                  ▼
[ @executing-plans ] ──> Executes batch-by-batch with test verifications & git commits
```

---

## 4. Workflows & Artifact Conventions
- **Design Docs:** Saved to `docs/plans/YYYY-MM-DD-<topic>-design.md`
- **Implementation Plans:** Saved to `docs/plans/YYYY-MM-DD-<feature>-plan.md`
- **Task Tracking:** Maintained in `docs/plans/task.md`
- **Executable Workflows:** Located in `.agents/workflows/` (`brainstorm.md`, `write-plan.md`, `execute-plan.md`)
