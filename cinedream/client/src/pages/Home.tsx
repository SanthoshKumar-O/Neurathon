import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clapperboard,
  Download,
  Film,
  Gauge,
  Headphones,
  Info,
  Layers3,
  Lightbulb,
  MapPin,
  Menu,
  Mic2,
  Moon,
  MoveHorizontal,
  Palette,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  SunMedium,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { buildMoviePayload, generateMovieConcept, type MovieGenerationResponse } from "@/lib/movieApi";

type Stage =
  | "intro"
  | "cast"
  | "director"
  | "genre"
  | "location"
  | "story"
  | "production"
  | "review"
  | "generating"
  | "result";

type Choice = {
  id: string;
  label: string;
  eyebrow?: string;
  description?: string;
  image?: string;
  icon?: React.ElementType;
  tone?: string;
};

const ASSETS = {
  stage: "/assets/cinedream-stage.jpg",
  hero: "/assets/cinedream-hero.jpg",
  heroine: "/assets/cinedream-heroine.jpg",
  poster: "/assets/cinedream-chennai-poster.jpg",
};

const steps: { id: Exclude<Stage, "intro" | "generating" | "result">; label: string; icon: React.ElementType }[] = [
  { id: "cast", label: "Cast", icon: Users },
  { id: "director", label: "Director", icon: Clapperboard },
  { id: "genre", label: "Genre", icon: Layers3 },
  { id: "location", label: "Location", icon: MapPin },
  { id: "story", label: "Story", icon: Lightbulb },
  { id: "production", label: "Production", icon: Film },
  { id: "review", label: "Review", icon: Check },
];

const castOptions: Choice[] = [
  { id: "arun", label: "Arun", eyebrow: "Reluctant detective", description: "Brave, observant, and pulled toward the truth.", image: ASSETS.hero },
  { id: "maya", label: "Maya", eyebrow: "Fearless journalist", description: "Sharp, resourceful, and never off the record.", image: ASSETS.heroine },
  { id: "custom", label: "Write your own", eyebrow: "Open casting", description: "Bring someone no one has seen before.", icon: WandSparkles },
];

const directorOptions: Choice[] = [
  { id: "ira", label: "Ira", description: "A visual storyteller with a bold eye for atmosphere and tension.", icon: Palette, tone: "Visual storyteller" },
  { id: "showrunner", label: "Blockbuster Showrunner", description: "Big swings, impossible set pieces, a heart at the center.", icon: Clapperboard, tone: "Epic" },
  { id: "minimalist", label: "Indie Minimalist", description: "Human-scale stories, natural light, devastating details.", icon: Mic2, tone: "Intimate" },
  { id: "genre-master", label: "Genre Master", description: "Every beat lands. Every shadow means something.", icon: Star, tone: "Precision" },
];

const genreOptions: Choice[] = [
  { id: "thriller", label: "Thriller", icon: Gauge, tone: "Primary" },
  { id: "romance", label: "Romance", icon: SunMedium, tone: "Blend" },
  { id: "sci-fi", label: "Sci-Fi", icon: Moon, tone: "Blend" },
  { id: "drama", label: "Drama", icon: Headphones, tone: "Blend" },
  { id: "fantasy", label: "Fantasy", icon: Sparkles, tone: "Blend" },
  { id: "comedy", label: "Comedy", icon: Play, tone: "Blend" },
];

const locationOptions: Choice[] = [
  { id: "chennai", label: "Chennai", description: "Rain-swept coastal streets where every signal feels personal.", icon: MapPin },
  { id: "neo-tokyo", label: "Neo-Tokyo Skyline", description: "Rain-lit rooftops, a city that never looks away.", icon: Lightbulb },
  { id: "desert", label: "Desert Ruins", description: "Ancient stone, endless heat, a signal beneath the sand.", icon: SunMedium },
  { id: "coast", label: "Coastal Village", description: "Salt air, small rooms, secrets carried by the tide.", icon: MapPin },
  { id: "station", label: "Space Station", description: "A beautiful machine drifting past the last sunrise.", icon: Moon },
  { id: "ancient", label: "Ancient City", description: "A forgotten empire waiting under the present day.", icon: Layers3 },
];

