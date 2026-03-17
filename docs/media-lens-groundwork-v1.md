# Media Lens Groundwork v1

## Purpose

Allow Rabbit Hole to accept a **media URL** (YouTube, podcast, TikTok, Reels-style) and route it into a clean, article-like interpretation path without building the full media system yet. Media becomes another input type that feeds the same explanation architecture.

## Why this is groundwork (not full media ingestion)

- **No real transcript fetch, no player, no external APIs.** v1 classifies and normalizes URLs, resolves via a fixture registry to an optional article, and optionally attaches **fixture-backed** summary and transcript content (Media Transcript / Summary Ingestion Groundwork v1).
- **Same flow as Share Intake.** User pastes or shares a URL; if it’s recognized as media, the app tries to resolve it and to load interpretation (summary/transcript); then article, media interpretation sheet, or “recognized but no entry yet”; otherwise existing search runs.
- **Fixture-backed and deterministic.** URL patterns, article mapping, and interpretation content (summary blocks, transcript blocks) are defined in code; no YouTube/podcast/TikTok/Instagram APIs in v1.
- **Extensible.** The same endpoints and client flow can later drive real transcript ingestion, generated summaries, or media-specific surfaces.

## Supported URL classes in v1

| Kind     | Examples |
|----------|----------|
| **youtube** | `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/embed/ID`, `youtube.com/v/ID` |
| **podcast** | `podcasts.apple.com/...`, `open.spotify.com/episode/...`, `podlink.com/...`, `podbean.com/...`, `listennotes.com/...`, `anchor.fm/...` |
| **tiktok**  | `tiktok.com/@user/video/ID`, `vm.tiktok.com/...` |
| **reel**    | `instagram.com/reel/ID`, `instagram.com/p/ID` |

Unrecognized URLs (e.g. `https://example.com/page`) are not treated as media; the app falls back to normal search.

## Classification and normalization

- **Classification:** A small utility (`app/media_url.classify_media_url`) uses regex patterns to detect the above URL shapes and return a `(kind, extracted_id)` tuple. Non-matching URLs return `None`.
- **Normalized ID:** For YouTube/TikTok/Reel, the extracted segment (e.g. video ID) is the stable id. For podcast URLs, the path (e.g. `/podcast/episode/123`) is used. Short links (e.g. `vm.tiktok.com`) may have no extractable id.
- **Registry lookup:** The API fixture `MEDIA_REGISTRY` maps normalized id (or full URL) to `{ articleId?, title? }`. If present, the resolve response includes `articleId` and optional `title`; otherwise the response is still 200 with `kind` and `originalUrl` but no `articleId`.

## Mapping / resolution behavior

- **GET /v1/media/resolve?url=...**  
  - If the URL is **not** recognized as media → **404**. Client treats this as “not media” and runs search.  
  - If recognized and **mapped** (registry entry with `articleId`) → **200** with `kind`, `originalUrl`, `normalizedId`, optional `title`, and `articleId`. Client navigates to the article.  
  - If recognized but **unmapped** (no registry entry or entry without `articleId`) → **200** with `kind`, `originalUrl`, `normalizedId`, and no `articleId`. Client shows “Media link recognized, but no Rabbit Hole entry yet” and keeps the text; user can “Search anyway”.

## Fallback behavior

- **Not a media URL:** 404 from resolve → client runs existing search with the shared text (unchanged behavior).
- **Media, unmapped, no interpretation:** 200 with no `articleId` and no interpretation → client shows “Media link recognized, but no Rabbit Hole entry yet” and leaves the input visible; “Search” runs search.
- **Media, unmapped, with interpretation:** 200 with no `articleId` but interpretation exists → client shows a **media interpretation sheet** (summary + transcript) and hint “You can search anyway.”
- **Media, mapped:** 200 with `articleId` → client fetches interpretation if available; opens the article and, when interpretation is present, shows a **“From this media”** section (summary + transcript + optional **claims**) on the article screen.

## Transcript / summary groundwork (v1)

- **Model:** `MediaSummaryBlock` (id, title?, content), `MediaTranscriptBlock` (id, speaker?, content, startMs?), `MediaInterpretation` (ref: MediaReference, summaryBlocks?, transcriptBlocks?, **claims?**).
- **Resolution:** `GET /v1/media/interpretation?url=...` returns 200 with `MediaInterpretation` when the URL is recognized as media and has fixture-backed interpretation; 404 otherwise.
- **Fixture:** `MEDIA_INTERPRETATIONS` keyed by normalized id (or URL) holds `summaryBlocks`, `transcriptBlocks`, and optionally **claims** for sample YouTube and podcast URLs. No real transcript fetch.
- **Current examples:** One YouTube ID (dQw4w9WgXcQ), second YouTube ID (jNQXAC9IVRw), podcast path `/podcast/episode/123` have summary, transcript, and **claims**. Podcast `/podcast/episode/456` has summary/transcript only (no claims). TikTok/unmapped media have no interpretation in v1.

