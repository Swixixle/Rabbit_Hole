# Reading-Assist Groundwork v13 — Claim-Ready Anchor Slots

**Status:** Implemented  
**Depends on:** v1–v12 (block focus through disagreement-ready examination markers)

---

## 1. Purpose

Reading Assist now has verification-aware reading paths and disagreement-ready examination markers. The next step is to make the reading-path layer **ready for future claim/source attachment** by adding **claim-ready anchor slots**.

This does **not** mean implementing claim extraction or source linkage yet. It means creating lightweight, derived **anchor slots** on examined blocks and sentences so future systems can attach:

- Claims  
- Sources  
- Disagreement objects  
- Verification overlays  
- Anti-hallucination support objects  

This remains **infrastructure only**. There are **no user-visible UI changes**.

---

## 2. Why claim-ready anchor slots now

Markers answer “when and how was this examined.” Anchor slots answer “**where** can we attach claims, sources, and disagreement objects?” Without stable slots per block and sentence, later claim/source work would have nowhere to land. Slots are created when a block or sentence is first examined; marker ids are then attached into the matching slot(s). The slot schema includes empty arrays for `claimIds`, `sourceIds`, and `disagreementIds` so future layers can fill them without changing the structure.

Claim-ready anchor slots remain **derived**, **observational**, and **empty scaffolding for now**: no real claims, no invented source ids, no verification logic, no change to reading or marker behavior.

---

## 3. Reading path, markers, and anchor slots

- **Reading path summary (v11):** Examined blocks/sentences with dwell and progression.  
- **Markers (v12):** Event-level examination records (block_examined, sentence_examined, sentence_revisited, sentence_backtracked).  
- **Anchor summary (v13):** `blockSlots` and `sentenceSlots` keyed by deterministic anchor id. Each slot has `anchorId`, `blockId`/`sentenceId`, `slotType`, `createdAt`, and arrays: `markerIds` (populated when markers are appended), `claimIds`, `sourceIds`, `disagreementIds` (all empty for now).

Slots are created on `block_focus_set` (block slot) and `sentence_focus_set` (sentence slot, and block slot if needed). When a marker is appended, its id is attached to the matching block and/or sentence slot if that slot exists.

---

## 4. Slot schema

- **`ReadingAssistClaimReadyAnchorSlot`:** `anchorId`, `blockId`, `sentenceId`, `slotType` ('block' | 'sentence'), `createdAt`, `markerIds`, `claimIds`, `sourceIds`, `disagreementIds`.  
- **`ReadingAssistClaimReadyAnchorSummary`:** `blockSlots`, `sentenceSlots`, `blockSlotIds`, `sentenceSlotIds`.

Anchor ids are deterministic: `createReadingAssistBlockAnchorId(blockId)` → `ra-anchor|block|${blockId}`; `createReadingAssistSentenceAnchorId(sentenceId)` → `ra-anchor|sentence|${sentenceId}`.

---

## 5. Marker attachment behavior

- On **block_focus_set** (non-null blockId): ensure block slot exists, append block_examined marker, attach that marker id to the block slot’s `markerIds`.  
- On **sentence_focus_set** (non-null sentenceId): ensure block slot if event.blockId present, ensure sentence slot, append sentence_examined (and sentence_revisited when applicable), attach each new marker id to the corresponding slot(s).  
- On **sentence_progress_next/previous** when backtrack count increases: append sentence_backtracked marker, attach that marker id to the block and sentence slots for event.blockId/event.sentenceId when those slots exist.

Marker ids are not duplicated inside a slot’s `markerIds`. Slots are only created on focus events; progression events only attach to existing slots.

---

## 6. Why claim/source/disagreement arrays remain empty

This step only creates the **structure**. No claim extraction, source resolution, or disagreement logic runs yet. `claimIds`, `sourceIds`, and `disagreementIds` stay empty so that:

- Later claim attachment can push ids into `claimIds`.  
- Later source linkage can push ids into `sourceIds`.  
- Later disagreement surfaces can push ids into `disagreementIds`.  

No semantic layer is implemented in v13.

---

## 7. Future compatibility

Anchor slots are the substrate for:

- **Claim attachment:** Attach candidate claims to a sentence or block the user actually examined.  
- **Source attachment:** Attach source objects to a sentence or block slot.  
- **Disagreement surfaces:** Attach disagreement objects to revisited/backtracked locations.  
- **Verification overlays:** Render verification state anchored to examination surfaces.  
- **Anti-hallucination assistance:** Distinguish surfaced vs examined content and attach support objects.

All of this can build on the v13 anchor summary without changing its contract.

---

## 8. Success criteria (met when)

- All existing reading-assist behavior still works.  
- Reading path summary and markers still update correctly.  
- Block and sentence anchor slots are created deterministically on focus events.  
- Marker ids attach into the correct slots without duplication.  
- No user-visible UI changes.  
- Tests pass.
