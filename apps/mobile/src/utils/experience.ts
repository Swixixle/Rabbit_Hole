import type { ArticleExperience, ExperienceStep } from '@rabbit-hole/contracts';

const STEP_ORDER: ExperienceStep[] = [
  'identification',
  'summary',
  'content',
  'evidence',
  'questions',
];

export function getNextStep(current: ExperienceStep): ExperienceStep | null {
  const index = STEP_ORDER.indexOf(current);
  if (index === -1 || index === STEP_ORDER.length - 1) {
    return null;
  }
  return STEP_ORDER[index + 1];
}

export function isExperienceComplete(experience: ArticleExperience): boolean {
  return experience.currentStep === 'questions';
}

export function getStepProgress(step: ExperienceStep): number {
  const index = STEP_ORDER.indexOf(step);
  return (index + 1) / STEP_ORDER.length;
}
