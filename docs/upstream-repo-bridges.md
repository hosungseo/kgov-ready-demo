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
- Integration direction: use as an offline/readable fallback for gazette metadata hits when live API is too thin.
- Guardrail: avoid cloning the full corpus during normal smoke; use targeted raw files or released indexes only.

### `hosungseo/gov-press-md`

- Role: Markdown press release corpus
- Integration direction: use as historical fallback for policy briefing content when API date windows are narrow.
- Guardrail: avoid broad clone; prefer date/ministry scoped lookup.

## Selection rule

Bridge a repo only when it gives one of these concrete benefits:

- new source coverage
- better issue seeding
- offline/readable fallback
- regression or quality evidence
- an executable command surface that Kgov can wrap

Do not bridge repos just because they are related by theme.
