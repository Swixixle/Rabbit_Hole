/**
 * Rabbit Hole v17 — Generated knowledge mapping tests.
 */
import {
  createGeneratedKnowledgeNode,
  createGeneratedClaimsForNode,
} from "../utils/generatedKnowledgeMapping";
import { getSampleNodes } from "../data/sampleNodes";
import { resolveKnowledgeNodeForManualEntity } from "../utils/manualRecognition";
import {
  addGeneratedNode,
  setGeneratedClaimsForNode,
  getGeneratedNodeById,
  getGeneratedClaimsForNode,
} from "../data/generatedKnowledgeStore";
import { getNodeById } from "../utils/nodeResolution";

const mockResponse = {
  title: "Wireless Earbuds",
  description: "A small personal audio device worn in the ear.",
  nodeKind: "product" as const,
  claims: [
    { text: "Often used for music and calls.", claimKind: "functional" as const, confidence: 0.8 },
    { text: "Typically battery-powered.", claimKind: "material" as const, confidence: null },
  ],
  suggestedRelations: [],
};

describe("generated knowledge mapping", () => {
  it("maps response to KnowledgeNode with origin = generated", () => {
    const node = createGeneratedKnowledgeNode({
      envelopeId: "env-1",
      identifiedEntityId: "entity-1",
      response: mockResponse,
    });
    expect(node.origin).toBe("generated");
    expect(node.title).toBe("Wireless Earbuds");
    expect(node.nodeKind).toBe("product");
    expect(node.description).toBe("A small personal audio device worn in the ear.");
    expect(node.relatedNodeIds).toEqual([]);
    expect(node.sourceIds).toEqual([]);
  });

  it("creates generated claims attached to node with no sources", () => {
    const node = createGeneratedKnowledgeNode({
      envelopeId: "env-1",
      identifiedEntityId: "entity-1",
      response: mockResponse,
    });
    const claims = createGeneratedClaimsForNode({ nodeId: node.id, claims: mockResponse.claims });
    expect(claims.length).toBe(2);
    claims.forEach((c) => {
      expect(c.nodeId).toBe(node.id);
      expect(c.text).toBeDefined();
      expect(c.claimKind).toBeDefined();
      expect(c.id).toMatch(/^gen-claim-/);
    });
    expect(claims[0].confidence).toBe(0.8);
    expect(claims[1].confidence).toBe(0);
  });

  it("authored node wins when exact match exists", () => {
    const nodes = getSampleNodes();
    const authored = resolveKnowledgeNodeForManualEntity("Sony WH-1000XM5", nodes);
    expect(authored).not.toBeNull();
    expect(authored!.origin).toBe("authored");
    expect(authored!.title).toBe("Sony WH-1000XM5");
  });

  it("generated node title uses backend response title for specific identity", () => {
    const specificResponse = {
      ...mockResponse,
      title: "Sony WH-1000XM5",
      description: "Sony flagship over-ear noise-cancelling headphones.",
    };
    const node = createGeneratedKnowledgeNode({
      envelopeId: "env-1",
      identifiedEntityId: "entity-1",
      response: specificResponse,
    });
    expect(node.title).toBe("Sony WH-1000XM5");
    expect(node.description).toContain("noise-cancelling");
  });

  it("getNodeById resolves generated node after store registration", () => {
    const node = createGeneratedKnowledgeNode({
      envelopeId: "env-99",
      identifiedEntityId: "entity-99",
      response: mockResponse,
    });
    addGeneratedNode(node);
    const claims = createGeneratedClaimsForNode({ nodeId: node.id, claims: mockResponse.claims });
    setGeneratedClaimsForNode(node.id, claims);

    expect(getGeneratedNodeById(node.id)).toEqual(node);
    expect(getGeneratedClaimsForNode(node.id)).toHaveLength(2);
    expect(getNodeById(node.id)).toEqual(node);
  });
});
