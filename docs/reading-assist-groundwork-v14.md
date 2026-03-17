# Reading-Assist Groundwork v14 — Source-Ready Attachment Envelopes

**Status:** Implemented  
**Depends on:** v1–v13 (block focus through claim-ready anchor slots)

---

## 1. Purpose

Reading Assist now has claim-ready anchor slots with top-level `markerIds`, `claimIds`, `sourceIds`, and `disagreementIds`. The next step is to make those slots **ready for future source attachment** without yet attaching real sources.

This does **not** mean implementing source extraction, source lookup, or verification. It means adding a lightweight, explicit **attachment envelope** inside each anchor slot so future systems can safely attach:

- Source references  
- Claim references  
- Disagreement references  
- Verification references  

in a stable, typed way. This remains **infrastructure only**. There are **no user-visible UI changes**.

---

## 2. Why attachment envelopes now

Slots already had loose arrays. Future verification and source layers need a single, explicit grouping surface. v14 introduces that surface **now**, before semantic layers land, so later work can use `attachments.claimIds`, `attachments.sourceIds`, `attachments.disagreementIds`, and `attachments.verificationIds` without redesigning the slot shape.

Source-ready attachment envelopes remain **derived**, **observational**, **empty scaffolding**, and **slot-local**: no real source resolution, no population from outside systems, no claim extraction or verification logic, no change to marker or reading behavior.

---

## 3. Slot arrays vs attachment envelope

- **Top-level slot arrays (v13):** `markerIds`, `claimIds`, `sourceIds`, `disagreementIds` remain on the slot for backward compatibility and test stability.  
- **Attachment envelope (v14):** `slot.attachments` is a single object with `markerIds`, `claimIds`, `sourceIds`, `disagreementIds`, and `verificationIds`. It is the future canonical grouping surface.

Temporary duplication is intentional: top-level arrays stay so existing consumers and tests keep working; `attachments` is the place new claim/source/verification logic will attach. When a marker is attached to a slot, both `slot.markerIds` and `slot.attachments.markerIds` are updated so they stay in sync.

---

## 4. Envelope schema

- **`ReadingAssistAttachmentEnvelope`:** `markerIds`, `claimIds`, `sourceIds`, `disagreementIds`, `verificationIds` (all arrays).  
- **`DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE`:** all arrays empty. Each new slot gets a **fresh copy** of this envelope (no shared mutable references between slots).  
- **`ReadingAssistClaimReadyAnchorSlot`** gains `attachments: ReadingAssistAttachmentEnvelope`; existing top-level arrays are unchanged.

---

## 5. Marker sync behavior

When the internal marker-attachment helper adds a marker id to a slot:

- The id is appended to the slot’s top-level `markerIds` if missing.  
- The id is appended to `slot.attachments.markerIds` if missing.  

Both are updated together so they never diverge. Claim, source, disagreement, and verification arrays (top-level and inside `attachments`) remain empty in v14.

---

## 6. Why real claim/source/verification attachment is deferred

This step only formalizes the **container**. No claim extraction, source resolution, or verification logic runs. All of `claimIds`, `sourceIds`, `disagreementIds`, and `verificationIds` (top-level and in `attachments`) stay empty so that:

- Later claim attachment can push into `attachments.claimIds`.  
- Later source linkage can push into `attachments.sourceIds`.  
- Later disagreement and verification layers can push into `attachments.disagreementIds` and `attachments.verificationIds`.  

Semantic attachment is left to future steps.

---

## 7. Future compatibility

Attachment envelopes are the substrate for:

- **Source linkage:** Attach source references to examined blocks/sentences.  
- **Verification overlays:** Attach verification state to slots.  
- **Disagreement objects:** Attach disagreement references to revisited/backtracked locations.  
- **Anti-hallucination tooling:** Use claim/source/verification ids on the envelope without changing slot shape.

All of this can build on the v14 envelope model without breaking the contract.

---

## 8. Success criteria (met when)

- All existing reading-assist behavior still works.  
- Reading path summary and marker attachment still work as before.  
- Anchor slots include `attachments` with the new envelope shape.  
- Top-level `markerIds` and `attachments.markerIds` stay in sync.  
- No user-visible UI changes.  
- Tests pass.
