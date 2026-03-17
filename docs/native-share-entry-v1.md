# Native Share Entry v1 — OS Share Target

Rabbit Hole can receive shared text or URLs from other apps (Safari, Chrome, Notes, etc.). The app opens and lands in **Share Intake** with that content prefilled; the existing flow (normalize → search → article resolution) handles it. No duplicate logic.

## Purpose

- **OS share target:** When the user shares a URL or text from another app and selects “Rabbit Hole”, the app opens and shows Share Intake with that content.
- **Single intake flow:** ShareIntakeScreen is the only entry point. It uses `normalizeSharedInput`, `maybeExtractSearchString`, and `api.search` (same as Lens). One result → open article; multiple → list; no results → editable fallback.
- **No new UI:** Same screen whether the user arrived via in-app link (“Open in Rabbit Hole”, “Simulate share”) or via the system share sheet.

## Architecture: How shared content flows

```
External app (Safari, Notes, Chrome, …)
    → User taps Share → chooses “Rabbit Hole”
    → OS opens Rabbit Hole and delivers payload (URL or text)
    → expo-share-intent exposes payload to useShareIntent()
    → App.tsx: when nav ready, navigate to Explore → ShareIntake with params { sharedText }
    → ShareIntakeScreen: route.params.sharedText → initialText
    → normalizeSharedInput(initialText) → setInputText + runSearch(maybeExtractSearchString(initialText))
    → api.search(q) (same as Lens)
    → 1 result: navigate to Article; >1: show list; 0: show “No results yet.” + editable input
```

No duplicate logic: the same normalization, search, and resolution run for in-app and OS share.

## Platform configuration

### app.json (Expo)

- **scheme:** `rabbit-hole` — used for linking and share target.
- **plugins:** `["expo-share-intent"]` — adds iOS share extension and Android intent filters at prebuild.

Already set in this repo. No extra config required for v1 (text and URL sharing).

### Dependencies

- `expo-share-intent@^2.7.0` — receive share intents (text/URL).
- `expo-linking@~6.3.0` — used by the plugin; required for share target.
- `expo-constants` — used to detect Expo Go (`Constants.appOwnership === "expo"`); share intent is disabled in Expo Go.

### Development build required

Share target **does not work in Expo Go**. You must use a development (or production) build:

1. **Generate native projects:**  
   `npm run prebuild`  
   (runs `expo prebuild --no-install --clean`)

2. **Run on device/simulator:**  
   - iOS: `npm run run:ios` or `npx expo run:ios`  
   - Android: `npm run run:android` or `npx expo run:android`

After that, “Rabbit Hole” (or the app name) appears in the system share sheet when sharing a URL or text.

## iOS setup

1. From repo root: `cd apps/mobile && npm run prebuild`
2. Then: `npm run run:ios` (or open `ios/` in Xcode and run).
3. The plugin adds the share extension target; the app appears in the share sheet for URLs and text.

**If prebuild fails** (e.g. “Config sync failed” or Xcode errors): see [expo-share-intent troubleshooting](https://github.com/achorein/expo-share-intent#troubleshooting). Some setups need `patch-package` and the Xcode patch from [expo-share-intent-demo](https://github.com/achorein/expo-share-intent-demo). We do not commit `ios/` by default; regenerate with prebuild when needed.

## Android setup

1. From repo root: `cd apps/mobile && npm run prebuild`
2. Then: `npm run run:android` (or open `android/` in Android Studio and run).
3. The plugin adds intent filters for text and URL; no extra config for v1.

## Routing incoming share in the app

- **App.tsx** uses `useShareIntent({ disabled: isExpoGo })`. When `hasShareIntent` and `shareIntent` are set and navigation is ready, it builds `text = (shareIntent.webUrl || shareIntent.text || "").trim()` and navigates to `Explore` → `ShareIntake` with `params: { sharedText: text }`. Then it calls `resetShareIntent()` after a short delay so the same content is not reused on next launch.
- **ShareIntakeScreen** reads `route.params.sharedText` as `initialText`. If non-empty, it normalizes, sets the input, and runs search (same as Lens). Resolution: 1 → article, many → list, 0 → no-results state with editable input.

## Manual test checklist

Use a **development build** (not Expo Go).

### iOS

1. Build and run: `cd apps/mobile && npm run run:ios` (or run from Xcode).
2. Open **Safari** or **Notes** and enter or copy a URL or text (e.g. `https://example.com/coffee` or `coffee cup recycling`).
3. Tap **Share** → choose **Rabbit Hole** (or “Open in Rabbit Hole”).
4. **Expected:** App opens and shows **Share Intake** with the shared content in the input and “Resolving…” then either:
   - **One match** → article opens automatically.
   - **Multiple** → result list; tap one to open article.
   - **No match** → “No results yet.” and editable input; user can change text and tap Search.
5. Close the app and share again with different text; confirm the new content appears.

### Android

1. Build and run: `cd apps/mobile && npm run run:android` (or run from Android Studio).
2. Open **Chrome** or any app with Share (e.g. Notes), enter or copy a URL or text.
3. Tap **Share** → choose **Rabbit Hole**.
4. **Expected:** Same as iOS: app opens to Share Intake with content prefilled and search/resolution as above.
5. Repeat with different content to confirm params update.

### Expo Go (no share target)

1. Run `npm run start` and open the app in **Expo Go**.
2. **Expected:** Share target does **not** appear in the system share sheet (by design; native module disabled).
3. In-app **“Open in Rabbit Hole”** and **“Simulate share: coffee”** on Home should still open Share Intake with prefilled text and resolve correctly.

## Intake behavior (unchanged)

- **Input:** Shared content is URL or plain text.
- **Normalize:** `normalizeSharedInput` — trim, collapse whitespace; full string used as search query in v1.
- **Search:** `api.search(normalizedString)` (same as Lens).
- **Resolution:** 1 result → navigate to Article; multiple → list; 0 → “No results yet.” + editable input + Search.

## What is not in scope (v1)

- Browser extension, overlay, or image share.
- URL-specific parsing (e.g. search only on path); v1 searches the full normalized string.
- Changes to article contract, epistemic model, Market, or Lens search.

## Future path

- **Browser extension:** Could open the app via deep link with the same `sharedText` param.
- **URL parsing:** `maybeExtractSearchString` could later derive a query from URL path/query for better matching.

## Summary

| Item | Status |
|------|--------|
| Plugin & scheme | In `app.json` |
| Routing | App.tsx → ShareIntakeScreen with `sharedText` |
| Intake flow | normalizeSharedInput → maybeExtractSearchString → api.search → article/list/no-results |
| Development build | `npm run prebuild` then `npm run run:ios` / `npm run run:android` |
| Expo Go | Share target disabled; in-app triggers still work |
