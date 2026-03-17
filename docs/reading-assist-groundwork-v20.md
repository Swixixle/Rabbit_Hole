# Reading-Assist Groundwork v20 — Verification Bundle Skeleton

**Status:** Implemented  
**Depends on:** v1–v19 (through placeholder cross-link slots)

---

## 1. Purpose

v20 introduces a **sentence-local epistemic unit** derived from existing placeholder cross-links: the **verification bundle skeleton**.

A verification bundle does **not** mean the system has decided that a source supports a claim. It only means:

> This sentence anchor produced a structurally eligible placeholder cross-link, and we are now materializing that cross-link into a stable verification-ready bundle object.

This is a **structural container only**. No semantic inference, claim/source matching, disagreement detection, or verification scoring is performed.

---

## 2. Why bundles after cross-links

The stack order is intentional:

```
Sentence Anchor
→ Placeholder Registries
→ Cross-Link Slots
→ Verification Bundles
```

Bundles are derived **only** from existing cross-links. There is no parallel model and no direct semantic construction. Verification bundles are the first stable object that can later carry claim–source pairing, verification workflows, disagreement overlays, and anti-hallucination support—without changing v20’s observational, deterministic contract.

---

## 3. Model

**ReadingAssistVerificationBundle** has:

- `id`, `sentenceId`, `anchorId`, `crossLinkId`
- `claimId`, `sourceId`, `verificationId` (required)
- `disagreementId` (optional, string | null)
- `createdAt` (string)

**ReadingAssistVerificationBundleSummary** has `bundles` (record by id) and `bundleIds` (ordered list).

All bundle fields are copied directly from the cross-link. The bundle id is deterministic: `ra-verification-bundle|<crossLinkId>`.

---

## 4. One bundle per cross-link

- At most **one cross-link per eligible sentence slot** (v19).
- At most **one verification bundle per cross-link** (v20).

Repeated reduction does not duplicate bundles. When a disagreement placeholder is added later (e.g. on revisit), the existing cross-link is updated and the same bundle is updated to set `disagreementId`; identity and count do not change.

---

## 5. Helpers

- **createReadingAssistVerificationBundleId(crossLinkId)**  
  Returns deterministic id: `ra-verification-bundle|<crossLinkId>`.

- **ensureReadingAssistVerificationBundle(summary, bundle)**  
  Inserts by `bundle.id` if missing; does not duplicate `bundleIds`; preserves original `createdAt`. If the bundle already exists and existing `disagreementId` is null while incoming is non-null, updates only `disagreementId`; otherwise leaves existing bundle unchanged.

- **ensureVerificationBundleForCrossLink(verificationBundleSummary, crossLinkSummary, crossLinkId)**  
  Finds the cross-link by id; if missing or incomplete (claim/source/verification required), returns summary unchanged. Otherwise builds one bundle from the link (all fields copied; `createdAt` stringified), upserts via `ensureReadingAssistVerificationBundle`, and returns the updated summary. Operates from the cross-link layer only; does not scan anchors or placeholders directly.

---

## 6. Reducer integration

The reading-assist reducer carries `verificationBundleSummary` in state and initializes it from the default reading path summary. After each place where `crossLinkSummary` may be updated from a sentence-level event (sentence_examined existing sentence, sentence_revisited, sentence_examined new sentence, sentence_progress_next/previous with backtrack), the reducer ensures the corresponding verification bundle exists for the sentence’s cross-link when present. The final `next` reading path summary always includes `verificationBundleSummary`.

---

## 7. What is deferred

v20 does **not** add:

- Semantic claim–source pairing
- Source ranking or verification scoring
- Disagreement analysis
- Persistence or database layer
- UI component changes
- New context/provider redesign

---

## 8. Future use

Verification bundle skeletons prepare the system for:

- Claim–source pairing surfaces
- Verification workflows
- Disagreement overlays
- Anti-hallucination support
- Bundle-level review primitives

All of these can be built on top of the bundle id and the copied fields without changing the v20 contract.

---

## 9. Success criteria (met when)

- Reading path summary includes `verificationBundleSummary` with default empty bundles/bundleIds.
- Eligible sentence-local cross-links automatically materialize into exactly one verification bundle each.
- Repeated reduction remains idempotent (no duplicate bundles).
- Disagreement can be filled into an existing bundle later without changing its identity.
- All behavior remains observational only; no UI changes.
- All tests pass.
