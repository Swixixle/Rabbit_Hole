# Rabbit Hole — First-Pass Implementation Report

Report for the **smallest real working slice** pass. No broad feature coding; no web/admin; no extra modalities.

---

## 1. Files created

### Repo skeleton and root
- `rabbit-hole/package.json` — root workspace (packages/*, apps/mobile)
- `rabbit-hole/.gitignore`

### packages/contracts
- `packages/contracts/package.json`
- `packages/contracts/tsconfig.json`
- `packages/contracts/src/enums.ts` — NodeType, ClaimType, SourceType, JobStatusEnum, ConfidenceLevel
- `packages/contracts/src/types.ts` — Node, Claim, Source, EvidenceSpan, Article, ArticleBlock, Question, TracePreview, TraceNodeRef, ImageSegment, Candidate, JobStatus, and API request/response types
- `packages/contracts/src/index.ts`

### apps/api
- `apps/api/requirements.txt`
- `apps/api/main.py` — FastAPI app, CORS, health
- `apps/api/app/__init__.py`
- `apps/api/app/models.py` — Pydantic models mirroring contracts
- `apps/api/app/fixtures.py` — 2 nodes, 2 articles, claims, sources, evidence spans, questions, trace previews
- `apps/api/app/routes.py` — v0 endpoints (upload, explore/image, explore/image/tap, articles, claims, sources, verification, traces, article questions)
- `apps/api/README.md`
- `apps/api/pyproject.toml`
- `apps/api/tests/test_routes.py` — contract validity and response shape tests

### apps/mobile
- `apps/mobile/package.json` — Expo, React Navigation, @rabbit-hole/contracts
- `apps/mobile/tsconfig.json`
- `apps/mobile/app.json`
- `apps/mobile/babel.config.js`
- `apps/mobile/App.tsx` — NavigationContainer, bottom tabs (Explore, History, Settings), stack (Home → ImageFocus → Article → TracePreview)
- `apps/mobile/src/api/client.ts` — fetch-based API client using contract types
- `apps/mobile/src/components/LoadingStateBlock.tsx`
- `apps/mobile/src/components/ErrorStateBlock.tsx`
- `apps/mobile/src/components/EmptyStateBlock.tsx`
- `apps/mobile/src/components/ClaimTypeBadge.tsx`
- `apps/mobile/src/components/SourceTypeBadge.tsx`
- `apps/mobile/src/components/SourceCard.tsx`
- `apps/mobile/src/components/EvidenceDrawer.tsx`
- `apps/mobile/src/components/MicroParagraphCard.tsx`
- `apps/mobile/src/components/FocusZoneReader.tsx`
- `apps/mobile/src/components/QuestionCard.tsx`
- `apps/mobile/src/components/TracePreviewRow.tsx`
- `apps/mobile/src/components/NodeChip.tsx`
- `apps/mobile/src/components/CandidatePickerSheet.tsx`
- `apps/mobile/src/components/ImageCanvas.tsx`
- `apps/mobile/src/components/index.ts`
- `apps/mobile/src/screens/HomeScreen.tsx`
- `apps/mobile/src/screens/ImageFocusScreen.tsx`
- `apps/mobile/src/screens/ArticleScreen.tsx`
- `apps/mobile/src/screens/VerifySheet.tsx`
- `apps/mobile/src/screens/TracePreviewScreen.tsx`
- `apps/mobile/src/screens/index.ts`
- **Experience layer (hook points only):** `apps/mobile/src/experience/exploration-transition/README.md`, `ExplorationTransitionSlot.tsx`, `index.ts`

### docs/architecture (copied)
- All existing architecture docs copied into `rabbit-hole/docs/architecture/`

---

## 2. Files updated

- Root `package.json`: workspaces limited to `packages/*` and `apps/mobile` (API is Python, not a workspace).
- **First real slice (experience hook pass):** `App.tsx` — import and use `ExplorationTransitionSlot` around ImageFocus screen; `HomeScreen.tsx` — comment at capture-success boundary pointing to experience-layer.md.
- No other existing codebase files were modified for the first slice.

---

## 3. Exact repo structure created

```
rabbit-hole/
├── package.json
├── .gitignore
├── docs/
│   └── architecture/     # mobile-v0-blueprint, v0-api-surface, etc.
├── packages/
│   └── contracts/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── enums.ts
│           └── types.ts
├── apps/
│   ├── api/
│   │   ├── requirements.txt
│   │   ├── main.py
│   │   ├── README.md
│   │   ├── pyproject.toml
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── models.py
│   │   │   ├── fixtures.py
│   │   │   └── routes.py
│   │   └── tests/
│   │       └── test_routes.py
│   └── mobile/
│       ├── package.json
│       ├── tsconfig.json
│       ├── app.json
│       ├── babel.config.js
│       ├── App.tsx
│       └── src/
│           ├── api/
│           │   └── client.ts
│           ├── experience/
│           │   └── exploration-transition/
│           │       ├── README.md
│           │       ├── ExplorationTransitionSlot.tsx
│           │       └── index.ts
│           ├── components/   # 14 components
│           └── screens/      # 5 screens
```

---

## 4. Contracts implemented

- **Node** — id, name, nodeType, optional slug, displayLabel
- **Claim** — id, text, claimType, confidence?, sourceCount
- **Source** — id, type, title, publisher?, contentHash?, retrievedAt?
- **EvidenceSpan** — id, claimId, sourceId, excerpt?
- **Article** — id, nodeId, title, nodeType, blocks[], relatedNodeIds?, questionIds?
- **ArticleBlock** — text, claimIds?, blockType?
- **Question** — id, text, category?
- **TracePreview** — path (TraceNodeRef[]), traceType?, label
- **TraceNodeRef** — nodeId, name
- **ImageSegment** — segmentId, label, confidence, nodeId?
- **Candidate** — alias of ImageSegment
- **JobStatus** — jobId, status, resultId?
- **Enums**: NodeType, ClaimType, SourceType, JobStatusEnum, ConfidenceLevel

---

## 5. Endpoints implemented

| Method | Path | Purpose |
|--------|------|--------|
| POST | /v1/media/upload | Stub: return uploadId + imageUri |
| POST | /v1/explore/image | Stub: return fixed segments (coffee cup, U-Haul box, low-conf) |
| POST | /v1/explore/image/tap | Stub: return candidates; articleId for seg-1/seg-2 |
| GET | /v1/articles/:articleId | Fixture article by id |
| GET | /v1/articles/by-node/:nodeId | Fixture article by node |
| GET | /v1/claims/:claimId | Fixture claim |
| GET | /v1/sources/:sourceId | Fixture source |
| GET | /v1/verification/article/:articleId | Sources for article (from evidence spans) |
| GET | /v1/traces/:nodeId | Trace preview list (fixture for node-coffee-cup, node-uhaul-box) |
| GET | /v1/articles/:articleId/questions | Suggested questions for article |

---

## 6. Screens implemented

- **Home** — Upload image / Take photo (image picker); on success → ImageFocus with uploadId and imageUri
- **ImageFocus** — ImageCanvas with tap; loads segments from API; on tap calls explore/tap; CandidatePickerSheet when multiple candidates; on select → Article
- **Article** — Loads article, claims, questions; MicroParagraphCard blocks; ClaimTypeBadge; Verify sheet (Sources); Trace navigation; related NodeChip; suggested questions; claim modal on badge tap
- **VerifySheet** — Modal/sheet listing sources; SourceCard; tap source → EvidenceDrawer (snapshot info)
- **TracePreview** — List of TracePreviewRow; tap node → Article by node

---

## 7. What is stubbed

- **Upload**: No real storage; returns uploadId and stub imageUri.
- **Segmentation**: Fixed list of segments (coffee cup, U-Haul box, “Possible object” low confidence).
- **Tap resolution**: Deterministic: seg-1 → article-coffee, seg-2 → article-uhaul; candidates always same set.
- **Articles / claims / sources / traces**: All from in-memory fixtures (fixtures.py).
- **History tab**: Placeholder “History (stub)”.
- **Settings tab**: Placeholder “Settings (stub)”.
- **Image capture**: Uses image picker only (no camera-specific path).
- **Questions**: Returned from fixture list by article’s questionIds.

---

## 8. What is real

- **Contract types**: Shared TypeScript contracts and Pydantic models; API responses conform.
- **Claim types**: Canonical enum; every claim has claimType and sourceCount.
- **Source types**: Canonical enum; hash and timestamp when present in fixture.
- **Article structure**: Micro-blocks with claimIds; relatedNodeIds; questionIds.
- **Verify surface**: Real source list; real claim/source structure; hash badge when contentHash present.
- **Trace preview**: Real path (node refs) + label; empty list when no trace.
- **Loading / error / empty states**: On Home, ImageFocus, Article, Verify, Trace.
- **Low confidence**: Shown in candidates (e.g. “Possible object” low); no fake high confidence.
- **Navigation**: Stack and tabs; back from Article → ImageFocus → Home; Verify as sheet; Trace as stack screen.

---

## 9. What remains before the first end-to-end demo works

1. **Run API**: From `apps/api`, create venv, install deps, run `uvicorn main:app --reload --port 8000`.
2. **Run mobile**: From repo root, `npm install`, `npm run mobile:start`; point device/simulator at API (e.g. `EXPO_PUBLIC_API_URL=http://<host>:8000` for device).
3. **Upload flow**: Mobile upload currently uses `api.uploadImage(uri)` with FormData; backend accepts file. If using Expo Go, ensure API URL is reachable (same network or tunnel).
4. **Optional**: Add `GET /v1/jobs/:jobId` only if async flow is introduced later.

---

## 10. Shortcuts taken (minimal but architecture-safe)

- **No database**: In-memory fixtures only; no migrations or ORM.
- **No auth**: No auth layer; no user identity.
- **API not in npm workspaces**: API is Python; only `packages/contracts` and `apps/mobile` are workspaces.
- **Related node names**: Article screen uses nodeId as display name for NodeChip when opening related node; could be replaced by node lookup later.
- **FocusZoneReader**: Implemented as simple ScrollView; no active-index emphasis yet.
- **Segment overlay**: ImageCanvas does not draw bboxes; segments are used for “other things” pills only; tap sends coords to backend.
- **Single article per node**: Fixtures have one article per node; by-node endpoint returns it.
- **Tests**: API tests only (contract shapes + one response per main endpoint); no mobile e2e; contracts validated via `tsc --noEmit`.

All shortcuts keep normalized contracts, typed claims/sources, verify surface, and trace preview intact. No decorative trust or fake confidence.

---

## 11. Degraded states handled

- **Weak segmentation**: ImageFocus shows segments from API; if empty, tap still works (explore/tap with coords).
- **Multiple candidates**: CandidatePickerSheet with labels and confidence; user picks one.
- **No plausible candidate**: EmptyStateBlock “No article for this selection” / “Tap failed”; retry.
- **Thin article**: Article screen renders whatever blocks exist; no fake blocks.
- **Sparse sources**: Verify sheet shows list; empty state “No sources for this article yet.”
- **Missing trace**: TracePreviewScreen shows “No trace data for this node yet.” with Go back.
- **Loading**: LoadingStateBlock on Home (upload), ImageFocus (segments), Article, Verify, Trace.
- **Network/API error**: ErrorStateBlock with message and “Try again” where appropriate.
- **Invalid image**: Upload fails; error message and retry (per v0-failure-and-fallbacks.md).

No decorative trust; uncertainty is surfaced (e.g. low-confidence candidate in picker).

---

## 12. Experience layer hook points (no implementation in this pass)

- **Transition trigger boundary**: In `HomeScreen.tsx`, immediately after successful upload and before `onImageReady(res.uploadId, uri)`. Comment: “EXPERIENCE LAYER HOOK: Transition trigger boundary. After capture success, the Exploration Transition will run here (see docs/architecture/experience-layer.md).”
- **Mount point for RabbitHoleTransition**: `ExplorationTransitionSlot` in `apps/mobile/src/experience/exploration-transition/ExplorationTransitionSlot.tsx`. Wraps the ImageFocus screen in `App.tsx` with props `capturedImageUri={imageUri}` and `triggerTransition={true}`. Slot currently renders children immediately; when the experience layer is implemented, it will run the rabbit-hole animation then show children.
- **Doc pointer**: `apps/mobile/src/experience/exploration-transition/README.md` points to `docs/architecture/experience-layer.md` and states that Lottie/sound/haptic are not added in the first slice.

No Lottie, Reanimated, sound assets, haptic logic, or tunnel visuals were added.
