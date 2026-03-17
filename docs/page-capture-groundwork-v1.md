# OCR / Page Capture Groundwork v1

## Purpose

Allow Rabbit Hole to accept a **captured page image** (e.g. textbook page, printed document, label) and convert it into **text** that feeds the existing Share Intake / search / article pipeline. Product framing: move from **camera object recognition** to **camera page recognition** — image → text → explanation.

## Why this is groundwork (not full OCR)

- **Real text extraction, minimal scope.** v1 uses server-side OCR (Tesseract via `pytesseract`) for non-stub URIs. Stub path remains for test/demo URIs (containing `page`, `scan`, `stub`, `test`, or `file://`) so tests and “Simulate share: coffee” flow work without the API. For real captures, the mobile app calls **POST /v1/page/extract-text** with the image; the API returns `{ text, confidence }`. No cloud OCR, no heavy ML, no full document analysis.
- **Same flow as Share Intake.** Extracted text is passed into the app exactly like pasted or shared text: `onOpenShareIntakeWithText(extractedText)` → Share Intake with `sharedText` → normalize → search → article or result list.
- **Smallest clean architecture.** One utility (`pageCapture.ts`), one API endpoint, one entry point (“Scan page”), loading and error states; no new tab, no document reader UI.

## Capture → extract → search pipeline

```
User taps "Scan page" on Home
  → Camera permission (if needed) → launch camera
  → User captures page image → asset URI
  → "Reading page…" loading state
  → extractTextFromImage(uri) → { text, confidence? }
  → If text non-empty: onOpenShareIntakeWithText(text) → Share Intake with sharedText → search → article/list
  → If text empty: show "Couldn't read text from this image. Try again or paste text manually." + "Try again"
  → (Optional) low confidence: still send to search; future: show hint or fallback message
```

Extracted text is treated **exactly like pasted text** in Share Intake: same normalization, search, and resolution.

## Current limitations

- **Stub for test URIs only.** Real OCR runs for URIs that do *not* contain `page`, `scan`, `stub`, `test`, or `file://`. Stub returns fixture text for those URIs so tests and demos work without the API or Tesseract.
- **Single image.** No multi-page documents, no document preview, no cropping/editing of the capture.
- **Text-only.** Tesseract extracts plain text; no diagram or layout parsing. Diagrams and tables are out of scope for v1.
- **OCR optional.** If Tesseract or `pytesseract` is not installed, the API returns empty text and low confidence; the endpoint does not crash. Mobile shows the same calm fallback (“Couldn't read text…”, “Try again”).
- **Confidence heuristic.** Confidence is derived from extracted text length (e.g. >200 chars → high, >50 → medium, else low). It is not a true OCR confidence score.

## Implementation summary

| Item | Location |
|------|----------|
| OCR utility | `apps/mobile/src/utils/pageCapture.ts` — `extractTextFromImage(uri)` (stub path + API call for real URIs) |
| API OCR | `apps/api/app/ocr.py` — `extract_text_from_image_bytes`; `apps/api/app/routes.py` — **POST /v1/page/extract-text** |
| Mobile API client | `apps/mobile/src/api/client.ts` — `extractPageText(imageUri)` |
| Entry point | HomeScreen: "Scan page" button (when `onOpenShareIntakeWithText` is provided) |
| Loading / error | "Reading page…" block; EmptyStateBlock for failed/empty OCR with "Try again" |
| Routing | Extracted text → `onOpenShareIntakeWithText(text)` → Share Intake with `sharedText` |
| Analytics | `page_capture_completed` (backend allowlist in `ANALYTICS_EVENT_NAMES`) |
| Tests | Mobile: `apps/mobile/src/__tests__/pageCapture.test.ts` — stub, API path, fallback, routing. API: `tests/test_routes.py` — `test_page_extract_text_no_file_returns_empty`, `test_page_extract_text_accepts_image_returns_shape` |

## OCR integration path

- **Chosen path: server-side OCR.** The API accepts a single image via **POST /v1/page/extract-text** (multipart `file`). Uses PIL + `pytesseract` when available; converts image to RGB/L and returns cleaned text plus a confidence level. Mobile uploads the captured image URI as a file and receives `{ text, confidence }`. No new native mobile dependencies; Expo Go compatible.
- **Fallback behavior:** If no file is sent, content-type is not image, or OCR fails/import fails, the API returns `{ text: "", confidence: "low" }`. Mobile treats empty text as failure and shows “Couldn't read text from this image. Try again or paste text manually.” with “Try again”. No new UI surface; same flow as before.

## Dependencies and setup

- **API:** `Pillow`, `pytesseract` in `apps/api/requirements.txt`. **Tesseract** binary must be installed on the host (e.g. `brew install tesseract` on macOS). If Tesseract or `pytesseract` is missing, OCR returns empty text and low confidence; no crash.
- **Mobile:** No new dependencies. Uses existing `fetch` + FormData to POST to `/v1/page/extract-text`.
- **CI:** Stub URIs avoid hitting the API in tests. API tests use minimal JPEG bytes or no file; they do not require Tesseract to be installed.

## Future path

- **Real device-side OCR (optional):** If desired, a lightweight mobile OCR (e.g. Expo text recognition) could be added later; keep the same return shape `{ text, confidence? }` and feed Share Intake the same way.
- **Multi-page documents:** Capture or pick multiple images; concatenate or sequence text; optional document-level UI later.
- **Textbook recognition:** Structure extraction (headings, sections) and optional study-mode integration.
- **Diagram parsing:** Out of scope for this groundwork; could be a later project.
- **Claim extraction from scanned text:** Reuse claim model and evidence flow when scanned content becomes first-class input (e.g. “claims from this scan”).
- **Study-mode integration:** Page-to-Study groundwork could consume scanned page text for summaries or key points.
- **Reading-assist:** Extraction output shape is kept compatible with future text-stream features (e.g. reading guidance, sentence focus); no reading-assist UI in this pass.

## Summary

| Item | Status |
|------|--------|
| OCR | No longer stubbed for real URIs; server-side Tesseract via POST /v1/page/extract-text |
| Stub path | Retained for URIs containing page/scan/stub/test/file:// (tests and demos) |
| `extractTextFromImage` | Implemented in `pageCapture.ts` (stub + API) |
| Scan page entry (Home) | Button + camera → extract → Share Intake or error |
| Routing to search | Via existing Share Intake with `sharedText` |
| Tests | Stub, API path, fallback, routing (mobile); no-file and image shape (API) |
| Doc | This file |
| Heavy OCR / cloud / new UI | Deferred; noted in “Future path” |
