/**
 * Rabbit Hole v11 — Pipeline trace and recognition selector tests.
 */
import type { SceneObjectRegion } from "../types/sceneRegions";
import type { PipelineTraceRecord } from "../types/pipelineTrace";
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { IdentifiedEntity } from "../types/entityIdentification";
import type { RecognitionCandidate } from "../types/recognition";
import {
  selectPipelineTraceForRegion,
  selectPipelineTraceForNode,
} from "../utils/pipelineTraceSelectors";
import {
  selectKnowledgeNodeForRegion,
  selectIdentifiedEntityForRegion,
  selectRecognitionCandidateForRegion,
} from "../utils/recognitionSelectors";
import { resolveKnowledgeNodeFromRegion } from "../utils/sceneRegionNodeResolver";

const CREATED = "2025-01-01T00:00:00Z";

function makeRegion(overrides: Partial<SceneObjectRegion> = {}): SceneObjectRegion {
  return {
    id: "region-1",
    envelopeId: "env-1",
    label: "Sony WH-1000XM5",
    regionKind: "product",
    confidence: 0.9,
    boundingBox: { x: 0.2, y: 0.2, width: 0.3, height: 0.3 },
    recognitionCandidateId: null,
    identifiedEntityId: null,
    knowledgeNodeId: null,
    createdAt: CREATED,
    ...overrides,
  };
}

function makeNode(
  id: string,
  envelopeId: string,
  identifiedEntityId: string
): KnowledgeNode {
  return {
    id,
    identifiedEntityId,
    envelopeId,
    title: "Sony WH-1000XM5",
    nodeKind: "product",
    description: null,
    relatedNodeIds: [],
    sourceIds: [],
    confidence: 0.9,
    createdAt: CREATED,
  };
}

function makeEntity(id: string, candidateId: string, envelopeId: string): IdentifiedEntity {
  return {
    id,
    envelopeId,
    candidateId,
    title: "Sony WH-1000XM5",
    entityKind: "product",
    confidence: 0.9,
    createdAt: CREATED,
  };
}

function makeCandidate(id: string, envelopeId: string): RecognitionCandidate {
  return {
    id,
    envelopeId,
    label: "Sony WH-1000XM5",
    confidence: 0.9,
    candidateType: "product",
  };
}

describe("pipeline trace", () => {
  describe("selectPipelineTraceForRegion", () => {
    it("returns envelopeId and optional pipeline IDs from region", () => {
      const region = makeRegion({
        envelopeId: "env-1",
        recognitionCandidateId: "cand-1",
        identifiedEntityId: "ent-1",
        knowledgeNodeId: "node-1",
      });
      const trace = selectPipelineTraceForRegion(region);
      expect(trace).toEqual({
        envelopeId: "env-1",
        candidateId: "cand-1",
        identifiedEntityId: "ent-1",
        knowledgeNodeId: "node-1",
      });
    });

    it("returns only envelopeId when region has no pipeline links", () => {
      const region = makeRegion({ recognitionCandidateId: null, identifiedEntityId: null, knowledgeNodeId: null });
      const trace = selectPipelineTraceForRegion(region);
      expect(trace).toEqual({ envelopeId: "env-1" });
    });
  });

  describe("selectPipelineTraceForNode", () => {
    it("traces node backward through entity and candidate when available", () => {
      const node = makeNode("node-1", "env-1", "ent-1");
      const entity = makeEntity("ent-1", "cand-1", "env-1");
      const candidate = makeCandidate("cand-1", "env-1");
      const trace = selectPipelineTraceForNode(
        "node-1",
        [node],
        [entity],
        [candidate]
      );
      expect(trace).not.toBeNull();
      expect(trace?.envelopeId).toBe("env-1");
      expect(trace?.candidateId).toBe("cand-1");
      expect(trace?.identifiedEntityId).toBe("ent-1");
      expect(trace?.knowledgeNodeId).toBe("node-1");
    });

    it("returns trace with envelopeId and nodeId when entity/candidate missing", () => {
      const node = makeNode("node-1", "env-1", "ent-missing");
      const trace = selectPipelineTraceForNode("node-1", [node], [], []);
      expect(trace).not.toBeNull();
      expect(trace?.envelopeId).toBe("env-1");
      expect(trace?.knowledgeNodeId).toBe("node-1");
      expect(trace?.identifiedEntityId).toBeUndefined();
      expect(trace?.candidateId).toBeUndefined();
    });

    it("returns null when node cannot be found", () => {
      const trace = selectPipelineTraceForNode("node-missing", [], [], []);
      expect(trace).toBeNull();
    });
  });
});