## Claim extraction from media groundwork (v1)

- **Purpose:** Allow media interpretation to expose a small set of fixture-backed **claims** so Rabbit Hole can treat media as another source of claims, without building real extraction or evidence pipelines yet.
- **Model:** Reuse existing **Claim** shape (id, text, claimType, confidence, sourceCount, support). Attached to `MediaInterpretation` as optional `claims?: Claim[]`. Media claims use `sourceCount=0` and `support=interpretation` (or similar) to reflect that they are surfaced from the media layer, not independently verified.
- **How they differ from article claims:** Article claims are tied to blocks and can have evidence/sources. Media claims in v1 are fixture-authored statements derived from or about the media interpretation; they are not linked to transcript segments or external evidence yet. Epistemic framing: “Claims surfaced from this media” / “not independently verified.”
- **Fixture examples:** YouTube (dQw4w9WgXcQ) and second YouTube (jNQXAC9IVRw), podcast episode 123 each have 1–2 claims with `claimType` interpretation/synthesized_claim, `confidence` medium/low, `support` interpretation.
- **UI:** “Claims from this media” section in `MediaInterpretationSheet` and in Article “From this media” block; reuse `ClaimTypeBadge`, confidence glyph, and support label. Helper copy: “Claims surfaced from this media; not independently verified.”
- **Intentionally not implemented:** No automatic claim extraction, no transcript parsing, no claim-to-evidence linking, no Verify-from-media flow yet. Fuller media claim verification can be a later GitHub issue.
- **Future path:** Automatic claim extraction; claim-to-evidence linking; verify-from-media; transcript segment anchoring; media-to-article claim graph.

## Verify-from-Media Groundwork v1

- **Purpose:** Allow media-derived claims to surface a lightweight verify/evidence state using the same calm, epistemically honest patterns as article claims, without implying full independent verification where it does not exist.
- **Model:** Reuse existing Claim/Source/Evidence and VerificationResponse shape. Media interpretation optionally includes **supportStatusByClaimId** (claimId → status). Status values: **support_available** (has fixture sources/evidence), **no_support_yet** (explicitly no evidence), **interpretation_only** (interpretive support only). Same copy as elsewhere: “Support available”, “No support attached yet”, “Interpretive support”.
- **How it differs from article verification:** Article verification is keyed by articleId and built from article blocks + evidence spans. Media verification is keyed by media URL/normalizedId; claims come from the media interpretation fixture; support status and optional sources/evidence are fixture-backed per media. We do not pretend media claims are externally fact-checked; we surface support state when we have it.
- **Fixture-backed examples:** YouTube (dQw4w9WgXcQ): mc-y1 interpretation_only, mc-y2 no_support_yet. YouTube (jNQXAC9IVRw): mc-y2-1 no_support_yet. Podcast episode 123: mc-p1 support_available with one fixture source and one evidence span.
- **API:**  
  - **Interpretation:** `GET /v1/media/interpretation?url=...` response now includes optional **supportStatusByClaimId** when the fixture defines it.  
  - **Verification bundle:** `GET /v1/media/verification?url=...` returns 200 with VerificationResponse shape (claims, sources, evidenceSpans, claimToSources, claimToEvidence, supportStatusByClaimId) for that media; 404 if not media or no interpretation.
- **UI integration:** Media interpretation sheet and Article “From this media” show per-claim support label when supportStatusByClaimId is present. “Verify from this media” button fetches the media verification bundle and opens the existing Verify sheet with that bundle (initialBundle), reusing the same claim/source/evidence detail view. No new tab; no new major screen.
- **What is intentionally not implemented:** No automatic source discovery, no web research pipeline, no full media fact-checking platform. Fuller media verification can be a later GitHub issue.
- **Future path:** Automatic source discovery; transcript segment anchoring; stronger evidence linking; media claim graph; organization/media/source cross-links.

## In scope (v1)

- Media URL classification (youtube, podcast, tiktok, reel).
- Normalized ID extraction where applicable.
- Fixture-backed registry and resolve endpoint.
- Share Intake: try media resolve and interpretation when input looks like a URL; then article (with optional “From this media” section), media interpretation sheet, or media-unmapped or search.
- Fixture-backed media interpretation: summary blocks, transcript blocks, and optional **claims** for a few sample media refs.
- **Claim extraction groundwork:** Optional `claims` on `MediaInterpretation`; reuse Claim shape; “Claims from this media” section in sheet and on article; epistemically honest framing.
- **Verify-from-Media groundwork:** Optional `supportStatusByClaimId` on interpretation; GET /v1/media/verification for full bundle; support labels (“Support available”, “No support attached yet”, “Interpretive support”); “Verify from this media” opens existing Verify sheet with media bundle.
- No new tab; no new major screen; media interpretation shown as sheet (when no article) or as section on article (when mapped).

