# Reading-Assist Groundwork v26 — Prompt Copy Catalog Bindings

**Status:** Implemented  
**Depends on:** v1–v25 (through prompt copy library records)

---

## 1. Purpose

v26 introduces a **deterministic copy catalog layer** that binds existing prompt copy library records to stable, curated copy entries. This layer bridges prompt copy library records to later actual UI rendering of calm, human-friendly prompts.

Important distinction:

- This step **does include curated copy text** (static title/body in catalog entries).
- This step does **not** include UI rendering.
- This step does **not** include generated or freeform language.
- This step does **not** include semantic interpretation.

The copy is intended to feel normal, calm, curious, non-intimidating, not childish, and not overly technical — like a thoughtful companion, not a teacher or warning label.

---

## 2. Why catalog bindings after library records

The stack order is intentional:

```
… → Prompt Copy Selections
→ Prompt Copy Library Records
→ Prompt Copy Catalog Bindings
```

Catalog bindings are derived **only** from existing prompt copy library records. One binding per record; primary and optional secondary catalog entry ids are determined from record shape. The binding is a deterministic lookup into the static catalog. No UI rendering yet.

---

## 3. Model

**ReadingAssistPromptCopyCatalogEntryId** (union): six ids — `catalog_explore_warm_v1`, `catalog_explore_warm_v2`, `catalog_source_warm_v1`, `catalog_source_warm_v2`, `catalog_compare_calm_v1`, `catalog_compare_calm_v2`. Explore/source/compare map to gentle exploration, source-aware, and disagreement-aware copy families.

**ReadingAssistPromptCopyCatalogActionKey** (union): `look_closer` | `see_source` | `compare_views` — structural action label keys (explore → look_closer, source → see_source, compare → compare_views). Not yet UI buttons.

**ReadingAssistPromptCopyCatalogEntry**: `id`, `libraryFamily`, `toneProfile`, `variantKey`, `title`, `body`, `actionKey`. Curated static copy; no generated language.

**ReadingAssistPromptCopyCatalogBinding**: `id`, `sentenceId`, `anchorId`, `signalId`, `bundleId`, `crossLinkId`, `slotId`, `selectionId`, `recordId`, `primaryCatalogEntryId`, `secondaryCatalogEntryId` (optional), `createdAt`.

**ReadingAssistPromptCopyCatalogBindingSummary**: `bindings` (by id), `bindingIds`.

**READING_ASSIST_PROMPT_COPY_CATALOG**: static record of all six entries with exact title/body/actionKey. Copy is short, calm, human, and readable.

---

## 4. Catalog families in this version

- **Explore / warm:** `catalog_explore_warm_v1`, `catalog_explore_warm_v2` — gentle exploration prompts; actionKey `look_closer`.
- **Source / warm:** `catalog_source_warm_v1`, `catalog_source_warm_v2` — source-aware prompts; actionKey `see_source`.
- **Compare / calm:** `catalog_compare_calm_v1`, `catalog_compare_calm_v2` — disagreement-aware calm prompts; actionKey `compare_views`.

---

## 5. Derivation and upgrades

- **Primary catalog entry id:** from record.libraryFamily — compare → catalog_compare_calm_v1, source → catalog_source_warm_v1, else catalog_explore_warm_v1. Deterministic and conservative.
- **Secondary catalog entry id:** when record.secondaryVariantKey === 'v2', return the v2 entry for the same family (catalog_compare_calm_v2, catalog_source_warm_v2, or catalog_explore_warm_v2); else null.

One binding per prompt copy library record (id: `ra-prompt-copy-catalog-binding|<recordId>`). When disagreement is added later, the same binding may upgrade: primaryCatalogEntryId to catalog_compare_calm_v1, secondaryCatalogEntryId to catalog_compare_calm_v2. No regression of primary or secondary.

---

## 6. Helpers

- **createReadingAssistPromptCopyCatalogBindingId(recordId)** — returns `ra-prompt-copy-catalog-binding|<recordId>`.
- **deriveReadingAssistPrimaryPromptCopyCatalogEntryId(record)** — from libraryFamily (compare → catalog_compare_calm_v1, source → catalog_source_warm_v1, else catalog_explore_warm_v1).
- **deriveReadingAssistSecondaryPromptCopyCatalogEntryId(record)** — v2 entry for family when secondaryVariantKey === 'v2'; else null.
- **ensureReadingAssistPromptCopyCatalogBinding(summary, binding)** — insert if missing; do not duplicate bindingIds; preserve createdAt; allow conservative upgrades (primary by rank, secondary fill); never regress.
- **ensurePromptCopyCatalogBindingForRecordId(promptCopyCatalogBindingSummary, promptCopyLibraryRecordSummary, recordId)** — find record by id; if missing return summary unchanged; else build binding from record and upsert. Operates from record layer only.

---

## 7. Reducer integration

The reading-assist reducer carries `promptCopyCatalogBindingSummary` and initializes it from the default reading path summary. After each place where `promptCopyLibraryRecordSummary` is updated for a sentence-local event (same four sites as v20–v25), the reducer derives `recordId = createReadingAssistPromptCopyLibraryRecordId(selectionId)` and calls `ensurePromptCopyCatalogBindingForRecordId(promptCopyCatalogBindingSummary, promptCopyLibraryRecordSummary, recordId)`. The final reading path summary includes `promptCopyCatalogBindingSummary`. No global scan.

---

## 8. What is deferred

v26 does **not** add:

- Live UI rendering of prompts
- AI-generated explanations
- Semantic claim/source pairing or verification scoring
- Persistence or UI component changes

---

## 9. Future use

Prompt copy catalog bindings prepare the system for:

- Prompt rendering in the UI
- Calm overlays and comfort-oriented reading dialogue
- Deterministic copy lookup by binding → catalog entry
- Comfort-oriented dialogue systems powered by stable bindings

---

## 10. Success criteria (met when)

- Reading path summary includes `promptCopyCatalogBindingSummary` with default empty bindings/bindingIds.
- Eligible sentence-local prompt copy library records automatically materialize one prompt copy catalog binding each.
- Repeated reduction remains idempotent (no duplicate bindings).
- Disagreement added later upgrades the same binding to primaryCatalogEntryId catalog_compare_calm_v1 and secondaryCatalogEntryId catalog_compare_calm_v2.
- All behavior remains observational only; no UI changes; curated catalog exists but nothing renders yet.
- All tests pass.
