import express from 'express';
import { articlesRouter } from './routes/articles';
import { experiencesRouter } from './routes/experiences';
import { intakeRouter } from './routes/intake';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/articles', articlesRouter);
  app.use('/experiences', experiencesRouter);
  app.use('/intake', intakeRouter);

  return app;
}
