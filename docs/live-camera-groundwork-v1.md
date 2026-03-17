# Live Camera Recognition Groundwork v1

## Purpose

Create the smallest clean “live lens” foundation so Rabbit Hole can support **pointing the camera at something** and flowing into the existing lookup/article system. Product framing: move from *capture image → tap object → article* to *live camera → freeze/sample frame → tap object → article*. This pass does **not** implement continuous real-time recognition.

## Why this is groundwork (not full live recognition)

- **No streaming inference, no real-time ML, no video pipeline.** v1 adds a single entry point (Live Lens) and a freeze-frame path: user opens Live Lens → taps “Capture” → one frame is taken → that frame is uploaded and handed off to the existing ImageFocus / segment / tap resolution flow. No continuous background processing.
- **Reuse only.** The captured frame is treated exactly like an image from “Upload image” or “Take photo”: same `api.uploadImage`, same `onImageReady(uploadId, imageUri)`, same ImageFocusScreen and explore/tap logic. No fork in the lookup pipeline.
- **Preview is optional in v1.** The current implementation uses the system camera (expo-image-picker) when the user taps “Capture”, so there is no in-app live preview yet. The groundwork is the entry point, handoff helper, and routing; an in-app camera preview (e.g. expo-camera) can be added in a later pass without changing this flow.

## Live preview → capture → existing image focus flow

```
Home → tap "Live Lens" → LiveLensScreen
  → "Point at something, then tap Capture"
  → User taps "Capture" → system camera opens (v1) or in-app preview captures frame (future)
  → One frame URI
  → api.uploadImage(uri) → uploadId
  → onImageReady(uploadId, imageUri) → stack sets state and navigates to ImageFocus
  → ImageFocusScreen (existing): segments, tap object, lookup → article
```

So: **Live Lens entry → capture one frame → same image pipeline as upload/photo.**

## Current limitations

- **No in-app preview.** v1 uses `expo-image-picker`’s `launchCameraAsync` for capture, so the “preview” is the system camera UI. Adding an in-app live preview (e.g. `expo-camera` with `CameraView` and `takePictureAsync`) is a documented next step.
- **Single frame only.** No periodic sampling, no passive recognition, no continuous analysis.
- **No new UI surface.** Live Lens is one screen (minimal: hint + Capture button) inside the existing Explore stack; no new tab or complex HUD.

## Implementation summary

| Item | Location |
|------|----------|
| Handoff helper | `apps/mobile/src/utils/liveLensHandoff.ts` — `requestCameraPermission`, `captureFrame`, `captureAndUploadFrame(uploadImage)` |
| Screen | `apps/mobile/src/screens/LiveLensScreen.tsx` — Capture button, “Capturing…”, error + “Try again” |
| Entry point | HomeScreen: “Live Lens” button → `onOpenLiveLens()` → navigate to LiveLens |
| Stack | App.tsx: `LiveLens` screen; same `onImageReady` → set uploadId/imageUri → navigate to ImageFocus |
| Reuse | Same `api.uploadImage`, ImageFocusScreen, exploreImage, exploreTap; no lookup logic changes |
| Tests | `apps/mobile/src/__tests__/liveLensHandoff.test.ts` — permission, capture cancel, capture+upload success, upload failure, handoff shape |

## Behavior and fallbacks

- **Permission denied:** “Camera access is required for Live Lens.” + “Try again”.
- **User cancels camera:** “No photo captured.” + “Try again”.
- **Upload fails:** Error message from API or “Upload failed.” + “Try again”.
- **Success:** Navigate to ImageFocus with the same behavior as after “Upload image” or “Take photo”.

## Manual validation checklist

1. From Home, tap **Live Lens** → Live Lens screen with hint and Capture button.
2. Tap **Capture** → system camera opens (or in-app preview when implemented).
3. Take a photo → “Capturing…” → then Image Focus with segments; tap object → lookup → article.
4. Deny camera permission → see fallback message and “Try again”.
5. Open Live Lens, tap Capture, then cancel camera → return to Live Lens with “No photo captured.” and “Try again”.

## Future path

- **In-app live preview:** Add `expo-camera` (or equivalent), show `CameraView`, capture with `takePictureAsync` so the user sees the preview inside the app before tapping Capture.
- **Periodic frame sampling:** Optionally capture frames on a timer for passive recognition (later project).
- **TV/show recognition:** Use frame pipeline for on-screen content (logo, show, network).
- **Logo/entity recognition:** Reuse segment/tap or add dedicated detector on captured frame.
- **Live subtitle / text extraction:** Combine with OCR/page-capture for text overlay.
- **Actor/show/network recognition:** Extend lookup or add media-specific resolution.
- **Real-time media overlays:** Show labels or results over the live feed (out of scope for v1).

## Dependencies and CI

- **No new dependencies** in v1. Uses existing `expo-image-picker` for camera capture.
- If `expo-camera` is added for in-app preview, document the choice and any native build impact here and in README.
- Full live recognition (streaming, continuous inference) should be tracked as a separate GitHub issue.

## Summary

| Item | Status |
|------|--------|
| Live Lens entry (Home) | Implemented |
| LiveLensScreen (Capture + fallbacks) | Implemented |
| Handoff to ImageFocus | Same onImageReady path as upload/photo |
| Tests | Permission, capture cancel, success, upload failure, handoff shape |
| Doc | This file |
| In-app preview / continuous recognition | Deferred; noted in “Future path” |
