export interface PersonPayload {
  name: string;
  persona: string;
  traits: string[];
}

export interface LocationPayload {
  name: string;
  description: string;
}

export interface TonePayload {
  mood: string;
  palette: string;
}

export interface MovieGenerationRequest {
  hero: PersonPayload;
  heroine: PersonPayload;
  director: PersonPayload;
  primary_genre: string;
  secondary_genres: string[];
  location: LocationPayload;
  story_style: string;
  tone: TonePayload;
  era: string;
  ending: string;
  runtime: string;
  rating_tone: string;
  language: string;
}

export interface CharacterResponse {
  name: string;
  role: string;
  description: string;
}

export interface MovieGenerationResponse {
  title: string;
  tagline: string;
  logline: string;
  synopsis: string;
  characters: CharacterResponse[];
  cinematic_style: string;
  poster_prompt: string;
  poster_url: string;
}

const CAST_MAP: Record<string, PersonPayload> = {
  arun: {
    name: "Arun",
    persona: "Reluctant detective",
    traits: ["Brave", "observant", "resilient"],
  },
  maya: {
    name: "Maya",
    persona: "Fearless journalist",
    traits: ["Sharp", "resourceful", "persistent"],
  },
};

const DIRECTOR_MAP: Record<string, PersonPayload> = {
  ira: {
    name: "Ira",
    persona: "A visual storyteller with a bold eye for atmosphere and tension",
    traits: ["Visual storyteller"],
  },
  showrunner: {
    name: "Blockbuster Showrunner",
    persona: "Big swings, impossible set pieces, a heart at the center",
    traits: ["Epic"],
  },
  minimalist: {
    name: "Indie Minimalist",
    persona: "Human-scale stories, natural light, devastating details",
    traits: ["Intimate"],
  },
  "genre-master": {
    name: "Genre Master",
    persona: "Every beat lands. Every shadow means something",
    traits: ["Precision"],
  },
};

const LOCATION_MAP: Record<string, LocationPayload> = {
  chennai: {
    name: "Chennai",
    description: "Rain-swept coastal streets where every signal feels personal.",
  },
  "neo-tokyo": {
    name: "Neo-Tokyo Skyline",
    description: "Rain-lit rooftops, a city that never looks away.",
  },
  desert: {
    name: "Desert Ruins",
    description: "Ancient stone, endless heat, a signal beneath the sand.",
  },
  coast: {
    name: "Coastal Village",
    description: "Salt air, small rooms, secrets carried by the tide.",
  },
  station: {
    name: "Space Station",
    description: "A beautiful machine drifting past the last sunrise.",
  },
  ancient: {
    name: "Ancient City",
    description: "A forgotten empire waiting under the present day.",
  },
};

const GENRE_MAP: Record<string, string> = {
  thriller: "Thriller",
  romance: "Romance",
  "sci-fi": "Sci-Fi",
  drama: "Drama",
  fantasy: "Fantasy",
  comedy: "Comedy",
};

const STORY_MAP: Record<string, string> = {
  journey: "Hero's Journey",
  "slow-burn": "Slow Burn",
  nonlinear: "Nonlinear",
  tragic: "Tragic Twist",
};

export function buildMoviePayload(selections: Record<string, string>): MovieGenerationRequest {
  const hero = CAST_MAP[selections.cast] || {
    name: selections.cast || "Arun",
    persona: "Protagonist lead",
    traits: ["Brave", "observant"],
  };

  const heroine = CAST_MAP[selections.heroine] || {
    name: selections.heroine || "Maya",
    persona: "Co-lead investigator",
    traits: ["Sharp", "resourceful"],
  };

  const director = DIRECTOR_MAP[selections.director] || {
    name: selections.director || "Ira",
    persona: "Visual storyteller",
    traits: ["Atmospheric"],
  };

  const primaryGenre = GENRE_MAP[selections.genre] || selections.genre || "Thriller";
  const secondaryGenreRaw = GENRE_MAP[selections.secondaryGenre] || selections.secondaryGenre;
  const secondaryGenres = secondaryGenreRaw && secondaryGenreRaw !== primaryGenre ? [secondaryGenreRaw] : ["Romance"];

  const location = LOCATION_MAP[selections.location] || {
    name: selections.location || "Chennai",
    description: "Evocative cinematic environment.",
  };

  const storyStyle = STORY_MAP[selections.story] || selections.story || "Nonlinear";
  const hopeVal = selections.hope || "58";
  const chaosVal = selections.chaos || "35";

  return {
    hero,
    heroine,
    director,
    primary_genre: primaryGenre,
    secondary_genres: secondaryGenres,
    location,
    story_style: storyStyle,
    tone: {
      mood: `Atmospheric (Hope: ${hopeVal}%, Chaos: ${chaosVal}%)`,
      palette: "Teal and amber nocturnal mood",
    },
    era: "Contemporary",
    ending: "Hopeful",
    runtime: "Feature · 2h 06m",
    rating_tone: "Mature & atmospheric",
    language: selections.language === "language" ? "Tamil" : (selections.language || "Tamil"),
  };
}

export async function generateMovieConcept(payload: MovieGenerationRequest): Promise<MovieGenerationResponse> {
  const apiUrl = "/api/movies/generate";
  const fallbackUrl = "http://127.0.0.1:8000/api/movies/generate";

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Proxy request failed: ${response.statusText}`);
    }
  } catch (err) {
    // Retry directly against backend port 8000 if proxy isn't available
    response = await fetch(fallbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText}`);
  }

  return await response.json();
}
