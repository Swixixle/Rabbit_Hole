/**
 * Rabbit Hole Clips v1: tests for clip plan derivation.
 */
import { getArticleClipPlan } from "../utils/clipPlan";
import { CLIP_CLOSING_TEXT } from "../types/clipPlan";
import type { Article } from "@rabbit-hole/contracts";

function article(overrides: Partial<Article>): Article {
  return {
    id: "art-1",
    nodeId: "node-1",
    title: "Test Article",
    nodeType: "product",
    blocks: [],
    ...overrides,
  };
}

describe("getArticleClipPlan", () => {
  it("derives clip plan from article with summary", () => {
    const a = article({
      id: "art-coffee",
      title: "Disposable coffee cups",
      blocks: [
        { text: "A disposable cup.", blockType: "identification" },
        { text: "One-sentence summary here.", blockType: "summary" },
        { text: "Some context and content.", blockType: "content" },
      ],
    });
    const plan = getArticleClipPlan(a as Article);
    expect(plan.articleId).toBe("art-coffee");
    expect(plan.title).toBe("Disposable coffee cups");
    expect(plan.frames).toHaveLength(4);
    expect(plan.frames[0].kind).toBe("title");
    expect(plan.frames[0].text).toBe("Disposable coffee cups");
    expect(plan.frames[1].kind).toBe("insight");
    expect(plan.frames[1].text).toBe("One-sentence summary here.");
    expect(plan.frames[2].kind).toBe("explanation");
    expect(plan.frames[3].kind).toBe("closing");
    expect(plan.frames[3].text).toBe(CLIP_CLOSING_TEXT);
  });

  it("fallback when summary missing uses getArticleSummary (title or Article.)", () => {
    const a = article({
      blocks: [{ text: "Identification only.", blockType: "identification" }],
      title: "Fallback Title",
    });
    const plan = getArticleClipPlan(a as Article);
    expect(plan.frames[1].kind).toBe("insight");
    expect(plan.frames[1].text).toBe("Fallback Title.");
    expect(plan.frames[2].text).toBe("Fallback Title.");
  });

  it("frame order is stable: title, insight, explanation, closing", () => {
    const a = article({
      blocks: [
        { text: "Sum.", blockType: "summary" },
        { text: "Content.", blockType: "content" },
      ],
    });
    const plan = getArticleClipPlan(a as Article);
    const kinds = plan.frames.map((f) => f.kind);
    expect(kinds).toEqual(["title", "insight", "explanation", "closing"]);
  });

  it("total duration is within 10–20 seconds", () => {
    const a = article({
      blocks: [{ text: "Summary.", blockType: "summary" }],
    });
    const plan = getArticleClipPlan(a as Article);
    expect(plan.totalDurationMs).toBeDefined();
    expect(plan.totalDurationMs!).toBeGreaterThanOrEqual(10_000);
    expect(plan.totalDurationMs!).toBeLessThanOrEqual(20_000);
  });

  it("total duration equals sum of frame durations", () => {
    const a = article({
      blocks: [{ text: "S.", blockType: "summary" }],
    });
    const plan = getArticleClipPlan(a as Article);
    const sum = plan.frames.reduce((s, f) => s + (f.durationMs ?? 0), 0);
    expect(plan.totalDurationMs).toBe(sum);
  });

  it("explanation truncates long content with ellipsis", () => {
    const long = "a".repeat(150);
    const a = article({
      blocks: [
        { text: "Short summary.", blockType: "summary" },
        { text: long, blockType: "content" },
      ],
    });
    const plan = getArticleClipPlan(a as Article);
    const explanation = plan.frames[2];
    expect(explanation.text).toHaveLength(121);
    expect(explanation.text.endsWith("…")).toBe(true);
  });

  it("no imageUrl set when article has no image", () => {
    const a = article({ blocks: [{ text: "S.", blockType: "summary" }] });
    const plan = getArticleClipPlan(a as Article);
    plan.frames.forEach((f) => expect(f.imageUrl).toBeUndefined());
  });
});
