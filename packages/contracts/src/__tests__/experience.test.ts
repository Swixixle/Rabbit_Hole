import type { ArticleExperience, ExperienceStep } from '../experience';

describe('ExperienceStep', () => {
  it('defines all five pipeline stages in order', () => {
describe('ArticleExperience', () => {
  it('accepts all valid experience steps', () => {
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
    steps.forEach((step) => {
      const experience: ArticleExperience = {
        id: '1',
        articleId: 'a1',
        userId: 'u1',
        currentStep: step,
        following: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(experience.currentStep).toBe(step);
    });
  });

  it('constructs a valid ArticleExperience object', () => {
    const experience: ArticleExperience = {
      id: 'exp-1',
      articleId: 'article-1',
      userId: 'user-1',
      currentStep: 'summary',
      following: true,
      createdAt: '2024-06-01T12:00:00Z',
      updatedAt: '2024-06-02T08:30:00Z',
    };
    expect(experience.id).toBe('exp-1');
    expect(experience.following).toBe(true);
    expect(experience.currentStep).toBe('summary');
  });
});
