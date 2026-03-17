# Live subtitle / text extraction groundwork v1

## Purpose

Allow **subtitle and caption text** (e.g. from pasted captions, media transcripts) to enter Rabbit Hole as a **text stream** that feeds the same interpretation pipeline as OCR and pasted text. Product framing: **video dialogue, podcasts, spoken explanations** → text → search → article / media interpretation. No new product silo; one interpretation engine, many inputs.

## Why this is groundwork

- **No real-time device caption capture yet.** v1 supports (1) **Paste captions / transcript** — user opens Share Intake in “captions” mode and pastes text; (2) **Search from transcript** — from Media Interpretation sheet, user taps “Search from transcript” and the transcript text is routed into Share Intake. Same normalize → search → article path as OCR and pasted text.
- **Same flow as Share Intake.** Subtitle text is normalized and passed through `maybeExtractSearchString` → search (or media resolve when applicable). No new screen; Share Intake shows “Analyzing captions…” when the input source is subtitle.
- **Reading-assist precursor.** The subtitle input model (`SubtitleInput`: `text`, `source: "subtitle"`, optional `segments`) is designed so future reading-assist features (eye-tracking guidance, rotary sentence enlargement, adaptive text focus) can attach to this stream. Do not implement reading assist in this pass.

## Subtitle input model

Canonical shape (mobile util `subtitleInput.ts`):

```ts
{
  text: string,
  source: "subtitle",
  segments?: [ { startMs?: number, endMs?: number, text: string } ]
}
```

- **text:** Full concatenated caption/transcript text for search and display.
- **source:** Always `"subtitle"` so the pipeline and future reading-assist can distinguish this stream.
- **segments:** Optional; groundwork for future transcript anchoring and time-based navigation. Used when building from media transcript blocks (`subtitleInputFromMediaTranscript`).

Normalization uses the same trim-and-collapse as `normalizeSharedInput`, so search behavior is identical to pasted text and OCR output.

## Integration with Share Intake

- **Route params:** Share Intake accepts `sharedText?: string` and `inputSource?: "paste" | "ocr" | "subtitle"`. When `inputSource === "subtitle"`, placeholder is “Paste captions or transcript…” and resolving state shows “Analyzing captions…”.
- **Paste captions:** Home → “Paste captions” → Share Intake with `inputSource: "subtitle"`. User pastes text and taps Search; same pipeline as any shared text.
- **Search from transcript:** User opens a media URL → Media Interpretation sheet → “Search from transcript” → transcript text is set as input, `inputSource` set to subtitle, sheet closes, search runs.
- **Empty or invalid:** Empty or whitespace-only subtitle text yields empty search string; existing Share Intake “No results yet” and “Edit the text above and tap Search to try again” provide calm fallback and retry.

## Current limitations

- **No live device caption stream.** No continuous capture of system or in-app captions; paste and “Search from transcript” only.
- **No automatic subtitle extraction from video.** Media transcript is fixture-backed or from existing interpretation API; we do not add a new backend subtitle extractor in this pass.
- **Segments are optional.** Used when building from media transcript; not required for paste path. Segment anchoring (e.g. “jump to 1:23”) is future work.

## Implementation summary

| Item | Location |
|------|----------|
| Subtitle types & utils | `apps/mobile/src/utils/subtitleInput.ts` — `SubtitleInput`, `toSubtitleInput`, `normalizeSubtitleToSearchText`, `subtitleInputFromMediaTranscript`, `subtitleTextForIntake` |
| Share Intake params & copy | `apps/mobile/src/screens/ShareIntakeScreen.tsx` — `inputSource`, “Paste captions or transcript…”, “Analyzing captions…”, `handleSearchFromTranscript` |
| Paste captions entry | HomeScreen “Paste captions” → `onOpenShareIntakeWithCaptions` → navigate to Share Intake with `inputSource: "subtitle"` (App.tsx) |
| Search from transcript | `MediaInterpretationSheet` — “Search from transcript” button, `onSearchFromTranscript(text)` → set input, close sheet, run search |
| Tests | `apps/mobile/src/__tests__/subtitleInput.test.ts` — ingestion, normalization, segments, empty/malformed, pipeline compatibility |

## Future path

- **Device caption stream:** Integrate system or in-app live captions when available; feed into same `SubtitleInput` shape and Share Intake path.
- **Transcript segment anchoring:** Use `segments` (startMs/endMs) for “jump to timestamp” and for future reading-assist sentence focus.
- **Reading-assist:** Subtitle text stream is an attachment point for eye-tracking reading guidance, rotary sentence enlargement, and adaptive text focus. Do not implement reading assist in this groundwork.
- **TV / show recognition:** Subtitle/caption text can later feed into “what’s being said” alongside show identification.

## Dependencies

- No new API routes for v1. Subtitle text uses existing search and media resolve.
- No new mobile dependencies. Uses existing `sharedInput` normalization and Share Intake screen.

## Summary

| Item | Status |
|------|--------|
| Subtitle input model | `SubtitleInput` with optional segments in `subtitleInput.ts` |
| Paste captions | Home “Paste captions” → Share Intake with `inputSource: "subtitle"` |
| Search from transcript | Media Interpretation sheet → “Search from transcript” → same pipeline |
| Routing | Same as OCR/paste: normalize → search → article / media interpretation |
| Tests | Ingestion, routing compatibility, segments, empty/malformed |
| Doc | This file |
| Live device captions / reading assist | Deferred; noted in “Future path” |
