/**
 * Object Selection UX v1: hit-test tap against segment bboxes (normalized 0-1).
 * Used to select a segment on first tap before confirming lookup.
 */
import type { ImageSegment } from "@rabbit-hole/contracts";

function pointInBbox(
  xNorm: number,
  yNorm: number,
  bbox: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    xNorm >= bbox.x &&
    xNorm <= bbox.x + bbox.width &&
    yNorm >= bbox.y &&
    yNorm <= bbox.y + bbox.height
  );
}

/**
 * Returns the segmentId of the first segment whose bbox contains the point, or null.
 * Segments without bbox are skipped.
 */
export function getSegmentIdAtPoint(
  segments: ImageSegment[] | null | undefined,
  xNorm: number,
  yNorm: number
): string | null {
  if (!segments?.length) return null;
  for (const s of segments) {
    if (s.bbox && pointInBbox(xNorm, yNorm, s.bbox)) return s.segmentId;
  }
  return null;
}

/**
 * Returns whether (xNorm, yNorm) is inside the given segment's bbox.
 */
export function isPointInSegment(
  segment: ImageSegment | null | undefined,
  xNorm: number,
  yNorm: number
): boolean {
  if (!segment?.bbox) return false;
  return pointInBbox(xNorm, yNorm, segment.bbox);
}
