import { advanceAssemblyStage, getStageIndex, isAssemblyComplete } from '../pipeline/assembly';
import type { Article } from '@rabbit-hole/contracts';

function makeArticle(stage: Article['assemblyStage']): Article {
  return {
    id: 'art-test',
    sourceId: 'src-1',
    title: 'Test',
    summary: 'Summary',
    sections: [],
    evidence: [],
    questions: [],
    claimIds: [],
    assemblyStage: stage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('advanceAssemblyStage', () => {
  it('advances from identification to summary', () => {
    const article = makeArticle('identification');
    const next = advanceAssemblyStage(article);
    expect(next.assemblyStage).toBe('summary');
  });

  it('advances through all stages in order', () => {
    const stages: Article['assemblyStage'][] = [
      'identification',
      'summary',
      'content',
      'evidence',
      'questions',
    ];
    let article = makeArticle('identification');
    for (let i = 1; i < stages.length; i++) {
      article = advanceAssemblyStage(article);
      expect(article.assemblyStage).toBe(stages[i]);
    }
  });

  it('does not advance past questions', () => {
    const article = makeArticle('questions');
    const next = advanceAssemblyStage(article);
    expect(next.assemblyStage).toBe('questions');
  });
});

describe('getStageIndex', () => {
  it('returns 0 for identification', () => {
    expect(getStageIndex('identification')).toBe(0);
  });

  it('returns 4 for questions', () => {
    expect(getStageIndex('questions')).toBe(4);
  });
});

describe('isAssemblyComplete', () => {
  it('returns false for non-final stages', () => {
    expect(isAssemblyComplete(makeArticle('identification'))).toBe(false);
    expect(isAssemblyComplete(makeArticle('content'))).toBe(false);
  });

  it('returns true for questions stage', () => {
    expect(isAssemblyComplete(makeArticle('questions'))).toBe(true);
  });
});
