/**
 * Rabbit Hole Core Groundwork v12 — Saved object tray substrate.
 * Saved objects are references to recognized scene regions, not ad hoc favorites.
 */

export type SavedObjectVerificationKind =
  | "verified"
  | "evidenced"
  | "recognition_only"
  | "unverified";

export type SavedObjectItem = {
  id: string;
  sourceEnvelopeId: string;
  sourceRegionId: string;
  recognitionCandidateId?: string;
  identifiedEntityId?: string;
  knowledgeNodeId?: string;
  label: string;
  savedAt: string;
  verificationKind: SavedObjectVerificationKind;
};

export type SavedObjectPreviewRef = {
  sourceEnvelopeId: string;
  sourceRegionId: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};
