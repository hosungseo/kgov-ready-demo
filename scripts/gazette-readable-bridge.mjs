#!/usr/bin/env node

const BASE = "https://hosungseo.github.io/ai-readable-gazette-kr";

function arg(name, fallback = "") {
  const i = process.argv.indexOf("--" + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function hasFlag(name) {
  return process.argv.includes("--" + name);
}
function short(s, n = 220) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
}
async function fetchJson(url) {
  const r = await fetch(url, { headers: { "user-agent": "kgov-ready-demo gazette readable bridge" } });
  if (!r.ok) throw new Error(url + " returned " + r.status);
  return r.json();
}
async function fetchText(url) {
  const r = await fetch(url, { headers: { "user-agent": "kgov-ready-demo gazette readable bridge" } });
  if (!r.ok) throw new Error(url + " returned " + r.status);
  return r.text();
}
function normalizeDoc(row, titles) {
  if (Array.isArray(row)) {
    const [dateIndex, n, instIndex, title, file] = row;
    const date = titles.dates?.[dateIndex] || "";
    const inst = titles.insts?.[instIndex] || "";
    return {
      date, n, inst, title, file,
      raw: "https://raw.githubusercontent.com/hosungseo/ai-readable-gazette-kr/main/derived/readable-corrected/" + encodeURIComponent(date) + "/" + encodeURIComponent(file),
      blob: "https://github.com/hosungseo/ai-readable-gazette-kr/blob/main/derived/readable-corrected/" + encodeURIComponent(date) + "/" + encodeURIComponent(file),
    };
  }
  return row;
}
function scoreDoc(doc, terms) {
  const hay = [doc.title, doc.inst, doc.date].join(" ");
  return terms.reduce((sum, term) => sum + (term && hay.includes(term) ? 1 : 0), 0);
}
function parseTerms() {
  const keyword = arg("keyword", arg("query", "공급망"));
  return keyword.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
}
async function searchTitles() {
  const limit = Number(arg("limit", "5"));
  const terms = parseTerms();
  const titles = await fetchJson(BASE + "/data/titles.json");
  const docs = (titles.docs || [])
    .map(row => normalizeDoc(row, titles))
    .map(doc => ({ ...doc, score: scoreDoc(doc, terms) }))
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score || String(b.date).localeCompare(String(a.date)))
    .slice(0, limit);
  return { titles, docs, terms };
}
async function searchDate() {
  const date = arg("date", "");
  if (!date) return null;
  try {
    const payload = await fetchJson(BASE + "/data/dates/" + date + ".json");
    const terms = parseTerms();
    const docs = (payload.docs || [])
      .map(doc => ({ ...doc, date, score: scoreDoc(doc, terms) }))
      .filter(doc => !terms.length || doc.score > 0)
      .slice(0, Number(arg("limit", "5")));
    return { date, docs, found: true };
  } catch (error) {
    return { date, docs: [], found: false, error: String(error.message || error) };
  }
}
async function attachReadable(docs) {
  if (!hasFlag("fetch-readable") || !docs[0]?.raw) return docs;
  const text = await fetchText(docs[0].raw);
  return docs.map((doc, index) => index === 0 ? { ...doc, readable_markdown: text.slice(0, Number(arg("max-chars", "2200"))) } : doc);
}
function renderMd(result) {
  const lines = [
    "# Gazette Readable Bridge",
    "",
    "- Upstream: `hosungseo/ai-readable-gazette-kr`",
    "- Reader: <https://hosungseo.github.io/ai-readable-gazette-kr/>",
    "- Query: `" + result.query + "`",
    "- Generated: " + result.generated_at,
    "- Coverage: " + result.meta.date_range.join(" -> ") + ", " + result.meta.total_docs + " docs",
    "- Hits: " + result.hits.length,
    "",
  ];
  if (result.date_lookup) {
    lines.push("## Date Lookup", "");
    lines.push("- Date: " + result.date_lookup.date);
    lines.push("- Found date index: " + (result.date_lookup.found ? "yes" : "no"));
    lines.push("- Matching docs: " + result.date_lookup.docs.length);
    if (result.date_lookup.error) lines.push("- Error: " + result.date_lookup.error);
    lines.push("");
  }
  lines.push("## Hits", "");
  if (!result.hits.length) lines.push("- No readable gazette title hits.");
  for (const hit of result.hits) {
    lines.push("### " + hit.title);
    lines.push("- Date: " + hit.date);
    lines.push("- Institution: " + (hit.inst || "n/a"));
    lines.push("- Score: " + hit.score);
    lines.push("- Raw: " + hit.raw);
    lines.push("- Blob: " + hit.blob);
    if (hit.readable_markdown) {
      lines.push("", "```md", hit.readable_markdown.trim(), "```");
    }
    lines.push("");
  }
  lines.push("## Caveat", "");
  lines.push("- This is a corrected OCR/readable corpus. Confirm official use against the original gazette PDF.");
  return lines.join("\n");
}

const meta = await fetchJson(BASE + "/data/meta.json");
const titleResult = await searchTitles();
const dateLookup = await searchDate();
const hits = await attachReadable(titleResult.docs);
const result = {
  source: "gazette-readable-bridge",
  upstream_repo: "hosungseo/ai-readable-gazette-kr",
  upstream_reader: BASE + "/",
  query: arg("keyword", arg("query", "공급망")),
  generated_at: new Date().toISOString(),
  meta: {
    version: meta.version,
    total_docs: meta.total_docs,
    date_range: meta.date_range,
    date_count: meta.date_count,
    institution_count: meta.institution_count,
  },
  date_lookup: dateLookup,
  hits,
};
if (arg("format", "md") === "json") console.log(JSON.stringify(result, null, 2));
else console.log(renderMd(result));

