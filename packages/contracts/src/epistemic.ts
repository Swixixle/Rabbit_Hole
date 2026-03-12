export type ClaimConfidence = 'high' | 'medium' | 'low';

export type ClaimSupport = 'direct' | 'inference' | 'interpretation' | 'speculation';

export interface EpistemicAnnotation {
  confidence: ClaimConfidence;
  support: ClaimSupport;
}
