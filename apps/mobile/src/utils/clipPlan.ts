/**
 * Rabbit Hole Clips v1: derive a clip plan from an article.
 * Deterministic, fixture-friendly. No video rendering or export.
 */
import type { Article, ArticleBlock } from "@rabbit-hole/contracts";
import type { ArticleClipPlan, ClipFrame } from "../types/clipPlan";
import {
  DEFAULT_FRAME_DURATION_MS,
  CLIP_CLOSING_TEXT,
} from "../types/clipPlan";
import { getArticleSummary } from "./shareArticle";

function firstSummaryBlock(blocks: ArticleBlock[]): ArticleBlock | undefined {
  return blocks.find((b) => b.blockType === "summary");
}

function firstContentOrContextBlock(blocks: ArticleBlock[]): ArticleBlock | undefined {
  return blocks.find((b) => b.blockType === "content" || b.blockType === "context");
}

/**
 * Builds a deterministic clip plan from article data.
 * Structure: title → insight (summary or key claim) → explanation → closing.
 * Target total duration 10–20 seconds.
 */
export function getArticleClipPlan(article: Article): ArticleClipPlan {
  const blocks = article.blocks || [];
  const summaryBlock = firstSummaryBlock(blocks);
  const summaryText = summaryBlock?.text?.trim() || getArticleSummary(article);
  const contentBlock = firstContentOrContextBlock(blocks);
  const rawExplanation = (contentBlock?.text?.trim() || summaryText) || "";
  const explanationText =
    rawExplanation.length > 120 ? rawExplanation.slice(0, 120) + "…" : rawExplanation;
  const title = article.title?.trim() || "Article";

  const frames: ClipFrame[] = [
    {
      id: `clip-${article.id}-title`,
      kind: "title",
      text: title,
      durationMs: DEFAULT_FRAME_DURATION_MS.title,
    },
    {
      id: `clip-${article.id}-insight`,
      kind: "insight",
      text: summaryText,
      durationMs: DEFAULT_FRAME_DURATION_MS.insight,
    },
    {
      id: `clip-${article.id}-explanation`,
      kind: "explanation",
      text: explanationText,
      durationMs: DEFAULT_FRAME_DURATION_MS.explanation,
    },
    {
      id: `clip-${article.id}-closing`,
      kind: "closing",
      text: CLIP_CLOSING_TEXT,
      durationMs: DEFAULT_FRAME_DURATION_MS.closing,
    },
  ];

  const totalDurationMs = frames.reduce(
    (sum, f) => sum + (f.durationMs ?? 0),
    0
  );

  return {
    articleId: article.id,
    title,
    frames,
    totalDurationMs,
  };
}
