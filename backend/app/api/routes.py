from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.schemas.movie import MovieGenerationRequest, MovieGenerationResponse
from app.services.movie_generation import MovieGenerationService

router = APIRouter(prefix="/api", tags=["movies"])


async def get_movie_service(request: Request) -> MovieGenerationService:
    return request.app.state.movie_service


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/movies/generate", response_model=MovieGenerationResponse)
async def generate_movie(
    payload: MovieGenerationRequest,
    service: MovieGenerationService = Depends(get_movie_service),
) -> MovieGenerationResponse:
    return await service.generate(payload)
