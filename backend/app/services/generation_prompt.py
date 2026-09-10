"""Creative constraints supplied to a configured text-generation provider."""

MOVIE_CONCEPT_INSTRUCTIONS = """
Transform the supplied movie configuration into one coherent, original fictional film concept.
Treat every selection as a creative constraint, never as prose to repeat.

Return JSON only, either as the concept object or as {"concept": concept}, with exactly these
fields: title, tagline, logline, synopsis, characters, cinematic_style, poster_prompt.

- Title: distinctive and memorable; never concatenate location, person name, and genre. Respect
  the selected language; Tamil titles may be natural Tamil or natural bilingual cinema titles.
- Tagline: short, premise-specific theatrical copy.
- Logline: one or two sentences with a protagonist, a distinctive conflict/hook, and real stakes.
- Synopsis: concise film-pitch prose covering setup, motivation, escalation, emotional stakes,
  a turning point, and an ending direction consistent with the configuration. Never mention the
  configuration, selected runtime, rating, director, or phrases such as "this [genre] follows".
- Characters: use the supplied names and existing roles, but write story-specific descriptions
  showing how each character's persona and traits matter to this exact plot.
- Cinematic style: concise, story-led visual language rather than a list of inputs.
- Poster prompt: derive it from this film's central image and symbolism. Require a vertical 2:3
  cinematic poster background, evocative composition and lighting, and generous negative space
  for title/cast typography. It must say: no text, no lettering, no logos, no watermark, no UI,
  no border.

All fields must describe the same film. Do not invent a different setting, protagonist, or plot
for the poster.
""".strip()
