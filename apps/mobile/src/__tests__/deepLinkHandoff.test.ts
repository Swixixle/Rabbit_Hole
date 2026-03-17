/**
 * Browser Extension Lens v1: tests for handoff URL parsing (app side).
 */
import { parseHandoffUrl } from "../utils/deepLinkHandoff";

describe("parseHandoffUrl", () => {
  it("decodes text param from rabbit-hole://share URL", () => {
    const url = "rabbit-hole://share?text=" + encodeURIComponent("https://example.com");
    expect(parseHandoffUrl(url)).toBe("https://example.com");
  });

  it("returns sharedText for simple text param", () => {
    expect(parseHandoffUrl("rabbit-hole://share?text=hello")).toBe("hello");
  });

  it("decodes selected text from handoff URL (extension selected-text handoff)", () => {
    const selected = "What is a disposable coffee cup?";
    const url = "rabbit-hole://share?text=" + encodeURIComponent(selected);
    expect(parseHandoffUrl(url)).toBe(selected);
  });

  it("returns null for wrong scheme", () => {
    expect(parseHandoffUrl("https://share?text=x")).toBeNull();
    expect(parseHandoffUrl("other://share?text=x")).toBeNull();
  });

  it("returns null for wrong host/path", () => {
    expect(parseHandoffUrl("rabbit-hole://other?text=x")).toBeNull();
  });

  it("returns null for empty or null input", () => {
    expect(parseHandoffUrl("")).toBeNull();
    expect(parseHandoffUrl(null as any)).toBeNull();
    expect(parseHandoffUrl(undefined as any)).toBeNull();
  });

  it("round-trips with extension buildHandoffUrl format", () => {
    const original = "https://example.com/page?q=1";
    const built = "rabbit-hole://share?text=" + encodeURIComponent(original);
    expect(parseHandoffUrl(built)).toBe(original);
  });
});
