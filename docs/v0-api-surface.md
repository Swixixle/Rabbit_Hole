# Rabbit Hole — v0 API Surface

Only the endpoints needed for the mobile v0 golden path. Tight subset; not the final universe.

---

## Endpoints

### 1. POST /v1/media/upload

| Field | Detail |
|-------|--------|
| **Purpose** | Upload image from mobile (camera or gallery). |
| **Request** | Multipart: file (image). Optional: metadata. |
| **Response** | `{ uploadId, imageUri?, jobId? }` — imageUri if sync; jobId if async. |
| **Sync vs async** | Prefer sync (return imageUri); async only if processing is heavy. |
| **Screen** | Home → Image Focus. |
| **Contracts** | Upload result (uploadId, imageUri, optional jobId). |
| **Errors** | 400 invalid format/size; 413 too large; 502 upload store failure. |

---

### 2. POST /v1/explore/image

| Field | Detail |
|-------|--------|
| **Purpose** | Submit image for segmentation / region detection; get tappable regions or accept tap later. |
| **Request** | `{ uploadId or imageUri or base64 }`. |
| **Response** | `{ jobId?, segments? }` — segments = list of { segmentId, bbox?, label?, confidence? } or jobId for async. |
| **Sync vs async** | Sync if fast; else jobId, poll with GET /v1/jobs/:jobId. |
| **Screen** | Image Focus (after image selected). |
| **Contracts** | ImageSegment/Candidate list or JobStatus. |
| **Errors** | 400 no image; 422 processing failed; 504 timeout if async. |

---

### 3. POST /v1/explore/image/tap

| Field | Detail |
|-------|--------|
| **Purpose** | User tapped a point or region; resolve to candidate(s) and optionally to node/article. |
| **Request** | `{ uploadId or imageUri, x, y }` or `{ segmentId }`. Optional: imageUri + segmentId. |
| **Response** | `{ candidates: [{ segmentId, label, confidence, nodeId? }], articleId? }` — if single high-confidence, articleId can be present. |
| **Sync vs async** | Sync preferred. |
| **Screen** | Image Focus (on tap). |
| **Contracts** | ImageSegment/Candidate list; optional Article ref. |
| **Errors** | 404 no candidate; 422 low confidence (still return candidates for disambiguation). |

---

### 4. GET /v1/articles/:articleId

| Field | Detail |
|-------|--------|
| **Purpose** | Fetch full article for reader. |
| **Request** | Path: articleId. |
| **Response** | Article contract: id, nodeId, title, nodeType, blocks, relatedNodeIds, questionIds, optional tracePreviewId. |
| **Sync** | Sync. |
| **Screen** | Article Reader. |
| **Contracts** | Article. |
| **Errors** | 404 not found; 500 server error. |

---

### 5. GET /v1/articles/by-node/:nodeId

| Field | Detail |
|-------|--------|
| **Purpose** | Get article for a node (e.g. from Trace or related node tap). |
| **Request** | Path: nodeId. |
| **Response** | Same as GET /v1/articles/:articleId (Article contract). |
| **Sync** | Sync. |
| **Screen** | Article Reader. |
| **Contracts** | Article. |
| **Errors** | 404 no article for node. |

---

### 6. GET /v1/claims/:claimId

| Field | Detail |
|-------|--------|
| **Purpose** | Claim detail for modal (text, type, confidence, source count, optional source ids). |
| **Request** | Path: claimId. |
| **Response** | Claim contract. |
| **Sync** | Sync. |
| **Screen** | Article (claim modal). |
| **Contracts** | Claim. |
| **Errors** | 404. |

---

### 7. GET /v1/sources/:sourceId

| Field | Detail |
|-------|--------|
| **Purpose** | Source detail for snapshot info (timestamp, hash, type, excerpt). |
| **Request** | Path: sourceId. |
| **Response** | Source contract (full fields for snapshot view). |
| **Sync** | Sync. |
| **Screen** | Sources sheet → SnapshotInfo. |
| **Contracts** | Source. |
| **Errors** | 404. |

---

### 8. GET /v1/verification/article/:articleId

| Field | Detail |
|-------|--------|
| **Purpose** | List sources for article (Verify surface). |
| **Request** | Path: articleId. |
| **Response** | `{ sources: Source[] }`. |
| **Sync** | Sync. |
| **Screen** | Sources & Verify sheet. |
| **Contracts** | Source list. |
| **Errors** | 404; 500. |

---

### 9. GET /v1/traces/:nodeId (or minimal trace preview endpoint)

| Field | Detail |
|-------|--------|
| **Purpose** | Minimal trace preview for node (path + labels). |
| **Request** | Path: nodeId. Query optional: limit. |
| **Response** | `{ traces: [{ path: NodeRef[], label }] }` or equivalent minimal Trace contract. |
| **Sync** | Sync. |
| **Screen** | Trace Preview. |
| **Contracts** | Trace preview (path + label). |
| **Errors** | 404; empty list if no trace. |

---

### 10. GET /v1/jobs/:jobId

| Field | Detail |
|-------|--------|
| **Purpose** | Poll async job (segment or article generation). |
| **Request** | Path: jobId. |
| **Response** | JobStatus: status, resultId (articleId/nodeId when completed). |
| **Sync** | Sync (polling). |
| **Screen** | Image Focus or Article (when async). |
| **Contracts** | JobStatus. |
| **Errors** | 404; 200 with status failed. |

---

### Optional: GET /v1/explorations/recent

| Field | Detail |
|-------|--------|
| **Purpose** | Recent explorations for Home list (thumbnail, title, time). |
| **Request** | Query: limit, offset. |
| **Response** | `{ items: [{ id, thumbnailUri?, title, nodeId?, articleId?, createdAt }] }`. |
| **Screen** | Home. |
| **Contracts** | Minimal exploration summary. |
| **Notes** | Can be stubbed or local-first for v0. |

---

### Optional: POST /v1/search (text stub)

| Field | Detail |
|-------|--------|
| **Purpose** | Text search fallback (e.g. "U-Haul box") → node or article. |
| **Request** | `{ q: string }`. |
| **Response** | `{ nodes?: Node[], articles?: Article[] }` or redirect to first result. |
| **Screen** | Home (search bar). |
| **Notes** | Stub or lightweight; not primary path. |

---

## Summary

- **Required for golden path**: upload, explore/image, explore/image/tap, articles (by id and by node), verification/article, traces (preview). Optional: claims/:id, sources/:id for detail modals; jobs/:id if async.
- **Keep tight**: No extra endpoints for v0. Add only when a screen requires them.
- **Contracts**: All responses use v0-contract-profile.md shapes; no raw DB or pipeline output.