describe("recognition selectors", () => {
  describe("selectKnowledgeNodeForRegion", () => {
    it("returns same node as resolveKnowledgeNodeFromRegion", () => {
      const region = makeRegion({
        envelopeId: "env-1",
        recognitionCandidateId: "cand-1",
        identifiedEntityId: "ent-1",
        knowledgeNodeId: "node-1",
      });
      const node = makeNode("node-1", "env-1", "ent-1");
      const entity = makeEntity("ent-1", "cand-1", "env-1");
      const candidate = makeCandidate("cand-1", "env-1");
      const nodes = [node];
      const entities = [entity];
      const candidates = [candidate];

      const fromSelector = selectKnowledgeNodeForRegion(region, candidates, entities, nodes);
      const fromResolver = resolveKnowledgeNodeFromRegion(region, candidates, entities, nodes);
      expect(fromSelector).toBe(fromResolver);
      expect(fromSelector?.id).toBe("node-1");
    });

    it("returns null when region has no pipeline link and no matching data", () => {
      const region = makeRegion({ recognitionCandidateId: null, identifiedEntityId: null, knowledgeNodeId: null });
      const result = selectKnowledgeNodeForRegion(region, [], [], []);
      expect(result).toBeNull();
    });
  });

  describe("selectIdentifiedEntityForRegion", () => {
    it("returns entity when region.identifiedEntityId matches", () => {
      const region = makeRegion({ identifiedEntityId: "ent-1" });
      const entity = makeEntity("ent-1", "cand-1", "env-1");
      const result = selectIdentifiedEntityForRegion(region, [entity]);
      expect(result?.id).toBe("ent-1");
    });

    it("returns null when region has no identifiedEntityId", () => {
      const region = makeRegion({ identifiedEntityId: null });
      const result = selectIdentifiedEntityForRegion(region, []);
      expect(result).toBeNull();
    });
  });

  describe("selectRecognitionCandidateForRegion", () => {
    it("returns candidate when region.recognitionCandidateId matches", () => {
      const region = makeRegion({ recognitionCandidateId: "cand-1" });
      const candidate = makeCandidate("cand-1", "env-1");
      const result = selectRecognitionCandidateForRegion(region, [candidate]);
      expect(result?.id).toBe("cand-1");
    });

    it("returns null when region has no recognitionCandidateId", () => {
      const region = makeRegion({ recognitionCandidateId: null });
      const result = selectRecognitionCandidateForRegion(region, []);
      expect(result).toBeNull();
    });
  });
});

describe("sample data consistency", () => {
  it("demo region resolves through pipeline to Sony node", () => {
    const { getSampleSceneRegionSummary } = require("../data/sampleScene");
    const { getSampleRecognitionCandidates, getSampleIdentifiedEntities } = require("../data/sampleRecognition");
    const { getSampleNodes } = require("../data/sampleNodes");
    const { SAMPLE_ENVELOPE_ID_CONST } = require("../data/sampleNodes");
    const { selectSceneObjectRegionsForEnvelope } = require("../utils/sceneRegionSelectors");

    const summary = getSampleSceneRegionSummary();
    const regions = selectSceneObjectRegionsForEnvelope(summary, SAMPLE_ENVELOPE_ID_CONST);
    expect(regions.length).toBeGreaterThanOrEqual(1);
    const region = regions[0];
    const candidates = getSampleRecognitionCandidates();
    const entities = getSampleIdentifiedEntities();
    const nodes = getSampleNodes();

    const node = selectKnowledgeNodeForRegion(region, candidates, entities, nodes);
    expect(node).not.toBeNull();
    expect(node?.title).toBe("Sony WH-1000XM5");
    expect(node?.nodeKind).toBe("product");

    const trace = selectPipelineTraceForNode(node!.id, nodes, entities, candidates);
    expect(trace).not.toBeNull();
    expect(trace?.envelopeId).toBe(SAMPLE_ENVELOPE_ID_CONST);
    expect(trace?.knowledgeNodeId).toBe(node!.id);
    expect(trace?.candidateId).toBeDefined();
    expect(trace?.identifiedEntityId).toBeDefined();
  });
});
