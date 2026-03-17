/**
 * Rabbit Hole Core Groundwork v5 — Selectors for scene regions and tap hit-testing.
 */
import type { SceneObjectRegion, SceneObjectRegionSummary } from "../types/sceneRegions";
import type { ActiveSceneObjectPreview } from "../types/sceneRegions";
import type { SceneRegionSelectionResult } from "../types/sceneRegions";
import { isPointInsideNormalizedBoundingBox } from "./sceneRegions";
import { computeNormalizedBoundingBoxArea } from "./sceneRegions";

/** Regions for one envelope in stable regionIds order. */
export function selectSceneObjectRegionsForEnvelope(
  summary: SceneObjectRegionSummary,
  envelopeId: string
): SceneObjectRegion[] {
  const out: SceneObjectRegion[] = [];
  for (const id of summary.regionIds) {
    const r = summary.regions[id];
    if (r && r.envelopeId === envelopeId) out.push(r);
  }
  return out;
}

/** All regions for the envelope whose bounding boxes contain (x,y), in regionIds order. */
export function selectSceneObjectRegionsAtPoint(args: {
  summary: SceneObjectRegionSummary;
  envelopeId: string;
  x: number;
  y: number;
}): SceneObjectRegion[] {
  const { summary, envelopeId, x, y } = args;
  const out: SceneObjectRegion[] = [];
  for (const id of summary.regionIds) {
    const r = summary.regions[id];
    if (!r || r.envelopeId !== envelopeId) continue;
    if (isPointInsideNormalizedBoundingBox(x, y, r.boundingBox)) out.push(r);
  }
  return out;
}

/**
 * Primary region at point: smallest area, then higher confidence, then stable regionIds order.
 */
export function selectPrimarySceneObjectRegionAtPoint(args: {
  summary: SceneObjectRegionSummary;
  envelopeId: string;
  x: number;
  y: number;
}): SceneObjectRegion | null {
  const containing = selectSceneObjectRegionsAtPoint(args);
  if (containing.length === 0) return null;
  if (containing.length === 1) return containing[0];
  const idToIndex = new Map<string, number>();
  args.summary.regionIds.forEach((id, i) => idToIndex.set(id, i));
  const byPrecedence = containing
    .map((r) => ({
      r,
      area: computeNormalizedBoundingBoxArea(r.boundingBox),
      index: idToIndex.get(r.id) ?? 0,
    }))
    .sort((a, b) => {
      if (a.area !== b.area) return a.area - b.area;
      if (a.r.confidence !== b.r.confidence) return b.r.confidence - a.r.confidence;
      return a.index - b.index;
    });
  return byPrecedence[0].r;
}

/** Hit-test result: selected region or null. */
export function selectSceneRegionSelectionResult(args: {
  summary: SceneObjectRegionSummary;
  envelopeId: string;
  x: number;
  y: number;
}): SceneRegionSelectionResult {
  const selectedRegion = selectPrimarySceneObjectRegionAtPoint(args);
  return { selectedRegion };
}

/** App-facing preview for the object at the tap; null if none. */
export function selectActiveSceneObjectPreview(args: {
  summary: SceneObjectRegionSummary;
  envelopeId: string;
  x: number;
  y: number;
}): ActiveSceneObjectPreview | null {
  const r = selectPrimarySceneObjectRegionAtPoint(args);
  if (!r) return null;
  return {
    regionId: r.id,
    envelopeId: r.envelopeId,
    label: r.label,
    regionKind: r.regionKind,
    confidence: r.confidence,
    knowledgeNodeId: r.knowledgeNodeId,
  };
}
