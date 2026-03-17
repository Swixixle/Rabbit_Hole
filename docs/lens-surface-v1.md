# Lens Surface v1

In-app universal input: type a plain-language query and get routed to the matching article when one exists.

## Purpose

- Provide a **lens** entry point: one search box at the top of the home screen.
- Resolve queries like "Michael Jordan rookie card", "coffee cup recycling", "U-Haul moving blankets" to the correct article via a lightweight search layer.
- Keep the app feeling like a lens on the internet without (yet) share extensions, browser extensions, or overlay bubbles.

## Endpoint / search behavior

- **GET /v1/search?q=**  
  Query parameter `q` is the search string. Response is a JSON array of **SearchResult** objects.
- Search is implemented as a **server-side fixture layer**: case-insensitive substring matching over article title, node name, node displayLabel, first summary block text, and a small per-article keyword/alias list (no external search service, embeddings, or ranking engine).
- Empty or whitespace-only `q` returns `[]`.

## Result payload

Each item in the response matches **SearchResult**:

- **nodeId** (string) — Node id for the article’s node.
- **articleId** (string, optional) — Article id; use for opening the article reader.
- **title** (string) — Article/node title.
- **summary** (string, optional) — First summary block text when available.
- **imageUrl** (string, optional) — Thumbnail when present in data.
- **matchReason** (string, optional) — `"title"` | `"alias"` | `"keyword"` for debugging/trust.

## Matching rules (v1)

- **Case-insensitive** substring match.
- Sources considered (in order for assigning matchReason):
  - Article title → `matchReason: "title"`.
  - Node name → `matchReason: "title"`.
  - Node displayLabel → `matchReason: "alias"`.
  - Per-article keywords/aliases (e.g. "coffee cup", "moving blankets") → `matchReason: "keyword"`.
  - First summary block text → `matchReason: "keyword"`.
- One result per article; no deduplication by node beyond that.
- No ranking beyond “any match”; order is fixture/iteration order.

## UX behavior

- **Search input** at the top of the home screen, placeholder: *"Search or explore anything..."*.
- As the user types, search runs (no separate submit required); results appear in a list below.
- Each result row shows title, optional summary (up to 2 lines), and optional thumbnail when `imageUrl` is set.
- **Tap a result** → open the article reader for that article (same Article screen as image flow or trace).
- **Empty state:** when there are no matches, show *"No results yet."*
- Typography and spacing follow the rest of the product; no redesign of the article screen.

## Out of scope (v1)

- Browser extension, mobile OS share extension, overlay bubble.
- Web crawling, external search APIs, embeddings, AI ranking.
- Market layer changes.
- Changes to article contract, section order, or epistemic semantics.
- Admin tooling or taxonomy system.

## Future path

- **Share extension** — share URL/text from another app into Rabbit Hole and resolve to an article.
- **Browser extension** — highlight text or use current page context, send to search/resolve.
- **Image-first lookup** — reuse existing image capture + tap flow as another lens entry (already in product).
