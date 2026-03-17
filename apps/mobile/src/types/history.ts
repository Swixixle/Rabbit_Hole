/**
 * Exploration History v1 — local record of opened articles.
 * Used by History tab to show recent explorations and reopen articles.
 */

export type HistoryEntrySource =
  | "search"
  | "image"
  | "share"
  | "trace"
  | "market"
  | "direct";

export interface HistoryEntry {
  id: string;
  articleId: string;
  title: string;
  subtitle?: string;
  source?: HistoryEntrySource;
  openedAt: string; // ISO
}
