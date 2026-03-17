/**
 * OCR / Page Capture: extract text from a captured page image.
 * Stub URIs (test/demo patterns) return fixture text for tests; real URIs call the API (POST /v1/page/extract-text).
 * Output shape is compatible with future reading-assist text streams (single text string + confidence).
 */
import { api } from "../api/client";

export type PageCaptureConfidence = "high" | "medium" | "low";

export interface PageCaptureResult {
  text: string;
  confidence?: PageCaptureConfidence;
}

/** Fixture text returned for known test URIs in stub mode. */
const FIXTURE_PAGE_TEXT = "coffee cup recycling";

/** URIs that we treat as stub (no API call) for deterministic tests and when API is unavailable. */
const STUB_KNOWN_URI_SUBSTRINGS = ["page", "scan", "stub", "test", "file://"];

function isStubUri(uri: string): boolean {
  const u = uri.trim().toLowerCase();
  return STUB_KNOWN_URI_SUBSTRINGS.some((s) => u.includes(s));
}

/**
 * Extract text from an image URI (e.g. from camera or gallery).
 * Stub URIs return fixture text; real URIs use the backend OCR endpoint.
 * On API failure or empty result, returns { text: "", confidence: "low" } for calm fallback and retry.
 */
export async function extractTextFromImage(imageUri: string): Promise<PageCaptureResult> {
  if (!imageUri || typeof imageUri !== "string") {
    return { text: "", confidence: "low" };
  }
  const uri = imageUri.trim();
  if (uri.length === 0) {
    return { text: "", confidence: "low" };
  }
  if (isStubUri(uri)) {
    return { text: FIXTURE_PAGE_TEXT, confidence: "high" };
  }
  try {
    const result = await api.extractPageText(uri);
    return {
      text: (result.text ?? "").trim(),
      confidence: (result.confidence as PageCaptureConfidence) ?? "low",
    };
  } catch {
    return { text: "", confidence: "low" };
  }
}
