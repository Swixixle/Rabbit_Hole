import { getNextStep, isExperienceComplete, getStepProgress } from '../utils/experience';
import type { ArticleExperience } from '@rabbit-hole/contracts';

describe('getNextStep', () => {
  it('returns summary after identification', () => {
    expect(getNextStep('identification')).toBe('summary');
  });

  it('returns null after questions (final step)', () => {
    expect(getNextStep('questions')).toBeNull();
  });

  it('advances through all steps in order', () => {
    expect(getNextStep('identification')).toBe('summary');
    expect(getNextStep('summary')).toBe('content');
    expect(getNextStep('content')).toBe('evidence');
    expect(getNextStep('evidence')).toBe('questions');
  });
});

describe('isExperienceComplete', () => {
  function makeExperience(step: ArticleExperience['currentStep']): ArticleExperience {
    return {
      id: 'exp-1',
      articleId: 'art-1',
      userId: 'user-1',
      currentStep: step,
      following: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  it('returns false for non-final steps', () => {
    expect(isExperienceComplete(makeExperience('identification'))).toBe(false);
    expect(isExperienceComplete(makeExperience('content'))).toBe(false);
  });

  it('returns true when at questions step', () => {
    expect(isExperienceComplete(makeExperience('questions'))).toBe(true);
  });
});

describe('getStepProgress', () => {
  it('returns 0.2 for identification (1/5)', () => {
    expect(getStepProgress('identification')).toBe(0.2);
  });

  it('returns 1.0 for questions (5/5)', () => {
    expect(getStepProgress('questions')).toBe(1.0);
  });
});
