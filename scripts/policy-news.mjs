#!/usr/bin/env node
const KEY = process.env.DATA_GO_KR_SERVICE_KEY || process.env.POLICY_NEWS_SERVICE_KEY || "";
function arg(name, fallback = "") { const i = process.argv.indexOf(`--${name}`); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback; }
function requireKey() { if (!KEY) { console.error("Missing DATA_GO_KR_SERVICE_KEY (or POLICY_NEWS_SERVICE_KEY). Set env; do not commit it."); process.exit(2); } return KEY; }
function redact(url) { return url.replace(/(serviceKey)=([^&]+)/g, "$1=***"); }
function text(s) { return String(s ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim(); }
function tag(xml, name) { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i")); return m ? text(m[1]) : ""; }
function blocks(xml, name) { return [...xml.matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "gi"))].map(m => m[1]); }
async function main() {
  const url = new URL("https://apis.data.go.kr/1371000/policyNewsService/policyNewsList");
  url.searchParams.set("serviceKey", requireKey());
  url.searchParams.set("startDate", arg("start", "20260515"));
  url.searchParams.set("endDate", arg("end", "20260517"));
  url.searchParams.set("numOfRows", arg("limit", "5"));
  url.searchParams.set("pageNo", arg("page", "1"));
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov policy-news adapter)" } });
  const xml = await res.text();
  if (/SERVICE_KEY|ERROR|INVALID|등록되지 않은|활용기간/.test(xml) && !/<item>/i.test(xml)) {
    console.error(`Policy news API error from ${redact(url.toString())}: ${text(xml).slice(0, 300)}`);
    process.exit(2);
  }
  const limit = Number(arg("limit", "5"));
  const allBlocks = blocks(xml, "NewsItem").length ? blocks(xml, "NewsItem") : blocks(xml, "item");
  const itemBlocks = allBlocks.slice(0, limit);
  const items = itemBlocks.map(b => ({
    news_id: tag(b, "NewsItemId") || tag(b, "newsId"),
    title: tag(b, "Title") || tag(b, "title"),
    subtitle: tag(b, "SubTitle1") || tag(b, "subTitle"),
    date: tag(b, "ApproveDate") || tag(b, "regDate") || tag(b, "date"),
    modified_at: tag(b, "ModifyDate"),
    agency: tag(b, "MinisterCode") || tag(b, "deptName") || tag(b, "department"),
    summary: tag(b, "SubTitle1") || tag(b, "DataContents").slice(0, 280) || tag(b, "contents") || tag(b, "summary"),
    source_url: tag(b, "OriginalUrl") || tag(b, "OriginUrl") || tag(b, "link") || tag(b, "url"),
    raw: b,
  }));
  const payload = { metadata: { source: "정책브리핑 정책뉴스 API", strategy: "KEYED_API_XML", retrieved_at: new Date().toISOString(), query_url: redact(url.toString()), count: items.length, total_count: allBlocks.length }, items };
  console.log(JSON.stringify(payload, null, 2));
  if (!items.length) process.exit(1);
}
await main();
