/**
 * Rabbit Hole Core Groundwork v2 — Recognition Envelope System.
 * Universal ingestion shape for all input modalities. Envelopes are modality-normalized
 * capture records; candidates are raw recognition outputs. Neither are knowledge nodes yet.
 * Node conversion comes in a later step.
 */

/** Canonical top-level input modalities. */
export type RabbitHoleInputModality =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "media_context";

/** Where the input came from, not what it is. */
export type RabbitHoleCaptureSource =
  | "camera"
  | "upload"
  | "microphone"
  | "video_frame"
  | "share_sheet"
  | "manual_text"
  | "url";

/** Universal capture object. No interpretation or node fields. */
export type RecognitionEnvelope = {
  id: string;
  modality: RabbitHoleInputModality;
  captureSource: RabbitHoleCaptureSource;
  createdAt: string;
  inputRef: string;
  mimeType?: string;
  metadata?: Record<string, unknown>;
};

/** Raw recognition output. Not yet a node, claim, or source. */
export type RecognitionCandidate = {
  id: string;
  envelopeId: string;
  label: string;
  confidence: number;
  candidateType: "entity" | "topic" | "product" | "landmark" | "media";
};

/** Collection of candidates keyed by id with stable order. */
export type RecognitionCandidateSummary = {
  candidates: Record<string, RecognitionCandidate>;
  candidateIds: string[];
};

export const DEFAULT_RECOGNITION_CANDIDATE_SUMMARY: RecognitionCandidateSummary = {
  candidates: {},
  candidateIds: [],
};
