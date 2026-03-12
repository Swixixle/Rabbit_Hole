import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /articles', () => {
  it('returns a list of articles', async () => {
    const res = await request(app).get('/articles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /articles/:id', () => {
  it('returns an article by id', async () => {
    const res = await request(app).get('/articles/art-1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('art-1');
    expect(res.body.title).toBeDefined();
    expect(res.body.assemblyStage).toBeDefined();
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/articles/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('GET /articles/:id/claims', () => {
  it('returns claims for an article', async () => {
    const res = await request(app).get('/articles/art-1/claims');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].epistemic).toBeDefined();
    expect(res.body[0].epistemic.confidence).toBeDefined();
    expect(res.body[0].epistemic.support).toBeDefined();
  });
});

describe('POST /experiences', () => {
  it('creates a new experience', async () => {
    const res = await request(app)
      .post('/experiences')
      .send({ articleId: 'art-1', userId: 'user-test' });
    expect(res.status).toBe(201);
    expect(res.body.currentStep).toBe('identification');
    expect(res.body.following).toBe(false);
  });

  it('returns 400 without required fields', async () => {
    const res = await request(app).post('/experiences').send({ articleId: 'art-1' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /experiences/:id/step', () => {
  it('advances the experience step', async () => {
    const create = await request(app)
      .post('/experiences')
      .send({ articleId: 'art-1', userId: 'user-advance' });
    const id = create.body.id;

    const res = await request(app).patch(`/experiences/${id}/step`);
    expect(res.status).toBe(200);
    expect(res.body.currentStep).toBe('summary');
  });
});

describe('PATCH /experiences/:id/follow', () => {
  it('toggles the follow state', async () => {
    const create = await request(app)
      .post('/experiences')
      .send({ articleId: 'art-1', userId: 'user-follow' });
    const id = create.body.id;

    const res = await request(app).patch(`/experiences/${id}/follow`);
    expect(res.status).toBe(200);
    expect(res.body.following).toBe(true);
  });
});

describe('POST /intake', () => {
  it('creates a media reference', async () => {
    const res = await request(app)
      .post('/intake')
      .send({ type: 'image', uri: 'https://example.com/photo.jpg' });
    expect(res.status).toBe(201);
    expect(res.body.media.type).toBe('image');
    expect(res.body.interpretation).toBeNull();
  });

  it('runs ecological interpretation when requested', async () => {
    const res = await request(app)
      .post('/intake')
      .send({
        type: 'image',
        uri: 'https://example.com/plant.jpg',
        interpretAs: 'ecological',
      });
    expect(res.status).toBe(201);
    expect(res.body.interpretation).not.toBeNull();
    expect(res.body.interpretation.type).toBe('ecological');
  });
});
