/**
 * Rabbit Hole — Seed sample nodes for the first exploration loop.
 * Used to demonstrate: tap object → node → explore connections.
 * Sony node is pipeline-linked via sampleRecognition (v11).
 */
import type { KnowledgeNode, RabbitHoleNodeKind } from "../types/knowledgeNodes";
import { createKnowledgeNodeId } from "../utils/knowledgeNodes";
import {
  SAMPLE_RECOGNITION_ENVELOPE_ID,
  SAMPLE_IDENTIFIED_ENTITY_ID,
} from "./sampleRecognition";

const SAMPLE_ENVELOPE_ID = SAMPLE_RECOGNITION_ENVELOPE_ID;
const CREATED = "2025-01-01T00:00:00Z";

function sampleNode(
  title: string,
  nodeKind: RabbitHoleNodeKind,
  description: string | null = null,
  identifiedEntityId?: string
): KnowledgeNode {
  const id = createKnowledgeNodeId(SAMPLE_ENVELOPE_ID, nodeKind, title);
  return {
    id,
    identifiedEntityId: identifiedEntityId ?? `sample-entity-${id}`,
    envelopeId: SAMPLE_ENVELOPE_ID,
    title,
    nodeKind,
    description,
    relatedNodeIds: [],
    sourceIds: [],
    confidence: 0.95,
    createdAt: CREATED,
    origin: "authored",
  };
}

const nodes: KnowledgeNode[] = [
  sampleNode(
    "Sony WH-1000XM5",
    "product",
    "Noise-cancelling wireless headphones.",
    SAMPLE_IDENTIFIED_ENTITY_ID
  ),
  sampleNode("Headphones", "topic", null),
  sampleNode("Sony", "entity", null),
  sampleNode("Bose QC Ultra", "product", null),
  sampleNode("Lithium battery", "entity", null),
  sampleNode("Sony Audio", "entity", null),
  sampleNode("Noise cancelling", "topic", null),
  sampleNode("Travel listening", "topic", null),
];

const nodesById = new Map(nodes.map((n) => [n.id, n]));

export const SAMPLE_ENVELOPE_ID_CONST = SAMPLE_ENVELOPE_ID;

export function getSampleNodes(): KnowledgeNode[] {
  return nodes;
}

export function getSampleNodeById(id: string): KnowledgeNode | undefined {
  return nodesById.get(id);
}

export function getSampleNodesById(): Map<string, KnowledgeNode> {
  return new Map(nodesById);
}
