# CineDream backend

Minimal FastAPI backend for generating structured movie concepts and poster prompts. It runs without external AI services: the deterministic fallback is the default.

## Run

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Visit `http://127.0.0.1:8000/docs`; health is at `GET /api/health`.

## Test

```bash
cd backend
pytest
```

## Providers

Copy `.env.example` to your environment (or export its variables). Set `PROVIDER_MODE=external` and configure `LLM_ENDPOINT` and/or `IMAGE_ENDPOINT` to use generic JSON HTTP adapters. The LLM endpoint receives `movie_configuration` and must return a `concept` object matching the API concept fields. The image endpoint receives a prompt and must return `{ "url": "https://..." }`. Any unavailable or malformed provider automatically falls back.

The generated poster prompt requests a vertical cinematic background with title/cast negative space and explicitly excludes text, logos, watermarks, and UI.
