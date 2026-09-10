from __future__ import annotations

from typing import Protocol

from app.schemas.movie import MovieConcept, MovieGenerationRequest


class ProviderError(RuntimeError):
    """An external provider was unavailable or returned an invalid payload."""


class LLMProvider(Protocol):
    async def generate_concept(self, request: MovieGenerationRequest) -> MovieConcept: ...


class ImageProvider(Protocol):
    async def generate_poster(self, prompt: str) -> str: ...
