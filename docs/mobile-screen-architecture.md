# Rabbit Hole — Mobile Screen Architecture (v0)

Defines the mobile information architecture and screen model for v0. Prevents messy navigation and state logic.

---

## Navigation Model

### Recommended app structure (v0)

- **Home**: Capture + recent explorations + search. Primary entry.
- **Explore**: In v0 this can overlap with Home (recent/pinned nodes). **Choice**: Treat Explore as the same as "recent explorations" on Home; one tab for "Home" (capture + recent) is enough. Explore tab can show the same recent list or be merged into Home for v0.
- **History**: List of past nodes/explorations, grouped by day.
- **Settings**: Account, model settings, privacy.

**Explicit v0 choice**: Home and Explore are effectively one: Home tab shows "Add" + recent explorations. Explore tab can duplicate recent list or be a second entry to the same list. No separate "Explore" flow until post-v0.

### Entry route

- App opens to **Home** (tab index 0).
- Deep link to Article (e.g. by nodeId/articleId) can open Article directly if needed later; not required for v0.

### Back stack expectations

- **Home** → Image Focus (push). Back from Image Focus → Home.
- **Image Focus** → Article (push). Back from Article → Image Focus.
- **Article** → Sources sheet (modal/sheet, not push). Dismiss → Article.
- **Article** → Trace preview (modal or push). Back → Article.
- **Article** → Claim modal (modal). Dismiss → Article.
- **Article** → another Article (push, e.g. related node). Back → previous Article.
- **History** → Article (push). Back → History.

### Modal vs full-screen

- **Sources & Verify**: Slide-up sheet (modal) from Article. Not a full-screen route.
- **Trace Preview**: Can be sheet or full-screen; recommend sheet or secondary screen with Back to Article.
- **Claim detail**: Modal (bottom sheet or center modal). Dismiss returns to Article.
- **Candidate picker** (multiple candidates on tap): Bottom sheet or inline card set. Choosing one closes sheet and navigates to Article.

### Where Verify appears

- From Article: "Sources (N)" button opens **Sources & Verify** sheet. Verify = this sheet + source list + tap source → snapshot info.

### Where Trace appears

- From Article: "Trace through systems" button opens **Trace Preview** (sheet or screen). Trace rows; tap node → Article.

### Candidate disambiguation

- When tap yields multiple plausible candidates: **Bottom sheet** with list of options (name + confidence). User picks one → "Explore this" → Article. Not inline card set for v0 (simpler to use one sheet).

---

## Screen Contracts

### Home (Capture & Explore)

| Field | Value |
|-------|--------|
| **Route name** | `Home` |
| **Params** | None (optional: refresh token). |
| **Data needed** | Recent explorations (id, thumbnail, title, time). |
| **Data source** | API or local cache: `GET /v1/explorations/recent` or equivalent. |
| **Loading state** | Show skeleton or spinner for recent list. |
| **Empty state** | "No explorations yet. Take or upload a photo to start." |
| **Low-confidence state** | N/A (per-item confidence on Article/Image Focus). |
| **Retry path** | Retry fetch for recent list. |
| **Transition rules** | On "Take photo" / "Upload image" → Image Focus with image. On search submit → optional: search endpoint then Article or Image. |

### Image Focus (Tap-to-Explore)

| Field | Value |
|-------|--------|
| **Route name** | `ImageFocus` |
| **Params** | `imageUri` or `uploadId`; optional `jobId` if async. |
| **Data needed** | Image bitmap/URI; segments (if precomputed) or tap-only; on tap → candidates. |
| **Data source** | Local image; `POST /v1/explore/image` or segment endpoint; `POST /v1/explore/image/tap` with coords. |
| **Loading state** | "Finding objects…" or segmenting indicator; after tap "Identifying…". |
| **Empty state** | "No objects detected. Try a different photo or area." |
| **Low-confidence state** | Show confidence chip; "Explore anyway" or "Try another area". |
| **Retry path** | Retry segment/tap; or allow new tap. |
| **Transition rules** | Tap + single candidate → Article. Tap + multiple candidates → sheet → pick → Article. Back → Home. |

