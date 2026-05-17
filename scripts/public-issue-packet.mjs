#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function loadEnv(path = ".env.local") {
  if (!existsSync(path)) return [];
  const loaded = [];
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0 && !process.env[t.slice(0, i)]) {
      process.env[t.slice(0, i)] = t.slice(i + 1);
      loaded.push(t.slice(0, i));
    }
  }
  return loaded;
}
function arg(name, fallback = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function parseJsonOutput(stdout) {
  const start = stdout.indexOf("{");
  if (start < 0) throw new Error(`No JSON object in output: ${stdout.slice(0, 240)}`);
  return JSON.parse(stdout.slice(start));
}
function runJson(name, cmd, opts = {}) {
  const missing = (opts.require || []).filter((k) => !process.env[k]);
  if (missing.length) return { name, skipped: true, missing };
  const r = spawnSync(cmd[0], cmd.slice(1), { encoding: "utf8", env: process.env, maxBuffer: 12 * 1024 * 1024 });
  if (r.status !== 0) return { name, ok: false, status: r.status, error: (r.stderr || r.stdout || "").slice(0, 1200) };
  try { return { name, ok: true, payload: parseJsonOutput(r.stdout) }; }
  catch (e) { return { name, ok: false, status: 1, error: String(e) }; }
}
function firstItems(result, n = 3) {
  if (!result?.ok) return [];
  return (result.payload.items || []).slice(0, n);
}
function compactApiReadable(result) {
  if (!result?.ok) return null;
  const p = result.payload;
  return {
    title: p.api_item?.title,
    agency: p.api_item?.agency,
    date: p.api_item?.date,
    source_url: p.api_item?.source_url,
    markdown: p.readable?.markdown,
    markdown_length: p.readable?.markdown_length,
    strategy: p.metadata?.strategy,
  };
}
function compactError(result) {
  if (result?.ok) return null;
  if (result?.skipped) return { skipped: true, missing: result.missing };
  return { ok: false, status: result?.status, error: result?.error };
}

loadEnv();
const topic = arg("topic", "공급망");
const policyQuery = arg("policy-query", topic);
const lawQuery = arg("law-query", "정부조직법");
const gazetteKeyword = arg("gazette-keyword", "고시");
const scheduleKeyword = arg("schedule-keyword", topic);
const gov24Keyword = arg("gov24-keyword", "보육");
const ecosSeries = arg("ecos-series", "baseRate");

const policyPacket = runJson("policy_readable_packet", ["node", "scripts/api-readable-packet.mjs", "--source", "policy-news", "--query", policyQuery, "--start", arg("start", "20250515"), "--end", arg("end", "20250517"), "--index", arg("index", "0"), "--max-chars", arg("max-chars", "2200")], { require: ["DATA_GO_KR_SERVICE_KEY"] });
const law = runJson("law_search", ["node", "scripts/moleg-law.mjs", "search", "--query", lawQuery, "--limit", "3"], { require: ["MOLEG_OC"] });
const lawHistory = runJson("law_history", ["node", "scripts/moleg-law.mjs", "history", "--query", lawQuery, "--limit", "3"], { require: ["MOLEG_OC"] });
const gazette = runJson("gazette_search", ["node", "scripts/gazette-search.mjs", "--from", arg("gazette-from", "2026-05-01"), "--to", arg("gazette-to", "2026-05-17"), "--keyword", gazetteKeyword, "--page-size", "3"], { require: ["GAZETTE_API_KEY"] });
const schedule = runJson("assembly_schedule", ["node", "scripts/assembly-openapi.mjs", "schedule", "--keyword", scheduleKeyword, "--limit", "20"], { require: ["ASSEMBLY_API_KEY"] });
const gov24 = runJson("gov24_service", ["node", "scripts/odcloud-gov.mjs", "gov24", "--keyword", gov24Keyword, "--limit", "3"], { require: ["DATA_GO_KR_SERVICE_KEY"] });
const ecos = runJson("ecos_series", ["node", "scripts/ecos-stat.mjs", "series", "--series", ecosSeries, "--start", arg("ecos-start", "202501"), "--end", arg("ecos-end", "202604"), "--limit", "20"], { require: ["ECOS_API_KEY"] });

const packet = {
  metadata: {
    source: "public-issue-packet",
    strategy: "MULTI_SOURCE_API_PLUS_READABLE_COMPOSITION",
    retrieved_at: new Date().toISOString(),
    topic,
    policy_query: policyQuery,
    law_query: lawQuery,
    gazette_keyword: gazetteKeyword,
    schedule_keyword: scheduleKeyword,
    gov24_keyword: gov24Keyword,
    ecos_series: ecosSeries,
  },
  lead_readable: compactApiReadable(policyPacket),
  legal_context: {
    current_laws: firstItems(law, 3),
    history: firstItems(lawHistory, 3),
  },
  official_signals: {
    gazette: firstItems(gazette, 3),
    assembly_schedule: firstItems(schedule, 5),
    gov24_services: firstItems(gov24, 3),
  },
  statistic_context: {
    ecos: firstItems(ecos, 6),
  },
  errors: Object.fromEntries(Object.entries({ policyPacket, law, lawHistory, gazette, schedule, gov24, ecos }).map(([k, v]) => [k, compactError(v)]).filter(([, v]) => v)),
};

console.log(JSON.stringify(packet, null, 2));
const hardFail = !packet.lead_readable && Object.keys(packet.errors).length === 7;
process.exit(hardFail ? 1 : 0);
