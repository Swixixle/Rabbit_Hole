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

  it('allows all confidence + support combinations', () => {
    const combos: EpistemicAnnotation[] = [
      { confidence: 'high', support: 'direct' },
      { confidence: 'high', support: 'inference' },
      { confidence: 'medium', support: 'interpretation' },
      { confidence: 'low', support: 'speculation' },
    ];
    expect(combos).toHaveLength(4);
    combos.forEach((c) => {
      expect(c.confidence).toBeDefined();
      expect(c.support).toBeDefined();
    });
  });
});
