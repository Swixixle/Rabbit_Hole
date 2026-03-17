/**
 * Rabbit Hole v14 — Manual scene region for captured images.
 * Tap-to-place; no fake confidence. Label may be "Unlabeled object" until user supplies one.
 */
import type { SceneObjectRegion } from "../types/sceneRegions";
import { createSceneObjectRegionId } from "./sceneRegions";

const DEFAULT_MANUAL_CONFIDENCE = 0.5;
const DEFAULT_LABEL = "Unlabeled object";
const CREATED = "2025-01-01T00:00:00Z";

export function createManualSceneObjectRegion(options: {
  envelopeId: string;
  label?: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  regionKind?: SceneObjectRegion["regionKind"];
  createdAt?: string;
}): SceneObjectRegion {
  const label = (options.label ?? DEFAULT_LABEL).trim() || DEFAULT_LABEL;
  const regionKind = options.regionKind ?? "entity";
  const created = options.createdAt ?? new Date().toISOString();
  const id = createSceneObjectRegionId({
    envelopeId: options.envelopeId,
    regionKind,
    label,
    boundingBox: options.boundingBox,
  });
  return {
    id,
    envelopeId: options.envelopeId,
    label,
    regionKind,
    confidence: DEFAULT_MANUAL_CONFIDENCE,
    boundingBox: options.boundingBox,
    recognitionCandidateId: null,
    identifiedEntityId: null,
    knowledgeNodeId: null,
    createdAt: created,
  };
}
