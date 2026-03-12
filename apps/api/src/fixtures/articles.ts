import type { Organization, Source, Article, Claim } from '@rabbit-hole/contracts';

export const fixtureOrganizations: Organization[] = [
  {
    id: 'org-reuters',
    name: 'reuters',
    displayName: 'Reuters',
    reliabilityScore: 0.92,
    biasSummary: 'Centrist, fact-based reporting',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'org-bbc',
    name: 'bbc',
    displayName: 'BBC',
    reliabilityScore: 0.89,
    biasSummary: 'Center-left, public service broadcaster',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const fixtureSources: Source[] = [
  {
    id: 'src-reuters-tech',
    organizationId: 'org-reuters',
    name: 'Reuters Technology',
    url: 'https://reuters.com/technology',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'src-bbc-science',
    organizationId: 'org-bbc',
    name: 'BBC Science & Environment',
    url: 'https://bbc.com/news/science_and_environment',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const fixtureClaims: Claim[] = [
  {
    id: 'claim-1',
    articleId: 'art-1',
    text: 'Global average temperatures have risen by approximately 1.1°C since pre-industrial times.',
    epistemic: { confidence: 'high', support: 'direct' },
    sourceId: 'src-reuters-tech',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'claim-2',
    articleId: 'art-1',
    text: 'Sea levels could rise by up to 1 metre by 2100 under high-emission scenarios.',
    epistemic: { confidence: 'medium', support: 'inference' },
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
];

export const fixtureArticles: Article[] = [
  {
    id: 'art-1',
    sourceId: 'src-reuters-tech',
    title: 'Climate Scientists Warn of Accelerating Sea Level Rise',
    author: 'Jane Smith',
    publishedAt: '2024-06-01T08:00:00Z',
    summary:
      'A new study published in Nature Climate Change highlights accelerating sea level rise linked to melting polar ice sheets.',
    sections: [
      {
        title: 'Introduction',
        body: 'Global average temperatures have risen by approximately 1.1°C since pre-industrial times, driving changes in polar ice sheets and ocean expansion.',
      },
      {
        title: 'Findings',
        body: 'Researchers found that ice sheet melt is now the dominant contributor to sea level rise, overtaking thermal expansion of ocean water.',
      },
    ],
    evidence: [
      'https://doi.org/10.1038/s41558-024-00000-0',
      'https://www.ipcc.ch/report/ar6/',
    ],
    questions: [
      'What mitigation strategies could slow sea level rise?',
      'How do ice sheet dynamics differ between Greenland and Antarctica?',
      'What are the projected impacts on coastal populations by 2050?',
    ],
    claimIds: ['claim-1', 'claim-2'],
    assemblyStage: 'questions',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
];
