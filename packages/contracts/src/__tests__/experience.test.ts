import type { ArticleExperience, ExperienceStep } from '../experience';

describe('ArticleExperience', () => {
  it('accepts all valid experience steps', () => {
    const steps: ExperienceStep[] = [
      'identification',
      'summary',
      'content',
      'evidence',
      'questions',
    ];
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
