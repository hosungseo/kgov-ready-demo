#!/usr/bin/env node
const ENDPOINT = "https://apis.data.go.kr/1741000/ApiTotalService/getApiTotalList";

function arg(name, fallback = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function serviceKey() {
  return process.env.GAZETTE_API_KEY || process.env.GOV_GAZETTE_API_KEY || process.env.DATA_GO_KR_SERVICE_KEY || "";
}

function requireKey() {
  const value = serviceKey();
  if (!value) {
    console.error("Missing GAZETTE_API_KEY (or GOV_GAZETTE_API_KEY / DATA_GO_KR_SERVICE_KEY). Set the data.go.kr service key in env; do not commit it.");
    process.exit(2);
  }
  return value;
}

function stripTags(s) {
  return String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function asArray(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

function pick(obj, names) {
  for (const name of names) {
    if (obj && obj[name] !== undefined && obj[name] !== null && String(obj[name]) !== "") return obj[name];
  }
  return "";
}

function normalizeRow(row) {
  const pdf = pick(row, ["pdfUrl", "pdf_url", "PDF_URL", "fileUrl", "FILE_URL", "downloadUrl", "DOWN_URL", "atchFileUrl", "pdfFilePath"]);
  return {
    gazette_id: String(pick(row, ["id", "ID", "gazetteId", "pblcnId", "PBL_CN_ID", "cntntSeqNo", "tocId", "no", "NO"])),
    publication_date: String(pick(row, ["pblcnYmd", "PBL_CN_YMD", "publicationDate", "date", "DATE", "gwanboDate", "hopePblictDt"])),
    agency: stripTags(pick(row, ["orgNm", "ORG_NM", "agency", "deptNm", "DEPT_NM", "pblcnOrgNm", "pblcnInstNm"])),
    title: stripTags(pick(row, ["title", "TITLE", "sj", "SJ", "ttl", "TTL", "gwanboSj", "docSj", "cntntSj"])),
    type: stripTags(pick(row, ["type", "TYPE", "docType", "DOC_TYPE", "gwanboType", "pblcnSeNm", "cmplatSeNm", "ofcttBookNm"])),
    pdf_url: pdf ? (String(pdf).startsWith("http") ? String(pdf) : `https://www.gwanbo.go.kr${pdf}`) : "",
    raw: row,
  };
}


function decodeXml(value) {
  return String(value ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseXmlItems(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  for (const itemMatch of xml.matchAll(itemRe)) {
    const row = {};
    for (const field of itemMatch[1].matchAll(/<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g)) {
      row[field[1]] = decodeXml(field[2]);
    }
    if (Object.keys(row).length) items.push(row);
  }
  return items;
}

function findRows(json) {
  if (Array.isArray(json)) return json;
  const candidates = [
    json?.response?.body?.items?.item,
    json?.response?.body?.items,
    json?.ApiTotalService?.row,
    json?.ApiTotalService?.item,
    json?.items?.item,
    json?.items,
    json?.row,
    json?.item,
    json?.data,
  ];
  for (const c of candidates) {
    const arr = asArray(c);
    if (arr.length && typeof arr[0] === "object") return arr;
  }
  // Last-resort recursive row finder for public-data wrappers with shifting keys.
  const stack = [json];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    if (Array.isArray(cur) && cur.length && typeof cur[0] === "object") return cur;
    for (const value of Object.values(cur)) stack.push(value);
  }
  return [];
}

const from = arg("from", arg("start", ""));
const to = arg("to", arg("end", ""));
const keyword = arg("keyword", arg("q", ""));
const page = arg("page", "1");
const pageSize = arg("page-size", arg("limit", "10"));
const format = arg("format", "json");

if (!from || !to) {
  console.error("gazette.search requires --from YYYY-MM-DD and --to YYYY-MM-DD");
  process.exit(2);
}

const params = new URLSearchParams({
  serviceKey: requireKey(),
  pageNo: page,
  pageSize,
  reqFrom: from.replaceAll("-", ""),
  reqTo: to.replaceAll("-", ""),
});
if (keyword) params.set("search", keyword);

const url = `${ENDPOINT}?${params.toString()}`;
const safeUrl = url.replace(/serviceKey=[^&]+/, "serviceKey=***");
const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov gazette adapter)" } });
const text = await res.text();
let json;
let rawRows;
try {
  json = JSON.parse(text);
  rawRows = findRows(json);
} catch {
  rawRows = parseXmlItems(text);
  if (!rawRows.length) {
    console.error(`Non-JSON/XML response from ${safeUrl}: ${text.slice(0, 300)}`);
    process.exit(2);
  }
}

const rows = rawRows.slice(0, Number(pageSize)).map(normalizeRow);
const payload = {
  metadata: {
    source: "행안부 관보 API getApiTotalList",
    strategy: "KEYED_API",
    retrieved_at: new Date().toISOString(),
    query_url: safeUrl,
    from,
    to,
    keyword,
    page: Number(page),
    page_size: Number(pageSize),
    count: rows.length,
  },
  items: rows,
};

if (format === "md") {
  console.log(`# 관보 검색: ${keyword || "(전체)"}\n`);
  console.log(`- Source: ${payload.metadata.source}`);
  console.log(`- Strategy: ${payload.metadata.strategy}`);
  console.log(`- Period: ${from} ~ ${to}\n`);
  rows.forEach((item, idx) => {
    console.log(`## ${idx + 1}. ${item.title || "(제목 없음)"}`);
    console.log(`- Date: ${item.publication_date}`);
    console.log(`- Agency: ${item.agency}`);
    console.log(`- Type: ${item.type}`);
    console.log(`- ID: ${item.gazette_id}`);
    if (item.pdf_url) console.log(`- PDF: ${item.pdf_url}`);
    console.log();
  });
} else {
  console.log(JSON.stringify(payload, null, 2));
}

if (rows.length === 0) process.exit(1);
