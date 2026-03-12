import { Router, Request, Response } from 'express';
import { createMediaReference } from '../pipeline/intake';
import { runInterpretation } from '../pipeline/interpretation';
import type { InterpretationType } from '@rabbit-hole/contracts';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { type, uri, mimeType, articleId, interpretAs } = req.body as {
    type: 'image' | 'video' | 'audio';
    uri: string;
    mimeType?: string;
    articleId?: string;
    interpretAs?: InterpretationType;
  };

  if (!type || !uri) {
    return res.status(400).json({ error: 'type and uri are required' });
  }

  const media = createMediaReference({ type, uri, mimeType, articleId });

  if (interpretAs) {
    const interpretation = runInterpretation(media, interpretAs);
    return res.status(201).json({ media, interpretation });
  }

  return res.status(201).json({ media, interpretation: null });
});

export { router as intakeRouter };
