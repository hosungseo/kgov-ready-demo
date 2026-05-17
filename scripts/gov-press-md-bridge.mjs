#!/usr/bin/env node

const REPO = "hosungseo/gov-press-md";
const RAW = "https://raw.githubusercontent.com/hosungseo/gov-press-md/main";
const BLOB = "https://github.com/hosungseo/gov-press-md/blob/main";

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
function terms() {
  return arg("keyword", arg("query", "공급망")).split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
}
function encodePath(p) {
  return p.split("/").map(encodeURIComponent).join("/");
}
async function fetchText(url) {
  const r = await fetch(url, { headers: { "user-agent": "kgov-ready-demo gov-press-md bridge" } });
  if (!r.ok) throw new Error(url + " returned " + r.status);
  return r.text();
}
async function fetchJson(url) {
  const r = await fetch(url, { headers: { "user-agent": "kgov-ready-demo gov-press-md bridge" } });
  if (!r.ok) throw new Error(url + " returned " + r.status);
  return r.json();
}
async function tryRaw(path) {
  try {
    return await fetchText(RAW + "/" + encodePath(path));
  } catch {
    return "";
  }
}
function normalizeRepoPath(href) {
  return String(href || "").replace(/^\.\.\/\.\.\//, "").replace(/^\.\//, "");
}
function scoreText(value, ts) {
  const s = String(value || "");
  return ts.reduce((sum, t) => sum + (t && s.includes(t) ? 1 : 0), 0);
}
function parseMinistryIndex(markdown, sourceSlug) {
  const rows = [];
  for (const m of markdown.matchAll(/^-\s*(.*?)\s*—\s*\[([^\]]+)\]\(([^)]+)\)/gm)) {
    const date = m[1].trim();
    const title = m[2].trim();
    const path = normalizeRepoPath(m[3]);
    rows.push({ date, title, path, source_index: sourceSlug });
  }
  return rows;
}
async function ministryCandidates() {
  const ts = terms();
  const keyword = arg("keyword", arg("query", "공급망"));
  const ministry = arg("ministry", "");
  const slugs = [...new Set([
    keyword, ministry,
    keyword + "실", keyword + "_실", keyword + "청", keyword + "_청", keyword + "부", keyword + "_부", keyword + "원", keyword + "_원",
  ].filter(Boolean))];
  const rows = [];
  for (const slug of slugs) {
    const md = await tryRaw("docs/ministries/" + slug + ".md");
    if (!md) continue;
    rows.push(...parseMinistryIndex(md, slug));
  }
  return rows.map(row => ({ ...row, score: scoreText(row.title + " " + row.source_index, ts) })).filter(row => row.score > 0);
}
async function dateCandidates() {
  const date = arg("date", "");
  if (!date) return [];
  const [year, month] = date.split("-");
  const api = "https://api.github.com/repos/" + REPO + "/contents/data/" + year + "/" + year + "-" + month + "/" + date;
  try {
    const entries = await fetchJson(api);
    const ts = terms();
    return (Array.isArray(entries) ? entries : [])
      .filter(e => e.type === "file" && e.name.endsWith(".md") && e.name !== "README.md")
      .map(e => ({ date, title: e.name.replace(/^\d+_/, "").replace(/\.md$/, "").replace(/_/g, " "), path: e.path, source_index: "date:" + date, score: scoreText(e.name, ts) }))
      .filter(row => row.score > 0);
  } catch {
    return [];
  }
}
function parseFrontmatter(markdown) {
  const m = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    value = value.replace(/^"|"$/g, "");
    fm[key] = value;
  }
  return fm;
}
async function attachReadable(rows) {
  if (!hasFlag("fetch-readable") || !rows[0]) return rows;
  const md = await fetchText(RAW + "/" + encodePath(rows[0].path));
  const fm = parseFrontmatter(md);
  return rows.map((row, index) => index === 0 ? { ...row, frontmatter: fm, readable_markdown: md.slice(0, Number(arg("max-chars", "2200"))) } : row);
}
function normalizeRows(rows) {
  const seen = new Set();
  return rows
    .filter(row => {
      if (!row.path || seen.has(row.path)) return false;
      seen.add(row.path);
      return true;
    })
    .sort((a, b) => b.score - a.score || String(b.date).localeCompare(String(a.date)))
    .slice(0, Number(arg("limit", "5")))
    .map(row => ({
      ...row,
      raw: RAW + "/" + encodePath(row.path),
      blob: BLOB + "/" + encodePath(row.path),
    }));
}
function renderMd(result) {
  const lines = [
    "# Gov Press Markdown Bridge",
    "",
    "- Upstream: `hosungseo/gov-press-md`",
    "- Query: `" + result.query + "`",
    "- Generated: " + result.generated_at,
    "- Strategy: ministry index + optional date directory",
    "- Hits: " + result.hits.length,
    "",
    "## Hits",
    "",
  ];
  if (!result.hits.length) lines.push("- No press Markdown hits.");
  for (const hit of result.hits) {
    lines.push("### " + hit.title);
    lines.push("- Date: " + hit.date);
    lines.push("- Source index: " + hit.source_index);
    lines.push("- Score: " + hit.score);
    lines.push("- Raw: " + hit.raw);
    lines.push("- Blob: " + hit.blob);
    if (hit.frontmatter?.original_url) lines.push("- Original URL: " + hit.frontmatter.original_url);
    if (hit.readable_markdown) lines.push("", "```md", hit.readable_markdown.trim(), "```");
    lines.push("");
  }
  lines.push("## Caveat", "");
  lines.push("- This is a git-backed Markdown corpus from the policy briefing API. Use original_url for official citation when present.");
  return lines.join("\n");
}

const rows = normalizeRows([...(await ministryCandidates()), ...(await dateCandidates())]);
const hits = await attachReadable(rows);
const result = {
  source: "gov-press-md-bridge",
  upstream_repo: REPO,
  query: arg("keyword", arg("query", "공급망")),
  generated_at: new Date().toISOString(),
  count: hits.length,
  hits,
};
if (arg("format", "md") === "json") console.log(JSON.stringify(result, null, 2));
else console.log(renderMd(result));

