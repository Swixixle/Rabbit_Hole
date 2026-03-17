/**
 * Rabbit Hole v15 — Vision recognition API contract.
 * Recognition only; no claims/sources.
 */

/** v17 refinement: optional specificity cues from recognition (observational only, not provenance). */
export type VisionRecognitionResponse = {
  label: string;
  candidateType: "entity" | "product" | "landmark" | "topic" | "media";
  confidence?: number | null;
  alternativeLabels?: string[];
  visualDescription?: string;
  specificityHint?: string;
  likelyVariant?: string;
  observedText?: string[];
  lineageHints?: string[];
};

export type VisionRecognitionRequest = {
  imageUri: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};
