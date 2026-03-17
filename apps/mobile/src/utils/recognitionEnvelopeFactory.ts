/**
 * Rabbit Hole v14 — Create real RecognitionEnvelope from captured image.
 * No upload; no content inference. Local use only.
 */
import type { RecognitionEnvelope } from "../types/recognition";
import { createRecognitionEnvelope } from "./recognition";

export function createRecognitionEnvelopeFromCapturedImage(options: {
  imageUri: string;
  mimeType?: string;
  captureSource?: "camera";
  width?: number;
  height?: number;
}): RecognitionEnvelope {
  const metadata: Record<string, unknown> = {};
  if (options.width != null) metadata.width = options.width;
  if (options.height != null) metadata.height = options.height;

  return createRecognitionEnvelope({
    modality: "image",
    captureSource: options.captureSource ?? "camera",
    inputRef: options.imageUri,
    mimeType: options.mimeType,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  });
}
