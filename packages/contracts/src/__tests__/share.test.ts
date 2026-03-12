import type { ArticleSharePayload } from '../share';

describe('ArticleSharePayload', () => {
  it('constructs a valid share payload', () => {
    const payload: ArticleSharePayload = {
      title: 'Test Article',
      summary: 'A short summary.',
      url: 'https://example.com/article/1',
    };
    expect(payload.title).toBe('Test Article');
    expect(payload.summary).toBe('A short summary.');
    expect(payload.url).toBe('https://example.com/article/1');
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
