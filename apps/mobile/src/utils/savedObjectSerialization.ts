/**
 * Rabbit Hole v13 — Saved object validation and normalization for persistence.
 * No schema library; minimal manual validation. Discard invalid entries safely.
 */
import type { SavedObjectItem, SavedObjectVerificationKind } from "../types/savedObjects";

const VERIFICATION_KINDS: SavedObjectVerificationKind[] = [
  "verified",
  "evidenced",
  "recognition_only",
  "unverified",
];

function isVerificationKind(value: unknown): value is SavedObjectVerificationKind {
  return typeof value === "string" && VERIFICATION_KINDS.includes(value as SavedObjectVerificationKind);
}

function hasRequiredStrings(obj: unknown): obj is Record<string, unknown> {
  if (obj === null || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.sourceEnvelopeId === "string" &&
    typeof o.sourceRegionId === "string" &&
    typeof o.label === "string" &&
    typeof o.savedAt === "string" &&
    isVerificationKind(o.verificationKind)
  );
}

/**
 * Type guard: value is a valid SavedObjectItem (required fields only).
 */
export function isSavedObjectItem(value: unknown): value is SavedObjectItem {
  if (!hasRequiredStrings(value)) return false;
  const o = value as Record<string, unknown>;
  if (o.recognitionCandidateId !== undefined && typeof o.recognitionCandidateId !== "string")
    return false;
  if (o.identifiedEntityId !== undefined && typeof o.identifiedEntityId !== "string")
    return false;
  if (o.knowledgeNodeId !== undefined && typeof o.knowledgeNodeId !== "string")
    return false;
  return true;
}

/**
 * Normalize unknown value to SavedObjectItem[]. Invalid entries discarded; order preserved.
 */
export function normalizeSavedObjectItems(value: unknown): SavedObjectItem[] {
  if (!Array.isArray(value)) return [];
  const out: SavedObjectItem[] = [];
  for (const entry of value) {
    if (isSavedObjectItem(entry)) {
      out.push({
        id: entry.id,
        sourceEnvelopeId: entry.sourceEnvelopeId,
        sourceRegionId: entry.sourceRegionId,
        label: entry.label,
        savedAt: entry.savedAt,
        verificationKind: entry.verificationKind,
        ...(entry.recognitionCandidateId != null && { recognitionCandidateId: entry.recognitionCandidateId }),
        ...(entry.identifiedEntityId != null && { identifiedEntityId: entry.identifiedEntityId }),
        ...(entry.knowledgeNodeId != null && { knowledgeNodeId: entry.knowledgeNodeId }),
      });
    }
  }
  return out;
}
