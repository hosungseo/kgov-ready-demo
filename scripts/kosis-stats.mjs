#!/usr/bin/env node
const KOSIS_KEY = process.env.KOSIS_API_KEY || "";
const BASE = "https://kosis.kr/openapi";

function arg(name, fallback = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function command() {
  if (process.argv.includes("params")) return "params";
  if (process.argv.includes("data")) return "data";
  return "list";
}
function requireKey() {
  if (!KOSIS_KEY) {
    console.error("Missing KOSIS_API_KEY. Set env; do not commit it.");
    process.exit(2);
  }
  return KOSIS_KEY;
}
function redact(url) {
  return url.replace(/(apiKey)=([^&]+)/g, "$1=***");
}
async function fetchJson(url) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov KOSIS adapter)" } });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Non-JSON response from ${redact(url.toString())}: ${text.slice(0, 200)}`); }
}
async function list() {
  const url = new URL(`${BASE}/statisticsList.do`);
  url.searchParams.set("method", "getList");
  url.searchParams.set("apiKey", requireKey());
  url.searchParams.set("vwCd", arg("vw-cd", "MT_ZTITLE"));
  url.searchParams.set("parentListId", arg("parent", ""));
  url.searchParams.set("format", "json");
  url.searchParams.set("jsonVD", "Y");
  const json = await fetchJson(url);
  const rows = Array.isArray(json) ? json : [];
  const limit = Number(arg("limit", "10"));
  return {
    metadata: { source: "KOSIS statisticsList.do", strategy: "KEYED_API", retrieved_at: new Date().toISOString(), query_url: redact(url.toString()), count: Math.min(rows.length, limit), total_count: rows.length },
    items: rows.slice(0, limit).map((r) => ({
      list_id: r.LIST_ID ?? r.listId ?? "",
      list_name: r.LIST_NM ?? r.listNm ?? "",
      org_id: r.ORG_ID ?? "",
      tbl_id: r.TBL_ID ?? "",
      tbl_name: r.TBL_NM ?? "",
      raw: r,
    })),
  };
}
async function params() {
  const orgId = arg("org-id", "");
  const tblId = arg("tbl-id", "");
  if (!orgId || !tblId) { console.error("params requires --org-id <ORG_ID> --tbl-id <TBL_ID>"); process.exit(2); }
  const url = new URL(`${BASE}/Param/statisticsParameterData.do`);
  url.searchParams.set("method", "getList");
  url.searchParams.set("apiKey", requireKey());
  url.searchParams.set("orgId", orgId);
  url.searchParams.set("tblId", tblId);
  url.searchParams.set("format", "json");
  url.searchParams.set("jsonVD", "Y");
  const json = await fetchJson(url);
  const rows = Array.isArray(json) ? json : [];
  return { metadata: { source: "KOSIS statisticsParameterData.do", strategy: "KEYED_API", retrieved_at: new Date().toISOString(), query_url: redact(url.toString()), org_id: orgId, tbl_id: tblId, count: rows.length }, items: rows };
}
async function data() {
  const orgId = arg("org-id", "101");
  const tblId = arg("tbl-id", "DT_1YL20631");
  const itmId = arg("itm-id", "T1");
  const objL1 = arg("obj-l1", "ALL");
  const prdSe = arg("prd-se", "Y");
  const startPrd = arg("start", "2023");
  const endPrd = arg("end", "2024");
  const url = new URL(`${BASE}/statisticsData.do`);
  url.searchParams.set("method", "getList");
  url.searchParams.set("apiKey", requireKey());
  url.searchParams.set("orgId", orgId);
  url.searchParams.set("tblId", tblId);
  url.searchParams.set("itmId", itmId);
  url.searchParams.set("objL1", objL1);
  url.searchParams.set("prdSe", prdSe);
  url.searchParams.set("startPrdDe", startPrd);
  url.searchParams.set("endPrdDe", endPrd);
  url.searchParams.set("format", "json");
  url.searchParams.set("jsonVD", "Y");
  const json = await fetchJson(url);
  const rows = Array.isArray(json) ? json : [];
  return { metadata: { source: "KOSIS statisticsData.do", strategy: "KEYED_API", retrieved_at: new Date().toISOString(), query_url: redact(url.toString()), org_id: orgId, tbl_id: tblId, count: rows.length }, items: rows };
}

const cmd = command();
const payload = cmd === "params" ? await params() : cmd === "data" ? await data() : await list();
console.log(JSON.stringify(payload, null, 2));
if ((payload.items && payload.items.length === 0) || !payload) process.exit(1);
