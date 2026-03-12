import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { ArticleExperience, ExperienceStep } from '@rabbit-hole/contracts';

const router = Router();

const STEP_ORDER: ExperienceStep[] = [
  'identification',
  'summary',
  'content',
  'evidence',
  'questions',
];

const experiences: ArticleExperience[] = [];

router.post('/', (req: Request, res: Response) => {
  const { articleId, userId } = req.body as { articleId: string; userId: string };
  if (!articleId || !userId) {
    return res.status(400).json({ error: 'articleId and userId are required' });
  }
  const now = new Date().toISOString();
  const experience: ArticleExperience = {
    id: uuidv4(),
    articleId,
    userId,
    currentStep: 'identification',
    following: false,
    createdAt: now,
    updatedAt: now,
  };
  experiences.push(experience);
  return res.status(201).json(experience);
});

router.get('/:id', (req: Request, res: Response) => {
  const exp = experiences.find((e) => e.id === req.params.id);
  if (!exp) {
    return res.status(404).json({ error: 'Experience not found' });
  }
  return res.json(exp);
});

router.patch('/:id/step', (req: Request, res: Response) => {
  const index = experiences.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Experience not found' });
  }
  const current = experiences[index];
  const currentIndex = STEP_ORDER.indexOf(current.currentStep);
  if (currentIndex === STEP_ORDER.length - 1) {
    return res.json(current);
  }
  const updated: ArticleExperience = {
    ...current,
    currentStep: STEP_ORDER[currentIndex + 1],
    updatedAt: new Date().toISOString(),
  };
  experiences[index] = updated;
  return res.json(updated);
});

router.patch('/:id/follow', (req: Request, res: Response) => {
  const index = experiences.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Experience not found' });
  }
  const updated: ArticleExperience = {
    ...experiences[index],
    following: !experiences[index].following,
    updatedAt: new Date().toISOString(),
  };
  experiences[index] = updated;
  return res.json(updated);
});

export { router as experiencesRouter };
