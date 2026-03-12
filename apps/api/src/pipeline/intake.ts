import type { MediaReference, MediaReferenceType } from '@rabbit-hole/contracts';
import { v4 as uuidv4 } from 'uuid';

export interface IntakePayload {
  type: MediaReferenceType;
  uri: string;
  mimeType?: string;
  articleId?: string;
}

/**
 * Intake surface handler.
 * Normalizes media inputs into MediaReference entities for the interpretation pipeline.
 */
export function createMediaReference(payload: IntakePayload): MediaReference {
  return {
    id: uuidv4(),
    type: payload.type,
    uri: payload.uri,
    mimeType: payload.mimeType,
    articleId: payload.articleId,
    createdAt: new Date().toISOString(),
  };
}
