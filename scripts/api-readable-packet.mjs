#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function loadEnv(path = ".env.local") {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0 && !process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = t.slice(i + 1);
  }
}
function arg(name, fallback = "") { const i = process.argv.indexOf(`--${name}`); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback; }
function requireKey(name, aliases = []) {
  for (const k of [name, ...aliases]) if (process.env[k]) return process.env[k];
  console.error(`Missing ${name}. Set env; do not commit it.`); process.exit(2);
}
function redactUrl(url) { return String(url).replace(/(serviceKey|KEY|OC|apiKey)=([^&]+)/g, "$1=***"); }
function clean(s) { return String(s ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(); }
function tag(xml, name) { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i")); return m ? clean(m[1]) : ""; }
function rawTag(xml, name) { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i")); return m ? String(m[1]).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() : ""; }
function blocks(xml, name) { return [...xml.matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "gi"))].map(m => m[1]); }
async function fetchPolicyNews() {
  const key = requireKey("DATA_GO_KR_SERVICE_KEY", ["POLICY_NEWS_SERVICE_KEY"]);
  const url = new URL("https://apis.data.go.kr/1371000/policyNewsService/policyNewsList");
  url.searchParams.set("serviceKey", key);
  url.searchParams.set("startDate", arg("start", "20250515"));
  url.searchParams.set("endDate", arg("end", "20250517"));
  url.searchParams.set("numOfRows", arg("api-limit", arg("limit", "5")));
  url.searchParams.set("pageNo", arg("page", "1"));
  const xml = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov api-readable composer)" } }).then(r => r.text());
  const all = blocks(xml, "NewsItem");
  const q = arg("query", "");
  const rows = all.map(b => ({
    id: tag(b, "NewsItemId"),
    title: tag(b, "Title"),
    subtitle: tag(b, "SubTitle1"),
    agency: tag(b, "MinisterCode"),
    date: tag(b, "ApproveDate"),
    source_url: tag(b, "OriginalUrl") || tag(b, "OriginUrl"),
    summary: tag(b, "SubTitle1") || tag(b, "DataContents").slice(0, 280),
    raw: b,
  })).filter(x => x.source_url && (!q || JSON.stringify(x).includes(q)));
  return { metadata: { source: "policy.news.search", query_url: redactUrl(url.toString()), total_count: all.length, filtered_count: rows.length }, rows };
}
async function fetchPressSearch() {
  const keyword = arg("query", arg("keyword", "정부조직"));
  const r = spawnSync("node", ["scripts/policy-briefing-press.mjs", "--keyword", keyword, "--limit", arg("api-limit", arg("limit", "5")), "--format", "json"], { encoding: "utf8", env: process.env });
  if (r.status !== 0) { console.error(r.stderr || r.stdout); process.exit(r.status || 1); }
  const payload = JSON.parse(r.stdout);
  return { metadata: { source: "press.search", query_url: payload.metadata?.query_url, total_count: payload.items?.length ?? 0, filtered_count: payload.items?.length ?? 0 }, rows: (payload.items || []).map(x => ({ id: x.news_id, title: x.title, agency: x.agency, date: x.date, source_url: x.source_url, summary: x.summary, raw: x })) };
}
function crawl(url) {
  const r = spawnSync("python3.10", ["scripts/crawl-readable.py", "--url", url, "--max-chars", arg("max-chars", "8000"), "--profile", arg("profile", "auto")], { encoding: "utf8", env: process.env, maxBuffer: 8 * 1024 * 1024 });
  if (r.status !== 0) return { error: r.stderr || r.stdout, exit_code: r.status };
  const start = r.stdout.indexOf("{");
  if (start < 0) return { error: `crawl output did not contain JSON: ${r.stdout.slice(0, 300)}`, exit_code: 1 };
  return JSON.parse(r.stdout.slice(start));
}
function htmlToMarkdown(html) {
  return clean(String(html || "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|figcaption)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, ""))
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}
function apiBodyReadable(selected, crawlError) {
  const body = rawTag(selected.raw || "", "DataContents");
  if (!body) return { error: crawlError?.error || "crawl failed and API item has no DataContents", exit_code: crawlError?.exit_code || 1 };
  const max = Number(arg("max-chars", "8000"));
  const markdown = [
    `# ${selected.title}`,
    "",
    `- Date: ${selected.date || ""}`,
    `- Agency: ${selected.agency || ""}`,
    `- Source: ${selected.source_url}`,
    "",
    "## Summary / extracted description",
    selected.summary || "",
    "",
    "## API body",
    htmlToMarkdown(body).slice(0, max),
  ].join("\n").trim();
  return {
    source_url: selected.source_url,
    strategy: "API_BODY_FALLBACK",
    markdown_length: markdown.length,
    postprocess: { profile: "policy-news-api-body", crawl_error: crawlError?.error ? String(crawlError.error).slice(0, 1000) : "" },
    markdown,
  };
}

loadEnv();
const source = arg("source", "policy-news");
const index = Number(arg("index", "0"));
const api = source === "press" ? await fetchPressSearch() : await fetchPolicyNews();
const selected = api.rows[index];
if (!selected) { console.error(`No API item at index ${index}. filtered_count=${api.rows.length}`); process.exit(1); }
const crawled = crawl(selected.source_url);
const readable = crawled.error ? apiBodyReadable(selected, crawled) : crawled;
const packet = {
  metadata: {
    source: "api-readable-packet",
    strategy: readable.strategy === "API_BODY_FALLBACK" ? "API_SEARCH_THEN_API_BODY_FALLBACK" : "API_SEARCH_THEN_CRAWL_READABLE",
    retrieved_at: new Date().toISOString(),
    api_source: api.metadata.source,
    api_query_url: redactUrl(api.metadata.query_url),
    selected_index: index,
    selected_source_url: selected.source_url,
  },
  api_item: selected,
  readable: readable.error ? { error: readable.error, exit_code: readable.exit_code } : {
    source_url: readable.metadata?.source_url || readable.source_url,
    strategy: readable.metadata?.strategy || readable.strategy,
    markdown_length: readable.metadata?.markdown_length || readable.markdown_length,
    postprocess: readable.postprocess,
    markdown: readable.markdown,
  },
};
console.log(JSON.stringify(packet, null, 2));
process.exit(readable.error ? 1 : 0);
