import pytest
from httpx import ASGITransport, AsyncClient

from app.config.settings import Settings
from app.main import create_app


@pytest.fixture
def settings():
    return Settings("fallback", None, None, None, None, 1, "https://example.com/fallback.png", ["http://localhost:3000"])


@pytest.fixture
def app(settings):
    return create_app(settings)


@pytest.fixture
async def client(app):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


@pytest.fixture
def payload():
    return {
        "hero": {"name": "Arun", "persona": "reluctant detective", "traits": ["brave"]},
        "heroine": {"name": "Maya", "persona": "fearless journalist", "traits": ["sharp"]},
        "director": {"name": "Ira", "persona": "visual storyteller"},
        "primary_genre": "thriller", "secondary_genres": ["romance"],
        "location": {"name": "Chennai", "description": "rain-swept coastal streets"},
        "story_style": "nonlinear", "tone": {"mood": "moody", "palette": "teal and amber"},
        "era": "contemporary", "ending": "hopeful", "runtime": "130 minutes",
        "rating_tone": "PG-13", "language": "Tamil",
    }
