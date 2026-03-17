/**
 * Rabbit Hole Clips v1: display props for rendering a single clip frame.
 * Used by ClipCard and export; fallback when imageUrl is missing.
 */
import type { ClipFrameKind } from "../types/clipPlan";

export interface ClipFrameDisplayProps {
  id: string;
  kind: ClipFrameKind;
  text: string;
  imageUrl: string | null;
}

/**
 * Maps a clip plan's frames to display props for rendering.
 * imageUrl is set only when the frame has one; otherwise null (render text-only).
 */
export function getClipFrameDisplayProps(
  frames: Array<{ id: string; kind: ClipFrameKind; text: string; imageUrl?: string }>
): ClipFrameDisplayProps[] {
  return frames.map((f) => ({
    id: f.id,
    kind: f.kind,
    text: f.text,
    imageUrl: f.imageUrl ?? null,
  }));
}

/** Stable frame order for export: title, insight, explanation, closing. */
export const CLIP_FRAME_ORDER: ClipFrameKind[] = [
  "title",
  "insight",
  "explanation",
  "closing",
];

/**
 * Returns frames in the canonical render order (already the plan order; use for tests).
 */
export function getOrderedFramesForRender(
  frames: Array<{ id: string; kind: ClipFrameKind; text: string; imageUrl?: string }>
): typeof frames {
  const byKind = new Map(frames.map((f) => [f.kind, f]));
  return CLIP_FRAME_ORDER.map((k) => byKind.get(k)).filter(
    (f): f is NonNullable<typeof f> => f != null
  );
}
