from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()  # load .env before any Settings are constructed

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.requests import Request

from app.api.routes import router
from app.config.settings import Settings, get_settings
from app.providers.factory import build_providers
from app.services.movie_generation import MovieGenerationService


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    llm, image = build_providers(settings)
    app = FastAPI(title="CineDream API", version="1.0.0")
    app.state.movie_service = MovieGenerationService(settings, llm, image)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Authorization"],
    )
    app.include_router(router)

    @app.exception_handler(Exception)
    async def unexpected_error(_: Request, __: Exception) -> JSONResponse:
        return JSONResponse(status_code=500, content={"detail": "Unexpected server error"})

    return app


app = create_app()
