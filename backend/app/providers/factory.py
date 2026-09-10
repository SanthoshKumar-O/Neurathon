from __future__ import annotations

from app.config.settings import Settings
from app.providers.external import HttpImageProvider, HttpLLMProvider


def build_providers(settings: Settings):
    """Return optional external providers; services own deterministic fallback."""
    if settings.provider_mode != "external":
        return None, None
    llm = HttpLLMProvider(settings.llm_endpoint, settings.llm_api_key, settings.provider_timeout_seconds) if settings.llm_endpoint else None
    image = HttpImageProvider(settings.image_endpoint, settings.image_api_key, settings.provider_timeout_seconds) if settings.image_endpoint else None
    return llm, image
