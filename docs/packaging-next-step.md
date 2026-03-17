# Packaging for real users — recommended next step

Inspect-only recommendation (do not implement yet). Smallest clean path for this codebase.

**Stack:** Expo 51 (React Native), FastAPI API, npm workspaces monorepo. Mobile is primary; no web app. Share Surface v1 uses `EXPO_PUBLIC_APP_URL` for canonical links; `app.json` has `scheme: "rabbit-hole"` (ready for deep links).

---

## 1. Developer distribution

**Goal:** Other devs (or you on another machine) can run the app and API with minimal setup.

**Recommended:**

- **Single source of truth:** Keep the repo as the only artifact. Document in README:
  - Prerequisites: Node ≥18, Python 3.11+, iOS Simulator / Android emulator or device.
  - From repo root: `npm install` (installs workspace deps), `npm run contracts:build`, then `npm run mobile:start` and in another terminal run the API (e.g. `cd apps/api && uvicorn app.main:app`). Set `EXPO_PUBLIC_API_URL` (and optionally `EXPO_PUBLIC_APP_URL`) for the mobile app.
- **Optional:** Add a root `package.json` script that builds contracts and starts mobile (e.g. `dev:mobile`) so one command gets the app running. No need for Docker or multi-service orchestration for v0 unless the team already uses it.
- **Do not** add a separate “developer package” (e.g. tarball or private npm package) for the app; cloning the repo is enough.

**Best path for this codebase:** README + one or two root scripts (e.g. `dev:mobile`, `dev:api`). No new tooling.

---

## 2. Web deployment

**Goal:** Serve the API (and optionally a future web app) on a public URL.

**Current state:** No web client. Only the API is a natural web deployable.

**Recommended:**

- **API only (smallest step):** Deploy the FastAPI app to a single service (e.g. Railway, Render, Fly.io, or a small VPS). Use one process (e.g. `uvicorn app.main:app --host 0.0.0.0`). Set CORS if the mobile app will call this URL (you already have `allow_origins=["*"]`; tighten later). Point `EXPO_PUBLIC_API_URL` (and any server-side env) to this API URL.
- **Web app later:** When/if you add a web client (e.g. Expo web or a separate SPA), deploy it as a static site or a second service; keep API deployment separate. Not required for the current mobile-first v0.

**Best path for this codebase:** Deploy the existing `apps/api` to one cloud service; document the API URL and set it in the mobile app env. No web app until you decide to add one.

---

## 3. Mobile distribution

**Goal:** Get the Expo app onto testers’ or users’ devices (without going through app stores first).

**Recommended:**

- **Internal testing (smallest step):** Use **Expo Go** plus a dev build or tunnel:
  - Run `npx expo start` and share the tunnel URL (e.g. `npx expo start --tunnel`) so testers with Expo Go can open the project. They must point their device at your API (e.g. same network or a deployed API). No native build required.
  - **Or** create a **development build** (e.g. `npx expo prebuild` then build with Xcode/Android Studio, or use EAS Build with a development profile) and distribute the binary via TestFlight / internal testing / ad-hoc. Gives a stable app that still talks to your dev/staging API.
- **Store builds later:** When you want production distribution, add **EAS Build** and **EAS Submit** (Expo Application Services): configure `eas.json` with build profiles (e.g. development, preview, production), set env (e.g. `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_APP_URL`) per profile, then build and submit to App Store / Play Store. Your share deep links (`rabbit-hole://article/:id`) can be wired to open the app when you have a production build and optional universal links.

**Best path for this codebase:** Start with **Expo Go + tunnel + deployed API** for quick external testing. Add **EAS Build** (and optionally Submit) when you need a standalone build or store release; that’s the natural place to lock in `EXPO_PUBLIC_APP_URL` and deep-link behavior for shared links.

---

## Summary

| Channel              | Smallest clean next step                                                                 |
|------------------------------------------------------------------------------------------|
| **Developer**       | README + root scripts (`dev:mobile`, `dev:api`); clone repo, install, build contracts, run. |
| **Web**             | Deploy `apps/api` to one host; no web app until you add one.                             |
| **Mobile**          | Expo Go + tunnel + deployed API for testing; add EAS Build (and Submit) when you need binaries or stores. |

No packaging implementation was done; this is a recommendation only.
