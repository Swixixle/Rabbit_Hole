import type { Article, Claim, Source, Organization, MediaReference, MediaInterpretation } from '../models';

describe('Organization', () => {
  it('constructs a valid organization', () => {
    const org: Organization = {
      id: 'org-1',
      name: 'reuters',
      displayName: 'Reuters',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(org.id).toBe('org-1');
    expect(org.displayName).toBe('Reuters');
  });
});

describe('Source', () => {
  it('constructs a valid source linked to an organization', () => {
    const source: Source = {
      id: 'src-1',
      organizationId: 'org-1',
      name: 'Reuters Technology',
      url: 'https://reuters.com/technology',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(source.organizationId).toBe('org-1');
  });
});

describe('Claim', () => {
  it('constructs a valid claim with epistemic annotation', () => {
    const claim: Claim = {
      id: 'claim-1',
      articleId: 'art-1',
      text: 'The earth is approximately 4.5 billion years old.',
      epistemic: { confidence: 'high', support: 'direct' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(claim.epistemic.confidence).toBe('high');
    expect(claim.epistemic.support).toBe('direct');
  });
});

describe('Article', () => {
  it('constructs a valid article', () => {
    const article: Article = {
      id: 'art-1',
      sourceId: 'src-1',
      title: 'Test Article',
      summary: 'A test article summary.',
      sections: [{ title: 'Introduction', body: 'Body text here.' }],
      evidence: ['https://source.example.com'],
      questions: ['What does this mean for the future?'],
      claimIds: ['claim-1'],
      assemblyStage: 'identification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(article.assemblyStage).toBe('identification');
    expect(article.sections).toHaveLength(1);
  });
});

describe('MediaReference', () => {
  it('constructs a valid media reference', () => {
    const media: MediaReference = {
      id: 'media-1',
      type: 'image',
      uri: 'https://example.com/image.jpg',
      mimeType: 'image/jpeg',
      createdAt: new Date().toISOString(),
    };
    expect(media.type).toBe('image');
  });
});

describe('MediaInterpretation', () => {
  it('constructs a valid media interpretation', () => {
    const interp: MediaInterpretation = {
      id: 'interp-1',
      mediaReferenceId: 'media-1',
      type: 'ecological',
      result: { species: 'Quercus robur', commonName: 'English Oak' },
      confidence: 0.92,
      createdAt: new Date().toISOString(),
    };
    expect(interp.type).toBe('ecological');
    expect(interp.confidence).toBe(0.92);
  });
});
