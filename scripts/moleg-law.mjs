#!/usr/bin/env node
import { loadEnvLocal } from "./env-local.mjs";

loadEnvLocal();

const BASE = "https://www.law.go.kr/DRF";

function arg(name, fallback = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function command() {
  if (process.argv.includes("history-detail")) return "history-detail";
  if (process.argv.includes("history")) return "history";
  if (process.argv.includes("article")) return "article";
  if (process.argv.includes("detail")) return "detail";
  return "search";
}

function oc() {
  return process.env.MOLEG_OC || process.env.LAW_GO_KR_OC || process.env.LAW_API_OC || "";
}

function requireOc() {
  const value = oc();
  if (!value) {
    console.error("Missing MOLEG_OC (or LAW_GO_KR_OC / LAW_API_OC). Set the law.go.kr OC value in env; do not commit it.");
    process.exit(2);
  }
  return value;
}

function decodeHtml(s) {
  return String(s ?? "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "\'");
}

function stripTags(s) {
  return decodeHtml(s)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function asArray(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}


async function fetchText(path, params) {
  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v) !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov law adapter)" } });
  const text = await res.text();
  return { url: url.toString().replace(/OC=[^&]+/, "OC=***"), text };
}

function parseHistoryRows(html, limit) {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const out = [];
  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => m[1]);
    if (cells.length < 8) continue;
    const linkMatch = cells[1].match(/href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;
    const href = decodeHtml(linkMatch[1]);
    const params = new URLSearchParams(href.split("?")[1] ?? "");
    const item = {
      order: stripTags(cells[0]),
      law_name: stripTags(linkMatch[2]),
      ministry: stripTags(cells[2]),
      amendment_type: stripTags(cells[3]),
      law_type: stripTags(cells[4]),
      promulgation_no: stripTags(cells[5]),
      promulgation_date: stripTags(cells[6]),
      enforcement_date: stripTags(cells[7]),
      status: stripTags(cells[8] ?? ""),
      mst: params.get("MST") ?? "",
      ef_yd: params.get("efYd") ?? "",
      detail_url: `https://www.law.go.kr${href}`.replace(/OC=[^&]+/, "OC=***"),
    };
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

async function fetchJson(path, params) {
  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v) !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov law adapter)" } });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error(`Non-JSON response from ${url.toString()}: ${text.slice(0, 200)}`);
    process.exit(2);
  }
  if (json?.result || json?.msg) {
    console.error(JSON.stringify({ error: "law_api_error", response: json, url: url.toString().replace(/OC=[^&]+/, "OC=***") }, null, 2));
    process.exit(2);
  }
  return { url: url.toString().replace(/OC=[^&]+/, "OC=***"), json };
}

async function search() {
  const query = arg("query", arg("q", "정부조직법"));
  const limit = Number(arg("limit", "5"));
  const { url, json } = await fetchJson("lawSearch.do", {
    OC: requireOc(),
    target: arg("target", "law"),
    type: "JSON",
    query,
    page: arg("page", "1"),
    display: String(limit),
  });
  const laws = asArray(json?.LawSearch?.law).slice(0, limit).map((law) => ({
    law_id: law.법령ID ?? law.lawId ?? "",
    law_name: stripTags(law.법령명한글 ?? law.lawName ?? law.법령명 ?? ""),
    law_type: stripTags(law.법령구분명 ?? ""),
    promulgation_date: law.공포일자 ?? "",
    enforcement_date: law.시행일자 ?? "",
    ministry: stripTags(law.소관부처명 ?? ""),
    detail_url: law.법령상세링크 ? `https://www.law.go.kr${law.법령상세링크}`.replace(/OC=[^&]+/, "OC=***") : "",
  }));
  return {
    metadata: {
      source: "법제처 국가법령정보 lawSearch.do",
      strategy: "KEYED_API",
      retrieved_at: new Date().toISOString(),
      query_url: url,
      query,
      count: laws.length,
    },
    items: laws,
  };
}


async function history() {
  const query = arg("query", arg("q", "정부조직법"));
  const limit = Number(arg("limit", "10"));
  const { url, text } = await fetchText("lawSearch.do", {
    OC: requireOc(),
    target: "lsHistory",
    type: "HTML",
    query,
    page: arg("page", "1"),
    display: String(limit),
    org: arg("org", ""),
    knd: arg("knd", ""),
  });
  const items = parseHistoryRows(text, limit);
  return {
    metadata: {
      source: "법제처 국가법령정보 lawSearch.do target=lsHistory",
      strategy: "KEYED_API_HTML_TABLE",
      retrieved_at: new Date().toISOString(),
      query_url: url,
      query,
      count: items.length,
    },
    items,
  };
}

async function historyDetail() {
  const mst = arg("mst", "");
  const efYd = arg("ef-yd", arg("efYd", ""));
  if (!mst || !efYd) {
    console.error("history-detail requires --mst <MST> --ef-yd <YYYYMMDD>");
    process.exit(2);
  }
  const { url, json } = await fetchJson("lawService.do", {
    OC: requireOc(),
    target: "eflaw",
    type: "JSON",
    MST: mst,
    efYd,
  });
  const law = json?.법령 ?? json?.Law ?? json;
  return {
    metadata: {
      source: "법제처 국가법령정보 lawService.do target=eflaw",
      strategy: "KEYED_API",
      retrieved_at: new Date().toISOString(),
      query_url: url,
      mst,
      ef_yd: efYd,
    },
    raw_keys: Object.keys(law ?? {}),
    law,
  };
}

async function detail() {
  const lawId = arg("law-id", "");
  const mst = arg("mst", "");
  if (!lawId && !mst) {
    console.error("detail requires --law-id <법령ID> or --mst <MST>");
    process.exit(2);
  }
  const { url, json } = await fetchJson("lawService.do", {
    OC: requireOc(),
    target: "law",
    type: "JSON",
    ID: lawId,
    MST: mst,
  });
  const law = json?.법령 ?? json?.Law ?? json;
  return {
    metadata: {
      source: "법제처 국가법령정보 lawService.do",
      strategy: "KEYED_API",
      retrieved_at: new Date().toISOString(),
      query_url: url,
      law_id: lawId,
      mst,
    },
    raw_keys: Object.keys(law ?? {}),
    law,
  };
}

async function article() {
  const payload = await detail();
  const articleNo = arg("article-no", arg("jo", ""));
  const law = payload.law;
  const articles = asArray(law?.조문?.조문단위 ?? law?.조문단위 ?? []);
  const found = articles.find((a) => String(a.조문번호 ?? "").replace(/^0+/, "") === String(articleNo).replace(/^0+/, ""));
  console.log(JSON.stringify({ ...payload.metadata, article_no: articleNo, item: found ?? null }, null, 2));
  process.exit(found ? 0 : 1);
}

const cmd = command();
if (cmd === "article") await article();
else {
  const payload = cmd === "history-detail" ? await historyDetail() : cmd === "history" ? await history() : cmd === "detail" ? await detail() : await search();
  console.log(JSON.stringify(payload, null, 2));
  if ((payload.items && payload.items.length === 0) || !payload) process.exit(1);
}
