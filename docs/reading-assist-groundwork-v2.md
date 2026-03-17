# Reading-Assist Groundwork v2 — Sentence Anchoring

## Purpose

Introduce **sentence anchoring inside blocks** so future features (eye tracking, rotary sentence enlargement, adaptive subtitle focus) can operate **without redesigning the reading model**. This step adds only the **data model and attachment points**; it does **not** change any UI. The system remains visually identical to v1.

## Block vs sentence hierarchy

Sentence anchoring is **subordinate to block focus**:

```
ReadingAssistMode
→ focusedBlockId (primary reading unit)
→ focusedSentenceId (optional; exists only inside a focused block)
```

- Block focus remains the primary reading unit.
- Sentence focus is valid only when a block is focused; setting or clearing block focus clears sentence focus.
- Context API: `setSentenceFocus(sentenceId)` only takes effect when a block is focused; `setFocus(blockId, sourceType)` and `setMode("off")` clear `focusedSentenceId`.

## Sentence anchoring model

- **State:** `ReadingAssistState` gains `focusedSentenceId: string | null`. Default `null`.
- **Anchors:** Each block can expose a list of **sentence anchors** — `{ id, startOffset, endOffset }` — so future UI can highlight or enlarge a single sentence.
- **ID scheme:** Sentence IDs are deterministic and compatible with article, study, and (later) transcript/OCR:
  - Article: `article-${articleId}-block-${blockIndex}-sentence-${sentenceIndex}`
  - Study: `${blockId}-sentence-${sentenceIndex}` (e.g. `sb-1-sentence-0`)

## Sentence parsing (internal only)

- **Article blocks:** Lightweight segmentation by terminal punctuation (`. ! ?`). Implemented in `getSentenceAnchorsForBlock(blockText, blockId)`; no new dependencies; not rendered separately.
- **Study blocks:** `getSentenceAnchorsForStudyBlock(content, bulletItems, blockId)` concatenates content and bullet items into one text and reuses the same segmentation. Study sheet does **not** yet support sentence-focus UI; only anchors are computed.

## Attach points

- **ArticleScreenBody:** For each article content block, `blockSentences = getSentenceAnchorsForBlock(block.text, blockId)` is computed and passed to `MicroParagraphCard` as optional `sentenceAnchors`. No change to layout or styling.
- **StudySheet / StudyBlockView:** `getSentenceAnchorsForStudyBlock(block.content, block.bulletItems, block.id)` is called internally; anchors are not yet passed to any sentence-level UI.

## Context API (v2)

- **setSentenceFocus(sentenceId: string)** — Sets `focusedSentenceId` only when `mode === "focus_block"` and `focusedBlockId != null`; otherwise no-op.
- **clearSentenceFocus()** — Sets `focusedSentenceId` to `null`.
- **setFocus(blockId, sourceType)** — When block focus changes, `focusedSentenceId` is cleared.
- **setMode("off")** — Clears block and sentence focus.

Helpers: **isSentenceFocused(state, sentenceId, blockId, sourceType)**, **isAnySentenceFocused(state)**.

## Future compatibility

- **Eye tracking:** A future service can set `focusedSentenceId` (and optionally `focusedBlockId`) from the current gaze; the same state drives emphasis/deemphasis or rotary band.
- **Rotary sentence enlargement:** A band component can read `focusedSentenceId` and the anchors for the focused block, then render that sentence in larger type; v2 does not implement the band.
- **Subtitle sync:** Transcript blocks can use the same ID scheme and anchor model so “current subtitle segment” maps to a sentence id; v2 does not implement subtitle syncing.

## Why UI is intentionally unchanged

- v2 is **infrastructure only**. No sentence highlighting, no rotary band, no scroll locking, no new toggles.
- All existing v1 behavior (block focus, tap-to-focus, Off / Focus block toggle, emphasis/deemphasis) is unchanged.
- This keeps the pass small and avoids UI churn while giving the next phases a stable foundation.

## Implementation summary

| Item | Location |
|------|----------|
| State | `readingAssist.ts` — `focusedSentenceId`, `SentenceAnchor`, default `null` |
| Helpers | `isSentenceFocused`, `isAnySentenceFocused` |
| Segmentation | `getSentenceAnchorsForBlock(text, blockId)`, `getSentenceAnchorsForStudyBlock(content, bulletItems, blockId)` |
| Context | `ReadingAssistContext.tsx` — `setSentenceFocus`, `clearSentenceFocus`; clear sentence on block/mode change |
| Article | `ArticleScreenBody` — compute `blockSentences`, pass `sentenceAnchors` to `MicroParagraphCard` (prop only; no render change) |
| Study | `StudySheet` — compute anchors in `StudyBlockView`; no sentence UI |
| Tests | `readingAssist.test.ts` — sentence state, helpers, anchoring id scheme, empty text |

## Out of scope (v2)

- Sentence highlighting
- Rotary enlargement band
- Eye tracking
- Sentence navigation UI
- Subtitle syncing
- Scroll locking
- Persistence

These belong to future reading-assist phases.

## Summary

| Item | Status |
|------|--------|
| focusedSentenceId in state | Done |
| setSentenceFocus / clearSentenceFocus | Done |
| Sentence cleared when block or mode changes | Done |
| Sentence anchors (article + study) | Done; internal only |
| UI change | None |
| Doc | This file |
