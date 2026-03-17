# Rabbit Hole — Mobile v0 Blueprint

Practical product/engineering blueprint for the first shipped slice. Authoritative for v0 implementation.

---

## Goal

v0 proves that the **golden path** works: a user can capture or upload an image, tap a region, receive a dynamic evidence-linked article, inspect claims and sources, preview one trace branch, and see suggested questions. Success = that loop is reliable and comprehensible. No broader product surface is in scope.

---

## Golden Path

1. User uploads or takes a photo.
2. App segments or interprets tappable regions (or accepts tap coordinates).
3. User taps a target.
4. System resolves one or more candidates (with optional disambiguation).
5. User gets a dynamic article (micro-paragraphs, claim-typed).
6. User inspects claim/source support (Verify surface).
7. User previews one trace branch (Trace preview).
8. User sees suggested questions (and can drill into related nodes).

Everything else is subordinate to this path.

---

## Included in v0

- Mobile app (React Native + Expo) as the only user-facing surface.
- Image upload and camera capture.
- Tap-on-image region selection; segment detection or tap-only flow.
- Article reader with micro-paragraphs, claim type badges, node type chip.
- Simple Sources & Verify: list of sources, type icon, title, publisher, hash badge when snapshot-preserved; tap to snapshot info (timestamp, hash, type, excerpt).
- Minimal Trace preview: vertical list of trace rows (e.g. Product → Organization → Law); tap node opens Article.
- Suggested questions and related nodes on Article.
- Screens: Capture & Explore Home, Image Focus (Tap-to-Explore), Article Reader, Sources & Verify (sheet), Trace Preview.
- Lightweight history/recent explorations if low-cost.
- Stub or lightweight text search as fallback.
- Normalized contracts: Node, Claim, Source, EvidenceSpan, Article, Question, minimal Trace preview, image segment/candidate contract, job status if async.

---

## Excluded from v0

- Web console, researcher console, admin UI as user-facing delivery.
- Audio, video, podcast, song, TV/film, meme recognition pipelines.
- Full deep trace engine; only minimal trace preview.
- Advanced graph visualization, collaborative trails, social features.
- Elaborate admin tooling.
- Heavy auth beyond what the app shell requires.
- Any modality that does not terminate in the same internal representation as image→tap→article.

---

## v0 Screens

### 1. Capture & Explore Home

| Item | Detail |
|------|--------|
| **Purpose** | Entry point: capture/upload image, see recent explorations, optional text search. |
| **Inputs** | User action (take photo, upload image, type query). |
| **Outputs** | Navigation to Image Focus (with image) or to Article (if text/search returns node). |
| **Required UI states** | Initial, loading (upload/processing), error (upload failed, invalid file), empty (no recent explorations). |
| **Primary components** | Add button (Take photo / Upload image), recent list (thumbnail, title, time), search bar. |
| **Navigation** | In: app entry. Out: Image Focus (with image), or Article (search path). |
| **Failure states** | Upload failed, unsupported format, network error; show message + retry. |
| **Before building** | Media upload endpoint; recent explorations list API or local cache. |

### 2. Image Focus (Tap-to-Explore)

| Item | Detail |
|------|--------|
| **Purpose** | Show image with tappable regions; on tap, show candidate(s) and "Explore this". |
| **Inputs** | Image (from capture/upload); tap coordinates or precomputed segments. |
| **Outputs** | Selected node/candidate → navigate to Article. |
| **Required UI states** | Initial (image shown, segments/hotspots if available), loading (segmenting or resolving tap), error (no regions, resolution failed), disambiguation (multiple candidates → sheet or picker). |
| **Primary components** | ImageCanvas, TapOverlay/hotspots, CandidatePickerSheet (provisional name, confidence, "Explore this"), optional "Other things" pills. |
| **Navigation** | In: from Home with image. Out: Article (with nodeId/articleId). Back: to Home. |
| **Failure states** | No objects detected, low confidence, no candidate; show message and retry or "Try different area". |
| **Before building** | Image segment or tap-resolution endpoint; candidate contract; segment/candidate selection contract. |

### 3. Article Reader (Read Mode)

| Item | Detail |
|------|--------|
| **Purpose** | Present dynamic article: micro-paragraphs, claim-typed blocks, links to Verify and Trace. |
| **Inputs** | articleId or nodeId; article payload (title, blocks, claims, node type, related nodes, questions). |
| **Outputs** | User reads; can open Sources/Verify sheet, Trace preview, claim modal, or related node Article. |
| **Required UI states** | Loading, content, error (article not found, load failed), empty (article empty). |
| **Primary components** | Title row (name, label, node type chip), MicroParagraphCard(s), ClaimTypeBadge, FocusZoneReader (optional), buttons for Sources, Trace. |
| **Navigation** | In: from Image Focus (after "Explore this") or from History/Trace/Questions. Out: Sources sheet, Trace preview, claim modal, another Article. Back: to Image Focus or prior screen. |
| **Failure states** | Load failed, empty article; show error/empty state and retry. |
| **Before building** | Article API; Claim, Node contracts; micro-block structure. |