const storyOptions: Choice[] = [
  { id: "journey", label: "Hero's Journey", description: "A familiar world breaks open. Someone has to cross the threshold.", icon: MoveHorizontal },
  { id: "slow-burn", label: "Slow Burn", description: "Small details gather until the truth is impossible to ignore.", icon: Moon },
  { id: "nonlinear", label: "Nonlinear", description: "Memory is the edit. The ending is hidden in the first frame.", icon: RotateCcw },
  { id: "tragic", label: "Tragic Twist", description: "The choice that saves everything costs the one thing that matters.", icon: Star },
];

const productionOptions: Choice[] = [
  { id: "score", label: "Analog synths + strings", eyebrow: "Score mood", icon: Headphones },
  { id: "runtime", label: "Feature · 2h 06m", eyebrow: "Runtime", icon: Film },
  { id: "rating", label: "Mature & atmospheric", eyebrow: "Rating tone", icon: Info },
  { id: "language", label: "English · subtitles on", eyebrow: "Language", icon: Mic2 },
];

const defaultSelections: Record<string, string> = {
  cast: "arun",
  heroine: "maya",
  director: "ira",
  genre: "thriller",
  secondaryGenre: "romance",
  location: "chennai",
  story: "nonlinear",
  production: "score",
  runtime: "runtime",
  rating: "rating",
  language: "language",
};

function ChoiceCard({ choice, selected, onSelect, className = "" }: { choice: Choice; selected: boolean; onSelect: () => void; className?: string }) {
  const Icon = choice.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`choice-card ${selected ? "is-selected" : ""} ${className}`}
    >
      {choice.image ? (
        <div className="choice-image-wrap">
          <img src={choice.image} alt="" className="choice-image" />
          <div className="choice-image-scrim" />
        </div>
      ) : (
        <div className="choice-icon-wrap">{Icon ? <Icon size={22} strokeWidth={1.4} /> : <Sparkles size={22} />}</div>
      )}
      <div className="choice-content">
        {choice.eyebrow && <span className="choice-eyebrow">{choice.eyebrow}</span>}
        <span className="choice-label">{choice.label}</span>
        {choice.description && <span className="choice-description">{choice.description}</span>}
        {choice.tone && <span className="choice-tone">{choice.tone}</span>}
      </div>
      <span className="choice-check" aria-hidden="true">{selected ? <Check size={13} /> : <span />}</span>
    </button>
  );
}

function ProgressRail({ stage, onJump }: { stage: Stage; onJump: (stage: Stage) => void }) {
  const current = Math.max(0, steps.findIndex((item) => item.id === stage));
  return (
    <aside className="progress-rail" aria-label="Movie production steps">
      <div className="rail-heading"><span className="eyebrow">Your production</span><span className="rail-count">0{Math.min(current + 1, 7)} / 07</span></div>
      <div className="rail-line" />
      <nav className="rail-steps">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const active = stage === step.id;
          const done = index < current || stage === "review" && index < 6 || stage === "result";
          return (
            <button key={step.id} type="button" className={`rail-step ${active ? "active" : ""} ${done ? "done" : ""}`} onClick={() => index <= current && onJump(step.id)} disabled={index > current}>
              <span className="rail-icon">{done ? <Check size={13} /> : <Icon size={14} strokeWidth={1.5} />}</span>
              <span>{step.label}</span>
              {active && <ChevronRight size={14} className="rail-arrow" />}
            </button>
          );
        })}
      </nav>
      <div className="rail-note"><Sparkles size={16} /><span>Director mode<br /><b>auto-save on</b></span></div>
    </aside>
  );
}

