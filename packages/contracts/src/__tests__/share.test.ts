import type { ArticleSharePayload } from '../share';

describe('ArticleSharePayload', () => {
  it('constructs a valid ArticleSharePayload object', () => {
    const payload: ArticleSharePayload = {
      title: 'Test Article',
      summary: 'A short summary of the article.',
      url: 'https://example.com/articles/test',
    };
    expect(payload.title).toBe('Test Article');
    expect(payload.summary).toBe('A short summary of the article.');
    expect(payload.url).toBe('https://example.com/articles/test');
  });
});
