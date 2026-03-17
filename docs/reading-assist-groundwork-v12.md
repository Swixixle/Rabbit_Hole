# Reading-Assist Groundwork v12 — Disagreement-Ready Examination Markers

**Status:** Implemented  
**Depends on:** v1–v11 (block focus through verification-aware reading paths)

---

## 1. Purpose

Reading Assist now has verification-aware reading paths that record which blocks and sentences were examined, with dwell and progression relationships. The next step is to make that layer **ready for future disagreement and verification overlays** by adding **examination markers**.

This does **not** mean implementing disagreement UI yet. It means adding a lightweight way to mark that certain examined blocks or sentences are **candidate attachment points** for future:

- Disagreement surfaces  
- Claim/source overlays  
- Anti-hallucination verification affordances  
- “Show me where uncertainty lives” interactions  

This remains **infrastructure only**. There are **no user-visible UI changes**.

---

## 2. Why examination markers now

The reading path summary already answers “what was examined.” Markers add an **event-level log** of *when* and *how* something was examined (first focus, revisit, backtrack). That gives future tooling stable attachment points: “this sentence was revisited” or “the user backtracked here” without interpreting truth or falsehood.

Disagreement-ready markers remain **derived**, **observational**, and **non-semantic for now**: they do not decide what is true, do not label content as wrong/right, do not introduce verification status, and do not change reading behavior. This step only creates the attachment structure.

---

## 3. Reading path vs markers

- **Reading path summary (v11):** Per-block and per-sentence records (focus counts, dwell, progression). Stable, cumulative.  
- **Markers (v12):** Event-level records appended over time. Each marker has a unique `id`, a `kind`, optional `blockId`/`sentenceId`, and `createdAt`.  

Markers are **not** deduplicated by kind + sentence forever. One sentence can produce multiple markers (e.g. multiple revisits or backtracks). `markerIds` is kept in sync with `markers` for stable indexing and testing.

---

## 4. Marker kinds

- **`block_examined`** — emitted on `block_focus_set` when `blockId` is non-null.  
- **`sentence_examined`** — emitted on `sentence_focus_set` when `sentenceId` is non-null.  
- **`sentence_revisited`** — emitted on `sentence_focus_set` when the sentence record already existed and its `focusCount` after update is greater than 1.  
- **`sentence_backtracked`** — emitted when the heuristic state’s `backtrackCount` has increased beyond the reading path’s previous `observedBacktrackCount` (on progression events). Attached to `event.sentenceId` and `event.blockId` when available.

---

## 5. Observational and non-semantic

Markers summarize **examination behavior** only. They do **not**:

- Decide what is true or false  
- Label content as wrong/right  
- Introduce verification status  
- Change focus, scrolling, progression, or UI  

Disagreement categories, claim/source linkage, contradiction detection, and user-visible overlays are **deferred**. Later layers can attach those semantics to markers.

---

## 6. Reducer and observedBacktrackCount

The reading path reducer is updated to:

- Append markers in the cases above (additive only).  
- Keep `observedBacktrackCount` in sync with the post-event heuristic state’s `backtrackCount` when a backtrack marker is appended.  
- Preserve all existing reading-path behavior (block/sentence counts, dwell mirroring, progression, last examined ids).

No new context API is required; `readingPathSummary` already includes `markers`, `markerIds`, and `observedBacktrackCount`. `resetReadingPathSummary()` resets them as part of the summary.

---

## 7. Future compatibility

Markers are the first true **attachment points** for:

- **Claim/source attachment:** Attach claim or source ids to markers for overlays.  
- **Disagreement surfaces:** Show disagreement only at examined (or revisited/backtracked) locations.  
- **Verification overlays:** Highlight verification status at marker locations.  
- **Anti-hallucination assistance:** Distinguish “surfaced” from “examined” and “re-examined” content.

All of this can build on the v12 marker model without changing its contract.

---

## 8. Success criteria (met when)

- All existing reading-assist behavior still works.  
- Reading path summary still updates correctly.  
- Markers are appended deterministically from events and heuristic changes.  
- Revisit and backtrack markers are captured safely.  
- No user-visible UI changes.  
- Tests pass.
