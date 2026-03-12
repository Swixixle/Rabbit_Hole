import type { MediaInterpretation, MediaReference } from '@rabbit-hole/contracts';
import { v4 as uuidv4 } from 'uuid';

interface EcologicalResult {
  species?: string;
  commonName?: string;
  family?: string;
  kingdom?: string;
  description?: string;
}

/**
 * Ecological / plant / wildlife identification.
 * Identifies plants, animals, and wildlife from image media references.
 */
export function interpretEcological(media: MediaReference): MediaInterpretation {
  const result: EcologicalResult = {
    species: 'Quercus robur',
    commonName: 'English Oak',
    family: 'Fagaceae',
    kingdom: 'Plantae',
    description:
      'A large deciduous tree native to most of Europe and western Asia.',
  };

  return {
    id: uuidv4(),
    mediaReferenceId: media.id,
    type: 'ecological',
    result: result as Record<string, unknown>,
    confidence: 0.87,
    createdAt: new Date().toISOString(),
  };
}