## Out of scope (v1)

- **Real** transcript fetch or external APIs.
- **Automatic** claim extraction, AI pipelines, or provider integrations.
- Embedded video/audio player.
- External metadata or API calls for media.
- OCR, page capture, or scraping.
- New article contract or epistemic model changes.

## Future path

- **Real transcript ingestion:** Fetch or derive transcript for a media ID via provider APIs; attach to article or media-backed view.
- **Automatic claim extraction:** Pull claims from transcript (e.g. LLM or rules); link to evidence.
- **Claim-to-evidence linking:** Attach media claims to transcript segments or external sources.
- **Verify-from-media (extended):** Automatic source discovery; transcript segment anchoring; stronger evidence linking; media claim graph.
- **Segment / timeline navigation:** Jump to segments or chapters; optional scrubber (out of scope for v1).
- **Study mode from media:** Reuse Page-to-Study model for media (e.g. “key points from this episode”).
- **Media-to-article claim graph:** Relate media claims to article claims and sources.
- **Organization/media/source cross-links:** Link media and sources to organization or company profiles.

## API

- **Resolve:** `GET /v1/media/resolve?url=<encoded URL>`
  - **200:** `{ kind, originalUrl, normalizedId?, title?, articleId? }`  
  - **404:** Not a recognized media URL.
- **Interpretation:** `GET /v1/media/interpretation?url=<encoded URL>`
  - **200:** `{ ref: MediaReference, summaryBlocks?, transcriptBlocks?, claims?, supportStatusByClaimId? }`  
  - **404:** Not media or no fixture interpretation for this URL.
  - `claims` when present is an array of Claim-shaped objects (id, text, claimType, confidence, sourceCount, support).
  - **Verify-from-Media v1:** `supportStatusByClaimId` optional; map claimId → support_available | no_support_yet | interpretation_only.
- **Verification (Verify-from-Media v1):** `GET /v1/media/verification?url=<encoded URL>`
  - **200:** Same shape as article VerificationResponse (claims, sources, evidenceSpans, claimToSources, claimToEvidence, supportStatusByClaimId).
  - **404:** Not media or no interpretation for this URL.

## Mobile

- **sharedInput:** `isLikelyMediaUrl(text)` — true when text is a single http(s) URL (no newlines, reasonable length).
- **ShareIntakeScreen:** On run search, if `isLikelyMediaUrl(normalized)` then call `api.resolveMediaUrl(url)`. If media: call `api.getMediaInterpretation(url)`. If `articleId` → navigate to article with `mediaInterpretation` in params (article shows “From this media” section when present, including **claims** if any). If no `articleId` but interpretation → set state `media_interpretation`, show `MediaInterpretationSheet` (summary + transcript + **claims**). If no interpretation → set state `media_unmapped` as before. If resolve returns null → run search.
- **ArticleScreen:** When `route.params.mediaInterpretation` is present, show a “From this media” section with summary blocks, transcript blocks, and optional **“Claims from this media”** (claim type badge, confidence, **support status** when present; hint that claims are surfaced from media, not independently verified). **“Verify from this media”** fetches media verification bundle and opens Verify sheet with initialBundle.
- **MediaInterpretationSheet:** Shows **support status** per claim when interpretation includes supportStatusByClaimId. **“Verify from this media”** button calls parent callback to fetch bundle and open Verify sheet with that bundle.
- **VerifySheet:** Accepts optional **initialBundle** (VerificationResponse); when provided, uses it instead of fetching by articleId. Reused for both article and media verification.
- No new tab; no player UI; transcript/summary/claims presented as readable blocks.

## Tests

- **API:** `test_media_url.py` — classification and normalization.  
  `test_routes.py` — media resolve and **media interpretation**: YouTube/podcast with summary+transcript+**claims**, unmapped 404, non-media 404, payload shape; **claims** shape and valid confidence/support; interpretation without claims returns valid payload; **supportStatusByClaimId** when present; **media verification** endpoint: 200 with bundle, 404 for non-media, support_available includes sources.
- **Mobile:** `sharedInput.test.ts` — `isLikelyMediaUrl`.

## Dependency

- No new heavy dependencies. Classification is regex-based; registry is in-memory fixtures.

## README

- Optional one-line mention of “media URL” in Share Intake / Open in Rabbit Hole if it stays concise.
