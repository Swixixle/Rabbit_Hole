/**
 * Rabbit Hole Clips v1: planning types for short vertical explainer clips.
 * No video export in v1; this is a scaffold for future rendering/export.
 */

export type ClipFrameKind = "title" | "insight" | "explanation" | "closing";

export interface ClipFrame {
  id: string;
  kind: ClipFrameKind;
  text: string;
  imageUrl?: string;
  durationMs?: number;
}

export interface ArticleClipPlan {
  articleId: string;
  title: string;
  frames: ClipFrame[];
  totalDurationMs?: number;
}

/** Default duration per frame kind for 10–20s total. */
export const DEFAULT_FRAME_DURATION_MS: Record<ClipFrameKind, number> = {
  title: 3000,
  insight: 4000,
  explanation: 4500,
  closing: 3000,
};

export const CLIP_CLOSING_TEXT = "Explore more in Rabbit Hole";
