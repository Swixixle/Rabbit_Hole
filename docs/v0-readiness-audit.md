# Rabbit Hole — v0 Readiness Audit

Concise audit after the architecture-first scaffolding pass. Use this to decide what to build first and what still needs a human decision.

---

## 1. Is the repo architecturally ready for v0 implementation?

**Mostly yes**, with caveats:

- **Docs and rules are in place**: v0 scope is locked in the Cursor rule and in `mobile-v0-blueprint.md`. Screen architecture, contracts, API surface, task map, component inventory, and failure modes are defined. Repo blueprint states mobile-first and defers web/admin.
- **No repo yet**: Under `Documents` we only have `docs/architecture/` and `.cursor/rules/`. There is no `apps/mobile`, `apps/api`, or `packages/contracts` yet. So "readiness" is **documentation readiness**; the next step is to create the repo structure and then implement.
- **Contracts are specified but not implemented**: v0-contract-profile.md defines the minimal fields. No TypeScript or Python types exist until someone creates `packages/contracts` (or equivalent) and adds Node, Claim, Source, Article, etc.
- **API is specified but not implemented**: v0-api-surface.md lists endpoints; no FastAPI routes or handlers exist until the backend is scaffolded.

**Verdict**: Ready to **start** v0 implementation (create repo layout, contracts, then API, then mobile). Not ready to **ship** until those are built and the golden path is tested.

---

## 2. What still blocks actual coding?

| Blocker | Resolution |
|---------|------------|
| No monorepo/apps structure | Create `apps/mobile`, `apps/api`, `packages/contracts` (and optional `workers/`) per repo-blueprint.md. |
| No contract types | Implement shared types from v0-contract-profile.md in `packages/contracts` (TypeScript for mobile + API, or shared JSON Schema). |
| No API implementation | Add FastAPI app; implement v0 endpoints in order: upload → explore/image (and tap) → articles → verification → traces → jobs (if async). |
| No mobile app shell | Create React Native + Expo app; add navigation (tabs + stack) per mobile-screen-architecture.md. |
| Backend logic for article/segment | Human decision: sync vs async; which models/services for segmentation and article generation (stub vs real). |

---

## 3. Which contracts must be created first?

Create these **first** (in `packages/contracts` or equivalent), in this order:

1. **Node** — id, name, nodeType, optional slug/displayLabel.
2. **Claim** — id, text, claimType, optional confidence, sourceCount.
3. **Source** — id, type, title, optional publisher, contentHash, retrievedAt.
4. **Article** — id, nodeId, title, nodeType, blocks[], optional relatedNodeIds, questionIds.
5. **Question** — id, text, optional category.
6. **Trace preview** — path (node refs), label.
7. **Image segment / Candidate** — segmentId/regionRef, label, confidence, optional nodeId.
8. **JobStatus** — jobId, status, optional resultId.
9. **EvidenceSpan** — id, claimId, sourceId, optional excerpt (can be minimal).

All must align with v0-contract-profile.md and the canonical claim type enum and node types.

---

## 4. Which docs are now authoritative?

| Doc | Purpose |
|-----|---------|
| `.cursor/rules/rabbit-hole.mdc` | Architecture laws + v0 scope + anti-drift; always apply. |
| `docs/architecture/mobile-v0-blueprint.md` | v0 goal, golden path, included/excluded, screens, user states, success criteria, non-goals. |
| `docs/architecture/mobile-screen-architecture.md` | Navigation, screen contracts, component ownership, view model boundaries. |
| `docs/architecture/v0-contract-profile.md` | Minimum contract surface; required vs deferred fields. |
| `docs/architecture/v0-api-surface.md` | v0 endpoints only; request/response, screens, errors. |
| `docs/architecture/mobile-v0-task-map.md` | Implementation buckets (contracts, API, mobile, etc.) and sequencing. |
| `docs/architecture/mobile-v0-component-inventory.md` | Reusable components and which screens use them. |
| `docs/architecture/v0-failure-and-fallbacks.md` | Failure modes and acceptable fallbacks; no bluffing. |
| `docs/architecture/repo-blueprint.md` | Repo layout; mobile primary; admin/web deferred. |

When in doubt, prefer these over ad hoc decisions.

---

## 5. Which areas still require human decisions?

| Area | Decision needed |
|------|-----------------|
| **Repo location** | Create Rabbit Hole repo under `Documents` or elsewhere; move/copy `docs/architecture/` and `.cursor/rules/` into it. |
| **Sync vs async** | Are segmentation and article generation sync or async in v0? If async, job polling and timeouts must be implemented. |
| **Segmentation/tap resolution** | Stub (e.g. whole image = one node) vs real model (vision API or local). Affects explore/image and explore/image/tap. |
| **Article generation** | Stub (template per node type) vs real (LLM or pipeline). Affects articles and blocks structure. |
| **Auth** | No auth, device id only, or minimal login for "history" or future features. |
| **History storage** | Server-side (explorations/recent API) vs local-only for v0. |
| **Trace data** | Stub (one static path per node type) vs real trace engine. v0 allows minimal preview (path + label). |

---

## 6. Summary

- **Files created**: mobile-v0-blueprint.md, mobile-screen-architecture.md, v0-contract-profile.md, mobile-v0-task-map.md, repo-blueprint.md, v0-api-surface.md, mobile-v0-component-inventory.md, v0-failure-and-fallbacks.md, v0-readiness-audit.md.
- **Files updated**: `.cursor/rules/rabbit-hole.mdc` (v0 Product Slice, Mobile-Only MVP Scope table, Anti-drift, authoritative docs reference).
- **v0 scope clarified**: In rule (table + anti-drift) and in mobile-v0-blueprint.md (included/excluded, non-goals).
- **Anti-drift guardrails**: In rule (explicit deferral of web, researcher console, admin; no split effort before golden path).
- **Feature creep constrained**: v0-api-surface.md is minimal; v0-contract-profile.md marks optional/deferred fields; task map has "deferred items" bucket.
- **Mandatory contracts for first pass**: Node, Claim, Source, Article, Question, Trace preview, ImageSegment/Candidate, JobStatus (if async), EvidenceSpan (minimal).
- **Human decisions**: Repo location; sync vs async; segmentation and article implementation (stub vs real); auth and history strategy; trace data source.

Implement in order: **repo structure → contracts → API (minimal v0 surface) → mobile routes → mobile features (golden path)**. Do not add web console, researcher console, or extra modalities until the loop is compelling.
