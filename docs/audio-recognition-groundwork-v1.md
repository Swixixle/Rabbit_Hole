# Audio Recognition Groundwork v1

**Status:** Implemented (fixture-backed; no real fingerprinting).  
**Scope:** Smallest clean foundation for “what is this audio?” so Rabbit Hole can support song / show theme / podcast / media-clip style inputs and route recognized results into existing article, media, and organization surfaces.

---

## Purpose

- Extend Rabbit Hole input from **text / image / media URL / page / live camera** to **short audio capture → recognition result → article / media / organization**.
- Provide a single, minimal entry point (“Identify audio”) and a deterministic, fixture-backed recognition path.
- **Do not** build real audio fingerprinting, third-party music recognition, or always-on listening in this pass.

---

## Why Groundwork (Not Full Shazam-like Recognition)

- **v1 is fixture-backed only:** Clip identifiers (e.g. `clipId` or stub URIs) map to known results. No acoustic fingerprinting, no external music-ID APIs.
- **Real microphone capture (v1):** User can record a short clip; the app sends a placeholder token to the API. Backend does not read the file, so recorded clips get no match until fingerprinting is added.
- **Outcome:** The product has a clear recognition model, handoff shape, routing, and a real recording path. Later passes can add upload/fingerprinting without changing the contract.

---

## Capture / Input Path Chosen

- **Entry:** Home/Explore → “Identify audio” → **Audio Identify** screen.
- **Real Microphone Capture v1:** Primary path: user taps **Record** → microphone permission requested → short recording → **Stop & identify** → recorded clip is sent to the API as a placeholder token (`recorded`). Backend does not read file contents (no fingerprinting); it returns **404** for this token, so the user sees “No Rabbit Hole match yet.” The same routing and result UI is used when a match exists (e.g. from sample clips).
- **Sample clips (v1):** Secondary “Try a sample” options (e.g. Sample song, Sample podcast) still send fixed `clipId` values for fixture-backed matches; useful for development and testing.
- **Stub URI form:** `stub://audio/<clipId>` and `file://` / `recorded` are supported; `recorded` and `file://` always return no match in v1.

---

## Recognition Model

- **Request:** `POST /v1/audio/recognize` with body `{ "clipId": string }` or `{ "uri": string }`. At least one of `clipId` or `uri` must be provided.
- **Response:** `AudioRecognitionResult` or **404** with detail `"No Rabbit Hole match yet."`

```ts
type AudioRecognitionKind = 'song' | 'show_theme' | 'podcast' | 'media_clip' | 'unknown';

interface AudioRecognitionResult {
  kind: AudioRecognitionKind;
  title: string;
  subtitle?: string;
  articleId?: string;
  mediaUrl?: string;
  organizationId?: string;
  confidence?: 'high' | 'medium' | 'low';
}
```

- **Fixture keys:** `sample-song`, `sample-podcast`, `sample-show-theme`, `sample-org-only`. Stub URI form `stub://audio/<clipId>` is also supported for testing.

---

## Routing Behavior

- **articleId** → Navigate to Article; add history entry with source `"audio"`.
- **mediaUrl** → Navigate to Share Intake with `sharedText: mediaUrl` so existing media resolution and interpretation flow runs.
- **organizationId** → Open Organization Profile sheet (existing pattern).
- **No match (404)** → Show “No Rabbit Hole match yet.” and “Try again”.

Multiple targets can be present in one result (e.g. podcast with both `mediaUrl` and `organizationId`). The UI shows an action per target.

---

## Fixture-Backed Examples

| clipId             | kind        | articleId       | mediaUrl | organizationId   |
|--------------------|------------|-----------------|----------|-------------------|
| `sample-song`      | song       | article-coffee | —        | —                 |
| `sample-podcast`   | podcast    | —               | yes      | org-podcast-demo  |
| `sample-show-theme`| show_theme | article-uhaul   | —        | —                 |
| `sample-org-only`  | media_clip | —               | —        | org-uhaul         |

---

## Current Limitations

- **No real fingerprinting:** Recognition is by clip identifier only. Recorded clips send a placeholder token and always get no match in v1.
- **No upload of recorded file:** The backend does not receive the recorded audio; a future pass could add upload + server-side fingerprinting.
- **No third-party services:** No Shazam, ACR, or similar integration.
- **No always-on listening:** Single, user-initiated “Identify audio” flow only.
- **Recording format:** Determined by expo-av (typically high-quality preset); no user-configurable duration or format in v1.

---

## Permission and recording flow (microphone)

- **Permission:** Requested when the user taps **Record** (not on app launch). If denied, the app shows “Microphone access needed” and **Try again** to re-prompt.
- **Recording:** After permission, audio mode is set and recording starts. Screen shows “Recording…” and **Stop & identify**. User taps **Stop & identify** when done. The app stops the recording, gets a local file URI, and sends the token `recorded` to `POST /v1/audio/recognize`. Backend returns 404 for `recorded`, so the user sees “No Rabbit Hole match yet.”
- **Errors:** “Recording could not start” or “Recording failed” with **Try again** if start or stop fails.

---

## Future Path

- **Real audio fingerprinting:** Generate a fingerprint from the recorded clip (or upload), match against a catalog or external API, and return the same `AudioRecognitionResult` / routing.
- **TV / show theme recognition:** Extend fixtures and later fingerprint DB for theme songs and dialogue.
- **Podcast / speaker recognition:** Map clips to podcast episodes and optional organization profiles.
- **Background/ambient recognition:** Optional “what’s playing?” from device audio (with clear UX and privacy).
- **Stronger media/entity linking:** Cross-link recognized audio to articles, media interpretations, and org profiles.

---

## Implementation Notes

- **Contracts:** `packages/contracts` — `AudioRecognitionKind`, `AudioRecognitionResult`.
- **API:** `POST /v1/audio/recognize`, `recognize_audio_clip()` in fixtures; `recorded` and `file://` URIs return 404. `AudioRecognitionResult` / `AudioRecognizeRequestBody` in models.
- **Mobile:** “Identify audio” on Home → **Audio Identify** screen. **Real Microphone Capture v1:** Record → permission → record → Stop & identify → send `recorded` token → no-match UI. Sample clips under “Try a sample.” `utils/audioRecording.ts`: permission, `setAudioModeForRecording`, `startRecording`, `RECORDED_CLIP_TOKEN`, `normalizedRecordedClipToken`.
- **Tests:** API: result shape, fixture mapping, stub URI, 404 for unknown/empty, 404 for `recorded` and `file://`. Mobile: result shape, routing fields, RECORDED_CLIP_TOKEN and normalizedRecordedClipToken (expo-av mocked).

## Manual validation (microphone capture)

- [ ] Device/simulator: **Identify audio** → **Record** → allow permission → record a few seconds → **Stop & identify** → expect “No Rabbit Hole match yet.” and **Try again**.
- [ ] Deny permission → expect “Microphone access needed” and **Try again**; tap again to re-prompt.
- [ ] **Try a sample** still returns fixture matches (e.g. Sample song → article).
- [ ] After no-match, **Try again** returns to main screen (Record + samples).
