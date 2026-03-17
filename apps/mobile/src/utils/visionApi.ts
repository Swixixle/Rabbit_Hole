/**
 * Rabbit Hole v15 — Vision recognition API client.
 * Sends image + bounding box to backend; returns structured candidate or null on failure.
 */
import type { VisionRecognitionRequest, VisionRecognitionResponse } from "../types/visionApi";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
const VISION_RECOGNIZE_PATH = "/v1/vision/recognize-region";

/**
 * Call backend to recognize object in image region.
 * Uses multipart: file (image) + boundingBox (JSON string) so device file URIs work.
 * Returns null on network/parse failure; does not throw into UI.
 */
export async function recognizeRegionWithVisionApi(
  request: VisionRecognitionRequest
): Promise<VisionRecognitionResponse | null> {
  try {
    const form = new FormData();
    form.append("file", {
      uri: request.imageUri,
      type: "image/jpeg",
      name: "region.jpg",
    } as any);
    form.append(
      "boundingBox",
      JSON.stringify({
        x: request.boundingBox.x,
        y: request.boundingBox.y,
        width: request.boundingBox.width,
        height: request.boundingBox.height,
      })
    );
    const res = await fetch(`${API_BASE}${VISION_RECOGNIZE_PATH}`, {
      method: "POST",
      body: form,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!isValidVisionResponse(data)) return null;
    return data as VisionRecognitionResponse;
  } catch {
    return null;
  }
}

function isValidVisionResponse(value: unknown): value is VisionRecognitionResponse {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.label !== "string") return false;
  const validTypes = ["entity", "product", "landmark", "topic", "media"];
  if (!validTypes.includes(o.candidateType as string)) return false;
  if (o.confidence != null && typeof o.confidence !== "number") return false;
  if (o.visualDescription != null && typeof o.visualDescription !== "string") return false;
  if (o.specificityHint != null && typeof o.specificityHint !== "string") return false;
  if (o.likelyVariant != null && typeof o.likelyVariant !== "string") return false;
  if (o.observedText != null && !Array.isArray(o.observedText)) return false;
  if (o.lineageHints != null && !Array.isArray(o.lineageHints)) return false;
  return true;
}
