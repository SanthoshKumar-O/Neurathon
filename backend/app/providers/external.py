from __future__ import annotations

import httpx

from app.providers.base import ProviderError
from app.schemas.movie import MovieConcept, MovieGenerationRequest
from app.services.generation_prompt import MOVIE_CONCEPT_INSTRUCTIONS


class HttpLLMProvider:
    """Small, vendor-neutral JSON HTTP adapter.

    It expects a JSON response with a `concept` object matching MovieConcept.
    Adapt this boundary—not the API route—when integrating a provider.
    """

    def __init__(self, endpoint: str, api_key: str | None, timeout: float) -> None:
        self.endpoint, self.api_key, self.timeout = endpoint, api_key, timeout

    async def generate_concept(self, request: MovieGenerationRequest) -> MovieConcept:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.endpoint,
                    json={
                        "movie_configuration": request.model_dump(),
                        "generation_instructions": MOVIE_CONCEPT_INSTRUCTIONS,
                        "response_format": "movie_concept",
                    },
                    headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                )
                response.raise_for_status()
                payload = response.json()
            return MovieConcept.model_validate(payload.get("concept", payload))
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderError("text provider failed") from exc


class HttpImageProvider:
    """OpenAI-compatible image adapter, including Pollinations responses."""

    def __init__(self, endpoint: str, api_key: str | None, timeout: float) -> None:
        self.endpoint, self.api_key, self.timeout = endpoint, api_key, timeout

    async def generate_poster(self, prompt: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.endpoint,
                    json={
                        "prompt": prompt,
                        "size": "720x1080",
                        "n": 1,
                        "response_format": "url",
                    },
                    headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                )
                response.raise_for_status()
                return self._extract_url(response.json())
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderError("image provider failed") from exc

    @staticmethod
    def _extract_url(payload: object) -> str:
        """Accept both a simple `{url}` body and OpenAI-compatible `{data: [{url}]}`."""
        if not isinstance(payload, dict):
            raise ProviderError("image provider response has no URL")
        url = payload.get("url")
        if not isinstance(url, str):
            data = payload.get("data")
            if isinstance(data, list) and data and isinstance(data[0], dict):
                url = data[0].get("url")
        if not isinstance(url, str) or not url:
            raise ProviderError("image provider response has no URL")
        return url
