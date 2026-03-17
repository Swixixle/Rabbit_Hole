# TV / Show Recognition Groundwork v1

## Purpose

Extend Rabbit Hole’s **audio recognition** so that recognized clips can resolve to **TV/show-style context** (show title, network/platform, notable cast) and continue to route into the existing article, media, and organization surfaces. Product framing: move from “audio clip → generic recognition result” to “audio clip / media-adjacent recognition → TV/show entity with structured context” when fixtures indicate a show.

## Why this is groundwork

- **No real show databases, no AV analysis.** v1 is fixture-backed only. New optional fields on `AudioRecognitionResult` and a new kind `tv_show` allow show-oriented results; no third-party TV/entertainment APIs or live video analysis.
- **Extends existing audio pipeline.** Same entry (Identify audio), same `POST /v1/audio/recognize`, same routing (articleId → Article, mediaUrl → Share Intake, organizationId → Organization profile). No new tab or dedicated entertainment surface.
- **Reading-assist compatible.** When a show has associated transcript/subtitle context (e.g. from media interpretation), that text remains on the existing subtitle/text stream path so future reading-assist can attach without redesign.

## Model used

TV/show context is represented as an **extension of** `AudioRecognitionResult` (contracts + API), not a separate type:

- **`AudioRecognitionKind`** extended with `tv_show` (in addition to `song`, `show_theme`, `podcast`, `media_clip`, `unknown`).
- **Optional fields on `AudioRecognitionResult`:**
  - `networkOrPlatform?: string` — e.g. "NBC", "Netflix", "Demo Network".
  - `notableCast?: string[]` — fixture-backed list of cast names.

Existing fields (`title`, `subtitle`, `articleId`, `mediaUrl`, `organizationId`, `confidence`) are unchanged. When a result has `kind: "show_theme"` or `kind: "tv_show"`, it may also include `networkOrPlatform` and/or `notableCast` for compact display.

## Fixture-backed examples

| clipId               | kind       | title                          | networkOrPlatform | notableCast              | articleId       | organizationId   |
|----------------------|------------|--------------------------------|-------------------|--------------------------|-----------------|-------------------|
| `sample-show-theme`  | show_theme | Sample show theme (fixture)   | Demo Network      | Fixture Actor A          | article-uhaul   | —                 |
| `sample-tv-show`     | tv_show    | Moving Day (fixture)          | Demo Network      | Host One, Host Two       | article-uhaul   | org-uhaul         |
| `sample-song`        | song       | …                             | —                 | —                        | article-coffee  | —                 |
| `sample-podcast`     | podcast    | …                             | —                 | —                        | —               | org-podcast-demo  |
| `sample-org-only`    | media_clip | …                             | —                 | —                        | —               | org-uhaul         |

- **Theme song / show-audio:** `sample-show-theme` — theme-style result with network and cast.
- **Full show:** `sample-tv-show` — `tv_show` kind with network, cast, article, and organization.
- **Network/platform:** Both show fixtures include `networkOrPlatform`; org linking via `organizationId` where relevant.

## Routing behavior

Unchanged from audio recognition groundwork:

- **articleId** → Navigate to Article; history source `"audio"`.
- **mediaUrl** → Navigate to Share Intake with `sharedText: mediaUrl` (media resolution / interpretation).
- **organizationId** → Open Organization Profile sheet.

Multiple targets in one result (e.g. `sample-tv-show` with both `articleId` and `organizationId`) are supported; the UI shows an action per target. When no match exists, 404 and “No Rabbit Hole match yet.” with “Try again” are preserved.

## Relationship to audio recognition and media interpretation

- **Audio recognition:** TV/show groundwork is a backward-compatible extension. Same endpoint, same request shape; response may now include `networkOrPlatform`, `notableCast`, and `kind: "tv_show"`. Existing fixtures and unknown/recorded behavior unchanged.
- **Media interpretation:** When a recognized show has a `mediaUrl`, routing goes through Share Intake → media resolve → MediaInterpretationSheet. Transcript/subtitle from that media uses the existing live-subtitle path (paste captions, Search from transcript). No new media-specific show surface.

## Relationship to subtitle/text groundwork

- Subtitle and transcript text for any media (including show-related) flows through the existing **live subtitle groundwork** (Share Intake, `SubtitleInput`). TV/show recognition does not introduce a separate transcript path.
- Future reading-assist (eye-tracking, rotary sentence enlargement, adaptive subtitle focus) will consume the same text streams; show recognition does not block that.

## UI behavior

- **Audio Identify result:** When the API returns `networkOrPlatform` and/or `notableCast`, they are shown as compact lines below the subtitle (e.g. “Network: Demo Network”, “Cast: Host One, Host Two”). Same actions: Open article, View media, Organization profile.
- **Sample clips:** “Sample TV show” added to “Try a sample” for testing. No new tab or dedicated “View show context” screen; show context is inline on the existing result block.

## Limitations

- **Fixture-backed only.** No real fingerprinting or TV database; no episode or actor recognition.
- **No live video analysis.** No “point at TV” video frame recognition in this pass.
- **No dedicated show profile screen.** Show context is the existing result block + optional network/cast lines; organization and article provide deeper context when linked.

## Future path

- **Real show recognition:** Fingerprint or external API mapping to shows/episodes; same `AudioRecognitionResult` shape.
- **Episode recognition:** Optional episode title/season in fixtures or extended model.
- **Actor recognition:** Optional cast/character mapping; could extend `notableCast` or add structured cast.
- **Network/platform detection:** Richer platform metadata; link to organization when platform is an org.
- **Live subtitle + show context:** When device captions or transcript are available for a show, combine show identity with subtitle stream for “what’s playing + what’s being said.”
- **TV-to-organization linking:** Already supported via `organizationId`; future expansion for networks, studios, distributors.

## Implementation summary

| Item | Location |
|------|----------|
| Contract | `packages/contracts` — `AudioRecognitionKind` + `tv_show`, `AudioRecognitionResult.networkOrPlatform`, `notableCast` |
| API model | `apps/api/app/models.py` — `AudioRecognitionResult` extended; `AUDIO_RECOGNITION_KINDS` + `tv_show` |
| Fixtures | `apps/api/app/fixtures.py` — `AUDIO_RECOGNITION_FIXTURES`: `sample-show-theme` (show context), `sample-tv-show` (full show); `recognize_audio_clip` mapping for `sample-tv-show` |
| Mobile UI | `apps/mobile/src/screens/AudioIdentifyScreen.tsx` — show `networkOrPlatform` and `notableCast` when present; “Sample TV show” in sample list |
| Tests | API: `test_audio_recognize_tv_show_result_shape`, `test_audio_recognize_show_theme_has_show_context`. Mobile: `audioRecognition.test.ts` — `tv_show` kind, optional show fields, routing for show result |

## Summary

| Item | Status |
|------|--------|
| Model | Extension of `AudioRecognitionResult` (kind `tv_show`, optional `networkOrPlatform`, `notableCast`) |
| Fixtures | sample-show-theme (theme + show context), sample-tv-show (full show + article + org) |
| Routing | Same as audio: articleId, mediaUrl, organizationId |
| UI | Inline network/cast on existing result; no new surface |
| Doc | This file |
| Real recognition / episode / actor / live video | Deferred; noted in “Future path” |
