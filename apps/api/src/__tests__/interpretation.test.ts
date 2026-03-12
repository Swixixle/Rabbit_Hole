import { runInterpretation } from '../pipeline/interpretation';
import { interpretEcological } from '../pipeline/interpretation/ecological';
import type { MediaReference } from '@rabbit-hole/contracts';

const testMedia: MediaReference = {
  id: 'media-test-1',
  type: 'image',
  uri: 'https://example.com/oak.jpg',
  mimeType: 'image/jpeg',
  createdAt: new Date().toISOString(),
};

describe('runInterpretation', () => {
  it('routes ecological type to ecological interpreter', () => {
    const result = runInterpretation(testMedia, 'ecological');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('ecological');
    expect(result?.mediaReferenceId).toBe('media-test-1');
  });

  it('returns null for stubbed types', () => {
    expect(runInterpretation(testMedia, 'landmark')).toBeNull();
    expect(runInterpretation(testMedia, 'tv_show')).toBeNull();
    expect(runInterpretation(testMedia, 'ocr')).toBeNull();
    expect(runInterpretation(testMedia, 'audio_recognition')).toBeNull();
  });
});

describe('interpretEcological', () => {
  it('returns a MediaInterpretation with ecological type', () => {
    const result = interpretEcological(testMedia);
    expect(result.type).toBe('ecological');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.result).toHaveProperty('species');
    expect(result.result).toHaveProperty('commonName');
  });
});
