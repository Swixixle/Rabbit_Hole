# Reading-Assist Groundwork v18 — Disagreement Placeholder Records

**Status:** Implemented  
**Depends on:** v1–v17 (block focus through source placeholder records)

---

## 1. Purpose

Reading Assist now has verification, claim, and source placeholder records. The next step is to introduce **disagreement placeholder records** so the attachment model can support a third semantic placeholder layer alongside claims and sources.

This does **not** mean detecting real disagreement yet. It means proving that the attachment model supports:

```
marker
→ anchor slot
→ disagreement id reference
→ disagreement registry record
```

This remains **infrastructure only**. There are **no user-visible UI changes**.

---

## 2. Why disagreement placeholders now

After v17, the system can emit verification, claim, and source placeholders. v18 adds the missing placeholder class needed for future “examine competing interpretations” flows.

Disagreement is tied to **revisit** and **backtrack** signals (potential friction) rather than mere examination. That is the right structural precursor for later claim/source comparison and disagreement surfaces.

---

## 3. Why only revisit and backtrack markers qualify

Disagreement placeholders are created only from:

- **sentence_revisited**
- **sentence_backtracked**

**sentence_examined** and **block_examined** do **not** create disagreement placeholders. That keeps disagreement tied to potentially meaningful friction (re-reading, going back) rather than first-time examination.

---

## 4. Disagreement record shape

`ReadingAssistDisagreementAttachmentRecord` is extended with:

- **placeholderKind:** `'marker-derived'` — all v18 disagreement records are marker-derived placeholders.
- **markerIds:** `string[]` — ids of the markers that contributed to this disagreement placeholder.

Existing fields remain: `id`, `anchorIds`, `createdAt`. No disagreement type, rationale, confidence, or linked claim/source ids yet.

---

## 5. Sentence-level scope rule

Disagreement placeholders are created only for sentence-level markers (revisit and backtrack). Block slots are not touched. Do not attach disagreement ids to unrelated slots.

---

## 6. Slot disagreement id sync

When a disagreement placeholder is created from a sentence marker:

- The disagreement id (`ra-disagreement-placeholder|<markerId>`) is appended to:
  - `slot.disagreementIds`
  - `slot.attachments.disagreementIds`
- Both are kept in sync for backward compatibility.

---

## 7. Helpers

- **ensureDisagreementAttachmentRecord(registry, id, anchorId, createdAt)**  
  Creates or updates a disagreement record; new records get `placeholderKind: 'marker-derived'` and `markerIds: []`. Preserves original `createdAt`; adds `anchorId` and `id` to arrays if missing.

- **attachMarkerToDisagreementAttachmentRecord(registry, disagreementId, markerId)**  
  Pure helper that appends `markerId` to the disagreement record’s `markerIds` if not already present. No duplication.

---

## 8. Internal helper

**applyDisagreementPlaceholderForMarker(registry, anchorSummary, markerId, kind, sentenceId, createdAt)**  
Runs only for `sentence_revisited` and `sentence_backtracked` when `sentenceId` is non-null. Resolves the sentence slot; ensures disagreement id `ra-disagreement-placeholder|<markerId>`; appends to slot `disagreementIds` and `attachments.disagreementIds`; ensures disagreement record with sentence anchor id; attaches marker id to the record’s `markerIds`. Returns updated `{ registry, anchorSummary }`.

---

## 9. What is deferred

v18 does **not** do any of the following:

- Link disagreement placeholders to claim or source placeholders
- Link disagreement placeholders to verification placeholders
- Derive disagreement semantics or compare claim/source contents

Those come in later steps.

---

## 10. Future compatibility

After v18 the reading stack has:

- Verification placeholders (v15)
- Claim placeholder records (v16)
- Source placeholder records (v17)
- Disagreement placeholder records (v18)

That prepares the system for:

- Placeholder cross-linking
- Claim–source pairing
- Disagreement surfaces
- Verification overlays and anti-hallucination tooling

without changing the v18 contract. Disagreement placeholders remain derived, local, and observational.

---

## 11. Success criteria (met when)

- All existing reading-assist behavior still works.
- Verification, claim, and source placeholder behavior still work.
- Revisit and backtrack sentence markers create disagreement placeholder ids and disagreement registry records; sentence_examined and block_examined do not.
- Slot `disagreementIds` and `attachments.disagreementIds` stay in sync.
- No user-visible UI changes.
- Tests pass.
