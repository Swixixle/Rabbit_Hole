/**
 * Landmark Recognition Groundwork v1 — visual capture and interpretation types.
 * Feeds the same epistemic spine: Claim → Confidence → Support → Source → Organization.
 * No ML models; pipeline infrastructure only.
 */

/** Source of the visual input. */
export type VisualCaptureSource = "camera" | "upload" | "video_frame";

/** Raw visual input entering the system. No interpretation fields. */
export type VisualCapture = {
  id: string;
  createdAt: string;
  source: VisualCaptureSource;
  uri: string;
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
};

/** Raw recognition output (candidates, not claims). */
export type VisualRecognitionCandidate = {
  id: string;
  captureId: string;
  label: string;
  confidence: number;
};

/** Connects recognition to the epistemic pipeline. Entry point for interpretation. */
export type LandmarkInterpretation = {
  id: string;
  captureId: string;
  candidateId: string;
  entityName: string;
  confidence: number;
};

/** Claim placeholder derived from landmark interpretation. Feeds knowledge surface. */
export type LandmarkClaimPlaceholder = {
  id: string;
  interpretationId: string;
  text: string;
  confidence: number;
};
