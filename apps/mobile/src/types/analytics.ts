/**
 * Lens Analytics v1 — minimal event model for lens and product flows.
 * No PII, no user IDs, no dashboards. Product-focused properties only.
 */

export type AnalyticsEventName =
  | "image_segment_selected"
  | "image_tap_miss"
  | "lookup_confirmed"
  | "lookup_candidates_shown"
  | "lookup_candidate_selected"
  | "article_opened"
  | "search_executed"
  | "search_result_selected"
  | "share_intake_opened"
  | "share_intake_resolved"
  | "market_item_selected"
  | "history_item_opened";

export type AnalyticsEventPropertyValue = string | number | boolean | null;

export interface AnalyticsEvent {
  id: string;
  name: AnalyticsEventName;
  occurredAt: string; // ISO
  properties?: Record<string, AnalyticsEventPropertyValue>;
}
