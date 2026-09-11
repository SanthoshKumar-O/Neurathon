from __future__ import annotations

from functools import lru_cache
from os import getenv
from dataclasses import dataclass


def _origins(value: str) -> list[str]:
    return [origin.strip() for origin in value.split(",") if origin.strip()]


@dataclass(frozen=True)
class Settings:
    provider_mode: str
    llm_endpoint: str | None
    llm_api_key: str | None
    image_endpoint: str | None
    image_api_key: str | None
    provider_timeout_seconds: float
    fallback_poster_url: str
    cors_origins: list[str]

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            provider_mode=getenv("PROVIDER_MODE", "fallback").lower(),
            llm_endpoint=getenv("LLM_ENDPOINT") or None,
            llm_api_key=getenv("LLM_API_KEY") or None,
            image_endpoint=getenv("IMAGE_ENDPOINT") or None,
            image_api_key=getenv("IMAGE_API_KEY") or None,
            provider_timeout_seconds=float(getenv("PROVIDER_TIMEOUT_SECONDS", "12")),
            fallback_poster_url=getenv(
                "FALLBACK_POSTER_URL",
                "https://placehold.co/720x1080/111827/f9fafb?text=CineDream",
            ),
            cors_origins=_origins(getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,*")),
        )


@lru_cache
def get_settings() -> Settings:
    return Settings.from_env()
