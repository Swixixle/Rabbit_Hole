# Rabbit Hole — End-to-End Stabilization Report

Report for the **stabilization pass**: make the first slice runnable, coherent, and demo-safe.

---

## 1. Issues found

- **API upload**: Validation rejected requests when `file` was missing or when `content_type` was not set (e.g. some mobile FormData). Blocked stub/demo when multipart was not sent correctly.
- **API explore/image/tap**: Body was required as `dict`; FastAPI did not parse optional JSON body, so empty or missing body could cause errors.
- **ArticleScreen useEffect**: Ran when `articleId` was undefined (e.g. initial mount or bad nav), causing unnecessary API calls.
- **VerifySheet**: Error state used `EmptyStateBlock` with no retry; users could not recover from "Failed to load sources."
- **Candidate picker**: No explicit low-confidence language; confidence was shown but not called out as "low confidence" for trust.
- **Article screen**: Verify and Trace entry points were single-line links; no short explanation of what they do.
- **Setup**: No root README or .env.example; unclear how to run API + mobile and point device at API.
- **Tests**: No test for upload-without-file (stub), tap with empty body, verification source shape, or trace unknown node returning empty list.

---

## 2. Issues fixed

- **API upload**: Only validate `content_type` when `file` is present; allow POST with no file and return `uploadId` + `imageUri` for stub/demo.
- **API explore/image/tap**: Added `ExploreTapRequestBody` (Pydantic) with optional fields; endpoint uses `Body(None)` so empty or missing JSON is accepted; use `body.model_dump() if body else {}`.
- **ArticleScreen**: Guard `useEffect` with `if (!articleId) return` so we do not fetch when params are missing.
- **VerifySheet**: Replaced error display with `ErrorStateBlock` and `onRetry` that re-fetches verification.
- **CandidatePickerSheet**: Added subtitle "Choose one to explore. Low confidence options are marked." and styled low-confidence label (red) so it is explicit.
- **ArticleScreen**: Added short sublabels under "Sources & Verify" and "Trace through systems" for clarity.
- **Root**: Added `README.md` (quick start for API and mobile, golden path steps, structure, tests, env) and `.env.example` (EXPO_PUBLIC_API_URL with examples for simulator/emulator/device).
- **API tests**: Added `test_upload_without_file_accepted_for_stub`, `test_explore_tap_empty_body`, `test_verification_source_shape`, `test_traces_unknown_node_empty`.
- **API routes**: Removed unused `JSONResponse` import.

---

## 3. Files created

- `rabbit-hole/README.md` — Quick start, API + mobile run, golden path, structure, tests, env.
- `rabbit-hole/.env.example` — EXPO_PUBLIC_API_URL with comments for simulator/emulator/device.
- `rabbit-hole/docs/architecture/STABILIZATION-REPORT.md` — This report.

---

## 4. Files updated

- `apps/api/app/routes.py` — Upload file optional; explore/image/tap body optional via `ExploreTapRequestBody | None = Body(None)`; remove JSONResponse import.
- `apps/api/app/models.py` — Add `ExploreTapRequestBody` (uploadId, imageUri, segmentId, x, y optional).
- `apps/mobile/src/screens/ArticleScreen.tsx` — Guard useEffect on articleId; add link sublabels for Verify and Trace.
- `apps/mobile/src/screens/VerifySheet.tsx` — Use ErrorStateBlock with retry for error state; add ErrorStateBlock import.
- `apps/mobile/src/components/CandidatePickerSheet.tsx` — Subtitle for low-confidence, style confidenceLow (red) when confidence is "low".
- `apps/api/requirements.txt` — Add httpx for TestClient.
- `apps/api/tests/test_routes.py` — Add 4 tests (upload no file, tap empty body, verification source shape, traces unknown node empty).

---

## 5. Contract mismatches resolved

