import { createMediaReference } from '../pipeline/intake';

describe('createMediaReference', () => {
  it('creates a media reference with a unique id', () => {
    const ref1 = createMediaReference({ type: 'image', uri: 'https://example.com/a.jpg' });
    const ref2 = createMediaReference({ type: 'image', uri: 'https://example.com/b.jpg' });
    expect(ref1.id).not.toBe(ref2.id);
  });

  it('preserves type and uri from payload', () => {
    const ref = createMediaReference({
      type: 'video',
      uri: 'https://example.com/video.mp4',
      mimeType: 'video/mp4',
      articleId: 'art-1',
    });
    expect(ref.type).toBe('video');
    expect(ref.uri).toBe('https://example.com/video.mp4');
    expect(ref.mimeType).toBe('video/mp4');
    expect(ref.articleId).toBe('art-1');
  });
});
