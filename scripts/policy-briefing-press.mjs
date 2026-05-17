#!/usr/bin/env node
import { writeFileSync } from "node:fs";

const BASE = "https://www.korea.kr";
const PATH = "/briefing/pressReleaseList.do";

function arg(name, fallback = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const command = process.argv.includes("detail") || process.argv.includes("--news-id") ? "detail" : "search";
const keyword = arg("keyword", arg("q", ""));
const newsIdArg = arg("news-id", "");
const limit = Number(arg("limit", "5"));
const page = Number(arg("page", "1"));
const format = arg("format", "json");

function stripTags(s) {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}


function metaContent(html, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<meta ${escaped} content="([^"]*)"`, "i");
  return stripTags(re.exec(html)?.[1] ?? "");
}

function parseDetail(html, sourceUrl, newsId) {
  const title = stripTags(
    html.match(/<div class="view_title">[\s\S]*?<h1>([\s\S]*?)<\/h1>/)?.[1] ??
      html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ??
      "",
  );
  const description = stripTags(
    html.match(/<meta name="description" content="([^"]*)"/)?.[1] ??
      html.match(/<meta property="og:description" content="([^"]*)"/)?.[1] ??
      "",
  );
  const agency = stripTags(html.match(/<a class="gotosite"[^>]*>[\s\S]*?([^<>\n\t]+)<i class="tooltip">/)?.[1] ?? "");
  const iframe = html.match(/<iframe[^>]+id="content_press"[^>]+src="([^"]+)"/)?.[1] ?? "";
  const attachments = [];
  const fileBlock = html.match(/<div class="filedown">([\s\S]*?)<\/div>\s*<!--\/\/ E: file Down/)?.[1] ?? "";
  for (const m of fileBlock.matchAll(/<p>[\s\S]*?<span><a href="([^"]+)">([\s\S]*?)<\/a><\/span>[\s\S]*?<a class="view" href="([^"]+)"[\s\S]*?<a class="down" href="([^"]+)"/g)) {
    attachments.push({
      name: stripTags(m[2]),
      file_url: new URL(m[1].replace(/&amp;/g, "&"), BASE).toString(),
      view_url: new URL(m[3].replace(/&amp;/g, "&"), BASE).toString(),
      download_url: new URL(m[4].replace(/&amp;/g, "&"), BASE).toString(),
    });
  }
  return {
    news_id: newsId,
    title,
    agency,
    description,
    source_url: sourceUrl,
    content_iframe_url: iframe ? new URL(iframe.replace(/&amp;/g, "&"), BASE).toString() : "",
    attachments,
  };
}

if (command === "detail") {
  if (!newsIdArg) {
    console.error("detail requires --news-id <id>");
    process.exit(2);
  }
  const detailUrl = `${BASE}/briefing/pressReleaseView.do?newsId=${encodeURIComponent(newsIdArg)}`;
  const response = await fetch(detailUrl, {
    headers: { "user-agent": "Mozilla/5.0 (K-Gov adapter smoke)" },
  });
  if (!response.ok) {
    console.error(`fetch failed: ${response.status} ${response.statusText}`);
    process.exit(2);
  }
  const html = await response.text();
  const item = parseDetail(html, detailUrl, newsIdArg);
  const payload = {
    metadata: {
      source: "대한민국 정책브리핑 보도자료 상세",
      strategy: "HTML_PARSE",
      retrieved_at: new Date().toISOString(),
      query_url: detailUrl,
      news_id: newsIdArg,
      count: item.title ? 1 : 0,
    },
    item,
  };
  console.log(JSON.stringify(payload, null, 2));
  if (!item.title) process.exit(1);
  process.exit(0);
}

const params = new URLSearchParams({
  pageIndex: String(page),
  srchWord: keyword,
  startDate: arg("start-date", ""),
  endDate: arg("end-date", ""),
  period: "",
  repCode: arg("agency-code", ""),
  repCodeType: "",
});
const queryUrl = `${BASE}${PATH}?${params.toString()}`;

const response = await fetch(queryUrl, {
  headers: { "user-agent": "Mozilla/5.0 (K-Gov adapter smoke)" },
});
if (!response.ok) {
  console.error(`fetch failed: ${response.status} ${response.statusText}`);
  process.exit(2);
}
const html = await response.text();
const listBlock = html.match(/<div class="list_type">([\s\S]*?)<\/div>\s*<!--/)?.[1] ?? html;
const itemPattern = /<li>\s*<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/li>/g;
const items = [];
for (const match of listBlock.matchAll(itemPattern)) {
  const href = match[1].replace(/&amp;/g, "&");
  const body = match[2];
  const title = stripTags(body.match(/<strong>([\s\S]*?)<\/strong>/)?.[1] ?? "");
  const summary = stripTags(body.match(/<span class="lead">([\s\S]*?)<\/span>\s*<span class="source">/)?.[1] ?? "");
  const source = body.match(/<span class="source">\s*<span>(.*?)<\/span>\s*<span>(.*?)<\/span>/s);
  const url = new URL(href, BASE).toString();
  const newsId = new URL(url).searchParams.get("newsId") ?? "";
  if (title && newsId) {
    items.push({
      news_id: newsId,
      date: stripTags(source?.[1] ?? ""),
      agency: stripTags(source?.[2] ?? ""),
      title,
      summary,
      source_url: url,
    });
  }
  if (items.length >= limit) break;
}

const payload = {
  metadata: {
    source: "대한민국 정책브리핑 보도자료",
    strategy: "HTML_PARSE",
    retrieved_at: new Date().toISOString(),
    query_url: queryUrl,
    keyword,
    page,
    limit,
    count: items.length,
  },
  items,
};

if (process.argv.includes("--save")) {
  const path = arg("save", "policy-briefing-press.sample.json");
  writeFileSync(path, JSON.stringify(payload, null, 2));
}

if (format === "md") {
  console.log(`# 정책브리핑 보도자료 검색: ${keyword || "(전체)"}\n`);
  console.log(`- Source: ${payload.metadata.source}`);
  console.log(`- Strategy: ${payload.metadata.strategy}`);
  console.log(`- Query: ${queryUrl}\n`);
  items.forEach((item, idx) => {
    console.log(`## ${idx + 1}. ${item.title}`);
    console.log(`- Date: ${item.date}`);
    console.log(`- Agency: ${item.agency}`);
    console.log(`- News ID: ${item.news_id}`);
    console.log(`- URL: ${item.source_url}`);
    console.log(`- Summary: ${item.summary}\n`);
  });
} else {
  console.log(JSON.stringify(payload, null, 2));
}

if (items.length === 0) process.exit(1);