- **ExploreTapRequest**: API now uses Pydantic `ExploreTapRequestBody` with same field names as contracts (uploadId, segmentId, x, y); optional body so mobile and tests can send minimal payload.
- **Confidence**: API returns enum string ("high" | "medium" | "low"); mobile and contracts already support string or number; no change needed.
- **Source**: API Source model and fixtures already include optional `excerpt`; VerificationResponse and mobile consume `sources` array; no drift.

No other contract mismatches were found; fixtures and API response shapes align with `packages/contracts` and mobile usage.

---

## 6. Screen wiring completed

- **Home**: Upload/capture → onImageReady(uploadId, uri) → navigate to ImageFocus; loading and error with retry. No gaps.
- **ImageFocus**: Load segments on mount; on tap call exploreTap; single candidate → Article; multiple → CandidatePickerSheet; on select → Article or error. Loading/error/empty and retry in place.
- **Article**: Params from route; load article, claims, questions; Verify sheet and Trace navigation; related nodes and questions; claim modal. Guard when !articleId; retry on error.
- **VerifySheet**: Visible + articleId from Article; load sources on open; list + tap source → EvidenceDrawer; loading/error with retry, empty state.
- **TracePreview**: nodeId from route; load traces; list rows; tap node → Article by node; empty and error with onBack.

Route params (articleId, nodeId) are passed and read correctly; modals/sheets dismiss without breaking state.

---

## 7. Degraded states confirmed

- **Weak segmentation**: ImageFocus shows whatever segments API returns; tap still works (explore/tap with uploadId).
- **Multiple candidates**: CandidatePickerSheet with labels and confidence; low-confidence option styled; user picks one.
- **No candidate / no article**: Error message and retry; no fake article.
- **Thin article**: Renders existing blocks only.
- **Sparse sources**: Verify shows list or "No sources for this article yet."
- **Missing trace**: "No trace data for this node yet." with Go back.
- **Loading**: All screens show LoadingStateBlock where appropriate.
- **Network/API error**: ErrorStateBlock with retry on Article and Verify; EmptyStateBlock with retry on Home and ImageFocus.
- **Invalid image**: Upload validation only when file is present; stub accepts no file.

Uncertainty is surfaced (low-confidence in picker); no decorative trust or fake certainty.

---

## 8. Setup / run instructions confirmed or updated

- **API**: `cd apps/api && .venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000`. Health: `GET /health` → `{"status":"ok"}`.
- **Mobile**: From repo root `npm install` then `npm run mobile:start`; use `i`/`a` for simulator. Default API is localhost:8000; override via `EXPO_PUBLIC_API_URL` (see `.env.example`).
- **Tests**: API `cd apps/api && python -m pytest tests/ -v` (11 tests). Contracts: `npm run contracts:build` (typecheck).

README and .env.example document these and the golden path.

---

## 9. Remaining blockers before demo

- **Network**: Physical device or Android emulator must reach API (set EXPO_PUBLIC_API_URL to host IP or 10.0.2.2:8000). No code blocker.
- **First run**: `npm install` at root can be slow; run once. No blocker.
- **Image picker**: Uses Expo ImagePicker; permissions on device. No code blocker.

No remaining code or contract blockers for running the golden path end-to-end on simulator or device with API running.

---

## 10. Weakest remaining stub

The **weakest stub** is still **tap-to-region resolution**: the API returns a fixed set of segments and candidates regardless of image content or tap coordinates. Replacing this with real region detection or coordinate-based lookup would be the most valuable next step, after confirming the full flow on-device. Second is **article generation** (currently fixture-only); third is **verify evidence spans** (structure exists, UI could show claim–source links more explicitly).

---

## Summary

Stabilization pass is complete: API accepts optional file and optional tap body, Article and Verify have guards and retry, candidate picker and article links have clearer copy, setup is documented, and tests cover stub and contract shapes. The first slice is runnable and demo-safe; the next move is to run it end-to-end on device and then replace the weakest stub (tap/segment resolution) with a minimal real implementation.
