import type { MediaInterpretation, MediaReference, InterpretationType } from '@rabbit-hole/contracts';
import { interpretEcological } from './ecological';
import { interpretLandmark } from './landmark';
import { interpretTvShow } from './tv';
import { interpretOcr } from './ocr';
import { interpretAudio } from './audio';

/**
 * Routes media through the correct identification layer based on requested type.
 */
export function runInterpretation(
  media: MediaReference,
  type: InterpretationType,
): MediaInterpretation | null {
  switch (type) {
    case 'ecological':
      return interpretEcological(media);
    case 'landmark':
      return interpretLandmark(media);
    case 'tv_show':
      return interpretTvShow(media);
    case 'ocr':
      return interpretOcr(media);
    case 'audio_recognition':
      return interpretAudio(media);
    default:
      return null;
  }
}