### 4. Sources & Verify Sheet

| Item | Detail |
|------|--------|
| **Purpose** | List sources for the article; show snapshot/verification info on tap. |
| **Inputs** | articleId or list of sources from Article context. |
| **Outputs** | List of sources; on tap, snapshot info (timestamp, hash, type, excerpt). |
| **Required UI states** | List loaded, empty (no sources), loading, error. |
| **Primary components** | SourceCard, SourceTypeBadge, hash badge; SnapshotInfo view (sheet or modal). |
| **Navigation** | In: from Article ("Sources (N)"). Out: close to Article; tap source → snapshot detail. |
| **Failure states** | Failed to load sources; show error and retry. |
| **Before building** | Verification/sources API; Source contract with hash/timestamp when applicable. |

### 5. Trace Preview

| Item | Detail |
|------|--------|
| **Purpose** | Show one or more trace rows (e.g. Product → Org → Law); tap node → Article. |
| **Inputs** | nodeId or articleId; trace preview payload (list of trace rows). |
| **Outputs** | List of trace rows; navigation to Article for chosen node. |
| **Required UI states** | Loaded, empty (no trace), loading, error. |
| **Primary components** | TracePreviewRow (nodes + chevron + one-line explanation). |
| **Navigation** | In: from Article ("Trace through systems"). Out: tap node → Article. Back: to Article. |
| **Failure states** | No trace available, load failed; show empty/error state. |
| **Before building** | Trace preview endpoint; minimal Trace contract (path of nodes + label). |

---

## v0 User States

- **First-time user**: No history; Home shows empty recent list, prominent Add + search.
- **Low-confidence result**: Image Focus or Article shows confidence indicator; allow retry or "Explore anyway".
- **No object match**: Image Focus shows "No objects detected" (or similar); suggest retry or different area.
- **Source-light result**: Article has few sources; Verify shows list; no fake sources.
- **Loading job**: If async (e.g. article generation), show job status and poll or wait; do not block UI indefinitely without feedback.
- **Verification available**: Sources sheet and claim modals show real data; hash badge when snapshot preserved.
- **Trace available / unavailable**: Trace preview shows rows when present; shows empty state when none, no fake trace.

---

## v0 Success Criteria

- User can complete the golden path on a real device (or simulator) with a real image and tap.
- Article displays with at least one micro-block and claim types visible.
- At least one source is inspectable (with type and, when applicable, hash/timestamp).
- At least one trace row is shown when backend provides it, or a clear empty state when not.
- Suggested questions or related nodes appear; tapping a node opens its Article.
- No dead-end screens: Article always offers Sources, Trace, and questions/related nodes.
- Failure modes (no object, no article, network error) show clear messages and retry where appropriate.

---

## v0 Non-Goals

- Full trace engine (deep multi-hop exploration).
- Podcast/audio/video/song/TV/film ingestion.
- Web or desktop UI.
- Researcher console or admin dashboard.
- Collaborative or social features.
- Perfect segmentation or zero low-confidence cases (we expose uncertainty).
- Faking verification or trace when data is missing.

---

## Post–v0: Exploration Transition (Experience Layer)

**Designed now, built after the golden path works.** See `docs/architecture/experience-layer.md`.

The **Exploration Transition** is the 2–3 s moment between capture and discovery: capture feedback (sound + haptic), rabbit-hole animation (photo freezes → circle opens → rabbit drops in → tunnel → result), and subtle sound (click → whoosh → landing). It makes the product feel like “you opened the rabbit hole,” not “you ran a search.” Implementation lives in `apps/mobile/src/experience/exploration-transition/` and must not block the architecture pipeline. Build order: (1) golden path works end-to-end, then (2) add Exploration Transition.

---

## Architectural Guardrails (v0)

1. **Do not overbuild v0**: No extra modalities, no web console, no elaborate admin.
2. **Do not underbuild core abstractions**: Claims typed, sources typed, interpretation labeled; Verify is real; Trace preview exists.
3. **v0 can be narrow, but not fake**: Small surface is fine; fake architecture is not.
4. **Verify is real even if minimal**: Real claim/source structure, not decorative trust theater.
5. **Trace can be shallow, but must exist**: Minimal preview is acceptable; total absence weakens product identity.
