/**
 * Rabbit Hole Core Groundwork v5 — Interactive Scene Regions.
 * A photo is a field of tappable regions; each region can resolve to a node.
 * Coordinates normalized 0–1 relative to image.
 */

/** Bounding box in normalized coordinates (0–1). */
export type NormalizedBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Scene-focused region kind; can be richer than recognition candidate types. */
export type SceneObjectRegionKind =
  | "entity"
  | "topic"
  | "product"
  | "landmark"
  | "media"
  | "material"
  | "plant"
  | "vehicle"
  | "apparel";

/** One tappable region in the image; may link to candidate/entity/node when resolved. */
export type SceneObjectRegion = {
  id: string;
  envelopeId: string;
  label: string;
  regionKind: SceneObjectRegionKind;
  confidence: number;
  boundingBox: NormalizedBoundingBox;
  recognitionCandidateId: string | null;
  identifiedEntityId: string | null;
  knowledgeNodeId: string | null;
  createdAt: string;
};

/** Collection of scene regions keyed by id with stable order. */
export type SceneObjectRegionSummary = {
  regions: Record<string, SceneObjectRegion>;
  regionIds: string[];
};

export const DEFAULT_SCENE_OBJECT_REGION_SUMMARY: SceneObjectRegionSummary = {
  regions: {},
  regionIds: [],
};

/** Currently selected region and envelope context. */
export type SelectedSceneObjectRegion = {
  regionId: string;
  envelopeId: string;
  selectedAt: string;
};

/** Result of hit-testing a tap: the selected region or null. */
export type SceneRegionSelectionResult = {
  selectedRegion: SceneObjectRegion | null;
};

/** App-facing preview payload for the currently tapped object. */
export type ActiveSceneObjectPreview = {
  regionId: string;
  envelopeId: string;
  label: string;
  regionKind: SceneObjectRegionKind;
  confidence: number;
  knowledgeNodeId: string | null;
};
