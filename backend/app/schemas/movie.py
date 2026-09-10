from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


class Person(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=80)
    persona: str = Field(min_length=1, max_length=240)
    traits: list[str] = Field(default_factory=list, max_length=8)

    @field_validator("traits")
    @classmethod
    def trait_lengths(cls, values: list[str]) -> list[str]:
        if any(not value.strip() or len(value) > 60 for value in values):
            raise ValueError("each trait must contain 1 to 60 characters")
        return values


class Location(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=300)


class Tone(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    mood: str = Field(min_length=1, max_length=80)
    palette: str = Field(min_length=1, max_length=120)


class MovieGenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    hero: Person
    heroine: Person
    director: Person
    primary_genre: str = Field(min_length=1, max_length=60)
    secondary_genres: list[str] = Field(default_factory=list, max_length=4)
    location: Location
    story_style: str = Field(min_length=1, max_length=100)
    tone: Tone
    era: str = Field(min_length=1, max_length=60)
    ending: str = Field(min_length=1, max_length=100)
    runtime: str = Field(min_length=1, max_length=40)
    rating_tone: str = Field(min_length=1, max_length=60)
    language: str = Field(min_length=1, max_length=60)

    @field_validator("secondary_genres")
    @classmethod
    def genre_lengths(cls, values: list[str]) -> list[str]:
        if any(not value.strip() or len(value) > 60 for value in values):
            raise ValueError("each secondary genre must contain 1 to 60 characters")
        return values


class Character(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    role: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=500)


class MovieConcept(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    tagline: str = Field(min_length=1, max_length=180)
    logline: str = Field(min_length=1, max_length=500)
    synopsis: str = Field(min_length=1, max_length=2000)
    characters: list[Character] = Field(min_length=2, max_length=10)
    cinematic_style: str = Field(min_length=1, max_length=500)
    poster_prompt: str = Field(min_length=1, max_length=4000)


class MovieGenerationResponse(MovieConcept):
    poster_url: HttpUrl
