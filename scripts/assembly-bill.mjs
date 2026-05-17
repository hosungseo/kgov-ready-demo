#!/usr/bin/env node
const BASE = "https://open.assembly.go.kr/portal/openapi";

function arg(name, fallback = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function command() {
  if (process.argv.includes("detail")) return "detail";
  return "search";
}

function apiKey() {
  return process.env.ASSEMBLY_API_KEY || process.env.OPEN_ASSEMBLY_API_KEY || process.env.NA_API_KEY || "";
}

function requireKey() {
  const value = apiKey();
  if (!value) {
    console.error("Missing ASSEMBLY_API_KEY (or OPEN_ASSEMBLY_API_KEY / NA_API_KEY). Set the Open Assembly API key in env; do not commit it.");
    process.exit(2);
  }
  return value;
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function pick(obj, names) {
  for (const name of names) {
    if (obj && obj[name] !== undefined && obj[name] !== null && String(obj[name]) !== "") return obj[name];
  }
  return "";
}

function normalizeText(value) {
  return String(value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function findRows(json) {
  if (Array.isArray(json)) return json;
  const stack = [json];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    if (Array.isArray(cur)) {
      if (cur.length && typeof cur[0] === "object" && !cur[0].head) return cur;
      for (const item of cur) stack.push(item);
      continue;
    }
    for (const [key, value] of Object.entries(cur)) {
      if (key === "row" && Array.isArray(value)) return value;
      stack.push(value);
    }
  }
  return [];
}

function normalizeBill(row) {
  const billId = String(pick(row, ["BILL_ID", "bill_id", "BILL_NO", "의안ID", "의안번호"]));
  const billNo = String(pick(row, ["BILL_NO", "bill_no", "의안번호"]));
  const sourceUrl = billId
    ? `https://likms.assembly.go.kr/bill/billDetail.do?billId=${encodeURIComponent(billId)}`
    : "";
  return {
    bill_id: billId,
    bill_no: billNo,
    title: normalizeText(pick(row, ["BILL_NAME", "BILL_NM", "bill_name", "의안명", "TITLE"])),
    proposer: normalizeText(pick(row, ["PROPOSER", "PPSR_NM", "PPSR", "proposer", "제안자"])),
    proposed_date: String(pick(row, ["PROPOSE_DT", "PPSL_DT", "propose_dt", "제안일자"])),
    committee: normalizeText(pick(row, ["CURR_COMMITTEE", "JRCMIT_NM", "committee", "소관위원회", "COMMITTEE"])),
    status: normalizeText(pick(row, ["PROC_RESULT", "PROC_RSLT", "PROC_STAGE_CD", "PASSGUBN", "RGS_CONF_RSLT", "status", "처리상태", "BILL_STATUS"])),
    source_url: String(pick(row, ["LINK_URL", "URL", "DETAIL_LINK"])) || sourceUrl,
    raw: row,
  };
}

async function fetchOpenApi(endpoint, params) {
  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set("KEY", requireKey());
  url.searchParams.set("Type", "json");
  url.searchParams.set("pIndex", params.page || "1");
  url.searchParams.set("pSize", params.pageSize || "10");
  for (const [key, value] of Object.entries(params.extra || {})) {
    if (value) url.searchParams.set(key, value);
  }
  const safeUrl = url.toString().replace(/KEY=[^&]+/, "KEY=***");
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov assembly adapter)" } });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error(`Non-JSON response from ${safeUrl}: ${text.slice(0, 300)}`);
    process.exit(2);
  }
  const rows = findRows(json);
  return { safeUrl, json, rows };
}

async function search() {
  const query = arg("query", arg("q", ""));
  const pageSize = arg("page-size", arg("limit", "10"));
  const endpoint = arg("endpoint", "nzmimeepazxkubdpn");
  const extra = {};
  const age = arg("age", "");
  const eraco = arg("eraco", endpoint === "ALLBILLV2" ? age : "");
  if (age && endpoint !== "ALLBILLV2") extra.AGE = age;
  if (eraco) extra.ERACO = eraco;
  if (query) extra[arg("query-field", endpoint === "ALLBILLV2" ? "BILL_NM" : "BILL_NAME")] = query;
  const { safeUrl, rows } = await fetchOpenApi(endpoint, {
    page: arg("page", "1"),
    pageSize,
    extra,
  });
  const items = rows.slice(0, Number(pageSize)).map(normalizeBill);
  return {
    metadata: {
      source: "열린국회정보 OpenAPI bill search",
      strategy: "KEYED_API",
      retrieved_at: new Date().toISOString(),
      query_url: safeUrl,
      endpoint,
      query,
      count: items.length,
    },
    items,
  };
}

async function detail() {
  const billId = arg("bill-id", "");
  const billNo = arg("bill-no", "");
  if (!billId && !billNo) {
    console.error("detail requires --bill-id <id> or --bill-no <number>");
    process.exit(2);
  }
  const endpoint = arg("endpoint", "nzmimeepazxkubdpn");
  const { safeUrl, rows } = await fetchOpenApi(endpoint, {
    page: "1",
    pageSize: "20",
    extra: {
      BILL_ID: billId,
      BILL_NO: billNo,
    },
  });
  const item = rows.map(normalizeBill).find((row) => !billId || row.bill_id === billId) || rows.map(normalizeBill)[0] || null;
  return {
    metadata: {
      source: "열린국회정보 OpenAPI bill detail/search row",
      strategy: "KEYED_API",
      retrieved_at: new Date().toISOString(),
      query_url: safeUrl,
      endpoint,
      bill_id: billId,
      bill_no: billNo,
      count: item ? 1 : 0,
    },
    item,
  };
}

const payload = command() === "detail" ? await detail() : await search();
console.log(JSON.stringify(payload, null, 2));
if ((payload.items && payload.items.length === 0) || ("item" in payload && !payload.item)) process.exit(1);
