import type { Article, ArticleAssemblyStage } from '@rabbit-hole/contracts';

const STAGE_ORDER: ArticleAssemblyStage[] = [
  'identification',
  'summary',
  'content',
  'evidence',
  'questions',
];

/**
 * Article assembly pipeline.
 * identification → summary → content → evidence → questions
 * Steps can only advance forward, never retreat.
 */
export function advanceAssemblyStage(article: Article): Article {
  const currentIndex = STAGE_ORDER.indexOf(article.assemblyStage);
  if (currentIndex === STAGE_ORDER.length - 1) {
    return article;
  }
  return {
    ...article,
    assemblyStage: STAGE_ORDER[currentIndex + 1],
    updatedAt: new Date().toISOString(),
  };
}

export function getStageIndex(stage: ArticleAssemblyStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function isAssemblyComplete(article: Article): boolean {
  return article.assemblyStage === 'questions';
}
