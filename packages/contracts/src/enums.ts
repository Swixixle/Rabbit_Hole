/**
 * Canonical enums for Rabbit Hole v0.
 * Do not add or change without aligning with architecture docs.
 */

export const NodeType = {
  object: 'object',
  product: 'product',
  place: 'place',
  organization: 'organization',
  person: 'person',
  event: 'event',
  law: 'law',
  legal_case: 'legal_case',
  institution: 'institution',
  source: 'source',
  other: 'other',
} as const;
export type NodeType = (typeof NodeType)[keyof typeof NodeType];

export const ClaimType = {
  verified_fact: 'verified_fact',
  synthesized_claim: 'synthesized_claim',
  interpretation: 'interpretation',
  opinion: 'opinion',
  anecdote: 'anecdote',
  speculation: 'speculation',
  conspiracy_claim: 'conspiracy_claim',
  advertisement: 'advertisement',
  satire_or_joke: 'satire_or_joke',
  disputed_claim: 'disputed_claim',
} as const;
export type ClaimType = (typeof ClaimType)[keyof typeof ClaimType];

export const SourceType = {
  gov: 'gov',
  academic: 'academic',
  news: 'news',
  social: 'social',
  other: 'other',
} as const;
export type SourceType = (typeof SourceType)[keyof typeof SourceType];

export const JobStatusEnum = {
  pending: 'pending',
  running: 'running',
  completed: 'completed',
  failed: 'failed',
} as const;
export type JobStatusEnum = (typeof JobStatusEnum)[keyof typeof JobStatusEnum];

export const ConfidenceLevel = {
  high: 'high',
  medium: 'medium',
  low: 'low',
} as const;
export type ConfidenceLevel = (typeof ConfidenceLevel)[keyof typeof ConfidenceLevel];

/** Epistemic backing: what kind of support the claim has. Used for reader trust, not editorial label. */
export const ClaimSupport = {
  direct: 'direct',
  inference: 'inference',
  interpretation: 'interpretation',
  speculation: 'speculation',
} as const;
export type ClaimSupport = (typeof ClaimSupport)[keyof typeof ClaimSupport];
