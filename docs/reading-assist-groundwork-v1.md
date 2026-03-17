# Reading-Assist Groundwork v1

## Purpose

Create a **minimal reading-assist foundation** so Rabbit Hole can support focused reading on existing text streams (article, study, transcript, OCR-derived text) without adding a new major UI surface. This pass implements **text-focus only**: one block can be visually emphasized and nearby content slightly deemphasized. It does **not** implement eye tracking, rotary sentence enlargement, or adaptive subtitle focus—those are future layers on top of this groundwork.

## What text surfaces it attaches to

- **ArticleScreen** — Article content blocks. When "Reading focus" is on, user can tap a paragraph/block to focus it; focused block gets a subtle background, others are slightly deemphasized (opacity).
- **StudySheet** — Study guide blocks (overview, explain simply, key points, etc.). Same focus-block behavior when the sheet is opened from an article that has a study guide; toggle "Reading focus" in the sheet.

Other text streams (media transcript in ArticleScreen "From this media", OCR-derived text in Share Intake, paste captions) use the same pipeline but are not wired to focus-block in v1. The model supports `sourceType: 'article' | 'study' | 'transcript' | 'ocr'` so those can be added later without changing the contract.

## What v1 actually does

1. **Reading-assist state** — `ReadingAssistMode`: `'off' | 'focus_block'`. `ReadingAssistState`: `mode`, `focusedBlockId`, `sourceType`. Stored in React context (`ReadingAssistContext`) scoped to the Article screen (and Study sheet opened from it).
2. **Focus-block behavior** — User turns "Reading focus" to "Focus block" (or taps a block, which can implicitly enable focus mode). One block at a time can be "focused"; that block is styled with a calm background; other blocks in the same surface are slightly deemphasized (reduced opacity). Tapping the focused block again clears focus.
3. **Tap-to-focus** — On ArticleScreen content blocks and StudySheet blocks, tap selects that block as focused. No new screens, no jumpy layout, no flashy animation.
4. **Off by default** — When mode is `off`, all blocks render normally; no focus or deemphasis.

## What it intentionally does NOT do

- **No eye tracking** — No camera or gaze input; no automatic "current sentence" or "current line" from eyes.
- **No rotary sentence enlargement band** — No upper or lower screen band that shows enlarged text; no sentence-level streaming UI.
- **No adaptive subtitle focus** — No automatic focus following along transcript/subtitle playback.
- **No new tab or reading screen** — Reading focus is a refinement on existing Article and Study surfaces.
- **No article contract or epistemic changes** — Claim/source/verification and block content are unchanged.

## How it prepares for future features

- **Eye tracking** — When added, the same `focusedBlockId` / `sourceType` can be driven by a "current line" or "current sentence" from an eye-tracking service; the same emphasis/deemphasis styling can apply. The context can be extended with `focusedSegmentId` or time-based focus for subtitles.
- **Rotary sentence enlargement** — A future component can consume `focusedBlockId` (or a new `focusedSentenceId`) and render that text in an upper or lower band with larger type; the groundwork does not assume where that band lives.
- **Adaptive subtitle focus** — For live or playback transcript, `sourceType: 'transcript'` and segment ids can be used so the same focus/deemphasis logic applies to transcript blocks; v1 does not implement transcript focus.

## Model

```ts
type ReadingAssistMode = 'off' | 'focus_block'

type ReadingAssistSourceType = 'article' | 'study' | 'transcript' | 'ocr'

type ReadingAssistState = {
  mode: ReadingAssistMode
  focusedBlockId: string | null
  sourceType: ReadingAssistSourceType | null
}
```

Helpers: `isReadingFocusActive(state)`, `isBlockFocused(state, blockId, sourceType)`, `isAnyBlockFocused(state)`.

## Implementation summary

| Item | Location |
|------|----------|
| Types | `apps/mobile/src/types/readingAssist.ts` — ReadingAssistMode, ReadingAssistState, helpers |
| Context | `apps/mobile/src/context/ReadingAssistContext.tsx` — ReadingAssistProvider, useReadingAssist |
| ArticleScreen | Wrapped in ReadingAssistProvider; inner ArticleScreenBody uses useReadingAssist; "Reading focus" toggle (Off / Focus block); content blocks are Pressable, tap sets/clears focus; styles readingBlockFocused, readingBlockDeemphasized |
| StudySheet | useReadingAssist(); "Reading focus" row (Off / Focus block); StudyBlockView receives isFocused, isDeemphasized, onPress; focused/deemphasized styles |
| Tests | `apps/mobile/src/__tests__/readingAssist.test.ts` — state shape, isBlockFocused, isAnyBlockFocused, isReadingFocusActive, off-state unchanged |

## Future path

- **Eye-tracking integration** — Drive `focusedBlockId` or a new segment/sentence id from gaze; same emphasis/deemphasis UI.
- **Rotary sentence enlargement** — New component or band that displays the focused sentence/block in larger text; can be a separate GitHub issue.
- **Transcript/subtitle focus** — Wire MediaInterpretationSheet transcript blocks (and future live subtitle blocks) to reading-assist with `sourceType: 'transcript'` and optional segment ids.
- **OCR result focus** — When viewing OCR-derived article/study content, reuse article or study focus behavior.

## Limitations

- Focus state is scoped to the Article screen (and Study sheet opened from it); it is not persisted across navigation.
- No sentence-level or line-level focus; only block-level (article block, study block).
- No accessibility-specific behavior (e.g. screen reader announcements) in this pass.

## Summary

| Item | Status |
|------|--------|
| Reading-assist state and context | Implemented |
| Focus-block mode and tap-to-focus | ArticleScreen + StudySheet |
| Emphasis/deemphasis styling | Subtle (background + opacity) |
| Doc | This file |
| Eye tracking / rotary band / adaptive subtitle focus | Deferred; groundwork ready |
