# Reading-Assist Groundwork v19 — Placeholder Cross-Link Slots

**Status:** Implemented  
**Depends on:** v1–v18 (block focus through disagreement placeholder records)

---

## 1. Purpose

Reading Assist now has placeholder records for verification, claims, sources, and disagreements. The next step is to introduce a **cross-link substrate** between these placeholder layers.

This does **not** mean performing real claim–source matching or real disagreement analysis yet. It means proving the model can represent relationships like:

```
claim placeholder ↔ source placeholder ↔ disagreement placeholder ↔ verification placeholder
```

anchored to the same examined sentence surface.

This remains **infrastructure only**. There are **no user-visible UI changes**.

---

## 2. Why cross-links now

After v18, the system can generate all four placeholder classes independently. Future verification/disagreement UI will need to reason about **co-located relationships** among them.

v19 is the first step that says: this examined sentence has a placeholder claim, a placeholder source, and a placeholder verification object that belong to the same local attachment surface. That is the correct precursor to claim–source pairing, disagreement surfaces, verification overlays, and anti-hallucination assistance.

---

## 3. Cross-link model

**ReadingAssistPlaceholderCrossLink** has:

- `id`, `sentenceId`, `anchorId`
- `claimId`, `sourceId`, `disagreementId`, `verificationId` (each nullable)
- `createdAt`

**ReadingAssistPlaceholderCrossLinkSummary** has `links` (record by id) and `linkIds` (ordered list).

No confidence, directionality, weights, or semantic labels yet.

---

## 4. Sentence-slot co-occurrence rule

When a sentence slot has:

- at least one claim placeholder id
- at least one source placeholder id
- at least one verification placeholder id

the reducer ensures **one cross-link** for that sentence using the first available id in each category. If the slot also has a disagreement placeholder id, it is included; otherwise `disagreementId` is null.

- **Required:** claim, source, verification.
- **Optional:** disagreement.

Only the **first** id per category is used; multiple combinations per sentence are not generated in v19.

---

## 5. Cross-link id and stability

The cross-link id is deterministic from `sentenceId`, first claim, first source, and first verification (disagreement is not part of the id). So there is at most **one cross-link per sentence**. When a disagreement placeholder is added later (e.g. on revisit), the existing link is updated to set `disagreementId`; the id and link count do not change.

---

## 6. Helpers

- **createReadingAssistPlaceholderCrossLinkId(sentenceId, claimId, sourceId, disagreementId, verificationId)**  
  Returns a deterministic string id.

- **ensureReadingAssistPlaceholderCrossLink(summary, link)**  
  Creates the link if missing; does not duplicate `linkIds`; preserves original `createdAt`. If a link with the same id exists and the new link has `disagreementId` set where the existing does not, the existing link is updated to set `disagreementId`.

- **ensureCrossLinkForSentenceSlot(crossLinkSummary, anchorSummary, sentenceId, createdAt)**  
  If the sentence slot has at least one claim, one source, and one verification id, ensures the corresponding cross-link (and updates disagreement when present). Exported for tests.

---

## 7. Timing and eligibility

Cross-links are derived **after** placeholder attachment during reading-path reduction:

1. Markers are attached.
2. Verification/claim/source/disagreement placeholders are attached.
3. The reducer checks the relevant sentence slot and ensures a cross-link when the minimum required ids exist.

A sentence slot is eligible only if it has `sentenceId`, `anchorId`, and non-empty `attachments.claimIds`, `attachments.sourceIds`, and `attachments.verificationIds`. Block slots are not used.

---

## 8. What is deferred

v19 does **not** add:

- Back-references from registry records to cross-links
- Real claim–source matching
- Semantic disagreement linking
- Cross-link scoring or ranking

---

## 9. Future compatibility

After v19 the reading stack has placeholder cross-link slots. That prepares the system for claim–source pairing, disagreement surfaces, verification overlays, and anti-hallucination tooling without changing the v19 contract. Cross-links remain derived, local, and observational.

---

## 10. Success criteria (met when)

- All existing reading-assist and placeholder behavior still works.
- Eligible sentence slots create one cross-link deterministically.
- Ineligible slots do not create cross-links.
- Repeated reduction does not duplicate cross-links.
- No user-visible UI changes.
- Tests pass.
