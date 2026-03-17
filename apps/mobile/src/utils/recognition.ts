/**
 * Rabbit Hole Core Groundwork v2 — Recognition envelope helpers.
 * Envelopes are modality-normalized capture records; candidates are raw recognition
 * outputs. Neither envelopes nor candidates are yet knowledge nodes; node conversion
 * comes in a later step.
 */
import type {
  RabbitHoleInputModality,
  RabbitHoleCaptureSource,
  RecognitionEnvelope,
  RecognitionCandidate,
  RecognitionCandidateSummary,
} from "../types/recognition";

const ENVELOPE_ID_PREFIX = "rh-recognition-envelope|";
const CANDIDATE_ID_PREFIX = "rh-recognition-candidate|";

/** Normalize a segment for use in deterministic ids (no pipe so format stays parseable). */
function normalizeIdSegment(s: string): string {
  return s.replace(/\|/g, "_");
}

/**
 * Deterministic id for a recognition envelope.
 * Same modality + captureSource + inputRef always yields the same id.
 */
export function createRecognitionEnvelopeId(
  modality: RabbitHoleInputModality,
  captureSource: RabbitHoleCaptureSource,
  inputRef: string
): string {
  return `${ENVELOPE_ID_PREFIX}${modality}|${captureSource}|${normalizeIdSegment(inputRef)}`;
}

/**
 * Deterministic id for a recognition candidate.
 * Same envelopeId + label + candidateType always yields the same id.
 */
export function createRecognitionCandidateId(
  envelopeId: string,
  label: string,
  candidateType: RecognitionCandidate["candidateType"]
): string {
  const safeLabel = normalizeIdSegment(label);
  const safeEnvelope = normalizeIdSegment(envelopeId);
  return `${CANDIDATE_ID_PREFIX}${safeEnvelope}|${candidateType}|${safeLabel}`;
}

/**
 * Build a normalized RecognitionEnvelope. Uses deterministic id; createdAt defaults to now (ISO).
 */
export function createRecognitionEnvelope(args: {
  modality: RabbitHoleInputModality;
  captureSource: RabbitHoleCaptureSource;
  inputRef: string;
  mimeType?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}): RecognitionEnvelope {
  const id = createRecognitionEnvelopeId(
    args.modality,
    args.captureSource,
    args.inputRef
  );
  const createdAt =
    args.createdAt ?? new Date().toISOString();
  return {
    id,
    modality: args.modality,
    captureSource: args.captureSource,
    createdAt,
    inputRef: args.inputRef,
    ...(args.mimeType != null && { mimeType: args.mimeType }),
    ...(args.metadata != null && { metadata: args.metadata }),
  };
}

/**
 * Convert raw candidates into deterministic RecognitionCandidate records.
 * Preserves input order in candidateIds; no sorting, no semantic resolution, no filtering.
 */
export function deriveRecognitionCandidates(args: {
  envelope: RecognitionEnvelope;
  rawCandidates: Array<{
    label: string;
    confidence: number;
    candidateType: RecognitionCandidate["candidateType"];
  }>;
}): RecognitionCandidateSummary {
  const { envelope, rawCandidates } = args;
  const candidates: Record<string, RecognitionCandidate> = {};
  const candidateIds: string[] = [];
  for (const raw of rawCandidates) {
    const id = createRecognitionCandidateId(
      envelope.id,
      raw.label,
      raw.candidateType
    );
    if (candidates[id]) continue;
    candidates[id] = {
      id,
      envelopeId: envelope.id,
      label: raw.label,
      confidence: raw.confidence,
      candidateType: raw.candidateType,
    };
    candidateIds.push(id);
  }
  return { candidates, candidateIds };
}
