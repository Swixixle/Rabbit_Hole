# Reading-Assist Groundwork v24 — Prompt Copy Keys

**Status:** Implemented  
**Depends on:** v1–v23 (through prompt tone slots)

---

## 1. Purpose

v24 introduces a **stable prompt-copy selection layer** derived from existing prompt tone slots. This layer bridges prompt tone slots to later actual user-facing microcopy rendering.

A prompt copy key does **not** mean the system is writing final text. It only means:

> This sentence-local prompt posture now maps to a stable, renderable copy family key that later UI/copy systems can translate into calm, human language.

This is a **copy-key layer**, not a freeform language layer. No final prose generation, no semantic interpretation, no UI surface yet.

---

## 2. Why copy keys after prompt tone slots

The stack order is intentional:

```
Sentence Anchor
→ … → Curiosity Signals
→ Prompt Tone Slots
→ Prompt Copy Keys
```

Copy selections are derived **only** from existing prompt tone slots. One selection per slot; primary and secondary copy keys are determined from slot kinds (soft_compare > source_peek > explore_gentle). Tone family and intensity are passed through from the slot for downstream rendering.

---

## 3. Model

**ReadingAssistPromptCopyKey** (union):

- `copy_explore_gentle` — baseline exploration-oriented prompt family
- `copy_source_peek` — source-aware prompt family
- `copy_compare_soft` — disagreement-aware comparison prompt family

**ReadingAssistPromptCopyVariant** — `primary` | `secondary` (for selection hierarchy).

**ReadingAssistPromptCopySelection** has:

- `id`, `sentenceId`, `anchorId`, `signalId`, `bundleId`, `crossLinkId`, `slotId`
- `primaryCopyKey: ReadingAssistPromptCopyKey`
- `secondaryCopyKey: ReadingAssistPromptCopyKey | null` — fallback/supporting key
- `toneFamily`, `intensity` — copied from slot for rendering
- `createdAt` (string)

**ReadingAssistPromptCopySelectionSummary** has `selections` (record by id) and `selectionIds`.

---

## 4. Primary and secondary derivation

- **Primary:** soft_compare → `copy_compare_soft`; else source_peek → `copy_source_peek`; else `copy_explore_gentle`.
- **Secondary:** when primary is `copy_compare_soft` → `copy_source_peek`; when primary is `copy_source_peek` → `copy_explore_gentle`; when primary is `copy_explore_gentle` → null.

One selection per prompt tone slot (id: `ra-prompt-copy-selection|<slotId>`). When disagreement is added later, the same selection may upgrade: primary to `copy_compare_soft`, secondary to `copy_source_peek`, toneFamily to calm, intensity to medium. No regression.

---

## 5. Helpers

- **createReadingAssistPromptCopySelectionId(slotId)** — returns `ra-prompt-copy-selection|<slotId>`.
- **deriveReadingAssistPrimaryPromptCopyKey(slot)** — order: soft_compare > source_peek > explore_gentle.
- **deriveReadingAssistSecondaryPromptCopyKey(slot)** — fallback hierarchy; null when primary is explore_gentle.
- **ensureReadingAssistPromptCopySelection(summary, selection)** — insert if missing; do not duplicate selectionIds; preserve createdAt; allow conservative upgrades (primary, secondary, toneFamily, intensity) when disagreement appears; never regress (internal rank map for primary).
- **ensurePromptCopySelectionForSlotId(promptCopySelectionSummary, promptToneSlotSummary, slotId)** — find slot by id; if missing return summary unchanged; else build selection from slot and upsert. Operates from slot layer only.

---

## 6. Reducer integration

The reading-assist reducer carries `promptCopySelectionSummary` and initializes it from the default reading path summary. After each place where `promptToneSlotSummary` is updated for a sentence-local event (same four sites as v20–v23), the reducer derives `slotId = createReadingAssistPromptToneSlotId(createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkId)))` and calls `ensurePromptCopySelectionForSlotId(promptCopySelectionSummary, promptToneSlotSummary, slotId)`. The final reading path summary includes `promptCopySelectionSummary`. No global scan.

---

## 7. What is deferred

v24 does **not** add:

- User-facing microcopy strings
- AI-generated explanations
- Semantic claim/source pairing or verification scoring
- Persistence or UI component changes

---

## 8. Future use

Prompt copy keys prepare the system for:

- Deterministic copy-library lookup by primary/secondary key
- Calm prompt rendering
- A/B-safe copy substitution without engine changes
- Comfort-oriented dialogue systems driven by stable keys

---

## 9. Success criteria (met when)

- Reading path summary includes `promptCopySelectionSummary` with default empty selections/selectionIds.
- Eligible sentence-local prompt tone slots automatically materialize one prompt copy selection each.
- Repeated reduction remains idempotent (no duplicate selections).
- Disagreement added later upgrades the same selection to copy_compare_soft, copy_source_peek, calm, medium.
- All behavior remains observational only; no UI changes; no generated language yet.
- All tests pass.
