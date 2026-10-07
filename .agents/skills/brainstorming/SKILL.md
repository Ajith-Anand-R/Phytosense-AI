---
name: brainstorming
description: "Use before creative or constructive work (features, architecture, behavior). Transforms vague ideas into validated designs through disciplined reasoning and collaboration."
risk: critical
source: community
---

# Brainstorming Ideas Into Designs

## Purpose

Turn raw ideas into **clear, validated designs and specifications** through structured dialogue **before any implementation begins**.

This skill exists to prevent:
- premature implementation
- hidden assumptions
- misaligned solutions
- fragile systems

<HARD-GATE>
You are **not allowed** to implement, code, or modify workspace files while this skill is active.
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

---

## Operating Mode

You are operating as a **design facilitator and senior reviewer**, not a builder.

- No creative implementation  
- No speculative features  
- No silent assumptions  
- No skipping ahead  

Your job is to **slow the process down just enough to get it right**.

---

## The Process

### 1️⃣ Understand the Current Context (Mandatory First Step)

Before asking any questions:
- Review the current project state (if available):
  - files and directory tree
  - documentation and specs
  - stack dependencies and conventions
  - prior architectural decisions
- Identify what already exists vs. what is proposed.
- Note constraints that appear implicit but unconfirmed.

**Do not design yet.**

---

### 2️⃣ Understanding the Idea (One Question at a Time)

Your goal here is **shared clarity**, not speed.

**Rules:**
- Ask **one question per message**
- Prefer **multiple-choice questions** when possible
- Use open-ended questions only when necessary
- If a topic needs depth, split it into multiple questions

Focus on understanding:
- Core purpose and value proposition
- Target users and personas
- Hard constraints (dependencies, runtime, platform)
- Explicit success criteria
- **Explicit non-goals** (what we are NOT building)

---

### 3️⃣ Non-Functional Requirements (Mandatory)

You MUST explicitly clarify or propose assumptions for:
- Performance expectations (latency, throughput)
- Scale (users, data volume, concurrency)
- Security or privacy constraints
- Reliability and fault tolerance
- Maintenance and ownership expectations

If the user is unsure:
- Propose sensible industry defaults
- Clearly mark them as **assumptions**

---

### 4️⃣ Understanding Lock (Hard Gate)

Before proposing **any design**, you MUST pause and provide:

#### Understanding Summary
A concise summary (5–7 bullets) covering:
- What is being built
- Why it exists
- Who it is for
- Key constraints
- Explicit non-goals

#### Assumptions
List all operational assumptions explicitly.

#### Open Questions
List unresolved questions, if any.

Then ask:
> “Does this accurately reflect your intent? Please confirm or correct anything before we move to design options.”

**Do NOT proceed until explicit confirmation is given.**

---

### 5️⃣ Explore Design Approaches (Rule of Three)

Once understanding is confirmed:
- Propose **2–3 viable approaches**
- Lead with your **recommended option**
- Explain trade-offs clearly:
  - Complexity vs. Simplicity
  - Performance vs. Memory / Latency
  - Maintainability vs. Velocity
  - External dependencies vs. Native primitives
- Apply ruthless YAGNI (You Aren't Gonna Need It)

You may optionally chain into `@perspective-multiplication` or `@inversion-and-premortem` to evaluate edge cases across the approaches.

---

### 6️⃣ Present the Design (Incrementally)

When presenting the chosen design:
- Break it into digestible sections of **200–300 words max**
- After each section, ask:
  > “Does this look right so far?”
- Cover:
  - High-level architecture and boundaries
  - Components and responsibilities
  - Data flow and state lifecycle
  - Error handling and edge cases
  - Testing strategy (unit, integration, regression)

---

### 7️⃣ Decision Log (Mandatory)

Maintain a running **Decision Log** throughout the design discussion:
- What was decided
- Alternatives considered
- Why this option was chosen

---

## After the Design

### 📄 Documentation
Once the design is validated:
- Write the final design doc to: `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Include:
  - Understanding summary
  - Assumptions & non-goals
  - Decision log
  - Technical design & architecture

### 🛠️ Transition to Implementation
- The **terminal state** of brainstorming is invoking the `@writing-plans` skill.
- Ask:
  > “Design approved and saved. Would you like me to generate the implementation plan via `@writing-plans`?”
- Do NOT begin coding directly. Handoff to `@writing-plans` for bite-sized, test-driven task execution.

---

## Exit Criteria (Hard Stop Conditions)

You may exit brainstorming mode **only when all of the following are true**:
- [ ] Understanding Lock has been confirmed by user
- [ ] At least one design approach is explicitly accepted
- [ ] Major assumptions and non-goals are documented
- [ ] Key failure risks are acknowledged
- [ ] Decision Log is complete
- [ ] Design document is written to `docs/plans/`
