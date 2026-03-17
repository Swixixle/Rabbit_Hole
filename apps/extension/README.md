# Rabbit Hole Browser Extension (v1 groundwork)

Minimal Chrome extension: **Open in Rabbit Hole** sends the current tab’s URL to the Rabbit Hole app via `rabbit-hole://share?text=...`.

## Install / load

- No `npm install` needed (no dependencies).
- **Chrome:** Open `chrome://extensions` → Enable “Developer mode” → “Load unpacked” → select this folder (`apps/extension`).
- Run tests: `npm test` (runs `node test-handoff.js`).

See `docs/browser-extension-lens-v1.md` for handoff format, app-side handling, and manual checklist.
