/**
 * Rabbit Hole — Sample scene regions for the first exploration loop.
 * One tappable region (Sony WH-1000XM5) linked through canonical pipeline (v11).
 */
import type { SceneObjectRegionSummary, SceneObjectRegion } from "../types/sceneRegions";
import { createSceneObjectRegionId } from "../utils/sceneRegions";
import { SAMPLE_ENVELOPE_ID_CONST } from "./sampleNodes";
import { createKnowledgeNodeId } from "../utils/knowledgeNodes";
import {
  SAMPLE_RECOGNITION_ENVELOPE_ID,
  SAMPLE_RECOGNITION_CANDIDATE_ID,
  SAMPLE_IDENTIFIED_ENTITY_ID,
} from "./sampleRecognition";

const CREATED = "2025-01-01T00:00:00Z";
const SONY_NODE_ID = createKnowledgeNodeId(SAMPLE_RECOGNITION_ENVELOPE_ID, "product", "Sony WH-1000XM5");

const regionId = createSceneObjectRegionId({
  envelopeId: SAMPLE_ENVELOPE_ID_CONST,
  regionKind: "product",
  label: "Sony WH-1000XM5",
  boundingBox: { x: 0.25, y: 0.2, width: 0.5, height: 0.35 },
});

const sampleSummary: SceneObjectRegionSummary = {
  regionIds: [regionId],
  regions: {
    [regionId]: {
      id: regionId,
      envelopeId: SAMPLE_ENVELOPE_ID_CONST,
      label: "Sony WH-1000XM5",
      regionKind: "product",
      confidence: 0.95,
      boundingBox: { x: 0.25, y: 0.2, width: 0.5, height: 0.35 },
      recognitionCandidateId: SAMPLE_RECOGNITION_CANDIDATE_ID,
      identifiedEntityId: SAMPLE_IDENTIFIED_ENTITY_ID,
      knowledgeNodeId: SONY_NODE_ID,
      createdAt: CREATED,
    },
  },
};

export function getSampleSceneRegionSummary(): SceneObjectRegionSummary {
  return sampleSummary;
}

export function getSampleSceneRegionsForEnvelope(envelopeId: string): SceneObjectRegion[] {
  if (envelopeId !== SAMPLE_ENVELOPE_ID_CONST) return [];
  return sampleSummary.regionIds.map((id) => sampleSummary.regions[id]);
}
