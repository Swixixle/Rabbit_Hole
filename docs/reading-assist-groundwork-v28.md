# Reading-Assist Groundwork v28 — Prompt Surface Candidates

**Status:** Implemented  
**Depends on:** v1–v27 (through prompt presentation records)

---

## 1. Purpose

v28 introduces a **surface-candidate layer** derived from existing prompt presentation records. This layer bridges prompt presentation records to later actual inline prompt mounting, visibility control, and surface rendering.

A prompt surface candidate does **not** render anything. It only means:

> Each eligible sentence-local presentation record now resolves into a stable surface candidate describing where and how it could be mounted later.

This is a **surface-planning layer**, not a UI layer. No component work, no visual styling, no mounting or rendering yet.

---

## 2. Why surface candidates after presentation records

The stack order is intentional:

```
… → Prompt Copy Catalog Bindings
→ Prompt Presentation Records
→ Prompt Surface Candidates
```

Surface candidates are derived **only** from existing prompt presentation records. One candidate per presentation record; placement, affordance, and priority come from the record. Mount-ready planning data only; no UI rendering in this step.

---

## 3. Model

**ReadingAssistPromptSurfacePlacement** (union): `after_sentence` | `within_sentence_flow`. Default for all v28 candidates is `after_sentence`; `within_sentence_flow` is reserved for future use and not emitted in v28.

**ReadingAssistPromptSurfaceAffordance** (union): `tap_inline` | `expand_inline` | `compare_inline` — structural action posture (explore → tap_inline, source → expand_inline, compare → compare_inline). Not UI behavior yet.

**ReadingAssistPromptSurfacePriority** (union): `normal` | `elevated`. Normal for gentle/source postures; elevated for compare only.

**ReadingAssistPromptSurfaceCandidate**: id, sentenceId, anchorId, signalId, bundleId, crossLinkId, slotId, selectionId, recordId, bindingId, presentationRecordId, title, body, actionKey, posture, readiness, placement, affordance, priority, createdAt. Title, body, actionKey, posture, and readiness are copied through from the presentation record; placement, affordance, and priority are derived. Mount-ready planning data; no UI rendering.

**ReadingAssistPromptSurfaceCandidateSummary**: `candidates` (by id), `candidateIds`.

---

## 4. Placements, affordances, and priorities in this version

- **Placements:** `after_sentence` for all v28; `within_sentence_flow` reserved only.
- **Affordances:** `tap_inline` (gentle), `expand_inline` (source), `compare_inline` (compare). Derived from presentation posture.
- **Priorities:** `normal` (gentle/source), `elevated` (compare). Derived from presentation posture.

---

## 5. Derivation and upgrades

- **Placement:** always `after_sentence` in v28.
- **Affordance:** from record.posture — inline_compare → compare_inline, inline_source → expand_inline, else tap_inline.
- **Priority:** from record.posture — inline_compare → elevated, else normal.

One surface candidate per presentation record (id: `ra-prompt-surface-candidate|<presentationRecordId>`). When disagreement is added later, the same candidate may upgrade: posture to inline_compare, title/body/actionKey to compare copy, affordance to compare_inline, priority to elevated. No regression.

---

## 6. Helpers

- **createReadingAssistPromptSurfaceCandidateId(presentationRecordId)** — returns `ra-prompt-surface-candidate|<presentationRecordId>`.
- **deriveReadingAssistPromptSurfacePlacement(record)** — always `after_sentence` in v28.
- **deriveReadingAssistPromptSurfaceAffordance(record)** — from posture (compare → compare_inline, source → expand_inline, else tap_inline).
- **deriveReadingAssistPromptSurfacePriority(record)** — elevated when posture inline_compare, else normal.
- **ensureReadingAssistPromptSurfaceCandidate(summary, candidate)** — insert if missing; do not duplicate candidateIds; preserve createdAt; allow conservative upgrades (posture, affordance, priority, title/body/actionKey); never regress.
- **ensurePromptSurfaceCandidateForPresentationRecordId(promptSurfaceCandidateSummary, promptPresentationRecordSummary, presentationRecordId)** — find presentation record; if missing return summary unchanged; else build candidate (copy fields from record, derive placement/affordance/priority), upsert. Operates from presentation-record layer only.

---

## 7. Reducer integration

The reading-assist reducer carries `promptSurfaceCandidateSummary` and initializes it from the default reading path summary. After each place where `promptPresentationRecordSummary` is updated for a sentence-local event (same four sites as v20–v27), the reducer derives `presentationRecordId = createReadingAssistPromptPresentationRecordId(bindingId)` and calls `ensurePromptSurfaceCandidateForPresentationRecordId(promptSurfaceCandidateSummary, promptPresentationRecordSummary, presentationRecordId)`. The final reading path summary includes `promptSurfaceCandidateSummary`. No global scan.

---

## 8. What is deferred

v28 does **not** add:

- Live UI rendering of prompts
- AI-generated explanations
- Semantic claim/source pairing or verification scoring
- Persistence or UI component changes

---

## 9. Future use

Prompt surface candidates prepare the system for:

- Inline prompt mounting and surface pacing
- Calm reading overlays and deterministic sentence-level prompt surfacing

---

## 10. Success criteria (met when)

- Reading path summary includes `promptSurfaceCandidateSummary` with default empty candidates/candidateIds.
- Eligible sentence-local prompt presentation records automatically materialize one prompt surface candidate each.
- Repeated reduction remains idempotent (no duplicate candidates).
- Disagreement added later upgrades the same candidate to compare title/body/actionKey, posture inline_compare, affordance compare_inline, priority elevated.
- All behavior remains observational only; no UI changes; mount-ready prompt data exists but nothing renders yet.
- All tests pass.
