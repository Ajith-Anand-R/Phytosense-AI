# Brainstorming & Ideation Workflow

Use this workflow to guide new features, refactors, and architectural exploration from scratch.

## Steps:
1. **Activate Gatekeeping Skill:**
   Activate `@peak-brainstorming` or `@brainstorming`.
   Verify that workspace files are NOT modified during ideation.
2. **Context & Requirement Discovery:**
   - Scan repository structure and stack conventions.
   - Ask clarifying questions one at a time (multiple choice where possible).
   - Define target users, scope, and explicit non-goals.
3. **Multi-Lens Exploration:**
   - Invoke `@perspective-multiplication` to review through User, Security, Product, and Maintainer lenses.
   - Invoke `@first-principles-decomp` to find the minimal primitive, zero-dependency approach.
   - Propose 2–3 architectural approaches with clear trade-offs.
4. **Premortem & Failure-Mode Analysis:**
   - Invoke `@inversion-and-premortem` to stress-test concurrency, timeouts, edge states, and load.
   - Establish active defenses for each failure vector.
5. **Understanding Lock & Approval:**
   - Present a concise 5–7 bullet summary and request user confirmation.
   - Write design specification to `docs/plans/YYYY-MM-DD-<topic>-design.md`.
6. **Handoff:**
   - Transition to `.agents/workflows/write-plan.md` (or invoke `@writing-plans`).
