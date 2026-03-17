/**
 * Market Resolution Layer v1: tests for getMarketItemAction.
 */
import { getMarketItemAction } from "../utils/marketResolution";
import type { MarketItem } from "@rabbit-hole/contracts";

function item(overrides: Partial<MarketItem>): MarketItem {
  return {
    id: "x",
    title: "Test",
    category: "shopping",
    ...overrides,
  };
}

describe("getMarketItemAction", () => {
  it("returns external action when destinationType is external", () => {
    const action = getMarketItemAction(
      item({ destinationType: "external", destinationValue: "https://example.com/page" })
    );
    expect(action).toEqual({ type: "external", url: "https://example.com/page" });
  });

  it("returns search action when destinationType is search", () => {
    const action = getMarketItemAction(
      item({ destinationType: "search", destinationValue: "reusable coffee cups materials safety" })
    );
    expect(action).toEqual({ type: "search", query: "reusable coffee cups materials safety" });
  });

  it("returns internal action when destinationType is internal", () => {
    const action = getMarketItemAction(
      item({ destinationType: "internal", destinationValue: "article-coffee" })
    );
    expect(action).toEqual({ type: "internal", articleId: "article-coffee" });
  });

  it("returns null when destinationValue is missing", () => {
    expect(getMarketItemAction(item({ destinationType: "external" }))).toBeNull();
    expect(getMarketItemAction(item({ destinationType: "search" }))).toBeNull();
    expect(getMarketItemAction(item({ destinationType: "internal" }))).toBeNull();
  });

  it("returns null when destinationValue is empty or whitespace", () => {
    expect(getMarketItemAction(item({ destinationType: "external", destinationValue: "   " }))).toBeNull();
    expect(getMarketItemAction(item({ destinationType: "search", destinationValue: "" }))).toBeNull();
  });

  it("trims destinationValue for search and internal", () => {
    expect(getMarketItemAction(item({ destinationType: "search", destinationValue: "  query  " }))).toEqual({
      type: "search",
      query: "query",
    });
    expect(getMarketItemAction(item({ destinationType: "internal", destinationValue: "  article-id  " }))).toEqual({
      type: "internal",
      articleId: "article-id",
    });
  });

  it("returns null when destinationType is missing or unknown", () => {
    expect(getMarketItemAction(item({ destinationValue: "https://x.com" }))).toBeNull();
  });
});
