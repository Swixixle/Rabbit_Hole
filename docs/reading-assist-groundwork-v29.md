# Reading-Assist Groundwork v29 — Prompt Mount Plans

**Status:** Implemented  
**Depends on:** v1–v28 (through prompt surface candidates)

---

## 1. Purpose

v29 introduces a **mount-plan layer** derived from existing prompt surface candidates. This layer bridges prompt surface candidates to later actual inline prompt mounting, visibility gating, and render orchestration.

A prompt mount plan does **not** mount anything. It only means:

> Each surface candidate now resolves into a stable mount plan describing whether it is currently mountable, what trigger posture it uses, and what inline expansion mode it would follow later.

This is a **mount-orchestration layer**, not a UI layer. No component work, no visual styling, no mounting or rendering yet.

---

## 2. Why mount plans after surface candidates

The stack order is intentional:

```
… → Prompt Presentation Records
→ Prompt Surface Candidates
→ Prompt Mount Plans
```

Mount plans are derived **only** from existing prompt surface candidates. One plan per surface candidate; mount status, trigger, expansion mode, and urgency come from the candidate. Mount-ready orchestration data only; no UI rendering in this step.

---

## 3. Model

**ReadingAssistPromptMountStatus** (union): `mountable` | `held`. Default for eligible candidates is `mountable`; `held` is reserved for future pacing logic and not emitted automatically in v29 unless the candidate is not eligible.

**ReadingAssistPromptMountTrigger** (union): `sentence_settle` | `sentence_expand` | `sentence_compare` — structural orchestration metadata (gentle → sentence_settle, source → sentence_expand, compare → sentence_compare). Not runtime UI behavior yet.

**ReadingAssistPromptExpansionMode** (union): `collapsed_inline` | `expandable_inline` | `compare_inline`. Gentle → collapsed_inline, source → expandable_inline, compare → compare_inline.

**ReadingAssistPromptMountUrgency** (union): `standard` | `heightened`. Normal priority → standard; elevated → heightened.

**ReadingAssistPromptMountPlan**: id, sentenceId, anchorId, signalId, bundleId, crossLinkId, slotId, selectionId, recordId, bindingId, presentationRecordId, surfaceCandidateId, title, body, actionKey, posture, readiness, placement, affordance, priority, mountStatus, mountTrigger, expansionMode, urgency, createdAt. Title, body, actionKey, and existing surface metadata are copied through from the surface candidate; mountStatus, mountTrigger, expansionMode, and urgency are derived. Orchestration-ready data; nothing is mounted or rendered in this step.

**ReadingAssistPromptMountPlanSummary**: `plans` (by id), `planIds`.

---

## 4. Mount statuses, triggers, expansion modes, and urgency in this version

- **Mount statuses:** `mountable` for eligible candidates; `held` reserved for future use only.
- **Mount triggers:** `sentence_settle` (gentle), `sentence_expand` (source), `sentence_compare` (compare). Derived from presentation posture.
- **Expansion modes:** `collapsed_inline` (gentle), `expandable_inline` (source), `compare_inline` (compare). Derived from presentation posture.
- **Urgency:** `standard` (normal priority), `heightened` (elevated). Derived from surface priority.

---

## 5. Derivation and upgrades

- **Mount status:** eligible → mountable, otherwise held.
- **Mount trigger:** from candidate.posture — inline_compare → sentence_compare, inline_source → sentence_expand, else sentence_settle.
- **Expansion mode:** from candidate.posture — inline_compare → compare_inline, inline_source → expandable_inline, else collapsed_inline.
- **Urgency:** from candidate.priority — elevated → heightened, else standard.

One mount plan per surface candidate (id: `ra-prompt-mount-plan|<surfaceCandidateId>`). When disagreement is added later, the same plan may upgrade: posture to inline_compare, title/body/actionKey to compare copy, affordance to compare_inline, priority to elevated, mountTrigger to sentence_compare, expansionMode to compare_inline, urgency to heightened. No regression of posture, affordance, priority, mountTrigger, expansionMode, urgency, or mountStatus.

---

## 6. Helpers

- **createReadingAssistPromptMountPlanId(surfaceCandidateId)** — returns `ra-prompt-mount-plan|<surfaceCandidateId>`.
- **deriveReadingAssistPromptMountStatus(candidate)** — mountable when readiness eligible, else held.
- **deriveReadingAssistPromptMountTrigger(candidate)** — from posture (compare → sentence_compare, source → sentence_expand, else sentence_settle).
- **deriveReadingAssistPromptExpansionMode(candidate)** — from posture (compare → compare_inline, source → expandable_inline, else collapsed_inline).
- **deriveReadingAssistPromptMountUrgency(candidate)** — heightened when priority elevated, else standard.
- **ensureReadingAssistPromptMountPlan(summary, plan)** — insert if missing; do not duplicate planIds; preserve createdAt; allow conservative upgrades (posture, affordance, priority, mountStatus held→mountable, mountTrigger, expansionMode, urgency, title/body/actionKey); never regress.
- **ensurePromptMountPlanForSurfaceCandidateId(promptMountPlanSummary, promptSurfaceCandidateSummary, surfaceCandidateId)** — find surface candidate; if missing return summary unchanged; else build plan from candidate and derived fields, upsert. Operates from surface-candidate layer only.

---

## 7. Reducer integration

The reading-assist reducer carries `promptMountPlanSummary` and initializes it from the default reading path summary. After each place where `promptSurfaceCandidateSummary` is updated for a sentence-local event (same four sites as v20–v28), the reducer derives `surfaceCandidateId = createReadingAssistPromptSurfaceCandidateId(presentationRecordId)` and calls `ensurePromptMountPlanForSurfaceCandidateId(promptMountPlanSummary, promptSurfaceCandidateSummary, surfaceCandidateId)`. The final reading path summary includes `promptMountPlanSummary`. No global scan of all surface candidates; only the relevant surfaceCandidateId for the relevant sentence-local event.

---

## 8. What is deferred

v29 does **not** add:

- Live UI rendering of prompts
- Visibility gating or pacing logic that uses held
- AI-generated explanations
- Semantic claim/source pairing or verification scoring
- Persistence or UI component changes

---

## 9. Future use

Prompt mount plans prepare the system for:

- Visibility gating and inline prompt mounting
- Pacing and orchestration (e.g. held for future use)
- Deterministic sentence-level prompt surfacing

---

## 10. Success criteria (met when)

- Reading path summary includes `promptMountPlanSummary` with default empty plans/planIds.
- Eligible sentence-local prompt surface candidates automatically materialize one prompt mount plan each.
- Repeated reduction remains idempotent (no duplicate plans).
- Disagreement added later upgrades the same plan to compare title/body/actionKey, posture inline_compare, affordance compare_inline, priority elevated, mountTrigger sentence_compare, expansionMode compare_inline, urgency heightened.
- All behavior remains observational only; no UI changes; mount orchestration data exists but nothing renders yet.
- All tests pass.
