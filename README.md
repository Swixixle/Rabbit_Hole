# Rabbit Hole

> Mobile-first exploration engine — capture an image, tap a region, get a verified article, trace it through systems. Built with Expo React Native + FastAPI.

![Status: Early Development](https://img.shields.io/badge/status-early%20development-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)

**Project status (v0):** First runnable slice. Core image → article → verify → trace flow works end-to-end with fixture-backed data. No web client, no admin panel, no experience-layer animation yet. Expect breaking changes as the API and mobile screens evolve.

## Quick start

### 1. API

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

For **page capture (Scan page)** text extraction, install Tesseract on the host (e.g. `brew install tesseract` on macOS). If Tesseract is missing, the extract-text endpoint still responds with empty text and low confidence.

Check: [http://localhost:8000/health](http://localhost:8000/health) → `{"status":"ok"}`

### 2. Mobile

```bash
# From repo root
npm install
npm run mobile:start
```

- Press `i` for iOS simulator or `a` for Android.
- **API URL**: Default is `http://localhost:8000`. For a physical device or Android emulator, set `EXPO_PUBLIC_API_URL` (see `.env.example`) and restart Expo. When the API URL is set, analytics events are sent to the backend (see `docs/lens-analytics-v1.md`).

### 3. Golden path

1. **Home** → Upload image (or Take photo).
2. **Image Focus** → Tap anywhere on the image.
3. If multiple candidates appear → pick one, tap "Explore this".
4. **Article** → Read; tap "Sources & Verify" or "Trace through systems".
5. **Verify** → Source list; tap a source for snapshot info.
6. **Trace** → One trace row; tap a node to open its article.

**Share intake (v1):** From Home, use **Open in Rabbit Hole** to open the share-intake screen (paste link, **media URL**, or text, then Search). Media URLs are recognized and can resolve to an article, to a **summary & transcript** (and optional claims, fixture-backed), or to “no entry yet.” See `docs/media-lens-groundwork-v1.md`.

**Share target (OS):** When you share a URL or text from another app into Rabbit Hole, the app opens and lands in Share Intake with that content. This requires a **development build** (not Expo Go): in `apps/mobile` run `npm run prebuild` then `npm run run:ios` or `npm run run:android`. See `docs/native-share-entry-v1.md` for platform setup and manual test steps.

**Market (v1):** From an article, tap **Market** for action options (e.g. local recommendations, healthier alternatives, vehicle safety); items resolve via Lens search, another article, or an external link. See `docs/market-surface-v1.md`.

**Study (v1 groundwork):** Articles with a study guide show a **Study** entry; tap to open a sheet with overview, explain simply, key points, why it matters, common confusion, and study questions. See `docs/page-to-study-groundwork-v1.md`.

**Audio recognition (v1 groundwork):** From Home, **Identify audio** → **Record** a short clip (or try a sample) → fixture-backed recognition → route to article, media, or organization. Real microphone capture; no fingerprinting yet. See `docs/audio-recognition-groundwork-v1.md`. **Optional location context** can improve identification in some flows; see `docs/future-location-context-groundwork-v1.md`.

**Live Lens (v1):** From Home, **Live Lens** → Capture a frame → same image pipeline as upload. Optional **location context** ("Location could improve identification" → Use location / Not now) is passed to explore/image when the user allows.

**Ecological identification (v1 groundwork):** The Lens/image pipeline can return optional **ecological entity** results (plants, wildlife, fungi, etc.). When present, the app shows a compact Nature block with summary and general-awareness notes; fixture-backed for v1. See `docs/ecological-identification-groundwork-v1.md`.

**Browser extension (v1 groundwork):** Load `apps/extension` as an unpacked Chrome extension; “Open in Rabbit Hole” sends the current page URL or **selected text** to the app via deep link. See `docs/browser-extension-lens-v1.md`.

## Structure

- `packages/contracts` — Shared types (Node, Claim, Source, Article, etc.).
- `apps/api` — FastAPI v0 endpoints; stub + fixtures.
- `apps/mobile` — Expo React Native; 5 screens, 14 components.
- `apps/extension` — Chrome extension (Manifest V3); Open in Rabbit Hole handoff.
- `docs/` — Architecture and experience-layer (deferred) docs.

## Tests

```bash
# API
cd apps/api && .venv/bin/python -m pytest tests/ -v

# Mobile (Jest, share/lens utils)
cd apps/mobile && npm test

# Contracts (typecheck)
npm run contracts:build
```

## Environment

Copy `.env.example` to `.env` in the repo root or in `apps/mobile` if you need to override `EXPO_PUBLIC_API_URL`. Expo reads `EXPO_PUBLIC_*` from the environment at build time.
