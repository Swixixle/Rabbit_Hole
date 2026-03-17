# Rabbit Hole — Mobile v0 Task Map

Translates architecture into implementation buckets. Bridge between architecture and sprint planning.

---

## contracts

| Item | Detail |
|------|--------|
| **Objective** | Shared contract types (Node, Claim, Source, EvidenceSpan, Article, Question, Trace preview, ImageSegment/Candidate, JobStatus) used by API and mobile. |
| **Files/modules** | `packages/contracts/` or `shared/contracts/`: type definitions (TypeScript), optionally JSON Schema or OpenAPI fragments. Export for backend and mobile. |
| **Dependencies** | None (contracts first). |
| **Sequencing** | Before API and mobile features. Define minimal v0 fields per v0-contract-profile.md. |
| **Risk** | Scope creep: keep v0 minimal; defer optional fields. |

---

## backend api

| Item | Detail |
|------|--------|
| **Objective** | v0 API surface only (see v0-api-surface.md): upload, explore/image, explore/image/tap, articles, claims, sources, verification, traces, jobs. |
| **Files/modules** | `apps/api/` or `backend/`: FastAPI routes, request/response models, service layer. |
| **Dependencies** | contracts; storage for media; optional worker for async. |
| **Sequencing** | After contracts. Implement endpoints in order of golden path: upload → tap/segment → article → verification → trace. |
| **Risk** | Overbuilding endpoints or schemas; stick to v0-api-surface.md. |

---

## worker/jobs

| Item | Detail |
|------|--------|
| **Objective** | If article generation or segmentation is async: job creation, status polling, result attachment. Minimal: status + resultId. |
| **Files/modules** | `workers/` or `backend/workers/`: Celery tasks or in-process queue; job store (DB or Redis). |
| **Dependencies** | contracts (JobStatus); API to enqueue and poll. |
| **Sequencing** | After API; can stub sync first (no job) then add async. |
| **Risk** | Making everything async too early; v0 can be sync where possible. |

---

## mobile routes

| Item | Detail |
|------|--------|
| **Objective** | Navigation structure: Home, ImageFocus, Article, SourcesSheet, TracePreview; tab bar (Home, History, Settings); modal/sheet behavior. |
| **Files/modules** | `apps/mobile/` navigation (e.g. React Navigation): stack, tabs, modal/sheet. Route names and params per mobile-screen-architecture.md. |
| **Dependencies** | None (can use placeholder screens). |
| **Sequencing** | Early; defines shell. Then fill screens. |
| **Risk** | Overlapping Home/Explore; keep one entry behavior. |

---

## mobile features

| Item | Detail |
|------|--------|
| **Objective** | Per-screen logic: Home (capture, upload, recent, search), Image Focus (tap, candidates, explore), Article (blocks, claims, related, questions), Sources sheet, Trace preview. |
| **Files/modules** | `apps/mobile/screens/` or `features/`: one module per screen/flow; use contracts for data. |
| **Dependencies** | contracts; API client; routes. |
| **Sequencing** | After routes and API client. Order: Home + Image Focus → Article → Sources → Trace. |
| **Risk** | Feature logic depending on raw API shape; always map to contracts. |

---

## reusable components

| Item | Detail |
|------|--------|
| **Objective** | Shared UI: ClaimTypeBadge, SourceCard, MicroParagraphCard, TracePreviewRow, Loading/Error/Empty blocks, etc. See mobile-v0-component-inventory.md. |
| **Files/modules** | `apps/mobile/components/` or `packages/ui/`: presentational components; props from contracts. |
| **Dependencies** | contracts (types for props). |
| **Sequencing** | In parallel with features; extract as features need them. |
| **Risk** | Component sprawl; only add what v0 screens need. |

---

## storage/assets

| Item | Detail |
|------|--------|
| **Objective** | Image upload storage (S3-compatible); optional local cache for recent list thumbnails. |
| **Files/modules** | Backend: upload handler, presigned URL or direct upload; mobile: image picker, camera. |
| **Dependencies** | API upload endpoint. |
| **Sequencing** | With backend API (upload) and Home/Image Focus. |
| **Risk** | Large file handling; validate format/size in v0. |

---

## verification support

| Item | Detail |
|------|--------|
| **Objective** | Sources list + snapshot info (timestamp, hash, type, excerpt); real claim/source structure. |
| **Files/modules** | API: verification endpoint; mobile: Sources sheet, SourceCard, SnapshotInfo. |
| **Dependencies** | Claim, Source contracts; article payload or verification API. |
| **Sequencing** | After Article; before or with Trace. |
| **Risk** | Fake or decorative verify; must show real data and hash when present. |

---

## trace preview support

| Item | Detail |
|------|--------|
| **Objective** | Minimal trace: list of trace rows (path + label); tap node → Article. |
| **Files/modules** | API: trace preview endpoint; mobile: TracePreview screen/sheet, TracePreviewRow. |
| **Dependencies** | Trace contract; Node; Article. |
| **Sequencing** | After Article. |
| **Risk** | Skipping trace entirely; at least one row or clear empty state. |

---

## test coverage

| Item | Detail |
|------|--------|
| **Objective** | Contract tests (serialization); API integration tests for v0 endpoints; mobile: critical path (upload → tap → article load). |
| **Files/modules** | `packages/contracts/__tests__`; `apps/api/tests/`; `apps/mobile/__tests__` or e2e. |
| **Dependencies** | contracts; API; mobile app. |
| **Sequencing** | After each layer; e2e after golden path works. |
| **Risk** | Testing implementation details; focus on contracts and user-visible outcomes. |

---

## deferred items

| Item | Detail |
|------|--------|
| **Objective** | Explicitly not in v0: web console, researcher console, admin UI, podcast/audio/video/song/TV/film, full trace engine, advanced graph viz, collaborative trails, social, elaborate auth. |
| **Files/modules** | If placeholders exist (e.g. `apps/admin/`), mark deferred in README or repo-blueprint. |
| **Dependencies** | N/A. |
| **Sequencing** | After v0 golden path is compelling. |
| **Risk** | Cursor or contributors building these; guardrails in rules and docs. |
