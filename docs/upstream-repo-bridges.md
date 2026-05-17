# Upstream Repo Bridges

K-Gov Ready Demo can reuse nearby public repos as upstream signals without copying their private state or secrets.

## Active bridge

### `hosungseo/question-forecast`

- Role: issue radar / question forecast seed source
- Surface used: `https://question-forecast.vercel.app/api/issues`
- Local command: `pnpm adapter:forecast-seeds`
- Output: forecast packets converted into `issue-workflow` commands
- Why it fits: the repo already ranks news-driven policy issues by ministry, signals, terms, and lead articles. Kgov can take those packets and run the official-source workflow against them.

### `hosungseo/korean-government-api-bundle`

- Role: broader question-first API bundle and MCP/CLI surface
- Useful pieces: lawmaking center, bill detail, public dataset metadata, dossier builder
- Local command: `pnpm adapter:kgab-bridge`
- Integration direction: call `kgab build-issue-dossier-markdown` as an upstream comparator and extract posture, score, route, source gaps, and dossier Markdown.
- Guardrail: keep API keys in env; do not vendor secrets or generated local state.

## Near-term candidates

### `hosungseo/ai-readable-gazette-kr`

- Role: readable gazette corpus
- Local command: `pnpm adapter:gazette-readable`
- Integration direction: search the static Pages JSON index and fetch targeted raw Markdown snippets when live gazette metadata is too thin.
- Guardrail: do not clone the full corpus during normal smoke; use `docs/data/*.json` and targeted raw files only.

### `hosungseo/gov-press-md`

- Role: Markdown press release corpus
- Local command: `pnpm adapter:press-md`
- Integration direction: search ministry/keyword indexes and date directories, then fetch only targeted raw Markdown files as historical policy briefing fallback.
- Guardrail: avoid broad clone; prefer date/ministry scoped lookup and preserve `original_url` for official citation.

## Selection rule

Bridge a repo only when it gives one of these concrete benefits:

- new source coverage
- better issue seeding
- offline/readable fallback
- regression or quality evidence
- an executable command surface that Kgov can wrap

Do not bridge repos just because they are related by theme.
