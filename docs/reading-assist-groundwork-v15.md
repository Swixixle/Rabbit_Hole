# Reading-Assist Groundwork v15 — Verification-Ready Attachment Registries

**Status:** Implemented  
**Depends on:** v1–v14 (block focus through source-ready attachment envelopes)

---

## 1. Purpose

Reading Assist now has claim-ready anchor slots and source-ready attachment envelopes (ids on slots). The next step is to introduce **verification-ready attachment registries** so that attachment ids can resolve to a stable registry layer.

This does **not** mean attaching real claims, sources, or verification objects yet. It means creating a **registry layer** so future semantic systems can attach objects by id in a dedicated registry, while anchor slots continue to hold only ids.

This remains **infrastructure only**. There are **no user-visible UI changes**.

---

## 2. Why registries now

Slots and envelopes can hold attachment ids, but there was nowhere for those ids to resolve to. v15 adds that resolution layer: **anchor slot ids → registry objects**. Registries remain **derived**, **observational**, **empty scaffolding** for claim/source/disagreement, and **separate from slot-local arrays**. No real semantic population, extraction, or inference yet.

---

## 3. Slot-local attachments vs registry records

- **Slot-local (envelope):** Each slot has `attachments.claimIds`, `sourceIds`, `disagreementIds`, `verificationIds` — lists of ids only.  
- **Registry:** `ReadingAssistAttachmentRegistrySummary` has `claimRegistry`, `sourceRegistry`, `disagreementRegistry`, `verificationRegistry` — each keyed by id — plus `claimIds`, `sourceIds`, `disagreementIds`, `verificationIds` for stable ordering.  
- **Record shells:** Each record has `id`, `anchorIds` (which slot anchors it is attached to), and `createdAt`. No labels, status, confidence, or payload yet.

---

## 4. Registry helpers

Pure helpers create or update records and keep id arrays in sync:

- `ensureClaimAttachmentRecord(registry, id, anchorId, createdAt)`  
- `ensureSourceAttachmentRecord(registry, id, anchorId, createdAt)`  
- `ensureDisagreementAttachmentRecord(registry, id, anchorId, createdAt)`  
- `ensureVerificationAttachmentRecord(registry, id, anchorId, createdAt)`  

Behavior: create record if missing; add `anchorId` to `anchorIds` if not present; add id to the corresponding top-level id array if missing; keep existing `createdAt` once set.

---

## 5. Verification placeholder population rule

To prove the structure end-to-end, v15 adds one derived population rule: **marker-backed verification placeholder records**.

When a marker is attached to a slot:

- A **verification placeholder id** is defined as `ra-verification-placeholder|<markerId>`.
- A **verification attachment record** is ensured in `attachmentRegistry.verificationRegistry` for that id, with the relevant anchor id(s) (block and/or sentence) and event timestamp.
- The placeholder id is appended to **`slot.attachments.verificationIds`** for each slot the marker was attached to.

So: **marker → anchor slot → verification id in envelope → verification registry record**. This is not a real verification object; it is a structural placeholder. Only verification gets this treatment in v15; claim/source/disagreement registries stay empty.

---

## 6. Slot synchronization

When a verification placeholder is created from a marker attachment:

- The placeholder id is appended to **`slot.attachments.verificationIds`** (envelope only).
- No new top-level `verificationIds` is added on the slot; only the envelope holds verification ids. This keeps attachment semantics in the envelope.

---

## 7. Why claim/source/disagreement registries stay empty

v15 does not populate claim, source, or disagreement registries. Only the verification registry gets placeholder records derived from markers. Real claim/source/disagreement attachment and verification payloads are left to later steps.

---

## 8. Observational scaffolding

Registries are still **observational**: they do not drive focus, scrolling, progression, or UI. They only provide the **attachment registry** half of the model so that future claim/source/verification/disagreement layers can resolve slot ids to objects without redesigning the system.

---

## 9. Future compatibility

After v15 the system has:

- Anchor slots → attachment envelopes → verificationIds (and later claimIds, sourceIds, disagreementIds)  
- Attachment registry → verification (and later claim, source, disagreement) records keyed by id  

That supports:

- Claim attachment and claim records  
- Source attachment and source records  
- Disagreement objects  
- Verification overlays and anti-hallucination assistance  

without changing the v15 contract.

---

## 10. Success criteria (met when)

- All existing reading-assist behavior still works.  
- Reading path summary still updates correctly; marker and slot behavior unchanged.  
- `attachmentRegistry` exists and is deterministic.  
- Verification placeholder ids resolve to registry records; slot envelope `verificationIds` are correct.  
- No user-visible UI changes.  
- Tests pass.
