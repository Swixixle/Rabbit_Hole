/**
 * OCR / Page Capture: tests for extractTextFromImage (stub path + API path) and routing behavior.
 */
import { extractTextFromImage } from "../utils/pageCapture";

const mockExtractPageText = jest.fn();

jest.mock("../api/client", () => ({
  api: {
    extractPageText: (...args: unknown[]) => mockExtractPageText(...args),
  },
}));

beforeEach(() => {
  mockExtractPageText.mockReset();
  // Default: non-stub URIs get empty from "API" (simulates no server or OCR failure)
  mockExtractPageText.mockResolvedValue({ text: "", confidence: "low" });
});

describe("extractTextFromImage (stub path)", () => {
  it("returns fixture text and high confidence for URIs containing known stub keywords", async () => {
    const known = [
      "file:///path/to/page.jpg",
      "file:///scan.png",
      "https://example.com/stub/image",
      "file:///test-scan.jpg",
    ];
    for (const uri of known) {
      const result = await extractTextFromImage(uri);
      expect(result.text).toBe("coffee cup recycling");
      expect(result.confidence).toBe("high");
    }
    expect(mockExtractPageText).not.toHaveBeenCalled();
  });

  it("matches file:// case-insensitively", async () => {
    const result = await extractTextFromImage("FILE:///tmp/image.PNG");
    expect(result.text).toBe("coffee cup recycling");
    expect(result.confidence).toBe("high");
    expect(mockExtractPageText).not.toHaveBeenCalled();
  });
});

describe("extractTextFromImage (API path)", () => {
  it("calls API for non-stub URIs and returns result", async () => {
    mockExtractPageText.mockResolvedValue({ text: "Hello world", confidence: "high" });
    const result = await extractTextFromImage("content://media/123.jpg");
    expect(mockExtractPageText).toHaveBeenCalledWith("content://media/123.jpg");
    expect(result.text).toBe("Hello world");
    expect(result.confidence).toBe("high");
  });

  it("returns empty text and low confidence when API returns empty", async () => {
    mockExtractPageText.mockResolvedValue({ text: "", confidence: "low" });
    const result = await extractTextFromImage("https://example.com/photo.jpg");
    expect(result.text).toBe("");
    expect(result.confidence).toBe("low");
  });

  it("returns empty text and low confidence when API rejects", async () => {
    mockExtractPageText.mockRejectedValue(new Error("Network error"));
    const result = await extractTextFromImage("https://example.com/photo.jpg");
    expect(result.text).toBe("");
    expect(result.confidence).toBe("low");
  });
});

describe("extractTextFromImage (input validation)", () => {
  it("returns empty text and low confidence for empty or invalid input", async () => {
    expect(await extractTextFromImage("")).toEqual({ text: "", confidence: "low" });
    expect(await extractTextFromImage("   ")).toEqual({ text: "", confidence: "low" });
    expect(mockExtractPageText).not.toHaveBeenCalled();
  });
});

describe("routing: extracted text is suitable for Share Intake", () => {
  it("stub returns trimmed plain text that can be passed to search pipeline", async () => {
    const result = await extractTextFromImage("file:///page.jpg");
    expect(result.text).toBe(result.text.trim());
    expect(typeof result.text).toBe("string");
    expect(result.text.length).toBeGreaterThan(0);
    expect(result.text).not.toMatch(/^https?:\/\//);
  });

  it("API result is trimmed and suitable for Share Intake", async () => {
    mockExtractPageText.mockResolvedValue({ text: "  some text  ", confidence: "medium" });
    const result = await extractTextFromImage("content:///real/capture.jpg");
    expect(result.text).toBe("some text");
    expect(result.confidence).toBe("medium");
  });
});

describe("empty/failed OCR fallback", () => {
  it("empty result has empty text so UI can show error and retry", async () => {
    const result = await extractTextFromImage("https://unknown.com/img.jpg");
    expect(result.text).toBe("");
    expect(result.confidence).toBe("low");
  });
});
