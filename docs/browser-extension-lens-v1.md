# Browser Extension Lens v1 (groundwork)

Minimal browser extension that sends the **current page URL** or **selected text** to Rabbit Hole. One action: **Open in Rabbit Hole**. The extension is a thin client; it does not duplicate search or article logic. Handoff uses a custom URL scheme that the mobile app handles via deep link.

## Purpose

- Let Rabbit Hole function as a **web lens**: from any tab, the user can send the page or a **selection** into the existing Share Intake / search flow.
- Establish a clean foundation: one button, one URL format, one handoff path. **Selected-text handoff v1** adds: if the user has selected text, send that; otherwise send the tab URL (or title). No overlays, side panel, or scraping.

## Why this is “groundwork”

- **Thin extension:** No full side panel, no page overlays or annotations, no scraping or summarization in the extension. Selected text is captured via a minimal scripting call and sent as the same `text` param.
- **One flow:** “Open in Rabbit Hole” — sends selection if present, else URL/title. The app interprets all input the same (normalize → search → article/list/no-results).
- **Explicit contract:** The handoff URL format is unchanged; selection is just another source for `text`.

## Extension package / location

- **Path:** `apps/extension/`
- **Contents:** `manifest.json` (Chrome Manifest V3), `popup.html`, `popup.js`, `handoff.js`, `test-handoff.js`.
- **Not in npm workspaces** by default; load as an unpacked extension. See “Load the extension” below.

## Chosen flow (including selected-text handoff v1)

1. User clicks the extension icon → popup opens.
2. User clicks **“Open in Rabbit Hole”**.
3. Extension **tries to read selected text** from the active tab (see “How selection is captured”).
4. **Fallback rules:** If there is meaningful selected text (non-empty after trim), that is used as `text`. Otherwise the tab’s `url` is used; if URL is empty, the tab’s `title` is used.
5. Extension builds `rabbit-hole://share?text=ENCODED_STRING` and navigates to it.
6. If the Rabbit Hole app is installed and registered for the `rabbit-hole` scheme, the OS opens the app with that URL.
7. The app parses the URL, extracts `text`, and navigates to **Share Intake** with `sharedText` set. The existing flow runs unchanged.

## Selected-text handoff behavior

- **When selection is used:** The extension sends the trimmed selection as `text`. The app receives it as `sharedText` and runs it through the same Share Intake path (normalize → search). No duplicate interpretation in the extension.
- **When selection is not used:** No selection, or selection is empty/whitespace-only, or scripting fails (e.g. restricted page like `chrome://`) → fall back to **tab URL**. If URL is empty → fall back to **tab title**. If all are empty, the popup shows “No selection, URL, or title to send.” and no handoff URL is opened.
- **Same button:** “Open in Rabbit Hole” does both: prefer selection, else URL/title. We do not add a separate “Send selection” button in this pass; one action covers both.

## How selection is captured

- The popup uses **Chrome’s `scripting` API**: `chrome.scripting.executeScript({ target: { tabId }, func })` with a function that returns `window.getSelection().toString().trim()`.
- This runs in the context of the active tab when the user invokes the extension (click popup). No persistent content script; no page overlay.
- **Restricted pages:** On pages where script injection is not allowed (e.g. `chrome://`, `edge://`, the extension’s own pages), `executeScript` fails; the extension catches the error and falls back to URL/title.
- **Minimal permission:** Only `activeTab` (already used) and `scripting` are required. No host permissions or broad `<all_urls>`.

## What data is captured

- **Selected text** — preferred when present and non-empty (trimmed). Sent as the `text` query value (URL-encoded).
- **Current tab URL** — fallback when no selection (or injection failed). Sent as `text`.
- **Current tab title** — fallback when URL is also empty.
- **No page content scraping, no PII** beyond what the user explicitly sends (selection or URL they are viewing).

## Handoff URL format

- **Scheme:** `rabbit-hole`
- **Host/path:** `share`
- **Query:** single param `text` = URL-encoded string (selection, page URL, or fallback title).

Examples:  
`rabbit-hole://share?text=https%3A%2F%2Fexample.com%2Fpage`  
`rabbit-hole://share?text=What%20is%20a%20disposable%20coffee%20cup%3F`

The mobile app parses this and navigates to Share Intake with `sharedText` = decoded `text`. Same intake flow as OS share and in-app “Simulate share”.

## Permissions / capabilities added (selected-text v1)

- **`scripting`** — Required to inject a one-off function into the active tab to read `window.getSelection().toString()`. Used only when the user clicks the extension (no background injection). Together with `activeTab`, this allows reading selection on the current tab only.

No new host permissions; no content scripts in the manifest; no persistent background script.

## How to build / run the extension

1. **No build step.** Extension files are plain HTML/JS.
2. **Tests:** From `apps/extension/`, run `npm test` (runs `node test-handoff.js`). Covers `buildHandoffUrl`, `parseHandoffUrl`, `chooseHandoffText`, and round-trip for selected text.
3. **Load in Chrome:** Open `chrome://extensions`, enable “Developer mode”, “Load unpacked”, select the `apps/extension` folder.

## Manual validation checklist

- [ ] Load the extension in Chrome (Load unpacked → `apps/extension`).
- [ ] **Selected text:** Open a normal webpage, select a phrase (e.g. “disposable coffee cup”). Click the extension icon, click “Open in Rabbit Hole”. The handoff URL should contain the selected text (URL-encoded). With the app installed, app should open on Share Intake with that text prefilled and search running.
- [ ] **No selection:** Same page, clear selection. Click extension, “Open in Rabbit Hole”. Handoff URL should contain the page URL. App should open with URL as sharedText.
- [ ] **Restricted page:** Open `chrome://extensions`. Click extension, “Open in Rabbit Hole”. Should fall back to URL/title (or show “No selection, URL, or title to send.” if that page has no usable URL/title).
- [ ] Run `node test-handoff.js` in `apps/extension` and mobile Jest test `deepLinkHandoff.test.ts`; both should pass.

## Limitations of v1

- **Chrome only** (Manifest V3). Firefox/Safari not configured.
- **No right-click context menu** “Send selection to Rabbit Hole” (same behavior is available via popup; context menu deferred).
- **No fallback when app is not installed** (custom scheme may open nothing or a browser error; no web fallback URL in v1).
- **Desktop only** for the extension; mobile app is the receiver.
- **Single handoff format**; no versioning or multiple params yet.
- **Selection only on click:** Selection is read at the moment the user clicks “Open in Rabbit Hole”. No live tracking or overlay.

## Future path

- **Right-click context action:** “Send selection to Rabbit Hole” from context menu (same handoff; different entry point).
- **Selected image handoff:** “Open this image in Rabbit Hole” (would need image URL and possibly app support).
- **Richer page context:** Send title + URL as separate params; or a small JSON payload for future parsing.
- **Side panel:** Optional Chrome side panel with “Open in Rabbit Hole” and refinements.
- **Overlay / lens interactions:** In-page highlights or “explore this” on elements (out of scope for groundwork).
- **Direct article opening:** If the URL is a known Rabbit Hole article link, open Article screen directly (would require app and/or backend support).

## App-side (mobile)

- **No change** to article contract, epistemic model, or Market. Deep-link handling is unchanged: `rabbit-hole://share?text=...` is parsed by `parseHandoffUrl`; the app navigates to **Explore → ShareIntake** with `params: { sharedText }`. Selected text and URL are treated identically as `sharedText`.

## Dependency

- None beyond the browser’s extension APIs. No npm dependencies in `apps/extension` for v1.
