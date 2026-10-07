# Implementation Planning Workflow

Use this workflow once an architectural design or specification is approved.

## Steps:
1. **Activate Skill:**
   Activate `@writing-plans` (or `@spec-writer`).
2. **Review Design Contract:**
   - Read the approved design doc in `docs/plans/` or `ORIGINAL_REQUEST.md`.
   - Ensure non-goals and failure defenses are accounted for.
3. **Deconstruct Into Bite-Sized Steps:**
   - Break tasks into 2–5 minute steps.
   - For every task, include exact file paths, failing test code, expected error, minimal implementation code, and pass verification.
4. **Persist Artifacts:**
   - Save implementation plan to `docs/plans/YYYY-MM-DD-<feature-name>.md`.
   - Initialize the task tracker at `docs/plans/task.md`.
5. **Handoff:**
   - Transition to `.agents/workflows/execute-plan.md` (or invoke `@executing-plans`).
