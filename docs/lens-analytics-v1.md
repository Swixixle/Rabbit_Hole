# Lens Analytics v1

A minimal, privacy-conscious event pipeline for understanding how people use the lens flow and key product surfaces. No dashboards, no third-party SDKs, no user tracking. Events are product-focused and PII-free.

## Purpose

- **Product insight:** See how often users tap segments, confirm lookups, see candidate pickers, open articles from search/share/image/market/history, and resolve share intake.
- **Improvement levers:** Data to tune tap resolution, lookup success, and article entry paths.
- **Privacy-first:** No PII, no accounts, no precise location, no raw shared text or full URLs in events.

## What events are captured

| Event | When | Typical properties |
|-------|------|--------------------|
| `image_segment_selected` | User taps and hits a segment on the image | `segmentId` |
| `image_tap_miss` | User taps but no segment under tap (segments exist) | `hadSegments: true` |
| `lookup_confirmed` | User taps "Look up" on selected segment | `segmentId` |
| `lookup_candidates_shown` | Multiple candidates returned; picker is shown | `candidateCount` |
| `lookup_candidate_selected` | User picks a candidate and an article is opened | `hadCandidates`, `hadSelection`, optional `segmentId` |
| `article_opened` | Article screen is opened from any entry path | `source`, `articleId` |
| `search_executed` | Lens search runs (Home search box) | `queryLength`, `resultCount` |
| `search_result_selected` | User taps a search result to open article | `source` (search/share), `articleId` |
| `share_intake_opened` | Share Intake screen opens with shared input | `hasInput`, `queryLength` |
| `share_intake_resolved` | Share Intake search completes | `resultCount`, `hadSelection` |
| `market_item_selected` | User taps a Market item | `destinationType` (internal/external/search) |
| `history_item_opened` | User taps an item in History list | `articleId` |

`source` for article/search flows: `search` | `image` | `share` | `trace` | `market` | `direct` (related).

## Privacy boundaries

- **No PII:** No email, name, or identifier.
- **No user accounts or tracking IDs.**
- **No precise location.**
- **No raw shared text or paste content** — only derived values such as `queryLength`, `hasInput`, `resultCount`.
- **No full URLs** in event payloads; use category-level or boolean properties instead.
- **Minimal properties:** Only what is needed for product analysis (e.g. `articleId`, `segmentId`, `resultCount`, `hadSelection`, `destinationType`).

## Local vs backend capture

- **Default when no API URL:** Events go to an **adapter** only. In development (`__DEV__`), the default adapter logs to console. In production build, the default adapter is no-op.
- **Backend capture (v1):** When `EXPO_PUBLIC_API_URL` is set (e.g. to `http://localhost:8000` or your API base), the default adapter is **createBackendAnalyticsAdapter(apiUrl)**. Each event is POSTed to `POST /v1/analytics/events` as a JSON array of one event. Fire-and-forget; failures are ignored so the app never breaks.
- **No persistence on device** for analytics; events are not queued locally.

## Backend capture path (v1)

### API endpoint(s)

- **POST /v1/analytics/events** — Body: JSON array of events (one or many). Validates event name (must be one of the 12 known names) and property values (string, number, boolean, or null only). Returns `{"status": "ok"}`. No auth.
- **GET /v1/analytics/events?limit=100** — Debug only: returns the most recent events from the in-memory store (capped at 500). Not for production dashboards.

### Storage choice

- **In-memory append-only list** in the API process, capped at 10,000 events. Oldest events are dropped when the cap is exceeded. No database. Process restart clears the store.

### Transport from mobile

- When `EXPO_PUBLIC_API_URL` is set, the app uses **createBackendAnalyticsAdapter(apiBaseUrl)** as the default adapter. Each `trackEvent` call results in one `fetch(POST, baseUrl/v1/analytics/events, body: JSON.stringify([event]))`. No batching across events in v1. The adapter catches all errors and never throws.

### Failure behavior

- If the POST fails (network error, 4xx/5xx), the adapter ignores it and returns. The app continues normally; no retry, no user-visible error. Analytics remain best-effort.

### Debug read endpoint

- **GET /v1/analytics/events** is provided for local development and debugging (e.g. confirm events are received). It is not intended for production dashboards or aggregation; use it only to inspect recent events during development.

## Event schema

```ts
type AnalyticsEventName =
  | 'image_segment_selected'
  | 'image_tap_miss'
  | 'lookup_confirmed'
  | 'lookup_candidates_shown'
  | 'lookup_candidate_selected'
  | 'article_opened'
  | 'search_executed'
  | 'search_result_selected'
  | 'share_intake_opened'
  | 'share_intake_resolved'
  | 'market_item_selected'
  | 'history_item_opened';

type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  occurredAt: string;  // ISO
  properties?: Record<string, string | number | boolean | null>;
};
```

## Where events are emitted

| Location | Events |
|----------|--------|
| **ImageFocusScreen** | `image_segment_selected`, `image_tap_miss`, `lookup_confirmed`, `lookup_candidates_shown`, `lookup_candidate_selected` |
| **HomeScreen** | `search_executed`, `search_result_selected`, `article_opened` (source: search) |
| **ShareIntakeScreen** | `share_intake_opened`, `share_intake_resolved`, `search_result_selected` (source: share), `article_opened` (source: share) |
| **ArticleScreen** | `article_opened` (source: direct, market), `market_item_selected` |
| **HistoryScreen** | `history_item_opened` |
| **App.tsx** (stack) | `article_opened` (source: image, trace) when navigating from ImageFocus or TracePreview |

## Out of scope for v1

- Dashboards or UI for analytics.
- Third-party analytics SDKs.
- User identification or cross-session IDs.
- Persistent event queue on device.
- Database or durable event store (in-memory only).
- Aggregation, retention, or reporting pipelines.

## Future path

- **Aggregate metrics:** Counts and funnels (e.g. segment selected → lookup confirmed → article opened) from event stream.
- **Tap heatmap analysis:** Segment-level success and miss rates to improve detection.
- **Candidate-resolution tuning:** Use `lookup_candidates_shown` and `lookup_candidate_selected` to improve ranking and single-result confidence.
- **Content quality feedback loops:** Correlate entry path and source with engagement or downstream actions.
- **Durable storage:** Persist events to a database or log sink for retention and analysis.
- **Optional batching:** Send events in batches from the app to reduce request volume.
