# Reading-Assist Groundwork v16 — Claim Placeholder Records

**Status:** Implemented  
**Depends on:** v1–v15 (block focus through verification-ready attachment registries)

---

## 1. Purpose

Reading Assist now has verification-ready attachment registries and marker-backed verification placeholders. The next step is to introduce **claim placeholder records** so the attachment model can support a second semantic layer beyond verification placeholders.

This does **not** mean extracting real claims or linking claims to real sources yet. It means proving that the attachment model supports:

```
marker
→ anchor slot
→ claim id reference
→ claim registry record
```

This remains **infrastructure only**. There are **no user-visible UI changes**.

---

## 2. Why claim placeholders now

After v15, verification placeholders proved the registry pattern worked. v16 proves the system can support **multiple semantic placeholder layers** in parallel:

- Verification placeholders from markers (v15)
- Claim placeholders from sentence-level markers (v16)

That is a major structural milestone: later Rabbit Hole will need to attach claims, sources, disagreements, and verification objects to the same anchor substrate without redesign.

---

## 3. Claim record shape

`ReadingAssistClaimAttachmentRecord` is extended with:

- **placeholderKind:** `'marker-derived'` — all v16 claim records are marker-derived placeholders.
- **markerIds:** `string[]` — ids of the markers that contributed to this claim placeholder (e.g. the sentence_examined marker that created it).

Existing fields remain: `id`, `anchorIds`, `createdAt`. No claim text, claim type, confidence, or verification status yet.

---

## 4. Sentence-level scope rule

Claim placeholders are created **only** from sentence-level markers:

- `sentence_examined`
- `sentence_revisited`
- `sentence_backtracked`

**Block-level** markers (`block_examined`) do **not** create claim placeholders in v16. That keeps the first claim placeholder layer sentence-scoped, which is the right granularity for future claim extraction.

---

## 5. Slot claim id sync

When a claim placeholder is created from a sentence marker:

- The claim id (`ra-claim-placeholder|<markerId>`) is appended to:
  - `slot.claimIds`
  - `slot.attachments.claimIds`
- Both are kept in sync for backward compatibility, just like marker ids.

Block slots are not touched in v16.

---

## 6. Helpers

- **ensureClaimAttachmentRecord(registry, id, anchorId, createdAt)**  
  Creates or updates a claim record; new records get `placeholderKind: 'marker-derived'` and `markerIds: []`. Preserves original `createdAt`; adds `anchorId` and `id` to arrays if missing.

- **attachMarkerToClaimAttachmentRecord(registry, claimId, markerId)**  
  Pure helper that appends `markerId` to the claim record’s `markerIds` if not already present. No duplication.

---

## 7. Internal helper

**applyClaimPlaceholderForMarker(registry, anchorSummary, markerId, kind, sentenceId, createdAt)**  
Runs only for the three sentence-level marker kinds and when `sentenceId` is non-null. Resolves the sentence slot; ensures claim id `ra-claim-placeholder|<markerId>`; appends to slot `claimIds` and `attachments.claimIds`; ensures claim record with sentence anchor id; attaches marker id to the record’s `markerIds`. Returns updated `{ registry, anchorSummary }`.

---

## 8. What is deferred

v16 does **not** do any of the following:

- Attach source ids to claim placeholders
- Attach verification ids to claim placeholders
- Link claim placeholders to disagreement ids
- Derive claim text or claim spans
- Infer semantic content

Those come in later steps.

---

## 9. Future compatibility

After v16 the reading stack has:

- Verification placeholders (v15)
- Claim placeholder records (v16)

That prepares the system for:

- Real claim records and claim extraction
- Source attachment to claims
- Disagreement objects
- Verification objects and anti-hallucination assistance

without changing the v16 contract. Claim placeholders remain derived, local, and observational.

---

## 10. Success criteria (met when)

- All existing reading-assist behavior still works.
- Verification placeholder behavior still works.
- Sentence-level markers create claim placeholder ids and claim registry records; block markers do not.
- Slot `claimIds` and `attachments.claimIds` stay in sync.
- No user-visible UI changes.
- Tests pass.
