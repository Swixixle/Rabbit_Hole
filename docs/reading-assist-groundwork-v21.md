# Reading-Assist Groundwork v21 — Verification Bundle Indexes

> **Additive only.** This document describes a purely structural addition to the
> reading-assist pipeline. No UI changes. No persistence. No semantic inference.

---

## Purpose

Verification bundle skeletons (introduced in v20) are stored in a flat map keyed
by bundle id (`verificationBundleSummary.bundles`). Later pipeline stages need to
answer questions such as:

- "Which bundles touch sentence `s`?"
- "Which bundles reference verification id `v`?"

Without an index, those queries require a full scan of the bundle map. For a
long document this is wasteful and complicates future stage logic.

v21 introduces **Verification Bundle Indexes** — a set of lookup maps that are
built deterministically from existing bundle data so later stages can answer
structural queries in O(1) without scanning.

---

## Why indexes come after bundle skeletons

Bundle indexes are **derived** from bundle objects. Creating them before the
bundle skeletons would require either:

- eagerly scanning bundles (violates locality), or
- building an incomplete index at construction time (violates determinism).

By adding indexes as a post-bundle step (v21 after v20) we guarantee that every
indexed id refers to a bundle that already exists in the summary.

---

## Structural retrieval only

The indexes hold **only structural ids** (sentence, anchor, claim, source,
verification, disagreement). They contain:

- No claim text
- No source names
- No confidence scores
- No support labels
- No semantic relationships
- No ranking or ordering signals

The index is a retrieval surface, not an analysis surface.

---

## Indexed keys

| Index map | Key type | Indexed from |
|---|---|---|
| `bySentenceId` | `sentenceId` | `bundle.sentenceId` |
| `byAnchorId` | `anchorId` | `bundle.anchorId` |
| `byClaimId` | `claimId` | `bundle.claimId` |
| `bySourceId` | `sourceId` | `bundle.sourceId` |
| `byVerificationId` | `verificationId` | `bundle.verificationId` |
| `byDisagreementId` | `disagreementId` | `bundle.disagreementId` (only when non-null) |

All values are `string[]` — arrays of bundle ids that share that structural key.

---

## Idempotent indexing

The helper functions are written so that calling them repeatedly with the same
bundle produces the same result:

- `ensureReadingAssistIdIndexEntry` checks for an existing id before appending.
- `ensureReadingAssistVerificationBundleIndexes` calls the id-entry helper for
  every field.
- `ensureVerificationBundleIndexesForBundleId` looks up the bundle first;
  returns the index summary unchanged if the bundle does not exist.

**No side effects. No mutation. Always returns a new object.**

---

## No UI impact

`ReadingAssistVerificationBundleIndexSummary` lives exclusively in the reducer
state. It is not rendered, not serialised to disk, and not transmitted over the
network. Any future UI that needs bundle lookup will read from this index via
a selector or derived value — it will not change the index structure.

---

## No persistence

Bundle indexes are re-derived every time the reducer replays events. They are
ephemeral pipeline state, not a stored data model. If the session resets, the
index resets to `DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY`
(all maps empty).

---

## Reducer integration

The reducer (`readingAssistReadingPathReducer`) already ensures cross-links and
verification bundles in response to `SENTENCE_OBSERVED` events. v21 adds one
additional step at each of those sites:

```
SENTENCE_OBSERVED
  → ensure cross-link              (v19/v20)
  → ensure verification bundle     (v20)
  → ensure bundle indexes          (v21 — new)
```

`BLOCK_OBSERVED` events pass through without touching any bundle or index state.

The index is updated **locally** — only the bundle relevant to the current event
is indexed, not a full rescan of all bundles.

---

## Future use

These indexes are the retrieval surface that later pipeline stages will consume:

| Future stage | How it uses bundle indexes |
|---|---|
| Verification workflows | Look up bundles by `verificationId` to check status |
| Disagreement overlays | Look up bundles by `disagreementId` to highlight conflicts |
| Bundle review surfaces | List all bundles for a sentence via `bySentenceId` |
| Anti-hallucination assistance | Check claim coverage via `byClaimId` |
| Semantic layers | Build semantic relationships on top of structural access |

---

## Files changed

| File | Change |
|---|---|
| `apps/mobile/src/types/readingAssist.ts` | New file — all reading-assist types including `ReadingAssistVerificationBundleIndexSummary` and `DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY` |
| `apps/mobile/src/utils/readingAssist.ts` | New file — id creators, index helpers, reducer |
| `apps/mobile/src/__tests__/readingAssist.test.ts` | New file — v21 test suite (20 tests) |
| `docs/reading-assist-groundwork-v21.md` | This document |

---

## Test commands

```bash
# Run only reading-assist tests
cd apps/mobile && npx jest --testPathPattern=readingAssist

# Run full test suite
npm test   # from repo root
```
