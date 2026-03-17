# Exploration History v1

Users can revisit recently opened articles from the **History** tab. The list is local-only, reverse-chronological, and tap-to-open. No account, sync, folders, or tags.

## Purpose

- **Return loop:** After search, image lookup, share, or trace, users can get back to an article without re-searching.
- **Product solidity:** History adds memory and continuity so the app feels like a tool, not a sequence of one-off moments.
- **Minimal surface:** The existing History tab stub is completed; no new major navigation or UI surface.

## What gets recorded

History entries are created when the user opens an article from:

| Entry point | Source label |
|-------------|--------------|
| Home/Lens search | Search |
| Image lookup (tap object → look up) | Image lookup |
| Share Intake (shared URL/text → article) | Share |
| Trace (open node from trace preview) | Trace |
| Market (internal link to another article) | Market |
| Related (node chip on article) | Related |

Each entry stores:

- `articleId`, `title`, optional `subtitle` (e.g. identification line)
- `source` (one of the above)
- `openedAt` (ISO timestamp)

When the same article is opened again, it is **deduped**: the existing entry moves to the top and its timestamp (and title if provided) is updated. The list is capped at 50 entries.

## Local-only persistence

- **Storage:** `@react-native-async-storage/async-storage` with key `rabbit-hole-exploration-history`.
- **No account, no sync, no cloud.** History lives only on the device.
- **No new heavy state library:** A small store module (`utils/historyStore.ts`) manages an in-memory list and persists to AsyncStorage on add/clear. The store can be initialized with an injectable storage adapter for tests.

## Display behavior

- **History tab:** Shows a list of recent explorations, newest first.
- **Each row:** Title (or “Article” if missing), optional subtitle, source label, relative time (e.g. “5m ago”, “2h ago”, “3d ago”).
- **Tap row:** Navigates to the Explore stack → Article screen with that `articleId`.
- **Clear:** Optional “Clear” button in the header empties history.

## Empty state

When there are no entries, the screen shows:

- **“No explorations yet.”**
- Short line: “Articles you open from search, image, share, or trace will appear here.”

## Implementation notes

- **Types:** `HistoryEntry` and `HistoryEntrySource` in `src/types/history.ts`.
- **Store:** `addHistoryEntry`, `listHistoryEntries`, `clearHistory`, plus `initHistoryStore(storage?)` and `resetHistoryStore()` for tests. Serialization helpers `serializeEntries` / `parseStoredEntries` are used by persistence and tests.
- **Recording:** Each place that navigates to Article calls `addHistoryEntry` with the appropriate `source` and whatever title/subtitle is available (e.g. from `SearchResult`, from `getArticleByNode`). Image and Market internal often have no title at the call site; the list shows “Article” when title is empty.
- **Tests:** `src/__tests__/historyStore.test.ts` covers add, list order, dedupe, clear, persistence, and serialize/parse.

## Future path

- **Filters:** Filter by source or date.
- **Favorites / saved:** Pin or save items out of history.
- **Synced history:** Optional account-backed history across devices.
- **Richer revisit context:** Last scroll position, read state, or “continue reading” hints.

None of these are in scope for v1.
