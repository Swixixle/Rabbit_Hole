/**
 * Object Selection UX v1: hit-test helpers for segment selection.
 */
import { getSegmentIdAtPoint, isPointInSegment } from "../utils/segmentHitTest";

describe("getSegmentIdAtPoint", () => {
  const segments = [
    { segmentId: "seg-a", label: "A", bbox: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 } },
    { segmentId: "seg-b", label: "B", bbox: { x: 0.5, y: 0.2, width: 0.3, height: 0.4 } },
  ];

  it("returns segmentId when point is inside segment bbox", () => {
    expect(getSegmentIdAtPoint(segments as any, 0.2, 0.35)).toBe("seg-a");
    expect(getSegmentIdAtPoint(segments as any, 0.6, 0.35)).toBe("seg-b");
  });

  it("returns null when point is outside all segments", () => {
    expect(getSegmentIdAtPoint(segments as any, 0.05, 0.1)).toBeNull();
    expect(getSegmentIdAtPoint(segments as any, 0.9, 0.9)).toBeNull();
  });

  it("returns first matching segment when point is in overlap", () => {
    const withOverlap = [
      ...segments,
      { segmentId: "seg-c", label: "C", bbox: { x: 0.2, y: 0.25, width: 0.2, height: 0.2 } },
    ];
    expect(getSegmentIdAtPoint(withOverlap as any, 0.25, 0.35)).toBe("seg-a");
  });

  it("skips segments without bbox", () => {
    const noBbox = [{ segmentId: "seg-nobbox", label: "X" }];
    expect(getSegmentIdAtPoint(noBbox as any, 0.5, 0.5)).toBeNull();
  });

  it("returns null for empty or null segments", () => {
    expect(getSegmentIdAtPoint(null, 0.5, 0.5)).toBeNull();
    expect(getSegmentIdAtPoint([], 0.5, 0.5)).toBeNull();
  });
});

describe("isPointInSegment", () => {
  const segment = { segmentId: "seg-a", label: "A", bbox: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 } };

  it("returns true when point is inside segment bbox", () => {
    expect(isPointInSegment(segment as any, 0.2, 0.35)).toBe(true);
  });

  it("returns false when point is outside", () => {
    expect(isPointInSegment(segment as any, 0.05, 0.1)).toBe(false);
  });

  it("returns false when segment has no bbox", () => {
    expect(isPointInSegment({ segmentId: "x", label: "X" } as any, 0.5, 0.5)).toBe(false);
  });

  it("returns false when segment is null", () => {
    expect(isPointInSegment(null, 0.5, 0.5)).toBe(false);
  });
});
