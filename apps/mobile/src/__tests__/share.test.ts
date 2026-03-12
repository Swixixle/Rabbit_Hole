import { buildSharePayload } from '../utils/share';

describe('buildSharePayload', () => {
  it('builds a valid share payload', () => {
    const payload = buildSharePayload(
      'Test Article',
      'A short summary.',
      'https://example.com/articles/1',
    );
    expect(payload.title).toBe('Test Article');
    expect(payload.summary).toBe('A short summary.');
    expect(payload.url).toBe('https://example.com/articles/1');
  });
});
