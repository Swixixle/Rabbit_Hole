# Rabbit Hole API (v0)

Minimal FastAPI surface for the mobile golden path. Stubbed responses; contract-aligned.

## Run

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `POST /v1/media/upload` — accept image, return uploadId + imageUri (stub)
- `POST /v1/explore/image` — return deterministic segments
- `POST /v1/explore/image/tap` — return candidates + optional articleId
- `GET /v1/articles/:articleId` — article by id
- `GET /v1/articles/by-node/:nodeId` — article by node
- `GET /v1/claims/:claimId` — claim detail
- `GET /v1/sources/:sourceId` — source detail
- `GET /v1/verification/article/:articleId` — sources for article
- `GET /v1/traces/:nodeId` — trace preview (list)
- `GET /v1/articles/:articleId/questions` — suggested questions

See `docs/architecture/v0-api-surface.md` for full contract.
