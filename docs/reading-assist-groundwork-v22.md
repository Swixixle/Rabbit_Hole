# Reading-Assist Groundwork v22 — Curiosity Signal Skeleton

**Status:** Implemented  
**Depends on:** v1–v21 (through verification bundle indexes)

---

## 1. Purpose

v22 introduces a **sentence-local, human-facing signal layer** derived from existing structural artifacts. This layer is the bridge between epistemic structure and later comfortable user-facing reading prompts.

A curiosity signal does **not** mean the system is explaining, judging, or interpreting content. It only means:

> Based on already-existing structural conditions, this sentence has a stable, user-surfaceable “reason to look closer.”

This is a **signal layer**, not a language layer. No copy generation, no semantic analysis, no UI surface yet.

---

## 2. Why signals after bundles and indexes

The stack order is intentional:

```
Sentence Anchor
→ Placeholder Registries
→ Cross-Link Slots
→ Verification Bundle Skeletons
→ Verification Bundle Indexes
→ Curiosity Signals
```

Signals are derived **only** from existing verification bundles. There is no parallel model and no semantic construction. One signal per bundle; signal kinds are determined purely from bundle shape (e.g. presence of disagreementId).

---

## 3. Model

**ReadingAssistCuriositySignalKind** (union):

- `explore_point` — the sentence has a verification bundle
- `source_available` — the bundle has a source id (all current bundles do)
- `verification_opportunity` — the sentence has a verification bundle
- `disagreement_present` — the bundle has a non-null disagreementId

**ReadingAssistCuriositySignal** has:

- `id`, `sentenceId`, `anchorId`, `bundleId`, `crossLinkId`
- `signalKinds: ReadingAssistCuriositySignalKind[]` — deterministic, deduplicated order
- `createdAt` (string)

**ReadingAssistCuriositySignalSummary** has `signals` (record by id) and `signalIds` (ordered list).

---

## 4. One signal per bundle

- At most **one curiosity signal per verification bundle** (id: `ra-curiosity-signal|<bundleId>`).
- When disagreement is added later (e.g. on revisit), the same signal is updated additively: `signalKinds` gains `disagreement_present`; signal id and count do not change. Kinds are never removed once present.

---

## 5. Helpers

- **createReadingAssistCuriositySignalId(bundleId)** — returns `ra-curiosity-signal|<bundleId>`.
- **buildReadingAssistCuriositySignalKinds(bundle)** — returns stable array: `explore_point`, `source_available`, `verification_opportunity`, and optionally `disagreement_present` when `bundle.disagreementId != null`. Deterministic order; no duplicates.
- **ensureReadingAssistCuriositySignal(summary, signal)** — insert by `signal.id` if missing; do not duplicate `signalIds`; preserve original `createdAt`. If signal exists, allow additive expansion of `signalKinds` only (e.g. add `disagreement_present` when new signal has it and existing does not); do not remove kinds.
- **ensureCuriositySignalForBundleId(curiositySignalSummary, verificationBundleSummary, bundleId)** — find bundle by id; if missing return summary unchanged; else build signal from bundle and upsert via ensureReadingAssistCuriositySignal. Operates from bundle layer only.

---

## 6. Reducer integration

The reading-assist reducer carries `curiositySignalSummary` and initializes it from the default reading path summary. After each place where `verificationBundleSummary` (and indexes) are updated for a sentence-local event (same four sites as v20/v21), the reducer calls `ensureCuriositySignalForBundleId(curiositySignalSummary, verificationBundleSummary, createReadingAssistVerificationBundleId(crossLinkId))` and assigns the result back. The final reading path summary includes `curiositySignalSummary`. No global scan; only the relevant bundle id is used.

---

## 7. What is deferred

v22 does **not** add:

- User-facing microcopy or prompts
- AI-generated explanations
- Semantic claim/source pairing
- Verification scoring or disagreement analysis
- Persistence or UI component changes

---

## 8. Future use

Curiosity signals prepare the system for:

- Gentle prompt selection
- Comfort-oriented reading cues
- Curiosity-first overlays
- Conversational interface translation
- Playful learning surfaces driven by structure

All of these can key off `signalKinds` and bundle identity without changing the v22 contract.

---

## 9. Success criteria (met when)

- Reading path summary includes `curiositySignalSummary` with default empty signals/signalIds.
- Eligible sentence-local verification bundles automatically materialize one curiosity signal each.
- Repeated reduction remains idempotent (no duplicate signals).
- Disagreement added later expands the same signal’s `signalKinds` to include `disagreement_present`.
- All behavior remains observational only; no UI changes; no user-facing language yet.
- All tests pass.
