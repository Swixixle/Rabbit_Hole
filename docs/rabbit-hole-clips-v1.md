# Rabbit Hole Clips v1

Minimal planning layer plus **rendering/export v1**: users can generate a shareable vertical image clip from an article and hand it to the system share sheet. No video pipeline, no social APIs, no new primary surface.

## Purpose

- Enable a tangible clip artifact from article data: vertical cards (title → insight → explanation → closing) rendered as one image and shared via the OS share sheet.
- Keep the clip plan as the single source of truth; rendering is deterministic and article-driven.
- Fit naturally into the existing Share surface (Share and Share Clip on the article screen).

## Why clips belong in Share

- Share is the distribution layer: user has learned something and wants to pass it on.
- Text share and clip share are both “export this article”; clips are a richer export format, not a separate product surface.
- “Share Clip” sits next to “Share” in the article header. No new tab or primary nav.

## Clip plan model

- **ClipFrame:** `id`, `kind` (`'title' | 'insight' | 'explanation' | 'closing'`), `text`, optional `imageUrl`, optional `durationMs`.
- **ArticleClipPlan:** `articleId`, `title`, `frames: ClipFrame[]`, optional `totalDurationMs`.

Defined in `apps/mobile/src/types/clipPlan.ts`. Derivation in `apps/mobile/src/utils/clipPlan.ts`.

## Rendering/export strategy (v1)

**Chosen approach: single stitched vertical image (option B).**

- All four frames are rendered as **one tall image** (4 × 9:16 cards, 360×2560 px).
- The view is captured with **react-native-view-shot** (`captureRef`), then the resulting file URI is passed to **React Native `Share.share()`** so the user can send the image to any app (Messages, Instagram, etc.).
- **Why this for v1:** Avoids multi-file share and image-stitching libraries. One capture, one share. Keeps the implementation small and stable. True video (MP4) is deferred.

## How rendered output is derived from ArticleClipPlan

1. **Plan:** `getArticleClipPlan(article)` returns four frames in order: title, insight, explanation, closing (see derivation rules below).
2. **Display props:** `getClipFrameDisplayProps(plan.frames)` maps each frame to `{ id, kind, text, imageUrl: string | null }`. Missing `imageUrl` becomes `null` (text-only card).
3. **Cards:** Each frame is rendered by `ClipCard`: 9:16 vertical card (360×640), simple typography, optional image at top. Labels for “Key insight” and “Context” on insight/explanation.
4. **Export view:** `ClipExportView` stacks the four cards in a single `View` (ref attached for capture). No scroll inside the captured view so the full height is one image.
5. **Capture:** `captureAndShareClipView(ref, { title, message })` runs `captureRef(ref, { format: 'png', result: 'tmpfile' })`, then `Share.share({ url })`.

Deterministic: same article → same plan → same visual output.

## How share/export works

1. User taps **Share Clip** on the article screen.
2. A modal opens with a scrollable preview of the four-frame clip (same view that will be captured, so user sees what they’re sharing).
3. User taps **Share** → app captures the ref view to a temp PNG, then opens the system share sheet with that file.
4. User picks an app (e.g. Messages, Instagram) and sends. On error (e.g. capture fails), a calm message is shown: “Could not create clip. Try again.”
5. **Cancel** closes the modal without sharing.

## Derivation rules from article data

- **Title frame:** Article title (or "Article" if missing).
- **Insight frame:** First summary block text, or fallback from `getArticleSummary(article)` (title or "Article.").
- **Explanation frame:** First content or context block text, or summary; truncated to 120 characters with ellipsis if longer.
- **Closing frame:** Fixed text: "Explore more in Rabbit Hole."
- **Duration:** Defaults per kind: title 3s, insight 4s, explanation 4.5s, closing 3s → ~14.5s total. Used for future video; not used in image export.
- **imageUrl:** Not set by plan in v1 (article has no image in contract); render path supports it so a future source (e.g. search result image) can plug in.

## Limitations of v1

- **Image only:** No MP4 or audio. One PNG file.
- **Single tall image:** Some apps may crop or show a long image in a scroll; that’s acceptable for v1.
- **No article image:** Cards are text-only unless a frame has `imageUrl` from a future data source.
- **Capture may fail** on some devices or when the view is not fully laid out; we show an error and let the user try again.
- **No editing:** User cannot change text or order; output is fully driven by the article and plan.

## Manual validation checklist

- [ ] Open an article that has title, summary, and at least one content block.
- [ ] Tap **Share Clip**. Modal opens with four cards (title, insight, explanation, closing) in a vertical strip; scroll to see all.
- [ ] Tap **Share**. System share sheet appears with one image (the full strip). Send to an app (e.g. Notes or Messages); confirm the received image shows all four frames.
- [ ] Tap **Cancel** and confirm modal closes without sharing.
- [ ] On an article with minimal content (e.g. only identification block), confirm Share Clip still produces four frames with fallback text.
- [ ] If capture fails (e.g. simulate by disabling permissions or in simulator), confirm error message appears and Share can be retried.

## Tests

- **Clip plan:** Frame order, fallbacks, duration, truncation, no imageUrl when article has no image (existing `clipPlan.test.ts`).
- **Clip render:** `getClipFrameDisplayProps` maps frames and uses `imageUrl ?? null`; `getOrderedFramesForRender` returns stable order title → insight → explanation → closing (`clipRender.test.ts`).

## Out of scope for v1

- Video file export (MP4).
- Social platform APIs (TikTok, Reels, Shorts upload).
- Object-segment highlight animation.
- Evidence snippets or overlay graphics.
- Clip editor or custom text/order overrides.
- Any new primary UI surface.

## Future path

- **True video export:** Compose frames into a short MP4 (e.g. 3–4s per frame) with optional silence or simple audio.
- **Motion/animation:** Fade or slide between frames in video.
- **Object highlight overlays:** If the article came from image exploration, one frame could highlight the selected object (segment/bbox).
- **Evidence snippets:** Overlay or cut to source quotes; would need evidence span text in the plan or from API.
- **Platform-specific sharing:** Optimized image size or format per destination (e.g. Stories aspect ratio).

## Dependency

- **react-native-view-shot** (v3.8.0): used to capture the clip export view as PNG. Documented in app `package.json` and this doc. Required for Share Clip; no other new dependencies.

## API / placement

- No backend for clip plans or export. Plan derivation and rendering are client-side. Share uses the system share sheet only.
- Entry point: article screen header, **Share Clip** next to **Share**.
