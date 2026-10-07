---
name: writing-plans
description: "Use when you have a spec or requirements for a multi-step task, before touching code. Generates comprehensive, bite-sized implementation plans (2-5 min tasks, exact file paths, complete code snippets, TDD cycles) ready for execution."
risk: critical
---

# Writing Plans Protocol

## Overview

Transform approved architectural designs and specifications into comprehensive, highly granular implementation plans. 

Assume the implementing engineer or subagent has zero prior context for our codebase and questionable taste. Document everything needed to execute safely:
- Exact files to create or modify (with line numbers if applicable)
- Full, unabridged code implementations (no "TODO: add logic here" or hand-waving)
- Exact verification and test commands with expected outputs
- Bite-sized task granularity (each step takes 2–5 minutes)
- TDD-first: Failing test -> Verify fail -> Minimal implementation -> Verify pass -> Commit

**Announce at start:**
> "I'm using the `@writing-plans` skill to generate the implementation plan."

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`  
**Track execution in:** `docs/plans/task.md`

---

## Bite-Sized Task Granularity

Every task must be broken down into discrete micro-steps:
1. **Write the failing test** (step)
2. **Run test to verify it fails** (step)
3. **Implement minimal code to make test pass** (step)
4. **Run test to verify it passes** (step)
5. **Commit with clean conventional commit message** (step)

---

## Plan Document Header

Every implementation plan MUST start with this standard header:

```markdown
# [Feature Name] Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agents/workflows/execute-plan.md` or `@executing-plans` to execute this plan task-by-task.

**Goal:** [One sentence describing the core objective]

**Architecture:** [2-3 sentences summarizing the technical approach]

**Tech Stack & Primitives:** [Key languages, runtimes, native APIs, or verified libraries]

---
```

---

## Standard Task Template

For every task in the plan, use this exact structure:

````markdown
### Task N: [Component or Module Name]

**Files:**
- Create: `exact/path/to/new_file.py`
- Modify: `exact/path/to/existing_file.py:45-72`
- Test: `tests/exact/path/to/test_file.py`

**Step 1: Write the failing test**

```python
def test_specific_behavior_under_conditions():
    # Setup
    input_data = ...
    # Execution
    result = function_under_test(input_data)
    # Assertion
    assert result == expected_output
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/path/test_file.py::test_specific_behavior_under_conditions -v`  
Expected: `FAIL` (ImportError or AssertionError: function not defined)

**Step 3: Write minimal implementation**

```python
def function_under_test(data):
    # Minimal logic strictly required to satisfy assertion
    return expected_output
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/path/test_file.py::test_specific_behavior_under_conditions -v`  
Expected: `PASS`

**Step 5: Git Commit**

```bash
git add tests/path/test_file.py path/to/new_file.py
git commit -m "feat(module): implement specific behavior"
```
````

---

## Task Progress Tracker (`docs/plans/task.md`)

When writing the plan, simultaneously create or update `docs/plans/task.md` with a clean tracking table:

```markdown
# Implementation Tasks: [Feature Name]

| Task # | Task Description | Target Files | Status |
| :---: | :--- | :--- | :---: |
| 1 | Create data model and validation schema | `src/models.py` | [ ] Pending |
| 2 | Implement core parser primitive | `src/parser.py` | [ ] Pending |
| 3 | Connect integration handlers | `src/service.py` | [ ] Pending |
| 4 | Add regression and edge-case tests | `tests/test_service.py` | [ ] Pending |
```

---

## Plan Quality Checklist

Before finalizing the plan, verify:
- [ ] Are all file paths exact and verified against the workspace directory?
- [ ] Is all code provided in full (no placeholder comments or elided lines)?
- [ ] Are test commands exact, runnable in the project's test framework, and targeting specific test cases?
- [ ] Is each task independent and achievable in 2–5 minutes?
- [ ] Did we follow YAGNI and first-principles (no gratuitous dependencies)?

---

## Execution Handoff

After saving the plan:
> "Plan complete and saved to `docs/plans/YYYY-MM-DD-<feature-name>.md`.  
> Tracker initialized at `docs/plans/task.md`.  
> Ready to execute? We can now run `.agents/workflows/execute-plan.md` or invoke `@executing-plans` to implement the plan step-by-step."
