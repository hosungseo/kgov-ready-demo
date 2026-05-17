# OpenCLI-style Adapter Layer

K-Gov Ready Demo is no longer only an agent-readable website demo. It also exposes a small **adapter-first command layer**: public websites and data portals should be discoverable as commands, not only as pages a human clicks.

## Philosophy

- **Command surface before screen surface**: agents should find `press.search`, `law.search`, `gazette.search`-style capabilities before opening a browser.
- **Official API before UI scraping**: use public APIs when available; HTML parsing is a fallback with an explicit strategy label.
- **Metadata first**: preserve source URL, retrieval time, query params, IDs, and raw provenance before summaries.
- **Small smoke-verified adapters first**: add one narrow command, verify it against live sample data, then expand.

## Discovery

- Adapter catalog: `/api/adapters`
- Individual adapter contract: `/api/adapters/policy-briefing-press`
- MCP tool packs: `/api/mcp-tools`
- Plaza JSON: `/api/plaza`

## First working adapter

```bash
pnpm adapter:smoke
# or
node scripts/policy-briefing-press.mjs --keyword 정부조직 --limit 5 --format md
node scripts/policy-briefing-press.mjs detail --news-id 156761598
```

This calls Korea Policy Briefing press-release list pages and emits structured JSON/Markdown:

- `news_id`
- `date`
- `agency`
- `title`
- `summary`
- `source_url`

The detail command additionally emits:

- `content_iframe_url`
- `attachments[].download_url`
- `attachments[].view_url`

Strategy: `HTML_PARSE`.

## Adapter maturity model

| Status | Meaning |
|---|---|
| `ready` | Has a script/command and live smoke test. |
| `planned` | Cataloged with command contract but not implemented. |
| `blocked` | Needs key, auth, or site behavior resolution. |

## Next adapters

1. `law.search` / `law.article` for 법제처 국가법령정보 — script scaffold ready, requires `MOLEG_OC`.
2. `gazette.search` for 관보 metadata — script scaffold ready, requires `GAZETTE_API_KEY`.
3. `assembly.bill.search` / `assembly.bill.detail` for 국회 의안정보.

Each should ship with:

- catalog entry in `lib/opencli-adapters.ts`
- route exposure through `/api/adapters`
- one smoke command in `package.json`
- source URL and retrieved timestamp in output

## Law adapter env

```bash
MOLEG_OC=*** node scripts/moleg-law.mjs search --query 정부조직법 --limit 3
MOLEG_OC=*** node scripts/moleg-law.mjs detail --law-id <법령ID>
```

The script exits with code `2` and a clear message when the OC value is missing.

## Gazette adapter env

```bash
GAZETTE_API_KEY=*** node scripts/gazette-search.mjs --from 2026-05-01 --to 2026-05-17 --keyword 고시 --page-size 5
```

The script exits with code `2` and a clear message when the service key is missing.
