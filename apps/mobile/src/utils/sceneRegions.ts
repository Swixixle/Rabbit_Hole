/**
 * Rabbit Hole Core Groundwork v5 — Interactive scene regions.
 * Many tappable regions per image; deterministic ids and conservative linking to candidate/entity/node.
 */
import type { RecognitionEnvelope, RecognitionCandidate, RecognitionCandidateSummary } from "../types/recognition";
import type { IdentifiedEntitySummary } from "../types/entityIdentification";
import type { KnowledgeNodeSummary } from "../types/knowledgeNodes";
import type {
  NormalizedBoundingBox,
  SceneObjectRegionKind,
  SceneObjectRegion,
  SceneObjectRegionSummary,
} from "../types/sceneRegions";
import { normalizeIdentifiedEntityTitle } from "./entityIdentification";

const SCENE_OBJECT_REGION_ID_PREFIX = "rh-scene-object-region|";
const BBOX_PRECISION = 4;

/** Normalize a segment for deterministic ids (no pipe). */
function normalizeIdSegment(s: string): string {
  return s.replace(/\|/g, "_");
}

/** Stable string for bounding box in ids. */
function bboxSegment(box: NormalizedBoundingBox): string {
  const x = Number(box.x.toFixed(BBOX_PRECISION));
  const y = Number(box.y.toFixed(BBOX_PRECISION));
  const w = Number(box.width.toFixed(BBOX_PRECISION));
  const h = Number(box.height.toFixed(BBOX_PRECISION));
  return `${x}|${y}|${w}|${h}`;
}

/**
 * Deterministic id for a scene object region. Same inputs always yield the same id.
 */
export function createSceneObjectRegionId(args: {
  envelopeId: string;
  regionKind: SceneObjectRegionKind;
  label: string;
  boundingBox: NormalizedBoundingBox;
}): string {
  const safeLabel = normalizeIdSegment(normalizeIdentifiedEntityTitle(args.label));
  const safeEnvelope = normalizeIdSegment(args.envelopeId);
  const box = bboxSegment(args.boundingBox);
  return `${SCENE_OBJECT_REGION_ID_PREFIX}${safeEnvelope}|${args.regionKind}|${safeLabel}|${box}`;
}

/**
 * Conservative mapping from recognition candidate type to scene region kind.
 * Richer kinds (material, plant, vehicle, apparel) come from raw detections later.
 */
export function mapCandidateTypeToSceneRegionKind(
  candidateType: RecognitionCandidate["candidateType"]
): SceneObjectRegionKind {
  return candidateType;
}

/**
 * Build scene object regions from raw detections. Optionally link to candidate/entity/node
 * by matching normalized label and compatible kind. Preserves input order; no sorting or filtering.
 */
export function deriveSceneObjectRegions(args: {
  envelope: RecognitionEnvelope;
  rawRegions: Array<{
    label: string;
    regionKind: SceneObjectRegionKind;
    confidence: number;
    boundingBox: NormalizedBoundingBox;
  }>;
  candidateSummary?: RecognitionCandidateSummary;
  identifiedEntitySummary?: IdentifiedEntitySummary;
  knowledgeNodeSummary?: KnowledgeNodeSummary;
  createdAt?: string;
}): SceneObjectRegionSummary {
  const {
    envelope,
    rawRegions,
    candidateSummary,
    identifiedEntitySummary,
    knowledgeNodeSummary,
    createdAt,
  } = args;
  const created = createdAt ?? new Date().toISOString();
  const regions: Record<string, SceneObjectRegion> = {};
  const regionIds: string[] = [];

  const normLabel = (s: string) => normalizeIdentifiedEntityTitle(s);

  for (const raw of rawRegions) {
    const id = createSceneObjectRegionId({
      envelopeId: envelope.id,
      regionKind: raw.regionKind,
      label: raw.label,
      boundingBox: raw.boundingBox,
    });
    if (regions[id]) continue;

    let recognitionCandidateId: string | null = null;
    let identifiedEntityId: string | null = null;
    let knowledgeNodeId: string | null = null;

    const rawNorm = normLabel(raw.label);

    if (candidateSummary) {
      for (const cid of candidateSummary.candidateIds) {
        const c = candidateSummary.candidates[cid];
        if (!c || c.envelopeId !== envelope.id) continue;
        if (normLabel(c.label) !== rawNorm) continue;
        if (mapCandidateTypeToSceneRegionKind(c.candidateType) !== raw.regionKind) continue;
        recognitionCandidateId = c.id;
        break;
      }
    }

    if (identifiedEntitySummary) {
      for (const eid of identifiedEntitySummary.entityIds) {
        const e = identifiedEntitySummary.entities[eid];
        if (!e || e.envelopeId !== envelope.id) continue;
        if (e.title !== rawNorm) continue;
        if (e.entityKind !== raw.regionKind) continue;
        identifiedEntityId = e.id;
        break;
      }
    }

    if (knowledgeNodeSummary) {
      for (const nid of knowledgeNodeSummary.nodeIds) {
        const n = knowledgeNodeSummary.nodes[nid];
        if (!n || n.envelopeId !== envelope.id) continue;
        if (n.title !== rawNorm) continue;
        if (n.nodeKind !== raw.regionKind) continue;
        knowledgeNodeId = n.id;
        break;
      }
    }

    regions[id] = {
      id,
      envelopeId: envelope.id,
      label: raw.label,
      regionKind: raw.regionKind,
      confidence: raw.confidence,
      boundingBox: raw.boundingBox,
      recognitionCandidateId,
      identifiedEntityId,
      knowledgeNodeId,
      createdAt: created,
    };
    regionIds.push(id);
  }

  return { regions, regionIds };
}

/** True if (x,y) is inside the box (inclusive of edges). */
export function isPointInsideNormalizedBoundingBox(
  x: number,
  y: number,
  boundingBox: NormalizedBoundingBox
): boolean {
  return (
    x >= boundingBox.x &&
    x <= boundingBox.x + boundingBox.width &&
    y >= boundingBox.y &&
    y <= boundingBox.y + boundingBox.height
  );
}

/** Area in normalized space (0–1 scale). */
export function computeNormalizedBoundingBoxArea(boundingBox: NormalizedBoundingBox): number {
  return boundingBox.width * boundingBox.height;
}
