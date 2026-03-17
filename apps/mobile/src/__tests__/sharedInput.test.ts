/**
 * Native Share Entry v1: tests for shared input normalization and search extraction.
 */
import { normalizeSharedInput, maybeExtractSearchString, isLikelyMediaUrl } from "../utils/sharedInput";

describe("normalizeSharedInput", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeSharedInput("  coffee   cup  ")).toBe("coffee cup");
  });

  it("preserves URL string for display", () => {
    const url = "https://example.com/page?q=coffee";
    expect(normalizeSharedInput(url)).toBe(url);
  });

  it("returns empty string for non-string", () => {
    expect(normalizeSharedInput("")).toBe("");
    expect(normalizeSharedInput((null as any))).toBe("");
  });
});

describe("maybeExtractSearchString", () => {
  it("returns normalized string for plain text", () => {
    expect(maybeExtractSearchString("  uhaul moving  ")).toBe("uhaul moving");
  });

  it("returns same string for coffee-related text for search", () => {
    const t = "coffee cup recycling";
    expect(maybeExtractSearchString(t)).toBe(t);
  });
});

describe("isLikelyMediaUrl", () => {
  it("returns true for https URL", () => {
    expect(isLikelyMediaUrl("https://www.youtube.com/watch?v=abc")).toBe(true);
  });

  it("returns true for http URL", () => {
    expect(isLikelyMediaUrl("http://example.com")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isLikelyMediaUrl("coffee cup")).toBe(false);
  });

  it("returns false for empty or whitespace", () => {
    expect(isLikelyMediaUrl("")).toBe(false);
    expect(isLikelyMediaUrl("   ")).toBe(false);
  });

  it("returns false for text with newline", () => {
    expect(isLikelyMediaUrl("https://example.com\nmore")).toBe(false);
  });
});
