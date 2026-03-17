/**
 * Rabbit Hole Core Groundwork v11 — Sample recognition pipeline data for demo.
 * One envelope (demo scene), one candidate (Sony WH-1000XM5), one identified entity.
 * IDs are canonical so sampleScene and sampleNodes can link through the pipeline.
 */
import type { RecognitionEnvelope, RecognitionCandidate } from "../types/recognition";
import type { IdentifiedEntity } from "../types/entityIdentification";
import {
  createRecognitionEnvelopeId,
  createRecognitionCandidateId,
} from "../utils/recognition";
import { createIdentifiedEntityId } from "../utils/entityIdentification";

const CREATED = "2025-01-01T00:00:00Z";
const SAMPLE_INPUT_REF = "sample";
const SAMPLE_ENVELOPE_ID = createRecognitionEnvelopeId("image", "upload", SAMPLE_INPUT_REF);

const envelope: RecognitionEnvelope = {
  id: SAMPLE_ENVELOPE_ID,
  modality: "image",
  captureSource: "upload",
  createdAt: CREATED,
  inputRef: SAMPLE_INPUT_REF,
};

const SONY_LABEL = "Sony WH-1000XM5";
const SAMPLE_CANDIDATE_ID = createRecognitionCandidateId(SAMPLE_ENVELOPE_ID, SONY_LABEL, "product");
const candidate: RecognitionCandidate = {
  id: SAMPLE_CANDIDATE_ID,
  envelopeId: SAMPLE_ENVELOPE_ID,
  label: SONY_LABEL,
  confidence: 0.95,
  candidateType: "product",
};

const SAMPLE_ENTITY_ID = createIdentifiedEntityId(
  SAMPLE_ENVELOPE_ID,
  SAMPLE_CANDIDATE_ID,
  "product",
  SONY_LABEL
);
const entity: IdentifiedEntity = {
  id: SAMPLE_ENTITY_ID,
  envelopeId: SAMPLE_ENVELOPE_ID,
  candidateId: SAMPLE_CANDIDATE_ID,
  title: SONY_LABEL,
  entityKind: "product",
  confidence: 0.95,
  createdAt: CREATED,
};

export const SAMPLE_RECOGNITION_ENVELOPE_ID = SAMPLE_ENVELOPE_ID;
export const SAMPLE_RECOGNITION_CANDIDATE_ID = SAMPLE_CANDIDATE_ID;
export const SAMPLE_IDENTIFIED_ENTITY_ID = SAMPLE_ENTITY_ID;

export function getSampleRecognitionEnvelopes(): RecognitionEnvelope[] {
  return [envelope];
}

export function getSampleRecognitionCandidates(): RecognitionCandidate[] {
  return [candidate];
}

export function getSampleIdentifiedEntities(): IdentifiedEntity[] {
  return [entity];
}
