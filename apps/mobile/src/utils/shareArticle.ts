/**
 * Share Surface v1: build normalized share payload from an article.
 * Distribution layer only; no account linking or per-platform integrations.
 */
import type { Article, ArticleBlock, ArticleSharePayload } from "@rabbit-hole/contracts";

const DEFAULT_SHARE_BASE_URL = "https://app.example.com";

/**
 * Builds deterministic canonical URL for an article (deep link).
 * Uses article.id so the same article always produces the same URL.
 */
export function getArticleShareUrl(articleId: string, baseUrl?: string): string {
  const base = baseUrl || process.env.EXPO_PUBLIC_APP_URL || DEFAULT_SHARE_BASE_URL;
  const path = base.replace(/\/$/, "") + "/article/" + encodeURIComponent(articleId);
  return path;
}

/**
 * Derives one-sentence summary from article: first summary block text, or safe fallback from title.
 */
export function getArticleSummary(article: Article): string {
  const summaryBlock = (article.blocks || []).find((b: ArticleBlock) => b.blockType === "summary");
  if (summaryBlock?.text?.trim()) return summaryBlock.text.trim();
  return article.title?.trim() ? `${article.title.trim()}.` : "Article.";
}

/**
 * Builds normalized ArticleSharePayload from an article.
 */
export function buildArticleSharePayload(
  article: Article,
  baseUrl?: string
): ArticleSharePayload {
  const summary = getArticleSummary(article);
  const url = getArticleShareUrl(article.id, baseUrl);
  const payload: ArticleSharePayload = {
    title: article.title?.trim() || "Article",
    summary,
    url,
  };
  if (article.experience?.steps?.length) {
    payload.teaser = "Follow the system";
  }
  return payload;
}

/**
 * Formats payload as shared text: title, summary, optional teaser, url.
 */
export function formatShareMessage(payload: ArticleSharePayload): string {
  const parts = [payload.title, payload.summary];
  if (payload.teaser) parts.push(payload.teaser);
  parts.push(payload.url);
  return parts.join("\n\n");
}
