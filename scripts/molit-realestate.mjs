#!/usr/bin/env node
const KEY = process.env.DATA_GO_KR_SERVICE_KEY || process.env.MOLIT_API_KEY || "";
function arg(name, fallback = "") { const i = process.argv.indexOf(`--${name}`); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback; }
function requireKey() { if (!KEY) { console.error("Missing DATA_GO_KR_SERVICE_KEY (or MOLIT_API_KEY). Set env; do not commit it."); process.exit(2); } return KEY; }
function redact(url) { return url.replace(/(serviceKey)=([^&]+)/g, "$1=***"); }
function clean(s) { return String(s ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/\s+/g," ").trim(); }
function tag(xml, name) { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i")); return m ? clean(m[1]) : ""; }
function blocks(xml, name) { return [...xml.matchAll(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "gi"))].map(m=>m[1]); }
const ENDPOINTS = {
  aptTrade: "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev",
  aptRent: "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent",
  officetelTrade: "https://apis.data.go.kr/1613000/RTMSDataSvcOffiTrade/getRTMSDataSvcOffiTrade",
  officetelRent: "https://apis.data.go.kr/1613000/RTMSDataSvcOffiRent/getRTMSDataSvcOffiRent",
};
async function main() {
  const kind = arg("kind", "aptTrade"); const endpoint = ENDPOINTS[kind];
  if (!endpoint) { console.error(`Unknown kind: ${kind}. Use ${Object.keys(ENDPOINTS).join(", ")}`); process.exit(2); }
  const url = new URL(endpoint); url.searchParams.set("serviceKey", requireKey()); url.searchParams.set("LAWD_CD", arg("lawd", "36110")); url.searchParams.set("DEAL_YMD", arg("ym", "202604")); url.searchParams.set("pageNo", arg("page", "1")); url.searchParams.set("numOfRows", arg("limit", "5"));
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov MOLIT adapter)" } }); const xml = await res.text();
  if (/<errMsg>|SERVICE_KEY|INVALID|ERROR/i.test(xml) && !/<item>/i.test(xml)) { console.error(`MOLIT API error from ${redact(url.toString())}: ${clean(xml).slice(0,300)}`); process.exit(2); }
  const items = blocks(xml, "item").map(b => ({
    property_name: tag(b, "aptNm") || tag(b, "offiNm") || tag(b, "단지") || tag(b, "단지명"),
    apt_name: tag(b, "aptNm") || tag(b, "offiNm") || tag(b, "단지") || tag(b, "단지명"),
    deal_amount: tag(b, "dealAmount") || tag(b, "거래금액"),
    deposit: tag(b, "deposit") || tag(b, "보증금액"),
    monthly_rent: tag(b, "monthlyRent") || tag(b, "월세금액"),
    area: tag(b, "excluUseAr") || tag(b, "전용면적"),
    floor: tag(b, "floor") || tag(b, "층"),
    build_year: tag(b, "buildYear") || tag(b, "건축년도"),
    deal_year: tag(b, "dealYear") || tag(b, "년"),
    deal_month: tag(b, "dealMonth") || tag(b, "월"),
    deal_day: tag(b, "dealDay") || tag(b, "일"),
    dong: tag(b, "umdNm") || tag(b, "법정동"),
    jibun: tag(b, "jibun") || tag(b, "지번"),
    contract_type: tag(b, "contractType"),
    cancel_date: tag(b, "cdealDay"),
    dealing_type: tag(b, "dealingGbn"),
    raw: b,
  }));
  const payload = { metadata: { source: "국토교통부 실거래가 API", strategy: "KEYED_API_XML", retrieved_at: new Date().toISOString(), query_url: redact(url.toString()), kind, lawd: arg("lawd", "36110"), ym: arg("ym", "202604"), count: items.length }, items };
  console.log(JSON.stringify(payload, null, 2)); if (!items.length) process.exit(1);
}
await main();