function Landing({ onStart, onSurprise }: { onStart: () => void; onSurprise: () => void }) {
  return (
    <main className="landing-shell">
      <div className="landing-backdrop" />
      <header className="topbar landing-topbar">
        <div className="brand"><span className="brand-mark"><Film size={16} /></span><span>CineDream</span><span className="brand-dot">/</span><span className="brand-sub">Director's cut</span></div>
        <div className="topbar-right"><span className="status-dot" /> <span>Studio 04 · Online</span><button className="icon-button" aria-label="Open menu"><Menu size={18} /></button></div>
      </header>
      <div className="landing-content container">
        <div className="landing-kicker"><span className="kicker-line" /> An interactive story studio <span className="kicker-line" /></div>
        <h1>Build the movie<br /><em>you've been waiting for.</em></h1>
        <p className="landing-copy">Every great film starts with a choice.<br />Make yours.</p>
        <div className="landing-actions"><button className="btn btn-primary btn-large" onClick={onStart}><span>Start directing</span><ArrowRight size={18} /></button><button className="btn btn-ghost" onClick={onSurprise}><Sparkles size={16} /> Surprise me</button></div>
        <div className="landing-foot"><span><span className="foot-dot" /> No script required</span><span>•</span><span>7 decisions</span><span>•</span><span>1 original movie</span></div>
      </div>
      <div className="landing-corner landing-corner-left">Roll sound<br /><span>Take 01 / Scene 01</span></div>
      <div className="landing-corner landing-corner-right"><span className="lens-ring" /><span>© 2026 CineDream</span></div>
      <div className="grain" />
    </main>
  );
}

function Header({ onHome, onSurprise, onMenu }: { onHome: () => void; onSurprise: () => void; onMenu: () => void }) {
  return <header className="topbar app-topbar"><button className="brand brand-button" onClick={onHome}><span className="brand-mark"><Film size={16} /></span><span>CineDream</span></button><div className="header-center"><span className="live-pip" /> <span>DIRECTOR MODE</span></div><div className="topbar-right"><button className="header-link" onClick={onSurprise}><Sparkles size={15} /> Surprise me</button><button className="icon-button mobile-menu" aria-label="Open menu" onClick={onMenu}><Menu size={18} /></button></div></header>;
}

function CastStage({ selections, select }: { selections: Record<string, string>; select: (key: string, value: string) => void }) {
  return <StageLayout eyebrow="Scene 01 / Casting" title={<>Who carries<br /><em>the story?</em></>} description="Start with the people. Choose a lead for the impossible and the one person who sees them clearly." hint="Choose a hero and a heroine" >
    <div className="cast-grid"><div><div className="selection-label"><span>01</span> Your hero</div><div className="choice-grid cast-cards">{castOptions.map((choice) => <ChoiceCard key={choice.id} choice={choice} selected={selections.cast === choice.id} onSelect={() => select("cast", choice.id)} />)}</div></div><div><div className="selection-label"><span>02</span> Your heroine</div><div className="choice-grid cast-cards">{castOptions.map((choice) => <ChoiceCard key={choice.id} choice={choice} selected={selections.heroine === choice.id} onSelect={() => select("heroine", choice.id)} />)}</div></div></div>
  </StageLayout>;
}

function StageLayout({ eyebrow, title, description, hint, children }: { eyebrow: string; title: React.ReactNode; description: string; hint?: string; children: React.ReactNode }) {
  return <section className="stage-view"><div className="stage-intro"><div className="section-kicker"><span className="kicker-number">{eyebrow.split(" /")[0]}</span> {eyebrow.split(" /").slice(1).join(" / ")}</div><h2>{title}</h2><p>{description}</p>{hint && <div className="stage-hint"><span className="hint-pulse" /> {hint}</div>}</div><div className="stage-content">{children}</div></section>;
}

function DirectorStage({ selections, select }: { selections: Record<string, string>; select: (key: string, value: string) => void }) {
  return <StageLayout eyebrow="Scene 02 / Directing style" title={<>What kind of<br /><em>world-maker?</em></>} description="You're not choosing a famous name. You're choosing the lens that turns your idea into a film." hint="One point of view sets the rhythm">
    <div className="choice-grid director-grid">{directorOptions.map((choice) => <ChoiceCard key={choice.id} choice={choice} selected={selections.director === choice.id} onSelect={() => select("director", choice.id)} />)}</div>
    <div className="director-footer"><span className="foot-rule" /> <span>Every director leaves a fingerprint.</span></div>
  </StageLayout>;
}

