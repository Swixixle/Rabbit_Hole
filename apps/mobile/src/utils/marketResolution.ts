/**
 * Market Resolution Layer v1: map MarketItem to in-app action.
 * external → open URL; search → Lens search; internal → open article.
 */
import type { MarketItem } from "@rabbit-hole/contracts";

export type MarketItemAction =
  | { type: "external"; url: string }
  | { type: "search"; query: string }
  | { type: "internal"; articleId: string }
  | null;

export function getMarketItemAction(item: MarketItem): MarketItemAction {
  const type = item.destinationType;
  const value = item.destinationValue?.trim();
  if (!value) return null;
  if (type === "external") return { type: "external", url: value };
  if (type === "search") return { type: "search", query: value };
  if (type === "internal") return { type: "internal", articleId: value };
  return null;
}
