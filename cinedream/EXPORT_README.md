# CineDream Prototype Export

This archive contains the responsive CineDream React + Vite prototype source and the generated cinematic assets.

## Run locally

```bash
pnpm install
pnpm dev
```

The prototype is client-side only. The current UI uses the provided request/response data as demo content and references the WebDev storage paths for hosted assets; the local copies are included in `assets/` for portability.

## Main files

- `client/src/pages/Home.tsx` — interactive CineDream directing flow
- `client/src/index.css` — midnight-studio visual system and responsive styles
- `client/src/App.tsx` — application shell and route
- `client/index.html` — page metadata
- `assets/` — original generated cinematic imagery
