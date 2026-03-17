/**
 * Rabbit Hole v15 — Vision API client tests. Mocks fetch.
 */
import { recognizeRegionWithVisionApi } from "../utils/visionApi";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe("vision API client", () => {
  it("returns parsed response on successful JSON", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          label: "Sony WH-1000XM5",
          candidateType: "product",
          confidence: 0.93,
        }),
    });
    const result = await recognizeRegionWithVisionApi({
      imageUri: "file:///photo.jpg",
      boundingBox: { x: 0.2, y: 0.2, width: 0.2, height: 0.2 },
    });
    expect(result).not.toBeNull();
    expect(result?.label).toBe("Sony WH-1000XM5");
    expect(result?.candidateType).toBe("product");
    expect(result?.confidence).toBe(0.93);
  });

  it("returns null on malformed response (missing label)", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ candidateType: "product" }),
    });
    const result = await recognizeRegionWithVisionApi({
      imageUri: "file:///x.jpg",
      boundingBox: { x: 0, y: 0, width: 0.2, height: 0.2 },
    });
    expect(result).toBeNull();
  });

  it("returns null on malformed response (invalid candidateType)", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ label: "X", candidateType: "invalid" }),
    });
    const result = await recognizeRegionWithVisionApi({
      imageUri: "file:///x.jpg",
      boundingBox: { x: 0, y: 0, width: 0.2, height: 0.2 },
    });
    expect(result).toBeNull();
  });

  it("returns null on non-ok response", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false });
    const result = await recognizeRegionWithVisionApi({
      imageUri: "file:///x.jpg",
      boundingBox: { x: 0, y: 0, width: 0.2, height: 0.2 },
    });
    expect(result).toBeNull();
  });

  it("returns null on network failure", async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    const result = await recognizeRegionWithVisionApi({
      imageUri: "file:///x.jpg",
      boundingBox: { x: 0, y: 0, width: 0.2, height: 0.2 },
    });
    expect(result).toBeNull();
  });
});
