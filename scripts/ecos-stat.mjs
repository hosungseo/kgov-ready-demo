#!/usr/bin/env node
import { loadEnvLocal } from "./env-local.mjs";

loadEnvLocal();

const KEY = process.env.ECOS_API_KEY || process.env.ECOS_KEY || "";
const SERIES = {
  baseRate: { table: "722Y001", item: "0101000", cycle: "M", name: "한국은행 기준금리" },
  mortgageRate: { table: "121Y006", item: "BECBLA0302", cycle: "M", name: "예금은행 주택담보대출금리" },
  cpi: { table: "901Y009", item: "0", cycle: "M", name: "소비자물가지수" },
  m2: { table: "101Y004", item: "BBHA00", cycle: "M", name: "M2 평잔" },
};
function arg(name, fallback = "") { const i = process.argv.indexOf(`--${name}`); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback; }
function requireKey() { if (!KEY) { console.error("Missing ECOS_API_KEY (or ECOS_KEY). Set env; do not commit it."); process.exit(2); } return KEY; }
function redact(url) { return url.replace(requireKey(), "***"); }
function command() { return process.argv.includes("catalog") ? "catalog" : "series"; }
async function fetchJson(url) { const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov ECOS adapter)" } }); const text = await res.text(); try { return JSON.parse(text); } catch { throw new Error(`Non-JSON response from ${redact(url)}: ${text.slice(0,200)}`); } }
async function catalog() {
  return { metadata: { source: "한국은행 ECOS curated catalog", strategy: "CURATED_CATALOG", retrieved_at: new Date().toISOString(), count: Object.keys(SERIES).length }, items: Object.entries(SERIES).map(([id, s]) => ({ id, ...s })) };
}
async function series() {
  const id = arg("series", "baseRate"); const s = SERIES[id] || { table: arg("table"), item: arg("item"), cycle: arg("cycle", "M"), name: arg("name", "custom") };
  if (!s.table || !s.item) { console.error("series requires --series <known> or --table <STAT_CODE> --item <ITEM_CODE>"); process.exit(2); }
  const start = arg("start", "202501"); const end = arg("end", "202604");
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${requireKey()}/json/kr/1/${arg("limit", "20")}/${s.table}/${s.cycle}/${start}/${end}/${s.item}`;
  const json = await fetchJson(url);
  if (json.RESULT?.CODE && json.RESULT.CODE !== "INFO-000") { console.error(JSON.stringify({ error: "ecos_api_error", result: json.RESULT, url: redact(url) }, null, 2)); process.exit(2); }
  const rows = json.StatisticSearch?.row || [];
  return { metadata: { source: "한국은행 ECOS StatisticSearch", strategy: "KEYED_API", retrieved_at: new Date().toISOString(), query_url: redact(url), series: id, table: s.table, item: s.item, count: rows.length }, items: rows.map(r => ({ period: r.TIME, value: r.DATA_VALUE, unit: r.UNIT_NAME, item_name: r.ITEM_NAME1, stat_name: r.STAT_NAME, raw: r })) };
}
const payload = command() === "catalog" ? await catalog() : await series();
console.log(JSON.stringify(payload, null, 2));
if ((payload.items && payload.items.length === 0) || !payload) process.exit(1);
