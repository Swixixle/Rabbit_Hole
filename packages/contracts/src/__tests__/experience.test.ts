import type { ArticleExperience, ExperienceStep } from '../experience';

describe('ExperienceStep', () => {
  it('defines all five pipeline stages in order', () => {
    const steps: ExperienceStep[] = [
      'identification',
      'summary',
      'content',
      'evidence',
      'questions',
    ];
    expect(steps).toHaveLength(5);
    expect(steps[0]).toBe('identification');
    expect(steps[4]).toBe('questions');
  });
});

describe('ArticleExperience', () => {
  it('constructs a valid experience record', () => {
    const experience: ArticleExperience = {
      id: 'exp-1',
      articleId: 'art-1',
      userId: 'user-1',
      currentStep: 'identification',
      following: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(experience.id).toBe('exp-1');
    expect(experience.currentStep).toBe('identification');
    expect(experience.following).toBe(false);
  });

  it('allows following to be toggled independently of step', () => {
    const experience: ArticleExperience = {
      id: 'exp-2',
      articleId: 'art-2',
      userId: 'user-2',
      currentStep: 'questions',
      following: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(experience.currentStep).toBe('questions');
    expect(experience.following).toBe(true);
  });
});
