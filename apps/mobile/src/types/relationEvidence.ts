/**
 * Rabbit Hole v9 — Edge–claim reference layer.
 * Links exploration relations to claims without merging graph and provenance.
 */

export type EdgeClaimReference = {
  id: string;
  edgeId: string;
  claimId: string;
  createdAt: string;
};
