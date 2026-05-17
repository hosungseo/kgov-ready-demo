# Adapter Command Cookbook

K-Gov Ready Demo exposes public-sector sources as small OpenCLI-style commands. The point is not a pretty dashboard first; it is a reliable command surface that an agent can inspect, run, cite, and compose.

## Local smoke

```bash
pnpm adapter:smoke:local
```

This loads `.env.local` and runs the live smoke set. Secrets stay local and every command redacts keys from emitted source URLs.

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

### 2. Policy News OpenAPI

```bash
pnpm adapter:policy-news
# equivalent
node scripts/policy-news.mjs --start 20250515 --end 20250517 --limit 5
```

Use when API-backed policy news is enough and a 3-day window is acceptable. The XML response uses `NewsItem`, so this is separate from the HTML press-release parser.

Outputs include `news_id`, `title`, `subtitle`, `date`, `agency`, `summary`, and `source_url`.

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

### Policy issue packet

```text
policy.news.search or press.search → press.read → gazette.search → gov24.service.search
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
