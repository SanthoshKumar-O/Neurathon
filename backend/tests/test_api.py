import pytest


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_generate_returns_valid_result(client, payload):
    response = await client.post("/api/movies/generate", json=payload)
    data = response.json()
    assert response.status_code == 200
    assert data["poster_url"] == "https://example.com/fallback.png"
    assert data["title"] != "Chennai: Thriller"
    assert len(data["characters"]) >= 2
    assert "Vertical 2:3 cinematic" in data["poster_prompt"]
    assert "No text" in data["poster_prompt"]


@pytest.mark.asyncio
async def test_invalid_request_has_clear_validation_error(client, payload):
    payload["hero"]["name"] = ""
    response = await client.post("/api/movies/generate", json=payload)
    assert response.status_code == 422
    assert response.json()["detail"]
