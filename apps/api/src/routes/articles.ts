import { Router, Request, Response } from 'express';
import { fixtureArticles, fixtureClaims } from '../fixtures/articles';
import { advanceAssemblyStage } from '../pipeline/assembly';

const router = Router();

let articles = [...fixtureArticles];

router.get('/', (_req: Request, res: Response) => {
  res.json(articles);
});

router.get('/:id', (req: Request, res: Response) => {
  const article = articles.find((a) => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  return res.json(article);
});

router.get('/:id/claims', (req: Request, res: Response) => {
  const article = articles.find((a) => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const claims = fixtureClaims.filter((c) => article.claimIds.includes(c.id));
  return res.json(claims);
});

router.post('/:id/advance', (req: Request, res: Response) => {
  const index = articles.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const updated = advanceAssemblyStage(articles[index]);
  articles[index] = updated;
  return res.json(updated);
});

export { router as articlesRouter };
