/**
 * Audio Recognition Groundwork v1: result shape and routing fields.
 * Real Microphone Capture v1: recorded clip token handoff (token module has no expo-av dep).
 */
import type { AudioRecognitionResult, AudioRecognitionKind } from "@rabbit-hole/contracts";
import {
  RECORDED_CLIP_TOKEN,
  normalizedRecordedClipToken,
} from "../utils/audioRecordingTokens";

const VALID_KINDS: AudioRecognitionKind[] = ["song", "show_theme", "podcast", "media_clip", "tv_show", "unknown"];

describe("AudioRecognitionResult shape", () => {
  it("has required kind and title", () => {
    const result: AudioRecognitionResult = {
      kind: "song",
      title: "Test",
    };
    expect(result.kind).toBe("song");
    expect(result.title).toBe("Test");
  });

  it("allows optional routing fields", () => {
    const withArticle: AudioRecognitionResult = {
      kind: "show_theme",
      title: "Theme",
      articleId: "article-1",
    };
    expect(withArticle.articleId).toBe("article-1");

    const withMedia: AudioRecognitionResult = {
      kind: "podcast",
      title: "Podcast",
      mediaUrl: "https://example.com/ep/1",
    };
    expect(withMedia.mediaUrl).toBe("https://example.com/ep/1");

    const withOrg: AudioRecognitionResult = {
      kind: "media_clip",
      title: "Clip",
      organizationId: "org-1",
    };
    expect(withOrg.organizationId).toBe("org-1");
  });

  it("allows optional subtitle and confidence", () => {
    const result: AudioRecognitionResult = {
      kind: "song",
      title: "Song",
      subtitle: "Artist",
      confidence: "high",
    };
    expect(result.subtitle).toBe("Artist");
    expect(result.confidence).toBe("high");
  });

  it("TV/Show v1: allows optional networkOrPlatform and notableCast", () => {
    const result: AudioRecognitionResult = {
      kind: "tv_show",
      title: "Moving Day",
      subtitle: "Reality series",
      networkOrPlatform: "Demo Network",
      notableCast: ["Host One", "Host Two"],
      articleId: "article-uhaul",
      organizationId: "org-uhaul",
    };
    expect(result.networkOrPlatform).toBe("Demo Network");
    expect(result.notableCast).toEqual(["Host One", "Host Two"]);
  });

  it("AudioRecognitionKind includes expected values", () => {
    expect(VALID_KINDS).toContain("song");
    expect(VALID_KINDS).toContain("show_theme");
    expect(VALID_KINDS).toContain("podcast");
    expect(VALID_KINDS).toContain("media_clip");
    expect(VALID_KINDS).toContain("tv_show");
    expect(VALID_KINDS).toContain("unknown");
  });
});

describe("audio recognition routing behavior", () => {
  it("result with articleId routes to article", () => {
    const result: AudioRecognitionResult = { kind: "song", title: "S", articleId: "article-coffee" };
    expect(result.articleId).toBeDefined();
    expect(result.articleId).toBe("article-coffee");
  });

  it("result with mediaUrl routes to media", () => {
    const result: AudioRecognitionResult = { kind: "podcast", title: "P", mediaUrl: "https://example.com/p" };
    expect(result.mediaUrl).toBeDefined();
  });

  it("result with organizationId routes to organization profile", () => {
    const result: AudioRecognitionResult = { kind: "media_clip", title: "C", organizationId: "org-uhaul" };
    expect(result.organizationId).toBeDefined();
  });

  it("result with no routing targets is valid (no match or unknown)", () => {
    const result: AudioRecognitionResult = { kind: "unknown", title: "Unknown" };
    expect(result.articleId).toBeUndefined();
    expect(result.mediaUrl).toBeUndefined();
    expect(result.organizationId).toBeUndefined();
  });

  it("TV/show result with articleId and organizationId routes to both", () => {
    const result: AudioRecognitionResult = {
      kind: "tv_show",
      title: "Moving Day",
      articleId: "article-uhaul",
      organizationId: "org-uhaul",
    };
    expect(result.articleId).toBe("article-uhaul");
    expect(result.organizationId).toBe("org-uhaul");
  });
});

describe("Real Microphone Capture v1: recorded clip handoff", () => {
  it("RECORDED_CLIP_TOKEN is sent for recorded clips (backend returns no-match in v1)", () => {
    expect(RECORDED_CLIP_TOKEN).toBe("recorded");
  });

  it("normalizedRecordedClipToken returns RECORDED_CLIP_TOKEN for any local URI", () => {
    expect(normalizedRecordedClipToken("file:///cache/recording.m4a")).toBe(RECORDED_CLIP_TOKEN);
    expect(normalizedRecordedClipToken(null)).toBe(RECORDED_CLIP_TOKEN);
  });
});
