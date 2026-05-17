#!/usr/bin/env node
import { loadEnvLocal } from "./env-local.mjs";

loadEnvLocal();

const KEY = process.env.SCHOOLINFO_API_KEY || "";
const TYPES = {
  students: "10",
  budget: "16",
  facilities: "17",
  safety: "20",
};
function arg(name, fallback = "") { const i = process.argv.indexOf(`--${name}`); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback; }
function requireKey() { if (!KEY) { console.error("Missing SCHOOLINFO_API_KEY. Set env; do not commit it."); process.exit(2); } return KEY; }
function redact(url) { return url.replace(/(apiKey)=([^&]+)/g, "$1=***"); }
async function main() {
  const typeName = arg("type", "students");
  const apiType = TYPES[typeName] || typeName;
  const year = arg("year", "2025");
  const schoolKind = arg("school-kind", "04");
  const url = new URL("https://www.schoolinfo.go.kr/openApi.do");
  url.searchParams.set("apiKey", requireKey());
  url.searchParams.set("apiType", apiType);
  url.searchParams.set("pbanYr", year);
  url.searchParams.set("schulKndCode", schoolKind);
  if (arg("depth-no")) url.searchParams.set("depthNo", arg("depth-no"));
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov schoolinfo adapter)" } });
  const json = await res.json();
  if (json.resultCode !== "success") {
    console.error(JSON.stringify({ error: "schoolinfo_api_error", resultCode: json.resultCode, resultMsg: json.resultMsg, url: redact(url.toString()) }, null, 2));
    process.exit(2);
  }
  const limit = Number(arg("limit", "5"));
  const rows = Array.isArray(json.list) ? json.list.slice(0, limit) : [];
  const items = rows.map((r) => ({
    school_code: r.SCHUL_CODE ?? r.UNITY_UON_SCHUL_CODE ?? "",
    school_name: r.SCHUL_NM ?? r.UNITY_UON_SCHUL_NM ?? "",
    office: r.ATPT_OFCDC_ORG_NM ?? r.JU_ORG_NM ?? "",
    region: r.ADRCD_NM ?? "",
    school_kind: r.SCHUL_KND_SC_CODE ?? schoolKind,
    foundation: r.FOND_SC_CODE ?? "",
    student_total: r.STDNT_SUM ?? "",
    raw: r,
  }));
  const payload = { metadata: { source: "학교알리미 openApi.do", strategy: "KEYED_API", retrieved_at: new Date().toISOString(), query_url: redact(url.toString()), type: typeName, api_type: apiType, year, school_kind: schoolKind, count: items.length, total_count: Array.isArray(json.list) ? json.list.length : null }, items };
  console.log(JSON.stringify(payload, null, 2));
  if (!items.length) process.exit(1);
}
await main();
