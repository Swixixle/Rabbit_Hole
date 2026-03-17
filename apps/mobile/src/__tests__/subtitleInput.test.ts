/**
 * Live subtitle groundwork: tests for subtitle input model, normalization, and routing compatibility.
 */
import {
  toSubtitleInput,
  normalizeSubtitleToSearchText,
  subtitleInputFromMediaTranscript,
  subtitleTextForIntake,
  type SubtitleInput,
  type SubtitleSegment,
} from "../utils/subtitleInput";
import { normalizeSharedInput, maybeExtractSearchString } from "../utils/sharedInput";

describe("toSubtitleInput", () => {
  it("builds SubtitleInput from plain text", () => {
    const out = toSubtitleInput("  some captions  ");
    expect(out.source).toBe("subtitle");
    expect(out.text).toBe("some captions");
    expect(out.segments).toBeUndefined();
  });

  it("includes segments when provided", () => {
    const segments: SubtitleSegment[] = [
      { startMs: 0, endMs: 1000, text: "Hello" },
      { startMs: 1000, endMs: 2000, text: "world" },
    ];
    const out = toSubtitleInput("Hello world", segments);
    expect(out.segments).toEqual(segments);
    expect(out.text).toBe("Hello world");
  });

  it("handles empty or non-string", () => {
    expect(toSubtitleInput("").text).toBe("");
    expect(toSubtitleInput((null as any)).text).toBe("");
  });
});

describe("normalizeSubtitleToSearchText", () => {
  it("returns normalized text for search pipeline", () => {
    const sub: SubtitleInput = { text: "  dialogue  here  ", source: "subtitle" };
    expect(normalizeSubtitleToSearchText(sub)).toBe("dialogue here");
  });

  it("returns empty for non-subtitle source", () => {
    const sub = { text: "x", source: "paste" as any };
    expect(normalizeSubtitleToSearchText(sub)).toBe("");
  });

  it("returns empty for empty subtitle text", () => {
    expect(normalizeSubtitleToSearchText({ text: "", source: "subtitle" })).toBe("");
    expect(normalizeSubtitleToSearchText({ text: "   ", source: "subtitle" })).toBe("");
  });
});

describe("subtitleInputFromMediaTranscript", () => {
  it("builds SubtitleInput from transcript blocks", () => {
    const blocks = [
      { id: "1", content: "First line", startMs: 0 },
      { id: "2", content: "Second line", startMs: 5000 },
    ];
    const out = subtitleInputFromMediaTranscript(blocks);
    expect(out.source).toBe("subtitle");
    expect(out.text).toBe("First line\nSecond line");
    expect(out.segments).toHaveLength(2);
    expect(out.segments![0]).toEqual({ startMs: 0, text: "First line" });
    expect(out.segments![1]).toEqual({ startMs: 5000, text: "Second line" });
  });

  it("returns empty SubtitleInput for empty blocks", () => {
    const out = subtitleInputFromMediaTranscript([]);
    expect(out.text).toBe("");
    expect(out.source).toBe("subtitle");
    expect(out.segments).toBeUndefined();
  });

  it("handles null/undefined blocks", () => {
    const out = subtitleInputFromMediaTranscript((null as any));
    expect(out.text).toBe("");
  });
});

describe("subtitleTextForIntake", () => {
  it("returns same string as normalizeSubtitleToSearchText for Share Intake routing", () => {
    const sub: SubtitleInput = { text: "  paste transcript  ", source: "subtitle" };
    expect(subtitleTextForIntake(sub)).toBe("paste transcript");
  });
});

describe("subtitle → Share Intake pipeline compatibility", () => {
  it("subtitle normalized text matches maybeExtractSearchString for same raw input", () => {
    const raw = "  same  query  ";
    const sub = toSubtitleInput(raw);
    const fromSubtitle = normalizeSubtitleToSearchText(sub);
    const fromShared = maybeExtractSearchString(raw);
    expect(fromSubtitle).toBe(fromShared);
  });

  it("empty or whitespace subtitle yields empty search string", () => {
    expect(normalizeSubtitleToSearchText(toSubtitleInput(""))).toBe("");
    expect(normalizeSubtitleToSearchText(toSubtitleInput("   "))).toBe("");
  });
});

describe("empty or malformed subtitle input", () => {
  it("empty string produces empty intake text", () => {
    expect(normalizeSubtitleToSearchText(toSubtitleInput(""))).toBe("");
  });

  it("whitespace-only produces empty intake text", () => {
    expect(normalizeSubtitleToSearchText(toSubtitleInput("  \n\t  "))).toBe("");
  });

  it("subtitle with segments but empty segment text still joins", () => {
    const out = subtitleInputFromMediaTranscript([
      { id: "1", content: "A" },
      { id: "2", content: "" },
      { id: "3", content: "B" },
    ]);
    expect(out.text).toBe("A\nB");
  });
});
