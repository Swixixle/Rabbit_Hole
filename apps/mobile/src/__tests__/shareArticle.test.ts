/**
 * Share Surface v1: tests for payload building and URL generation.
 */
import {
  buildArticleSharePayload,
  formatShareMessage,
  getArticleShareUrl,
  getArticleSummary,
} from "../utils/shareArticle";

const BASE = "https://example.com/app";

describe("getArticleShareUrl", () => {
  it("returns deterministic URL from article id", () => {
    expect(getArticleShareUrl("art-1", BASE)).toBe("https://example.com/app/article/art-1");
    expect(getArticleShareUrl("art-1", BASE)).toBe(getArticleShareUrl("art-1", BASE));
  });

  it("encodes article id in path", () => {
    expect(getArticleShareUrl("art/2", BASE)).toContain("/article/art%2F2");
  });

  it("strips trailing slash from base", () => {
    expect(getArticleShareUrl("x", BASE + "/")).toBe("https://example.com/app/article/x");
  });
});

describe("getArticleSummary", () => {
  it("uses first summary block text when present", () => {
    const article = {
      id: "a",
      nodeId: "n",
      title: "Title",
      nodeType: "product",
      blocks: [
        { text: "Identification line", blockType: "identification" as const },
        { text: "One-sentence summary here.", blockType: "summary" as const },
        { text: "Context.", blockType: "context" as const },
      ],
    };
    expect(getArticleSummary(article as any)).toBe("One-sentence summary here.");
  });

  it("falls back to title when no summary block", () => {
    const article = {
      id: "a",
      nodeId: "n",
      title: "Coffee Supply Chain",
      nodeType: "product",
      blocks: [{ text: "Identification", blockType: "identification" as const }],
    };
    expect(getArticleSummary(article as any)).toBe("Coffee Supply Chain.");
  });

  it("falls back to 'Article.' when title and summary missing", () => {
    const article = {
      id: "a",
      nodeId: "n",
      title: "",
      nodeType: "product",
      blocks: [],
    };
    expect(getArticleSummary(article as any)).toBe("Article.");
  });
});

describe("buildArticleSharePayload", () => {
  it("builds payload from article with summary", () => {
    const article = {
      id: "art-123",
      nodeId: "node-1",
      title: "My Article",
      nodeType: "product",
      blocks: [
        { text: "Summary sentence.", blockType: "summary" as const },
      ],
    };
    const payload = buildArticleSharePayload(article as any, BASE);
    expect(payload.title).toBe("My Article");
    expect(payload.summary).toBe("Summary sentence.");
    expect(payload.url).toBe("https://example.com/app/article/art-123");
    expect(payload.teaser).toBeUndefined();
  });

  it("fallback when summary is missing uses title", () => {
    const article = {
      id: "art-456",
      nodeId: "node-2",
      title: "Fallback Title",
      nodeType: "product",
      blocks: [],
    };
    const payload = buildArticleSharePayload(article as any, BASE);
    expect(payload.summary).toBe("Fallback Title.");
    expect(payload.url).toBe("https://example.com/app/article/art-456");
  });

  it("includes teaser when experience exists", () => {
    const article = {
      id: "art-789",
      nodeId: "node-3",
      title: "System Article",
      nodeType: "product",
      blocks: [{ text: "Summary.", blockType: "summary" as const }],
      experience: {
        mode: "system_path" as const,
        steps: [{ id: "s1", label: "Step 1", shortTitle: "Step 1" }],
      },
    };
    const payload = buildArticleSharePayload(article as any, BASE);
    expect(payload.teaser).toBe("Follow the system");
  });
});

describe("formatShareMessage", () => {
  it("formats title, summary, url without teaser", () => {
    const payload = { title: "T", summary: "S", url: "https://u.co" };
    expect(formatShareMessage(payload)).toBe("T\n\nS\n\nhttps://u.co");
  });

  it("includes teaser between summary and url when present", () => {
    const payload = { title: "T", summary: "S", url: "https://u.co", teaser: "Follow the system" };
    expect(formatShareMessage(payload)).toBe("T\n\nS\n\nFollow the system\n\nhttps://u.co");
  });
});
