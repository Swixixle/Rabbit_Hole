import type { ClaimConfidence, ClaimSupport, EpistemicAnnotation } from '../epistemic';

describe('EpistemicAnnotation', () => {
  it('accepts valid confidence values', () => {
    const confidences: ClaimConfidence[] = ['high', 'medium', 'low'];
    expect(confidences).toHaveLength(3);
  });

  it('accepts valid support values', () => {
    const supports: ClaimSupport[] = ['direct', 'inference', 'interpretation', 'speculation'];
    expect(supports).toHaveLength(4);
  });

  it('constructs a valid EpistemicAnnotation', () => {
    const annotation: EpistemicAnnotation = {
      confidence: 'high',
      support: 'direct',
    };
    expect(annotation.confidence).toBe('high');
    expect(annotation.support).toBe('direct');
  });

  it('accepts all valid confidence levels', () => {
    const levels: ClaimConfidence[] = ['high', 'medium', 'low'];
    levels.forEach((confidence) => {
      const annotation: EpistemicAnnotation = { confidence, support: 'direct' };
      expect(annotation.confidence).toBe(confidence);
    });
  });

  it('accepts all valid support types', () => {
    const types: ClaimSupport[] = ['direct', 'inference', 'interpretation', 'speculation'];
    types.forEach((support) => {
      const annotation: EpistemicAnnotation = { confidence: 'high', support };
      expect(annotation.support).toBe(support);
    });
  });

  it('constructs a valid EpistemicAnnotation object', () => {
    const annotation: EpistemicAnnotation = {
      confidence: 'medium',
      support: 'inference',
    };
    expect(annotation).toEqual({ confidence: 'medium', support: 'inference' });
  });
});
