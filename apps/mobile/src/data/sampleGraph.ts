/**
 * Rabbit Hole — Seed sample graph for the first exploration loop.
 * Provides graph edge data only. "Related" is a view over this graph via exploration selectors.
 */
import type { EntityGraphEdge } from "../types/entityGraph";
import { getSampleNodeById } from "./sampleNodes";
import { createKnowledgeNodeId } from "../utils/knowledgeNodes";

const SAMPLE_ENVELOPE_ID = "rh-recognition-envelope|image|upload|sample";
const CREATED = "2025-01-01T00:00:00Z";

function nodeId(title: string, kind: string): string {
  return createKnowledgeNodeId(SAMPLE_ENVELOPE_ID, kind as any, title);
}

function edge(
  sourceTitle: string,
  sourceKind: string,
  targetTitle: string,
  targetKind: string,
  relationType: EntityGraphEdge["relationType"]
): EntityGraphEdge {
  const sourceNodeId = nodeId(sourceTitle, sourceKind);
  const targetNodeId = nodeId(targetTitle, targetKind);
  return {
    id: `sample-edge|${sourceNodeId}|${targetNodeId}|${relationType}`,
    sourceNodeId,
    targetNodeId,
    relationType,
    confidence: 0.9,
    createdAt: CREATED,
  };
}

const edges: EntityGraphEdge[] = [
  edge("Sony WH-1000XM5", "product", "Headphones", "topic", "is_a"),
  edge("Sony WH-1000XM5", "product", "Sony", "entity", "produced_by"),
  edge("Sony WH-1000XM5", "product", "Bose QC Ultra", "product", "alternative_to"),
  edge("Sony WH-1000XM5", "product", "Lithium battery", "entity", "made_of"),
  edge("Headphones", "topic", "Sony Audio", "entity", "related_to"),
  edge("Sony WH-1000XM5", "product", "Noise cancelling", "topic", "related_to"),
  edge("Sony WH-1000XM5", "product", "Travel listening", "topic", "used_for"),
];

export function getSampleGraphEdges(): EntityGraphEdge[] {
  return edges;
}

/**
 * @deprecated v7 — Related is a presentation mode over the graph. Use selectExplorationTargetsForNode(node, nodes, getSampleGraphEdges()) instead.
 * Get target node ids that are related to the given node (outgoing edges).
 */
export function getRelatedNodeIdsFromSampleGraph(nodeId: string): string[] {
  const targetIds = edges
    .filter((e) => e.sourceNodeId === nodeId)
    .map((e) => e.targetNodeId);
  return [...new Set(targetIds)];
}

/**
 * @deprecated v7 — Related is a presentation mode over the graph. Use selectExplorationTargetsForNode + ExplorationTargetList instead.
 * Get related nodes (resolved) for a given node id.
 */
export function getRelatedSampleNodes(nodeId: string): Array<{ nodeId: string; title: string }> {
  const relatedIds = getRelatedNodeIdsFromSampleGraph(nodeId);
  return relatedIds
    .map((id) => {
      const node = getSampleNodeById(id);
      return node ? { nodeId: id, title: node.title } : null;
    })
    .filter((x): x is { nodeId: string; title: string } => x != null);
}
