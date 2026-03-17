/**
 * Lens Analytics v1 — lightweight event pipeline.
 * trackEvent(name, properties?) builds a normalized event and passes it to the current adapter.
 * Default: no-op in production; __DEV__ logs to console. When EXPO_PUBLIC_API_URL is set, events are also sent to the backend.
 */

import type { AnalyticsEvent, AnalyticsEventName, AnalyticsEventPropertyValue } from "../types/analytics";

export type AnalyticsAdapter = (event: AnalyticsEvent) => void | Promise<void>;

let adapter: AnalyticsAdapter = getDefaultAdapter();

function getDefaultAdapter(): AnalyticsAdapter {
  const apiUrl =
    typeof process !== "undefined" && process.env && process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl && String(apiUrl).trim()) {
    return createBackendAnalyticsAdapter(apiUrl.trim());
  }
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    return (event) => {
      // eslint-disable-next-line no-console
      console.log("[analytics]", event.name, event.properties ?? {});
    };
  }
  return () => {};
}

/**
 * Adapter that POSTs events to POST /v1/analytics/events. Best-effort; never throws.
 */
export function createBackendAnalyticsAdapter(apiBaseUrl: string): AnalyticsAdapter {
  const base = apiBaseUrl.replace(/\/$/, "");
  const url = `${base}/v1/analytics/events`;
  return (event: AnalyticsEvent) => {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([event]),
    }).catch(() => {});
  };
}

/**
 * Build a full event from name and optional properties. Used by trackEvent and tests.
 */
export function createEvent(
  name: AnalyticsEventName,
  properties?: Record<string, AnalyticsEventPropertyValue>
): AnalyticsEvent {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  return {
    id,
    name,
    occurredAt: new Date().toISOString(),
    ...(properties && Object.keys(properties).length > 0 ? { properties } : {}),
  };
}

/**
 * Emit an event: create and pass to the current adapter. Fire-and-forget; no await.
 */
export function trackEvent(
  name: AnalyticsEventName,
  properties?: Record<string, AnalyticsEventPropertyValue>
): void {
  const event = createEvent(name, properties);
  try {
    const result = adapter(event);
    if (result && typeof (result as Promise<void>).catch === "function") {
      (result as Promise<void>).catch(() => {});
    }
  } catch (_) {
    // Adapter should not throw; ignore if it does.
  }
}

/**
 * Set the analytics adapter (e.g. for tests or for POST /v1/analytics/events).
 * Pass undefined to reset to default.
 */
export function setAnalyticsAdapter(next: AnalyticsAdapter | undefined): void {
  adapter = next ?? getDefaultAdapter();
}
