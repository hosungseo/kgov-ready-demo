# Adapter Command Cookbook

K-Gov Ready Demo exposes public-sector sources as small OpenCLI-style commands. The point is not a pretty dashboard first; it is a reliable command surface that an agent can inspect, run, cite, and compose.

## Local smoke

```bash
pnpm adapter:smoke:local
```

This loads `.env.local` and runs the live smoke set. Secrets stay local and every command redacts keys from emitted source URLs.

## Creative composition

### Public issue packet + brief

```bash
pnpm adapter:issue-packet
pnpm adapter:issue-brief
pnpm adapter:issue-timeline
pnpm adapter:issue-gap
pnpm adapter:issue-matrix
pnpm adapter:issue-scenario
pnpm adapter:issue-router
# equivalent
node scripts/public-issue-packet.mjs \
  --topic 공급망 \
  --policy-query 조달청 \
  --law-query 정부조직법 \
  --schedule-keyword AI \
  --gov24-keyword 보육 \
  --max-chars 1200
node scripts/issue-brief.mjs \
  --topic 공급망 \
  --policy-query 조달청 \
  --law-query 정부조직법 \
  --schedule-keyword AI \
  --gov24-keyword 보육
node scripts/issue-timeline.mjs \
  --topic 공급망 \
  --policy-query 조달청 \
  --law-query 정부조직법 \
  --schedule-keyword AI \
  --gov24-keyword 보육
node scripts/issue-gap-check.mjs \
  --topic 공급망 \
  --policy-query 조달청 \
  --law-query 정부조직법 \
  --schedule-keyword AI \
  --gov24-keyword 보육
node scripts/issue-evidence-matrix.mjs \
  --topic 공급망 \
  --policy-query 조달청 \
  --law-query 정부조직법 \
  --schedule-keyword AI \
  --gov24-keyword 보육
node scripts/issue-scenario-lab.mjs \
  --topic 공급망 \
  --policy-query 조달청 \
  --law-query 정부조직법 \
  --schedule-keyword AI \
  --gov24-keyword 보육
node scripts/issue-decision-router.mjs \
  --topic 공급망 \
  --policy-query 조달청 \
  --law-query 정부조직법 \
  --schedule-keyword AI \
  --gov24-keyword 보육
```

This is the first genuinely composite command. It builds one packet from:

```text
policy.news.search → crawl.readable lead article
law.search + law.history
-gazette.search
assembly.schedule.search
gov24.service.search
ecos.series
```

`issue.packet.compose` returns structured JSON. `issue.brief.render` turns the same packet into a Markdown briefing with legal context, official signals, statistics, question forecast, and next actions. `issue.timeline.render` converts packet dates into a policy timeline. `issue.gap.check` scores whether the packet has enough source coverage for a reliable briefing. `issue.evidence.matrix` explains which source plays which evidentiary role and what caveat should be attached. `issue.scenario.lab` recombines the packet/gap/matrix outputs into administrative risk scenarios, a question playbook, an action packet, and counter-arguments. `issue.decision.router` scores the next best workflow route, such as brief-now, legal-deep-dive, official-signal-narrowing, assembly-watch, or statistics-support.

The packet shape is:

```text
lead_readable        API-selected article + readable Markdown
legal_context        current law + law history rows
official_signals     gazette + assembly schedule + gov24 services
statistic_context    ECOS series rows
errors               isolated source failures
```

## Source groups

### 1. Policy Briefing press releases

```bash
pnpm adapter:press
pnpm adapter:press:detail
pnpm adapter:press:read
```

Use when the agent needs a Korea Policy Briefing press release as metadata or readable Markdown.

- `press.search`: list/search press releases from korea.kr HTML.
- `press.detail`: fetch title, agency, iframe, attachments.
- `press.read`: Crawl4AI readable packet for a `news_id`.

### 2. Policy News OpenAPI + readable packet

```bash
pnpm adapter:policy-news
pnpm adapter:api-readable
# equivalent
node scripts/policy-news.mjs --start 20250515 --end 20250517 --limit 5
node scripts/api-readable-packet.mjs --source policy-news --query 조달청 --start 20250515 --end 20250517 --index 0 --max-chars 3000
```

Use `policy.news.search` when API-backed metadata is enough. Use `policy.news.packet` when the agent needs the combined artifact: API-selected candidate + source URL + Crawl4AI readable Markdown.

Outputs include `news_id`, `title`, `subtitle`, `date`, `agency`, `summary`, `source_url`, plus `readable.markdown` for the composed packet.

### 3. MOLEG / law.go.kr

```bash
pnpm adapter:law:search
pnpm adapter:law:history
```

Direct commands:

```bash
node scripts/moleg-law.mjs search --query 정부조직법 --limit 3
node scripts/moleg-law.mjs history --query 정부조직법 --limit 3
node scripts/moleg-law.mjs history-detail --mst 280421 --ef-yd 20251223
```

Use `law.history` to get `MST` + `efYd`, then `history-detail` to fetch the version-specific text through `target=eflaw`.

### 4. Gazette metadata

```bash
pnpm adapter:gazette:search
```

Uses the 행안부 관보 API metadata endpoint. It keeps `gazette_id`, publication date, agency, title, type, `pdf_url`, and raw row.

### 5. National Assembly

```bash
pnpm adapter:assembly:search
pnpm adapter:assembly:member
pnpm adapter:assembly:schedule
```

Direct commands:

```bash
node scripts/assembly-bill.mjs search --endpoint ALLBILLV2 --eraco 제22대 --limit 5
node scripts/assembly-openapi.mjs member --query 강경숙 --limit 20
node scripts/assembly-openapi.mjs schedule --keyword AI --limit 20
```

Use this trio for bill tracking: bill status, member profile, and hearing/event schedule.

### 6. data.go.kr / odcloud + Gov24 services

```bash
pnpm adapter:odcloud:function
pnpm adapter:gov24:search
```

Direct commands:

```bash
node scripts/odcloud-gov.mjs dataset --dataset centralFunction --limit 5
node scripts/odcloud-gov.mjs dataset --dataset purposeFunction --limit 5
node scripts/odcloud-gov.mjs dataset --dataset localFunction --limit 5
node scripts/odcloud-gov.mjs gov24 --keyword 보육 --limit 5
```

Use for 행안부 function classification and public-service benefit lookup.

### 7. ECOS

```bash
pnpm adapter:ecos:series
```

Direct commands:

```bash
node scripts/ecos-stat.mjs catalog
node scripts/ecos-stat.mjs series --series baseRate --start 202501 --end 202604 --limit 20
```

Curated series currently include `baseRate`, `mortgageRate`, `cpi`, and `m2`.

### 8. MOLIT real estate

```bash
pnpm adapter:molit:apt-trade
pnpm adapter:molit:apt-rent
pnpm adapter:molit:officetel-trade
```

Direct commands:

```bash
node scripts/molit-realestate.mjs --kind aptTrade --lawd 36110 --ym 202604 --limit 5
node scripts/molit-realestate.mjs --kind aptRent --lawd 36110 --ym 202604 --limit 5
node scripts/molit-realestate.mjs --kind officetelTrade --lawd 36110 --ym 202604 --limit 5
```

`kind` supports `aptTrade`, `aptRent`, `officetelTrade`, and `officetelRent`.

### 9. Schoolinfo

```bash
pnpm adapter:schoolinfo:students
pnpm adapter:schoolinfo:budget
pnpm adapter:schoolinfo:facilities
```

Direct commands:

```bash
node scripts/schoolinfo.mjs --type students --year 2025 --school-kind 04 --limit 5
node scripts/schoolinfo.mjs --type budget --year 2025 --school-kind 04 --limit 5
node scripts/schoolinfo.mjs --type facilities --year 2025 --school-kind 04 --limit 5
```

Type presets: `students`, `budget`, `facilities`, `safety`. Raw `COL_*` fields are preserved because Schoolinfo field meanings drift by item/year.

## Blocked / watch items

- `kosis-statistics`: currently cataloged, but the local KOSIS key returned invalid-key during smoke.
- `work24-job-dictionary`: currently cataloged, but the saved service/key combination returned service-not-found.
- R-ONE: not yet wired in this repo; good next candidate if a valid key + table sample is reconfirmed.

## Composition patterns

### Bill briefing

```text
assembly.bill.search → assembly.member.search → assembly.schedule.search → law.search/history
```

### API + crawling packet

```text
API search → source_url selection → crawl.read(profile) → packet
```

Concrete command:

```bash
pnpm adapter:api-readable
```

Current readable profiles:

- `korea-press`: policy briefing press release pages
- `korea-policy-news`: policy news article pages
- `public-generic`: government/public pages such as gov.kr, law.go.kr, assembly.go.kr, data.go.kr

### Policy issue packet

```text
policy.news.search → policy.news.packet(API_SEARCH_THEN_CRAWL_READABLE) → gazette.search → gov24.service.search
```

or:

```text
press.search → press.detail → press.read → gazette.search
```

### Education/local housing packet

```text
schoolinfo.disclosure.search → molit.realestate.search → ecos.series
```

## Guardrails

- Never commit `.env.local`.
- Keep source URL and retrieved timestamp in output.
- Prefer official APIs before HTML/crawl fallback.
- Use small `limit`/date windows for smoke tests.
- Treat `raw` as provenance, not polished user-facing copy.