function GenreStage({ selections, select }: { selections: Record<string, string>; select: (key: string, value: string) => void }) {
  return <StageLayout eyebrow="Scene 03 / Genre" title={<>Give it a<br /><em>pulse.</em></>} description="One primary genre. One secret ingredient. The best movies live in the tension between the two." hint="Blend genres for a story with edges">
    <div className="genre-pick-row"><div className="genre-primary"><div className="selection-label"><span>01</span> Primary genre</div><ChoiceCard choice={genreOptions.find((g) => g.id === selections.genre) ?? genreOptions[0]} selected onSelect={() => {}} className="genre-feature" /></div><div className="genre-secondary"><div className="selection-label"><span>02</span> Add a second</div><div className="genre-grid">{genreOptions.filter((g) => g.id !== selections.genre).map((choice) => <ChoiceCard key={choice.id} choice={choice} selected={selections.secondaryGenre === choice.id} onSelect={() => select("secondaryGenre", choice.id)} />)}</div></div></div><div className="genre-tabs" role="tablist" aria-label="Genre categories"><button className="genre-tab active">All genres</button><button className="genre-tab">Classic</button><button className="genre-tab">Strange</button></div>
  </StageLayout>;
}

function LocationStage({ selections, select }: { selections: Record<string, string>; select: (key: string, value: string) => void }) {
  return <StageLayout eyebrow="Scene 04 / Location" title={<>Where does<br /><em>it happen?</em></>} description="A place is never just a backdrop. It tells the audience what kind of story they're about to enter." hint="Move your camera somewhere impossible">
    <div className="location-grid">{locationOptions.map((choice, index) => <button key={choice.id} type="button" className={`location-card ${selections.location === choice.id ? "is-selected" : ""} location-${index + 1}`} onClick={() => select("location", choice.id)}><div className="location-art"><div className={`location-art-inner art-${choice.id}`}><span className="art-sun" /><span className="art-horizon" /><span className="art-gridlines" /></div></div><div className="location-info"><span className="location-index">0{index + 1}</span><span className="choice-label">{choice.label}</span><span className="choice-description">{choice.description}</span><span className="choice-check">{selections.location === choice.id ? <Check size={13} /> : <span />}</span></div></button>)}</div>
    <div className="custom-field"><span className="custom-prefix">Or imagine</span><input placeholder="a location of your own..." aria-label="Custom location" /><ArrowRight size={16} /></div>
  </StageLayout>;
}

function StoryStage({ selections, select }: { selections: Record<string, string>; select: (key: string, value: string) => void }) {
  const hope = selections.hope ?? "58";
  const chaos = selections.chaos ?? "35";
  return <StageLayout eyebrow="Scene 05 / Story" title={<>What stays<br /><em>after the lights?</em></>} description="Shape the emotional weather. We'll take care of the plot points." hint="There are no wrong instincts here">
    <div className="story-wrap"><div className="selection-label"><span>01</span> Story structure</div><div className="choice-grid story-grid">{storyOptions.map((choice) => <ChoiceCard key={choice.id} choice={choice} selected={selections.story === choice.id} onSelect={() => select("story", choice.id)} />)}</div><div className="slider-block"><SliderLine labelLeft="Hope" labelRight="Despair" value={hope} onChange={(value) => select("hope", value)} accent="amber" /><SliderLine labelLeft="Chaos" labelRight="Order" value={chaos} onChange={(value) => select("chaos", value)} accent="red" /></div></div>
  </StageLayout>;
}

function SliderLine({ labelLeft, labelRight, value, onChange, accent }: { labelLeft: string; labelRight: string; value: string; onChange: (value: string) => void; accent: string }) {
  return <label className="slider-line"><span className="slider-labels"><span>{labelLeft}</span><b>{labelRight}</b></span><input type="range" min="0" max="100" value={value} onChange={(event) => onChange(event.target.value)} className={`range-${accent}`} /><span className="slider-endpoints"><span>0</span><span>100</span></span></label>;
}

