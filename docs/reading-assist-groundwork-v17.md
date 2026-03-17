# Reading-Assist Groundwork v17 — Source Placeholder Records

**Status:** Implemented  
**Depends on:** v1–v16 (block focus through claim placeholder records)

---

## 1. Purpose

Reading Assist now has verification-ready attachment registries, claim placeholder records, and marker-backed verification and claim placeholders. The next step is to introduce **source placeholder records** so the attachment model can support a second placeholder layer alongside claims and verification.

This does **not** mean resolving real sources, reconstructing citations, or linking claims to verified sources yet. It means proving that the attachment model supports:

```
marker
→ anchor slot
→ source id reference
→ source registry record
```

This remains **infrastructure only**. There are **no user-visible UI changes**.

---

## 2. Why source placeholders now

After v16, the system proved it could generate claim placeholders from sentence markers. v17 proves the same substrate can support **parallel source placeholders** without redesign.

That matters because later Rabbit Hole will need to support claim records, source records, disagreement records, and verification records all attached to the same anchors and often originating from the same examined sentence.

---

## 3. Source record shape

`ReadingAssistSourceAttachmentRecord` is extended with:

- **placeholderKind:** `'marker-derived'` — all v17 source records are marker-derived placeholders.
- **markerIds:** `string[]` — ids of the markers that contributed to this source placeholder.

Existing fields remain: `id`, `anchorIds`, `createdAt`. No source title, URL, publisher, provenance, or confidence yet.

---

## 4. Sentence-level scope rule

Source placeholders are created **only** from sentence-level markers:

- `sentence_examined`
- `sentence_revisited`
- `sentence_backtracked`

**Block-level** markers (`block_examined`) do **not** create source placeholders in v17. That keeps the first source placeholder layer sentence-scoped, matching the current claim placeholder granularity.

---

## 5. Slot source id sync

When a source placeholder is created from a sentence marker:

- The source id (`ra-source-placeholder|<markerId>`) is appended to:
  - `slot.sourceIds`
  - `slot.attachments.sourceIds`
- Both are kept in sync for backward compatibility.

Block slots are not touched in v17.

---

## 6. Helpers

- **ensureSourceAttachmentRecord(registry, id, anchorId, createdAt)**  
  Creates or updates a source record; new records get `placeholderKind: 'marker-derived'` and `markerIds: []`. Preserves original `createdAt`; adds `anchorId` and `id` to arrays if missing.

- **attachMarkerToSourceAttachmentRecord(registry, sourceId, markerId)**  
  Pure helper that appends `markerId` to the source record’s `markerIds` if not already present. No duplication.

---

## 7. Internal helper

**applySourcePlaceholderForMarker(registry, anchorSummary, markerId, kind, sentenceId, createdAt)**  
Runs only for the three sentence-level marker kinds and when `sentenceId` is non-null. Resolves the sentence slot; ensures source id `ra-source-placeholder|<markerId>`; appends to slot `sourceIds` and `attachments.sourceIds`; ensures source record with sentence anchor id; attaches marker id to the record’s `markerIds`. Returns updated `{ registry, anchorSummary }`.

---

## 8. What is deferred

v17 does **not** do any of the following:

- Attach source ids to claim placeholder records
- Attach verification ids to source placeholders
- Link source placeholders to disagreement ids
- Derive source text or citation spans
- Infer semantic provenance

Those come in later steps.

---

## 9. Future compatibility

After v17 the reading stack has:

- Verification placeholders (v15)
- Claim placeholder records (v16)
- Source placeholder records (v17)

That prepares the system for:

- Real source records and source reconstruction
- Claim–source linking
- Disagreement objects
- Verification objects and anti-hallucination assistance

without changing the v17 contract. Source placeholders remain derived, local, and observational.

---

## 10. Success criteria (met when)

- All existing reading-assist behavior still works.
- Verification and claim placeholder behavior still work.
- Sentence-level markers create source placeholder ids and source registry records; block markers do not.
- Slot `sourceIds` and `attachments.sourceIds` stay in sync.
- No user-visible UI changes.
- Tests pass.
