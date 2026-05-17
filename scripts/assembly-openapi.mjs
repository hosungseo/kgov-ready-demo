#!/usr/bin/env node
const KEY = process.env.ASSEMBLY_API_KEY || process.env.OPEN_ASSEMBLY_API_KEY || process.env.NA_API_KEY || "";
function arg(name, fallback = "") { const i = process.argv.indexOf(`--${name}`); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback; }
function command() { if (process.argv.includes("member")) return "member"; if (process.argv.includes("schedule")) return "schedule"; return "member"; }
function requireKey() { if (!KEY) { console.error("Missing ASSEMBLY_API_KEY (or OPEN_ASSEMBLY_API_KEY / NA_API_KEY). Set env; do not commit it."); process.exit(2); } return KEY; }
function redact(url) { return url.replace(/(KEY)=([^&]+)/g, "$1=***"); }
async function fetchEndpoint(endpoint, extra = {}) {
  const url = new URL(`https://open.assembly.go.kr/portal/openapi/${endpoint}`);
  url.searchParams.set("KEY", requireKey()); url.searchParams.set("Type", "json"); url.searchParams.set("pIndex", arg("page", "1")); url.searchParams.set("pSize", arg("limit", "5"));
  for (const [k, v] of Object.entries(extra)) if (v) url.searchParams.set(k, v);
  const json = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (K-Gov assembly adapter)" } }).then(r => r.json());
  const root = json[endpoint];
  if (!Array.isArray(root)) {
    const result = json.RESULT || json?.[endpoint]?.RESULT;
    console.error(JSON.stringify({ error: "assembly_api_error", result, url: redact(url.toString()) }, null, 2));
    process.exit(2);
  }
  const head = root.find(x => x.head)?.head || [];
  const result = head.find(x => x.RESULT)?.RESULT;
  if (result && result.CODE !== "INFO-000") { console.error(JSON.stringify({ error: "assembly_api_error", result, url: redact(url.toString()) }, null, 2)); process.exit(2); }
  const total = head.find(x => x.list_total_count)?.list_total_count ?? null;
  const rows = root.find(x => x.row)?.row || [];
  return { url: redact(url.toString()), total, rows };
}
async function member() {
  const q = arg("query", "");
  const eraco = arg("eraco", "제22대");
  const { url, total, rows } = await fetchEndpoint("ALLNAMEMBER", {});
  const filtered = rows.filter(r => (!eraco || String(r.GTELT_ERACO || "").includes(eraco)) && (!q || JSON.stringify(r).includes(q)));
  const items = filtered.map(r => ({
    member_id: r.NAAS_CD || "",
    name: r.NAAS_NM || "",
    party: r.PLPT_NM || "",
    district: r.ELECD_NM || "",
    election_type: r.ELECD_DIV_NM || "",
    committee: r.CMIT_NM || r.BLNG_CMIT_NM || "",
    era: r.GTELT_ERACO || "",
    phone: r.NAAS_TEL_NO || "",
    email: r.NAAS_EMAIL_ADDR || "",
    homepage: r.NAAS_HP_URL || "",
    photo_url: r.NAAS_PIC || "",
    raw: r,
  }));
  return { metadata: { source: "열린국회정보 의원정보 ALLNAMEMBER", strategy: "KEYED_API", retrieved_at: new Date().toISOString(), query_url: url, query: q, eraco, count: items.length, total_count: total }, items };
}
async function schedule() {
  const date = arg("date", "");
  const keyword = arg("keyword", "");
  const { url, total, rows } = await fetchEndpoint("ALLSCHEDULE", { DAE_NUM: arg("dae-num", "22") });
  const filtered = rows.filter(r => (!date || r.SCH_DT === date) && (!keyword || JSON.stringify(r).includes(keyword)));
  const items = filtered.map(r => ({
    kind: r.SCH_KIND || "",
    title: r.SCH_CN || "",
    date: r.SCH_DT || "",
    time: r.SCH_TM || "",
    committee: r.CMIT_NM || "",
    host: r.EV_INST_NM || "",
    place: r.EV_PLC || "",
    raw: r,
  }));
  return { metadata: { source: "열린국회정보 국회일정 ALLSCHEDULE", strategy: "KEYED_API", retrieved_at: new Date().toISOString(), query_url: url, date, keyword, count: items.length, total_count: total }, items };
}
const payload = command() === "schedule" ? await schedule() : await member();
console.log(JSON.stringify(payload, null, 2));
if ((payload.items && payload.items.length === 0) || !payload) process.exit(1);