function ProductionStage({ selections, select }: { selections: Record<string, string>; select: (key: string, value: string) => void }) {
  return <StageLayout eyebrow="Scene 06 / Production" title={<>Set the<br /><em>atmosphere.</em></>} description="The final technical choices. These are the details that make the world feel lived in." hint="Last checks before we roll camera">
    <div className="production-grid">{productionOptions.map((choice) => <ChoiceCard key={choice.id} choice={choice} selected={selections[choice.id] === choice.id} onSelect={() => select(choice.id, choice.id)} />)}</div><div className="title-field"><label htmlFor="title">Working title <span>optional</span></label><input id="title" placeholder="Leave it to the story engine" /><span className="title-count">0 / 42</span></div><div className="production-note"><Sparkles size={15} /><span>Your choices are saved as you direct.</span></div>
  </StageLayout>;
}

function ReviewStage({ selections, onEdit }: { selections: Record<string, string>; onEdit: (stage: Stage) => void }) {
  const labelFor = (options: Choice[], id: string | undefined, fallback: string) => options.find((option) => option.id === id)?.label ?? fallback;
  const hero = labelFor(castOptions, selections.cast, "Your hero");
  const heroine = labelFor(castOptions, selections.heroine, "Your heroine");
  const director = labelFor(directorOptions, selections.director, "Your director");
  const primaryGenre = labelFor(genreOptions, selections.genre, "Primary genre");
  const secondaryGenre = labelFor(genreOptions, selections.secondaryGenre, "Second genre");
  const location = labelFor(locationOptions, selections.location, "Your location");
  const story = labelFor(storyOptions, selections.story, "Your story");
  const rows = [
    ["Cast", `${hero} + ${heroine}`, "cast"],
    ["Director", director, "director"],
    ["Genre", `${primaryGenre} / ${secondaryGenre}`, "genre"],
    ["Location", location, "location"],
    ["Story", `${story} · Hopeful ending`, "story"],
    ["Production", "130 minutes · PG-13 · Tamil", "production"],
  ];
  return <StageLayout eyebrow="Scene 07 / Review" title={<>Your film is<br /><em>ready to roll.</em></>} description="Look over the choices that will become your movie. You can still step back into any scene." hint="Nothing is locked until you say action">
    <div className="review-card">{rows.map(([label, value, stage]) => <button type="button" key={label} className="review-row" onClick={() => onEdit(stage as Stage)}><span className="review-label">{label}</span><span className="review-value">{value}</span><span className="review-edit">Edit <ArrowRight size={14} /></span></button>)}</div><div className="review-callout"><span className="callout-mark"><Check size={15} /></span><span><b>All scenes accounted for.</b><br />Your movie will be one of a kind.</span></div>
    <div className="review-detail-grid">
      <div><span>Request payload</span><b>12 creative inputs</b><small>Characters, genres, setting, tone, era, ending, runtime, rating and language.</small></div>
      <div><span>Response preview</span><b>Title + story package</b><small>Title, tagline, logline, synopsis, character cards and cinematic style.</small></div>
      <div><span>Creative profile</span><b>Moody · teal + amber</b><small>Contemporary texture with a hopeful ending and a nonlinear structure.</small></div>
    </div>
  </StageLayout>;
}

function GeneratingStage({ generationStep }: { generationStep: number }) {
  const lines = ["Casting locked", "Location secured", "Story developing", "Camera rolling", "Rendering your movie"];
  return <section className="generating-view"><div className="generating-inner"><div className="generating-kicker"><span className="live-pip" /> Production in progress</div><div className="clapper-animation"><div className="clapper-top"><span /><span /><span /><span /><span /></div><div className="clapper-body"><Clapperboard size={42} strokeWidth={1} /><span>CINEDREAM</span><b>TAKE 01</b></div></div><h2>Making something<br /><em>worth watching.</em></h2><div className="production-list">{lines.map((line, index) => <div key={line} className={`production-line ${index < generationStep ? "done" : ""} ${index === generationStep ? "current" : ""}`}><span className="production-status">{index < generationStep ? <Check size={13} /> : index === generationStep ? <span className="status-pulse" /> : <span />}</span><span>{line}</span><span className="production-meta">{index < generationStep ? "done" : index === generationStep ? "now" : "queued"}</span></div>)}</div><div className="generation-caption">A little patience. The lights are finding their mark.</div></div></section>;
}

