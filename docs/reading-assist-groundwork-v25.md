# Reading-Assist Groundwork v25 — Prompt Copy Library Records

**Status:** Implemented  
**Depends on:** v1–v24 (through prompt copy selections)

---

## 1. Purpose

v25 introduces a **stable copy-library record layer** derived from existing prompt copy selections. This layer bridges prompt copy selections to later actual user-facing copy lookup and rendering.

A prompt copy library record does **not** mean the system is rendering text in the UI yet. It only means:

> Each sentence-local prompt copy selection now resolves to a stable, structured library record that later rendering systems can use to fetch calm, human-language copy without changing engine logic.

This is a **library-record layer**, not a rendering layer. No UI surface yet, no live copy rendering yet, no semantic interpretation.

---

## 2. Why library records after prompt copy selections

The stack order is intentional:

```
… → Prompt Tone Slots
→ Prompt Copy Selections
→ Prompt Copy Library Records
```

Library records are derived **only** from existing prompt copy selections. One record per selection; library family, tone profile, and variant keys are determined from selection shape. The record is a deterministic lookup contract for future copy rendering.

---

## 3. Model

**ReadingAssistPromptCopyLibraryFamily** (union):

- `library_explore` — copy family for gentle exploration
- `library_source` — copy family for source-aware exploration
- `library_compare` — copy family for disagreement-aware comparison

**ReadingAssistPromptCopyLibraryToneProfile** (union): `warm` | `calm` (warm for neutral_warm/low, calm for calm or medium intensity).

**ReadingAssistPromptCopyLibraryVariantKey** (union): `v1` | `v2` (v1 default, v2 reserved for secondary/alternate).

**ReadingAssistPromptCopyLibraryRecord** has:

- `id`, `sentenceId`, `anchorId`, `signalId`, `bundleId`, `crossLinkId`, `slotId`, `selectionId`
- `libraryFamily`, `primaryCopyKey`, `secondaryCopyKey`
- `toneProfile`, `primaryVariantKey`, `secondaryVariantKey` (optional)
- `createdAt` (string)

No user-facing copy text is stored on the record.

**ReadingAssistPromptCopyLibraryRecordSummary** has `records` (record by id) and `recordIds`.

---

## 4. Derivation and upgrades

- **Library family:** copy_compare_soft → library_compare; copy_source_peek → library_source; else library_explore. Precedence: library_compare > library_source > library_explore.
- **Tone profile:** calm when toneFamily calm or intensity medium; else warm.
- **Primary variant key:** always v1 in v25.
- **Secondary variant key:** v2 when secondaryCopyKey present; else null.

One record per prompt copy selection (id: `ra-prompt-copy-library-record|<selectionId>`). When disagreement is added later, the same record may upgrade: libraryFamily to library_compare, secondaryCopyKey/secondaryVariantKey fill in, toneProfile to calm. No regression.

---

## 5. Helpers

- **createReadingAssistPromptCopyLibraryRecordId(selectionId)** — returns `ra-prompt-copy-library-record|<selectionId>`.
- **deriveReadingAssistPromptCopyLibraryFamily(selection)** — from primaryCopyKey.
- **deriveReadingAssistPromptCopyLibraryToneProfile(selection)** — calm when toneFamily calm or intensity medium; else warm.
- **deriveReadingAssistPrimaryPromptCopyLibraryVariantKey(selection)** — always v1 in v25.
- **deriveReadingAssistSecondaryPromptCopyLibraryVariantKey(selection)** — v2 when secondaryCopyKey != null; else null.
- **ensureReadingAssistPromptCopyLibraryRecord(summary, record)** — insert if missing; do not duplicate recordIds; preserve createdAt; allow conservative upgrades (library family by rank, secondaryCopyKey, secondaryVariantKey, toneProfile); never regress.
- **ensurePromptCopyLibraryRecordForSelectionId(promptCopyLibraryRecordSummary, promptCopySelectionSummary, selectionId)** — find selection by id; if missing return summary unchanged; else build record from selection and upsert. Operates from selection layer only.

---

## 6. Reducer integration

The reading-assist reducer carries `promptCopyLibraryRecordSummary` and initializes it from the default reading path summary. After each place where `promptCopySelectionSummary` is updated for a sentence-local event (same four sites as v20–v24), the reducer derives `selectionId = createReadingAssistPromptCopySelectionId(createReadingAssistPromptToneSlotId(createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkId))))` and calls `ensurePromptCopyLibraryRecordForSelectionId(promptCopyLibraryRecordSummary, promptCopySelectionSummary, selectionId)`. The final reading path summary includes `promptCopyLibraryRecordSummary`. No global scan.

---

## 7. What is deferred

v25 does **not** add:

- User-facing microcopy strings
- AI-generated explanations
- Semantic claim/source pairing or verification scoring
- Persistence or UI component changes

---

## 8. Future use

Prompt copy library records prepare the system for:

- Deterministic copy-library lookup by family / tone / variant
- Calm prompt rendering
- Copy catalog binding
- Comfort-oriented dialogue systems driven by stable records

---

## 9. Success criteria (met when)

- Reading path summary includes `promptCopyLibraryRecordSummary` with default empty records/recordIds.
- Eligible sentence-local prompt copy selections automatically materialize one prompt copy library record each.
- Repeated reduction remains idempotent (no duplicate records).
- Disagreement added later upgrades the same record to library_compare, copy_compare_soft, copy_source_peek, calm, secondaryVariantKey v2.
- All behavior remains observational only; no UI changes; no generated language yet.
- All tests pass.
