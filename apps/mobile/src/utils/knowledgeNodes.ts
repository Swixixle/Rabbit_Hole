/**
 * Rabbit Hole Core Groundwork v4 — Knowledge node conversion helpers.
 * Converts IdentifiedEntity into the first canonical KnowledgeNode. IdentifiedEntity is
 * interpretation-ready but pre-node; KnowledgeNode is the first explorable object.
 * Branch generation, claim extraction, and source linking come later.
 */
import type {
  RabbitHoleEntityKind,
  IdentifiedEntity,
  IdentifiedEntitySummary,
} from "../types/entityIdentification";
import type {
  RabbitHoleNodeKind,
  KnowledgeNode,
  KnowledgeNodeSummary,
  NodeActionSlotKind,
} from "../types/knowledgeNodes";
import { normalizeIdentifiedEntityTitle } from "./entityIdentification";

const KNOWLEDGE_NODE_ID_PREFIX = "rh-knowledge-node|";

/** Normalize a segment for use in deterministic ids (no pipe so format stays parseable). */
function normalizeIdSegment(s: string): string {
  return s.replace(/\|/g, "_");
}

/**
 * Direct 1:1 mapping from entity kind to node kind. No inference in v4.
 */
export function mapEntityKindToNodeKind(
  entityKind: RabbitHoleEntityKind
): RabbitHoleNodeKind {
  return entityKind;
}

/**
 * Deterministic id for a knowledge node. Same inputs always yield the same id.
 */
export function createKnowledgeNodeId(
  envelopeId: string,
  nodeKind: RabbitHoleNodeKind,
  title: string
): string {
  const safeTitle = normalizeIdSegment(normalizeIdentifiedEntityTitle(title));
  const safeEnvelope = normalizeIdSegment(envelopeId);
  return `${KNOWLEDGE_NODE_ID_PREFIX}${safeEnvelope}|${nodeKind}|${safeTitle}`;
}

/**
 * Node description in v4: null. No generated prose or placeholder yet.
 */
export function deriveKnowledgeNodeDescription(
  _entity: IdentifiedEntity
): string | null {
  return null;
}

/**
 * Convert identified entities into knowledge nodes. Preserves entityIds order;
 * no sorting, filtering, or semantic enrichment. description = null,
 * relatedNodeIds = [], sourceIds = [] for all nodes in v4.
 */
export function deriveKnowledgeNodes(args: {
  identifiedEntitySummary: IdentifiedEntitySummary;
  createdAt?: string;
}): KnowledgeNodeSummary {
  const { identifiedEntitySummary, createdAt } = args;
  const created = createdAt ?? new Date().toISOString();
  const nodes: Record<string, KnowledgeNode> = {};
  const nodeIds: string[] = [];
  for (const entityId of identifiedEntitySummary.entityIds) {
    const entity = identifiedEntitySummary.entities[entityId];
    if (!entity) continue;
    const nodeKind = mapEntityKindToNodeKind(entity.entityKind);
    const id = createKnowledgeNodeId(entity.envelopeId, nodeKind, entity.title);
    if (nodes[id]) continue;
    nodes[id] = {
      id,
      identifiedEntityId: entity.id,
      envelopeId: entity.envelopeId,
      title: entity.title,
      nodeKind,
      description: deriveKnowledgeNodeDescription(entity),
      relatedNodeIds: [],
      sourceIds: [],
      confidence: entity.confidence,
      createdAt: created,
    };
    nodeIds.push(id);
  }
  return { nodes, nodeIds };
}

/**
 * v5 — Default action slot kinds per node kind. No full action records yet;
 * live retailer links and live prices come later. This prepares branch expectations.
 */
export function deriveDefaultNodeActionSlotKinds(node: KnowledgeNode): NodeActionSlotKind[] {
  switch (node.nodeKind) {
    case "landmark":
      return ["learn", "history", "context", "source"];
    case "product":
      return ["learn", "compare", "market", "materials", "uses", "alternatives", "diy"];
    case "media":
      return ["learn", "context", "source"];
    case "topic":
    case "entity":
      return ["learn", "context", "source"];
    default:
      return ["learn", "context", "source"];
  }
}