function ResultStage({
  movieResult,
  selections,
  onRemix,
  onAnother,
}: {
  movieResult: MovieGenerationResponse | null;
  selections: Record<string, string>;
  onRemix: () => void;
  onAnother: () => void;
}) {
  const posterUrl = movieResult?.poster_url ? String(movieResult.poster_url) : ASSETS.poster;
  const title = movieResult?.title || "Chennai: Thriller";
  const tagline = movieResult?.tagline ? `“${movieResult.tagline}”` : "“One nonlinear choice can change everything.”";
  const logline = movieResult?.logline || "In Chennai, Arun, a reluctant detective, and Maya, a fearless journalist, confront a thriller turning point under Ira's bold vision.";
  const synopsis = movieResult?.synopsis || "Set against rain-swept coastal streets, Arun and Maya's contrasting strengths collide as the nonlinear story builds toward a hopeful PG-13 climax.";
  const cinematicStyle = movieResult?.cinematic_style || "Moody thriller filmmaking with a teal and amber visual palette and contemporary texture.";

  const heroName = selections.cast === "maya" ? "Maya" : "Arun";
  const heroineName = selections.heroine === "arun" ? "Arun" : "Maya";
  const directorName = selections.director === "showrunner" ? "Showrunner" : selections.director === "minimalist" ? "Minimalist" : selections.director === "genre-master" ? "Genre Master" : "Ira";
  const primaryGenre = selections.genre || "Thriller";
  const secondaryGenre = selections.secondaryGenre || "Romance";
  const locationName = selections.location ? selections.location.charAt(0).toUpperCase() + selections.location.slice(1) : "Chennai";
  const languageName = selections.language === "language" || !selections.language ? "Tamil" : selections.language;

  const characters = movieResult?.characters || [
    { name: heroName, role: "Hero", description: "Reluctant detective · Brave, observant" },
    { name: heroineName, role: "Heroine", description: "Fearless journalist · Sharp, resourceful" },
    { name: directorName, role: "Director's lens", description: "Bold visual narrative" },
  ];

  return (
    <section className="result-view">
      <div className="result-hero">
        <div className="result-poster">
          <img
            src={posterUrl}
            alt={title}
            className="result-poster-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ASSETS.poster;
            }}
          />
          <div className="poster-overlay">
            <span className="poster-studio">A CINEDREAM ORIGINAL</span>
            <span className="poster-title">{title}</span>
            <span className="poster-credit">{tagline}</span>
          </div>
        </div>
        <div className="result-copy">
          <div className="section-kicker"><span className="kicker-number">FIN</span> Your movie</div>
          <h2>{title}</h2>
          <p className="result-tagline">{tagline}</p>
          <div className="result-meta">
            <span>{primaryGenre}</span><i /> <span>{secondaryGenre}</span><i /> <span>130 min</span><i /> <span>PG-13</span>
          </div>
          <p className="result-logline">{logline}</p>
          <div className="credit-grid">
            <div><span>Director</span><b>{directorName}</b></div>
            <div><span>Cast</span><b>{heroName} + {heroineName}</b></div>
            <div><span>Location</span><b>{locationName}</b></div>
            <div><span>Language</span><b>{languageName}</b></div>
          </div>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={onRemix}><RotateCcw size={16} /> Remix movie</button>
            <a className="btn btn-ghost" href={posterUrl} target="_blank" rel="noopener noreferrer" download={`${title.toLowerCase().replace(/\s+/g, "-")}-poster.jpg`}>
              <Download size={16} /> Download poster
            </a>
          </div>
        </div>
      </div>
      <div className="characters-strip">
        <div className="strip-label">03 / Characters</div>
        {characters.map((char, index) => (
          <div key={index} className="character-card">
            <span>{char.role} · {char.name}</span>
            <b>{char.name}</b>
            <small>{char.description}</small>
          </div>
        ))}
      </div>
      <div className="synopsis-strip">
        <div>
          <span className="strip-label">01 / Synopsis</span>
          <p>{synopsis}</p>
        </div>
        <div>
          <span className="strip-label">02 / Cinematic style</span>
          <p>{cinematicStyle}</p>
        </div>
        <button className="btn btn-outline" onClick={onAnother}>Create another <ArrowRight size={15} /></button>
      </div>
    </section>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [selections, setSelections] = useState<Record<string, string>>(defaultSelections);
  const [generationStep, setGenerationStep] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [movieResult, setMovieResult] = useState<MovieGenerationResponse | null>(null);

  const currentIndex = useMemo(() => steps.findIndex((item) => item.id === stage), [stage]);
  const select = (key: string, value: string) => setSelections((current) => ({ ...current, [key]: value }));
  const surprise = () => {
    setSelections((current) => ({ ...current, cast: "arun", heroine: "maya", director: "ira", genre: "thriller", secondaryGenre: "romance", location: "chennai", story: "nonlinear", hope: "68", chaos: "42" }));
    setStage("review");
  };

  useEffect(() => {
    if (stage !== "generating") return;
    setGenerationStep(0);
    let isMounted = true;
    const payload = buildMoviePayload(selections);

    const timer = window.setInterval(() => {
      setGenerationStep((value) => (value < 4 ? value + 1 : value));
    }, 700);

    generateMovieConcept(payload)
      .then((data) => {
        if (!isMounted) return;
        setMovieResult(data);
        setGenerationStep(4);
        window.setTimeout(() => {
          if (isMounted) setStage("result");
        }, 400);
      })
      .catch((err) => {
        console.error("Error generating concept from backend API:", err);
        if (!isMounted) return;
        setGenerationStep(4);
        window.setTimeout(() => {
          if (isMounted) setStage("result");
        }, 600);
      })
      .finally(() => {
        window.clearInterval(timer);
      });

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [stage, selections]);

  if (stage === "intro") return <Landing onStart={() => setStage("cast")} onSurprise={surprise} />;
  if (stage === "generating") return <GeneratingStage generationStep={generationStep} />;
  if (stage === "result") return <><Header onHome={() => setStage("intro")} onSurprise={surprise} onMenu={() => setMenuOpen((value) => !value)} /><ResultStage movieResult={movieResult} selections={selections} onRemix={() => setStage("review")} onAnother={() => { setSelections(defaultSelections); setMovieResult(null); setStage("cast"); }} /></>;

  return <div className="app-shell"><Header onHome={() => setStage("intro")} onSurprise={surprise} onMenu={() => setMenuOpen((value) => !value)} />{menuOpen && <div className="mobile-menu-popover"><button onClick={() => { setStage("intro"); setMenuOpen(false); }}><ArrowLeft size={15} /> Back to soundstage</button><button onClick={surprise}><Sparkles size={15} /> Surprise me</button></div>}<div className="app-layout"><ProgressRail stage={stage} onJump={setStage} /><main className="main-stage"><div className="mobile-stage-progress"><span>0{Math.min(currentIndex + 1, 7)} / 07</span><div><i style={{ width: `${((currentIndex + 1) / 7) * 100}%` }} /></div></div>{stage === "cast" && <CastStage selections={selections} select={select} />}{stage === "director" && <DirectorStage selections={selections} select={select} />}{stage === "genre" && <GenreStage selections={selections} select={select} />}{stage === "location" && <LocationStage selections={selections} select={select} />}{stage === "story" && <StoryStage selections={selections} select={select} />}{stage === "production" && <ProductionStage selections={selections} select={select} />}{stage === "review" && <ReviewStage selections={selections} onEdit={setStage} />}<div className="stage-footer"><button type="button" className="back-link" onClick={() => setStage(currentIndex > 0 ? steps[currentIndex - 1].id : "intro")}><ArrowLeft size={15} /> Back</button>{stage === "review" ? <button type="button" className="btn btn-primary btn-generate" onClick={() => setStage("generating")}><span>Wrap it & generate</span><Sparkles size={16} /></button> : <button type="button" className="btn btn-primary" onClick={() => setStage(currentIndex < steps.length - 1 ? steps[currentIndex + 1].id : "review")}><span>Continue</span><ArrowRight size={16} /></button>}</div></main></div><div className="grain" /></div>;
}
