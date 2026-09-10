import pytest

from app.providers.base import ProviderError
from app.providers.external import HttpImageProvider
from app.services.movie_generation import MovieGenerationService


class FailingLLM:
    async def generate_concept(self, request):
        raise ProviderError("offline")


class FailingImage:
    async def generate_poster(self, prompt):
        raise ProviderError("offline")


@pytest.mark.asyncio
async def test_provider_failures_fall_back(settings, payload):
    from app.schemas.movie import MovieGenerationRequest
    service = MovieGenerationService(settings, FailingLLM(), FailingImage())
    result = await service.generate(MovieGenerationRequest.model_validate(payload))
    assert result.title != "Chennai: Thriller"
    assert result.title
    assert result.tagline
    assert result.logline
    assert result.synopsis
    assert result.poster_prompt
    assert [character.name for character in result.characters] == ["Arun", "Maya", "Ira"]
    assert {"title", "tagline", "logline", "synopsis", "characters", "cinematic_style", "poster_prompt", "poster_url"} == set(result.model_dump(mode="json"))
    assert str(result.poster_url) == "https://example.com/fallback.png"


@pytest.mark.asyncio
async def test_fallback_is_deterministic(settings, payload):
    from app.schemas.movie import MovieGenerationRequest
    request = MovieGenerationRequest.model_validate(payload)
    service = MovieGenerationService(settings)
    assert (await service.generate(request)).model_dump() == (await service.generate(request)).model_dump()


def test_image_provider_reads_pollinations_url_response():
    assert HttpImageProvider._extract_url({"data": [{"url": "https://pollinations.ai/image.png"}]}) == "https://pollinations.ai/image.png"
