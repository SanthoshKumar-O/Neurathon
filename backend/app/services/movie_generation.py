from __future__ import annotations

from app.config.settings import Settings
from app.providers.base import ImageProvider, LLMProvider, ProviderError
from app.schemas.movie import Character, MovieConcept, MovieGenerationRequest, MovieGenerationResponse


class MovieGenerationService:
    def __init__(self, settings: Settings, llm: LLMProvider | None = None, image: ImageProvider | None = None) -> None:
        self.settings, self.llm, self.image = settings, llm, image

    async def generate(self, request: MovieGenerationRequest) -> MovieGenerationResponse:
        concept = await self._concept(request)
        poster_url = await self._poster(concept.poster_prompt)
        return MovieGenerationResponse(**concept.model_dump(), poster_url=poster_url)

    async def _concept(self, request: MovieGenerationRequest) -> MovieConcept:
        if self.llm:
            try:
                return await self.llm.generate_concept(request)
            except ProviderError:
                pass
        return self._fallback_concept(request)

    async def _poster(self, prompt: str) -> str:
        if self.image:
            try:
                return await self.image.generate_poster(prompt)
            except ProviderError:
                pass
        return self.settings.fallback_poster_url

    @staticmethod
    def _fallback_concept(request: MovieGenerationRequest) -> MovieConcept:
        hero, heroine, director = request.hero, request.heroine, request.director
        is_tamil = request.language.strip().lower() == "tamil"
        genre_words = " ".join([request.primary_genre, *request.secondary_genres]).lower()
        stormy = any(word in f"{request.location.description} {request.tone.mood}".lower() for word in ("rain", "monsoon", "storm"))
        title = (
            "Mazhaiyin Marupakkam" if is_tamil and stormy else
            "Vaanathin Nizhal" if is_tamil else
            "After the Last Rain" if stormy else
            "The Unsent Hour"
        )
        evidence = "a weather-stained cassette that records a murder no one remembers" if any(
            word in genre_words for word in ("thriller", "mystery", "crime")
        ) else "an unsent letter that predicts the moment two lives will break apart"
        symbol = "an old cassette" if "cassette" in evidence else "an unopened letter"
        threat = "the people who buried its truth begin closing in" if any(
            word in genre_words for word in ("thriller", "mystery", "crime")
        ) else "the choice it demands could cost them the life they are trying to build"
        ending = (
            "At the point of no return, they choose to expose the truth together, leaving room for a hard-won new beginning."
            if request.ending.lower() in {"hopeful", "happy", "uplifting"}
            else "At the point of no return, they make the choice the truth demands, even though it leaves a lasting scar."
        )
        prompt = (
            f"Vertical 2:3 cinematic movie poster background for '{title}': a rain-lashed "
            f"{request.location.name} street at night, a lone detective-like figure holding {symbol} "
            "beside a woman beneath a wind-torn umbrella, distant headlights dissolving into wet reflections. "
            f"Suggest {request.location.description} through the environment; use {request.tone.palette} "
            f"lighting, deep shadows, and a {request.tone.mood} emotional charge. The central object and "
            "a fractured reflection are visual symbols of a buried past. Cinematic depth, dramatic negative "
            "space at the top and bottom for title and cast typography. No text, no lettering, no logos, "
            "no watermark, no UI, no border."
        )
        return MovieConcept(
            title=title,
            tagline="Some truths only surface after the storm.",
            logline=(f"When {hero.name} finds {evidence}, the case drags him and {heroine.name} "
                     f"toward a night their city agreed to forget. To save the person now being framed, "
                     f"they must decide whether to trust each other before {threat}."),
            synopsis=(f"{hero.name} has learned to keep distance from every case that asks for more than facts. "
                      f"But after a monsoon uncovers {evidence}, a detail in the recording pulls {hero.name} "
                      f"back to an old wound. {heroine.name}, who has her own reason to distrust the official "
                      f"story, becomes an uneasy ally as they trace the clue through {request.location.name}. "
                      f"Each answer puts someone they care about in danger and exposes a connection neither can "
                      f"dismiss. When the final recording reveals who benefited from the silence, they must risk "
                      f"everything in public rather than let the past claim another victim. {ending}"),
            characters=[
                Character(name=hero.name, role="Hero", description=(
                    f"A {hero.persona} whose patience for small details makes the cassette's hidden pattern visible. "
                    f"{hero.name}'s {', '.join(hero.traits) or 'resilient'} instincts keep the investigation alive, but a buried personal memory makes every discovery costly."
                )),
                Character(name=heroine.name, role="Heroine", description=(
                    f"A {heroine.persona} with a private connection to the erased night. Her {', '.join(heroine.traits) or 'resourceful'} instincts turn her from a wary witness into the one person willing to challenge {hero.name} when the evidence becomes dangerous."
                )),
                Character(name=director.name, role="Director's narrative lens", description=(
                    f"A {director.persona} shapes the story around withheld memories, rain-soaked clues, and the emotional cost of choosing truth over safety."
                )),
            ],
            cinematic_style=(f"A {request.era} nocturnal mystery, framed through rain-polished streets, intimate close-ups, "
                             f"and {request.tone.palette} pools of light. The camera treats each reflection and clue "
                             f"as a fragment of memory, balancing {request.tone.mood} suspense with an emotionally charged partnership."),
            poster_prompt=prompt,
        )
