# Reading-Assist Groundwork v27 — Prompt Presentation Records

**Status:** Implemented  
**Depends on:** v1–v26 (through prompt copy catalog bindings)

---

## 1. Purpose

v27 introduces a **render-ready presentation record layer** derived from existing prompt copy catalog bindings. This layer bridges prompt copy catalog bindings to later actual UI rendering, overlays, and prompt surfaces.

A prompt presentation record **does include chosen curated copy text** (title, body, actionKey from the primary catalog entry), but it still does **not** render anything to the screen. It only means:

> Each sentence-local prompt binding now resolves into a stable, display-ready record with title, body, and action metadata that the UI can later consume directly.

This is a **presentation-record layer**, not a UI layer. No component work, no visual styling, no mounting or rendering yet.

---

## 2. Why presentation records after catalog bindings

The stack order is intentional:

```
… → Prompt Copy Library Records
→ Prompt Copy Catalog Bindings
→ Prompt Presentation Records
```

Presentation records are derived **only** from existing prompt copy catalog bindings plus the static catalog lookup. One record per binding; title, body, actionKey, and posture come from the binding and catalog. Display-ready data only; no UI rendering in this step.

---

## 3. Model

**ReadingAssistPromptPresentationPosture** (union): `inline_gentle` | `inline_source` | `inline_compare` — exploration-oriented, source-aware, and disagreement-aware presentation postures.

**ReadingAssistPromptVisibilityReadiness** (union): `eligible` | `deferred`. Default for all v27 records is `eligible`; `deferred` is reserved for future pacing logic and is not emitted automatically in v27.

**ReadingAssistPromptPresentationRecord**: `id`, `sentenceId`, `anchorId`, `signalId`, `bundleId`, `crossLinkId`, `slotId`, `selectionId`, `recordId`, `bindingId`, `primaryCatalogEntryId`, `secondaryCatalogEntryId`, `title`, `body`, `actionKey`, `posture`, `readiness`, `createdAt`. Title, body, and actionKey are copied from the chosen primary catalog entry; display-ready but not rendered.

**ReadingAssistPromptPresentationRecordSummary**: `records` (by id), `recordIds`.

---

## 4. Postures and readiness in this version

- **Postures:** `inline_gentle` (explore), `inline_source` (source), `inline_compare` (compare). Derived from binding primary catalog entry id (compare → inline_compare, source → inline_source, else inline_gentle).
- **Readiness:** `eligible` for all v27 records; `deferred` reserved for future use only.

---

## 5. Derivation and upgrades

- **Posture:** from binding.primaryCatalogEntryId — catalog_compare_calm_v1 → inline_compare, catalog_source_warm_v1 → inline_source, else inline_gentle.
- **Readiness:** always `eligible` in v27.
- **Title/body/actionKey:** from READING_ASSIST_PROMPT_COPY_CATALOG[binding.primaryCatalogEntryId].

One presentation record per catalog binding (id: `ra-prompt-presentation-record|<bindingId>`). When disagreement is added later, the same record may upgrade: primaryCatalogEntryId to catalog_compare_calm_v1, secondaryCatalogEntryId to catalog_compare_calm_v2, title/body/actionKey to the compare entry, posture to inline_compare. No regression.

---

## 6. Helpers

- **createReadingAssistPromptPresentationRecordId(bindingId)** — returns `ra-prompt-presentation-record|<bindingId>`.
- **deriveReadingAssistPromptPresentationPosture(binding)** — from primaryCatalogEntryId (compare → inline_compare, source → inline_source, else inline_gentle).
- **deriveReadingAssistPromptVisibilityReadiness(binding)** — always `eligible` in v27.
- **ensureReadingAssistPromptPresentationRecord(summary, record)** — insert if missing; do not duplicate recordIds; preserve createdAt; allow conservative upgrades (primary by rank, secondary fill, title/body/actionKey/posture); never regress.
- **ensurePromptPresentationRecordForBindingId(promptPresentationRecordSummary, promptCopyCatalogBindingSummary, bindingId)** — find binding; if missing return summary unchanged; else look up primary catalog entry, build record (including title/body/actionKey from catalog, posture and readiness derived), upsert. Operates from binding layer + catalog lookup only.

---

## 7. Reducer integration

The reading-assist reducer carries `promptPresentationRecordSummary` and initializes it from the default reading path summary. After each place where `promptCopyCatalogBindingSummary` is updated for a sentence-local event (same four sites as v20–v26), the reducer derives `bindingId = createReadingAssistPromptCopyCatalogBindingId(recordId)` and calls `ensurePromptPresentationRecordForBindingId(promptPresentationRecordSummary, promptCopyCatalogBindingSummary, bindingId)`. The final reading path summary includes `promptPresentationRecordSummary`. No global scan.

---

## 8. What is deferred

v27 does **not** add:

- Live UI rendering of prompts
- AI-generated explanations
- Semantic claim/source pairing or verification scoring
- Persistence or UI component changes

---

## 9. Future use

Prompt presentation records prepare the system for:

- Direct prompt rendering in the UI
- Calm inline overlays and sentence-level prompt surfaces
- Comfort-oriented reading assistance powered by deterministic presentation records

---

## 10. Success criteria (met when)

- Reading path summary includes `promptPresentationRecordSummary` with default empty records/recordIds.
- Eligible sentence-local prompt copy catalog bindings automatically materialize one prompt presentation record each.
- Repeated reduction remains idempotent (no duplicate records).
- Disagreement added later upgrades the same record to catalog_compare_calm_v1/v2, compare title/body/actionKey, posture inline_compare.
- All behavior remains observational only; no UI changes; display-ready prompt data exists but nothing renders yet.
- All tests pass.