### Article Reader

| Field | Value |
|-------|--------|
| **Route name** | `Article` |
| **Params** | `articleId` or `nodeId`. |
| **Data needed** | Article (title, node type, micro-blocks, claims, related nodes, questions), optional trace preview. |
| **Data source** | `GET /v1/articles/:articleId` or `GET /v1/articles/by-node/:nodeId`. |
| **Loading state** | Article skeleton or spinner. |
| **Empty state** | "This article couldn’t be loaded." or "No content yet." |
| **Low-confidence state** | Show claim types; no fake "verified" when interpretation. |
| **Retry path** | Retry load article. |
| **Transition rules** | "Sources" → Sources sheet. "Trace" → Trace preview. Tap claim → claim modal. Tap related node/question → Article or search. Back → Image Focus or previous screen. |

### Sources & Verify (Sheet)

| Field | Value |
|-------|--------|
| **Route name** | `SourcesSheet` (modal) |
| **Params** | `articleId` or sources passed from Article. |
| **Data needed** | List of sources (id, type, title, publisher, hasSnapshot, hash?). |
| **Data source** | `GET /v1/verification/article/:articleId` or from Article payload. |
| **Loading state** | Spinner in sheet. |
| **Empty state** | "No sources for this article." |
| **Retry path** | Retry load. |
| **Transition rules** | Tap source → SnapshotInfo (modal or inline). Dismiss → Article. |

### Trace Preview

| Field | Value |
|-------|--------|
| **Route name** | `TracePreview` (sheet or screen) |
| **Params** | `nodeId` or `articleId`. |
| **Data needed** | List of trace rows (each row: path of nodes + short label). |
| **Data source** | `GET /v1/traces/:nodeId` or minimal trace preview endpoint. |
| **Loading state** | Spinner. |
| **Empty state** | "No trace data for this node yet." |
| **Retry path** | Retry load. |
| **Transition rules** | Tap node in row → Article. Back → Article. |

---

## Component Ownership

| Component | Owner (feature/screen) | Shared? |
|-----------|------------------------|--------|
| Add button, recent list, search bar | Home | Home |
| ImageCanvas, TapOverlay, hotspots | Image Focus | Image Focus (reusable in feature) |
| CandidatePickerSheet | Image Focus | Image Focus |
| MicroParagraphCard, ClaimTypeBadge, title row | Article | Article; badges shared |
| FocusZoneReader | Article | Shared (reading) |
| SourceCard, SourceTypeBadge, hash badge | Verify / Sources | Shared (Verify) |
| EvidenceDrawer / SnapshotInfo | Verify | Verify |
| TracePreviewRow | Trace | Trace |
| QuestionCard, NodeChip | Article / shared | Shared |
| LoadingStateBlock, ErrorStateBlock, EmptyStateBlock | All | Shared UI |

Screens consume **normalized contracts** (Article, Node, Claim, Source, Trace); they do not depend on raw ingestion output.

---

## View Model Boundaries

- **Screen receives**: Normalized DTOs from API (Article, Node, Claim, Source, Trace rows). No raw pipeline output.
- **Screen computes locally**: Layout, which block is in "focus" (FocusZone), expand/collapse of detail, modal open/close. No business logic that changes claim type or source integrity.
- **Data source**: API layer returns contracts only. If backend sends different shape, adapter in client maps to contract before passing to screen.

---

## UI-State Rules

1. Screens never depend directly on raw ingestion output; they consume normalized contracts (see v0-contract-profile.md).
2. Loading, empty, error states are required for every screen that fetches data.
3. Low-confidence and "no result" are first-class states; we do not fake confidence or hide uncertainty.
4. Modal/sheet dismissal always returns to the same screen (Article) without clearing Article state.
5. Back from a pushed screen (e.g. Article → Article) restores previous Article; stack is preserved.
