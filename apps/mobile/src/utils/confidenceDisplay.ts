/**
 * Epistemic display: confidence and support labels for the reader.
 * Matches backend derivation; use for claim modal and block rollup.
 */
import type { ConfidenceLevel, ClaimSupport } from "@rabbit-hole/contracts";

export const CONFIDENCE_LABELS: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export const SUPPORT_LABELS: Record<string, string> = {
  direct: "Direct",
  inference: "Inferred",
  interpretation: "Interpreted",
  speculation: "Speculative",
};

/** Glyph for confidence (subtle, not a warning system) */
export function confidenceGlyph(confidence: string): string {
  switch (confidence) {
    case "high":
      return "●";
    case "medium":
      return "○";
    case "low":
      return "◌";
    default:
      return "○";
  }
}

export function getConfidenceLabel(confidence: string): string {
  return CONFIDENCE_LABELS[confidence] ?? confidence;
}

export function getSupportLabel(support: string): string {
  return SUPPORT_LABELS[support] ?? support;
}

/** Derive support from claimType when support is missing (mirrors backend) */
export function deriveSupport(claimType: string): string {
  const map: Record<string, string> = {
    verified_fact: "direct",
    synthesized_claim: "inference",
    interpretation: "interpretation",
    speculation: "speculation",
    opinion: "inference",
    anecdote: "inference",
    conspiracy_claim: "speculation",
    advertisement: "speculation",
    satire_or_joke: "speculation",
    disputed_claim: "interpretation",
  };
  return map[claimType] ?? "inference";
}

/** Default confidence when missing */
export function defaultConfidence(claimType: string): string {
  const map: Record<string, string> = {
    verified_fact: "high",
    synthesized_claim: "medium",
    interpretation: "medium",
    speculation: "low",
    opinion: "medium",
    anecdote: "medium",
    conspiracy_claim: "low",
    advertisement: "low",
    satire_or_joke: "low",
    disputed_claim: "low",
  };
  return map[claimType] ?? "medium";
}

export function getClaimConfidence(claim: { confidence?: string; claimType: string }): string {
  return claim.confidence ?? defaultConfidence(claim.claimType);
}

export function getClaimSupport(claim: { support?: string; claimType: string }): string {
  return claim.support ?? deriveSupport(claim.claimType);
}
