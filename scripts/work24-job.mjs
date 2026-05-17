#!/usr/bin/env node
import { loadEnvLocal } from "./env-local.mjs";

loadEnvLocal();

const KEY = process.env.WORK24_AUTH_KEY || "";
function arg(name, fallback = "") { const i = process.argv.indexOf(`--${name}`); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback; }
function command() { return process.argv.includes("detail") ? "detail" : "search"; }
function requireKey() { if (!KEY) { console.error("Missing WORK24_AUTH_KEY. Set env; do not commit it."); process.exit(2); } return KEY; }
function decode(s) { return String(s ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim(); }
function redact(url) { return url.replace(/(authKey)=([^&]+)/g, "$1=***"); }
function tag(xml, name) { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i")); return m ? decode(m[1]) : ""; }
function blocks(xml, name) { return [...xml.matchAll(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "gi"))].map(m => m[1]); }
async function fetchText(url) { const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov work24 adapter)" } }); return await res.text(); }
async function search() {
  const url = new URL("https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo212L50.do");
  url.searchParams.set("authKey", requireKey()); url.searchParams.set("returnType", "XML"); url.searchParams.set("target", "dJobCD");
  url.searchParams.set("startPage", arg("page", "1")); url.searchParams.set("display", arg("limit", "5")); url.searchParams.set("srchType", arg("srch-type", "K")); url.searchParams.set("keyword", arg("keyword", "행정"));
  const xml = await fetchText(url);
  const items = blocks(xml, "dJobList").map(b => ({ job_code: tag(b, "dJobCd"), job_seq: tag(b, "dJobCdSeq"), job_name: tag(b, "dJobNm"), raw: b }));
  return { metadata: { source: "고용24 직업사전 목록", strategy: "KEYED_API_XML", retrieved_at: new Date().toISOString(), query_url: redact(url.toString()), count: items.length }, items };
}
async function detail() {
  const code = arg("job-code", ""); const seq = arg("job-seq", "");
  if (!code || !seq) { console.error("detail requires --job-code <dJobCd> --job-seq <dJobCdSeq>"); process.exit(2); }
  const url = new URL("https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo212D50.do");
  url.searchParams.set("authKey", requireKey()); url.searchParams.set("returnType", "XML"); url.searchParams.set("target", "dJobDTL"); url.searchParams.set("dJobCd", code); url.searchParams.set("dJobCdSeq", seq);
  const xml = await fetchText(url);
  const item = { job_code: code, job_seq: seq, job_name: tag(xml, "dJobNm"), overview: tag(xml, "jobSum"), duties: tag(xml, "jobDuty"), raw: xml.slice(0, 8000) };
  return { metadata: { source: "고용24 직업사전 상세", strategy: "KEYED_API_XML", retrieved_at: new Date().toISOString(), query_url: redact(url.toString()), count: item.job_name ? 1 : 0 }, item };
}
const payload = command() === "detail" ? await detail() : await search();
console.log(JSON.stringify(payload, null, 2));
if ((payload.items && payload.items.length === 0) || (payload.item && !payload.item.job_name)) process.exit(1);
