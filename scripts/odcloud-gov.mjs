#!/usr/bin/env node
import { loadEnvLocal } from "./env-local.mjs";

loadEnvLocal();

const DATA_KEY = process.env.DATA_GO_KR_SERVICE_KEY || process.env.PUBLIC_DATA_API_KEY || "";

const DATASETS = {
  centralFunction: {
    name: "행안부 정부기능별분류체계",
    base: "https://api.odcloud.kr/api/15062615/v1/uddi:5cf8e011-80f5-44ed-a639-a99c48cdd74e",
    fields: ["분류체계ID", "분류체계명", "상위과제ID", "분류체계단계", "수행기관", "기관코드", "분류체계경로"],
  },
  purposeFunction: {
    name: "행안부 정부 목적별 분류체계",
    base: "https://api.odcloud.kr/api/15062616/v1/uddi:0c4929ed-694b-4610-a51e-f8c0e75a2e5c",
    fields: ["분류체계ID", "분류체계명", "상위과제ID", "분류체계단계", "수행기관", "기관코드", "분류체계경로"],
  },
  localFunction: {
    name: "행안부 지방자치단체 기능분류체계",
    base: "https://api.odcloud.kr/api/15062318/v1/uddi:943d066a-ca18-4302-b655-8f2e402ca995",
    fields: ["정책분야", "정책영역", "대기능", "중기능"],
  },
  gov24Service: {
    name: "정부24 공공서비스 목록",
    base: "https://api.odcloud.kr/api/gov24/v3/serviceList",
    fields: ["서비스ID", "서비스명", "서비스목적요약", "지원대상", "지원내용", "소관기관명", "부서명", "서비스분야", "상세조회URL"],
  },
};

function arg(name, fallback = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function command() {
  if (process.argv.includes("gov24-detail")) return "gov24-detail";
  if (process.argv.includes("gov24")) return "gov24";
  return "dataset";
}
function requireKey() {
  if (!DATA_KEY) {
    console.error("Missing DATA_GO_KR_SERVICE_KEY (or PUBLIC_DATA_API_KEY). Set env; do not commit it.");
    process.exit(2);
  }
  return DATA_KEY;
}
function redact(url) {
  return url.replace(/(serviceKey)=([^&]+)/g, "$1=***");
}
function normalizeDate(v) {
  return String(v ?? "").replace(/\./g, "-").replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
}
async function fetchJson(url) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov odcloud adapter)" } });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Non-JSON response from ${redact(url.toString())}: ${text.slice(0, 200)}`); }
}
function pick(row, fields) {
  const out = {};
  for (const f of fields) out[f] = row[f] ?? "";
  return out;
}
async function dataset() {
  const dataset = arg("dataset", "centralFunction");
  const def = DATASETS[dataset];
  if (!def || dataset === "gov24Service") {
    console.error(`Unknown dataset: ${dataset}. Use ${Object.keys(DATASETS).filter(k => k !== "gov24Service").join(", ")}`);
    process.exit(2);
  }
  const page = arg("page", "1");
  const perPage = arg("per-page", arg("limit", "5"));
  const url = new URL(def.base);
  url.searchParams.set("page", page);
  url.searchParams.set("perPage", perPage);
  url.searchParams.set("serviceKey", requireKey());
  const json = await fetchJson(url);
  const data = Array.isArray(json.data) ? json.data : [];
  return {
    metadata: { source: def.name, strategy: "KEYED_API", retrieved_at: new Date().toISOString(), query_url: redact(url.toString()), dataset, count: data.length, total_count: json.totalCount ?? null },
    items: data.map((row) => ({ ...pick(row, def.fields), raw: row })),
  };
}
async function gov24List() {
  const page = arg("page", "1");
  const perPage = arg("per-page", arg("limit", "5"));
  const keyword = arg("keyword", "보육");
  const field = arg("field", "서비스명");
  const url = new URL(DATASETS.gov24Service.base);
  url.searchParams.set("page", page);
  url.searchParams.set("perPage", perPage);
  url.searchParams.set("serviceKey", requireKey());
  if (keyword) url.searchParams.set(`cond[${field}::LIKE]`, keyword);
  const json = await fetchJson(url);
  const data = Array.isArray(json.data) ? json.data : [];
  return {
    metadata: { source: DATASETS.gov24Service.name, strategy: "KEYED_API", retrieved_at: new Date().toISOString(), query_url: redact(url.toString()), keyword, field, count: data.length, total_count: json.totalCount ?? null },
    items: data.map((row) => ({
      service_id: row["서비스ID"] ?? "",
      title: row["서비스명"] ?? "",
      summary: row["서비스목적요약"] ?? "",
      target: row["지원대상"] ?? "",
      content: row["지원내용"] ?? "",
      agency: row["소관기관명"] ?? "",
      department: row["부서명"] ?? "",
      category: row["서비스분야"] ?? "",
      updated_at: normalizeDate(row["수정일시"]),
      source_url: row["상세조회URL"] ?? "",
      raw: row,
    })),
  };
}
async function gov24Detail() {
  const serviceId = arg("service-id", "");
  if (!serviceId) { console.error("gov24-detail requires --service-id <서비스ID>"); process.exit(2); }
  const url = new URL("https://api.odcloud.kr/api/gov24/v3/serviceDetail");
  url.searchParams.set("serviceKey", requireKey());
  url.searchParams.set("cond[서비스ID::EQ]", serviceId);
  const json = await fetchJson(url);
  const data = Array.isArray(json.data) ? json.data : [];
  return { metadata: { source: "정부24 공공서비스 상세", strategy: "KEYED_API", retrieved_at: new Date().toISOString(), query_url: redact(url.toString()), service_id: serviceId, count: data.length }, items: data };
}

const cmd = command();
const payload = cmd === "gov24-detail" ? await gov24Detail() : cmd === "gov24" ? await gov24List() : await dataset();
console.log(JSON.stringify(payload, null, 2));
if ((payload.items && payload.items.length === 0) || !payload) process.exit(1);
