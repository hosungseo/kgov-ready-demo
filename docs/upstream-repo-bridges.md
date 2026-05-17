# Upstream Repo Bridges

K-Gov Ready Demo can reuse nearby public repos as upstream signals without copying their private state or secrets.

## Active bridge

### Combined pack

- Local command: `pnpm adapter:upstream-pack`
- Role: one-shot external evidence pack across all active upstream repo bridges
- Sources: `question-forecast`, `korean-government-api-bundle`, `ai-readable-gazette-kr`, `gov-press-md`
- Output: bridge health, pack posture, evidence matrix, KGAB comparator summary, forecast seed commands
- Use before: `issue.workflow.run`, when you want external repo evidence before creating a fresh Kgov casefile.

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

### `hosungseo/gonpunclaw-policymap`

- Role: keyless administrative-region centroid mapping plus optional geocoder chain for address-to-coordinate enrichment
- Local command: `pnpm adapter:policymap-region`
- Geocoder command: `pnpm adapter:policymap-geocode`
- Smoke command: `pnpm adapter:policymap-geocode:self-test`
- API doctor: `pnpm adapter:policymap-geocode:doctor`
- Integration direction: use `public/data/*-boundaries.geojson` for keyless sido/sigg/emd centroid mapping first; use Kakao → VWorld → Juso only when free-text address precision is needed.
- Guardrail: region centroid outputs are administrative context, not building coordinates. API keys stay in env or `.env.local`; geocoder outputs must preserve raw address, normalized address, provider, attempted chain, and cache state.

API setup:

- Kakao Local address search: `KAKAO_REST_API_KEY`, docs <https://developers.kakao.com/docs/latest/ko/local/dev-guide#address-coord>, key console <https://developers.kakao.com/console/app>
- VWorld Search API: `VWORLD_API_KEY`, docs <https://www.vworld.kr/dev/v4dv_search2_s001.do>, key page <https://www.vworld.kr/mypo/mypo_apiKey_i001.do>
- Juso road-address coord API: `JUSO_API_KEY`, docs <https://business.juso.go.kr/jst/jstCoordApiSearch>, key page <https://business.juso.go.kr/jst/jstAddressApiApplicationWrite>

## Selection rule

Bridge a repo only when it gives one of these concrete benefits:

- new source coverage
- better issue seeding
- offline/readable fallback
- regression or quality evidence
- an executable command surface that Kgov can wrap

Do not bridge repos just because they are related by theme.
