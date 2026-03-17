/**
 * Rabbit Hole Clips v1: tests for clip render payload and frame order.
 */
import {
  getClipFrameDisplayProps,
  getOrderedFramesForRender,
  CLIP_FRAME_ORDER,
} from "../utils/clipRender";
import type { ClipFrame } from "../types/clipPlan";

function frame(id: string, kind: ClipFrame["kind"], text: string, imageUrl?: string): ClipFrame {
  return { id, kind, text, imageUrl };
}

describe("clipRender", () => {
  describe("getClipFrameDisplayProps", () => {
    it("maps frames to display props with imageUrl when present", () => {
      const frames = [
        frame("f1", "title", "Title", "https://example.com/img.png"),
        frame("f2", "insight", "Insight"),
      ];
      const result = getClipFrameDisplayProps(frames);
      expect(result).toHaveLength(2);
      expect(result[0].imageUrl).toBe("https://example.com/img.png");
      expect(result[1].imageUrl).toBeNull();
    });

    it("uses null for imageUrl when missing (fallback for render)", () => {
      const frames = [
        frame("a", "title", "A"),
        frame("b", "closing", "Explore more"),
      ];
      const result = getClipFrameDisplayProps(frames);
      result.forEach((r) => expect(r.imageUrl).toBeNull());
    });

    it("preserves id, kind, text", () => {
      const frames = [frame("clip-1-explanation", "explanation", "Some context.")];
      const result = getClipFrameDisplayProps(frames);
      expect(result[0].id).toBe("clip-1-explanation");
      expect(result[0].kind).toBe("explanation");
      expect(result[0].text).toBe("Some context.");
    });
  });

  describe("getOrderedFramesForRender", () => {
    it("returns frames in stable order: title, insight, explanation, closing", () => {
      const frames = [
        frame("c", "closing", "Bye"),
        frame("a", "title", "Hi"),
        frame("b", "insight", "Key"),
        frame("d", "explanation", "Detail"),
      ];
      const ordered = getOrderedFramesForRender(frames);
      expect(ordered.map((f) => f.kind)).toEqual(CLIP_FRAME_ORDER);
      expect(ordered[0].text).toBe("Hi");
      expect(ordered[3].text).toBe("Bye");
    });

    it("filters out unknown kinds when present", () => {
      const frames = [
        frame("1", "title", "T"),
        frame("2", "closing", "C"),
      ];
      const ordered = getOrderedFramesForRender(frames);
      expect(ordered).toHaveLength(2);
      expect(ordered[0].kind).toBe("title");
      expect(ordered[1].kind).toBe("closing");
    });
  });

  describe("CLIP_FRAME_ORDER", () => {
    it("has four kinds in export order", () => {
      expect(CLIP_FRAME_ORDER).toEqual(["title", "insight", "explanation", "closing"]);
    });
  });
});
