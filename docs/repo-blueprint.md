# Rabbit Hole — Repo Blueprint

Repository structure aligned with **mobile-first v0**. The mobile app is the primary product surface; API and workers support the mobile flow; contracts are the shared load-bearing layer. Admin and web are deferred.

---

## Principles

1. **Mobile app is the primary product** for v0. All other apps are secondary or deferred.
2. **API and workers** exist to serve the mobile golden path (capture → tap → article → verify → trace).
3. **Contracts package** is load-bearing: shared between API and mobile; no duplicate type definitions for v0 entities.
4. **Admin app** (if present) is deferred/internal — not part of v0 product slice.
5. **Web researcher console** is not in scope for v0; no equal priority with mobile.
6. **No premature multi-frontend effort** until the core image→article→verify→trace loop is compelling.

---

## Suggested layout (v0)

```
rabbit-hole/
├── apps/
│   ├── mobile/          # React Native + Expo — PRIMARY for v0
│   └── api/             # FastAPI — serves mobile
│   # admin/             # Optional placeholder — DEFERRED, not v0
├── packages/
│   └── contracts/       # Shared types (Node, Claim, Source, Article, etc.)
├── workers/             # Optional: Celery/tasks for async jobs
├── docs/
│   └── architecture/    # Authoritative v0 and screen docs
└── .cursor/
    └── rules/           # rabbit-hole.mdc (architecture + v0 scope)
```

- **apps/mobile**: Single mobile app. No separate "web" or "admin" app in v0 delivery.
- **apps/api**: REST API for mobile only. Endpoints defined in v0-api-surface.md.
- **apps/admin**: If present, label in README: "Deferred / internal. Not part of v0 user-facing delivery."
- **packages/contracts**: Single source of truth for Node, Claim, Source, EvidenceSpan, Article, Question, Trace preview, ImageSegment/Candidate, JobStatus. Consumed by API and mobile.
- **workers**: Optional; only if async (e.g. article generation) is required for v0.
- **docs/architecture**: Holds mobile-v0-blueprint.md, mobile-screen-architecture.md, v0-contract-profile.md, mobile-v0-task-map.md, repo-blueprint.md, v0-api-surface.md, mobile-v0-component-inventory.md, v0-failure-and-fallbacks.md.

---

## Priority order (v0)

1. **Contracts** — define first; used by API and mobile.
2. **API** — minimal v0 surface only.
3. **Mobile** — routes, then features, then polish.
4. **Workers** — only if async is necessary.
5. **Admin / web** — explicitly deferred; do not split effort.

---

## What this repo does not imply

- Equal priority between mobile and web (mobile is v0; web is deferred).
- A researcher console or dashboard in v0.
- Multiple frontends in parallel before the golden path works.
- Admin tooling as part of the first shipped slice.

---

## Placeholder apps

If you add `apps/admin` or `apps/web` as placeholders:

- Add a **README** in that directory: "Deferred. Not part of v0 product slice. Do not prioritize over mobile golden path."
- Do **not** implement features there until v0 mobile loop is validated.
- In **repo-blueprint.md** (this file), admin and web remain "deferred" until explicitly promoted.
