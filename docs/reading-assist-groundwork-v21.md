# Reading-Assist Groundwork v21 — Verification Bundle Indexes / Retrieval Surface

**Status:** Implemented  
**Depends on:** v1–v20 (through verification bundle skeletons)

---

## 1. Purpose

v21 makes existing verification bundles **structurally retrievable** by deterministic keys, without scanning the entire bundle map and without introducing semantic meaning.

A bundle index does **not** mean:

- a source supports a claim
- a disagreement refutes a claim
- a verification has been performed

It only means:

> This bundle can now be retrieved by structural ids already present on the bundle.

This is a **lookup layer only**.

---

## 2. Why indexes after bundle skeletons

The stack order is intentional:

```
Sentence Anchor
→ Placeholder Registries
→ Cross-Link Slots
→ Verification Bundle Skeletons
→ Verification Bundle Indexes
```

Indexes are derived **only** from existing verification bundles. There is no parallel model, no semantic construction, and no scoring. Later pipeline stages need fast, explicit access patterns (by sentence, anchor, claim, source, verification, optional disagreement) without interpretation.

---

## 3. Model

**ReadingAssistVerificationBundleIndexSummary** has:

- `bySentenceId: Record<string, string[]>` — bundle ids keyed by sentence id
- `byAnchorId: Record<string, string[]>`
- `byClaimId: Record<string, string[]>`
- `bySourceId: Record<string, string[]>`
- `byVerificationId: Record<string, string[]>`
- `byDisagreementId: Record<string, string[]>` — only when a bundle has a non-null disagreementId

Values are **bundle ids** only. Indexing is idempotent: repeated ensure does not duplicate ids in any array.

---

## 4. Indexed dimensions

- **Sentence, anchor, claim, source, verification** — every bundle is indexed under these (required on the bundle).
- **Disagreement** — a bundle is indexed under `byDisagreementId[bundle.disagreementId]` only when `bundle.disagreementId != null`. When disagreement is added later (e.g. on revisit), the same bundle is re-indexed and the id is added to the disagreement index without changing bundle identity.

---

## 5. Helpers

- **ensureReadingAssistIdIndexEntry(indexMap, key, id)**  
  Pure; if key is null/undefined/empty, returns indexMap unchanged; otherwise ensures id is in the list for that key without duplicating; immutable.

- **ensureReadingAssistVerificationBundleIndexes(summary, bundle)**  
  Indexes one bundle into all six dimensions (disagreement only when non-null). Idempotent.

- **ensureVerificationBundleIndexesForBundleId(indexSummary, verificationBundleSummary, bundleId)**  
  Finds the bundle by id; if missing returns indexSummary unchanged; otherwise calls ensureReadingAssistVerificationBundleIndexes. Operates from the bundle layer only.

---

## 6. Reducer integration

The reading-assist reducer carries `verificationBundleIndexSummary` and initializes it from the default reading path summary. After each place where `verificationBundleSummary` is updated for a sentence-local event (same four sites as v20), the reducer calls `ensureVerificationBundleIndexesForBundleId` with the same bundle id and assigns the result back to `verificationBundleIndexSummary`. The final reading path summary includes `verificationBundleIndexSummary`. No global scan of all bundles; only the relevant bundle id is indexed per event.

---

## 7. What is deferred

v21 does **not** add:

- Semantic claim–source pairing
- Source ranking or verification scoring
- Disagreement analysis
- Persistence or database layer
- UI component changes

---

## 8. Future use

Indexes enable:

- Retrieval for verification workflows
- Disagreement overlays
- Bundle review surfaces
- Anti-hallucination assistance
- Later semantic layers built on structural access (e.g. “bundles for this claim” without scanning)

---

## 9. Success criteria (met when)

- Reading path summary includes `verificationBundleIndexSummary` with default empty index maps.
- Eligible sentence-local verification bundles automatically populate deterministic retrieval indexes.
- Repeated reduction remains idempotent (no duplicate bundle ids in any index).
- Disagreement can be added later and then appear under `byDisagreementId`.
- All behavior remains observational only; no UI changes.
- All tests pass.
