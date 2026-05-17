#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function arg(name, fallback = "") {
  const i = process.argv.indexOf("--" + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function hasFlag(name) {
  return process.argv.includes("--" + name);
}
function shellQuote(s) {
  const v = String(s || "");
  return /^[A-Za-z0-9_./:-]+$/.test(v) ? v : "\"" + v.replace(/"/g, "\\\"") + "\"";
}
function short(s, n = 180) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
}
function parseJson(stdout) {
  const start = String(stdout || "").indexOf("{");
  if (start < 0) return null;
  try {
    return JSON.parse(stdout.slice(start));
  } catch {
    return null;
  }
}
function runBridge(id, script, args) {
  const r = spawnSync("node", [script, ...args, "--format", "json"], {
    encoding: "utf8",
    env: process.env,
    maxBuffer: 96 * 1024 * 1024,
  });
  const status = typeof r.status === "number" ? r.status : 1;
  const json = parseJson(r.stdout);
  return {
    id,
    command: ["node", script, ...args, "--format", "json"].map(shellQuote).join(" "),
    status,
    ok: status === 0 && Boolean(json),
    json,
    stderr: r.stderr || r.error?.message || "",
    stdout_preview: String(r.stdout || "").slice(0, 1200),
  };
}
function baseArgs() {
  const topic = arg("topic", "공급망");
  return {
    topic,
    policyQuery: arg("policy-query", "조달청"),
    lawQuery: arg("law-query", "정부조직법"),
    gazetteQuery: arg("gazette-query", arg("gazette-keyword", topic)),
    statQuery: arg("stat-query", "기준금리"),
    datasetQuery: arg("dataset-query", "인구"),
    billQuery: arg("bill-query", topic),
    lawmakingQuery: arg("lawmaking-query", topic),
    date: arg("date", "2025-05-16"),
    limit: arg("limit", "5"),
    maxChars: arg("max-chars", "1400"),
  };
}
function collectEvidence(runs) {
  const byId = Object.fromEntries(runs.map(r => [r.id, r]));
  const forecast = byId.forecast?.json;
  const kgab = byId.kgab?.json;
  const gazette = byId.gazette?.json;
  const press = byId.press?.json;
  const rows = [];
  for (const seed of forecast?.seeds || []) {
    rows.push({
      role: "issue seed",
      source: "question-forecast",
      title: seed.topic,
      strength: seed.priority >= 300 ? "high" : "medium",
      note: "priority " + seed.priority + "; ministry " + (seed.ministry || "n/a"),
      url: seed.lead_item?.url || "",
    });
  }
  if (kgab?.summary) {
    rows.push({
      role: "upstream dossier comparator",
      source: "korean-government-api-bundle",
      title: "KGAB " + (kgab.summary.posture || "n/a") + " / " + (kgab.summary.route || "n/a"),
      strength: Number(kgab.summary.score || 0) >= 80 ? "high" : "medium",
      note: "score " + (kgab.summary.score || "n/a") + "; gaps " + ((kgab.summary.source_gaps || []).map(g => g.source).join(", ") || "none"),
      url: "https://github.com/hosungseo/korean-government-api-bundle",
    });
  }
  for (const hit of gazette?.hits || []) {
    rows.push({
      role: "gazette readable fallback",
      source: "ai-readable-gazette-kr",
      title: hit.title,
      strength: hit.inst === "법제처" ? "high" : "medium",
      note: [hit.date, hit.inst].filter(Boolean).join("; "),
      url: hit.blob || hit.raw || "",
    });
  }
  for (const hit of press?.hits || []) {
    rows.push({
      role: "policy briefing markdown fallback",
      source: "gov-press-md",
      title: hit.title,
      strength: hit.frontmatter?.original_url ? "high" : "medium",
      note: [hit.date, hit.source_index].filter(Boolean).join("; "),
      url: hit.frontmatter?.original_url || hit.blob || hit.raw || "",
    });
  }
  return rows;
}
function scorePack(runs, evidence) {
  const byId = Object.fromEntries(runs.map(r => [r.id, r]));
  let score = 0;
  if ((byId.forecast?.json?.seeds || []).length) score += 20;
  if (byId.kgab?.ok) score += 25;
  if ((byId.gazette?.json?.hits || []).length) score += 25;
  if ((byId.press?.json?.hits || []).length) score += 20;
  if (runs.every(r => r.ok)) score += 10;
  const failed = runs.filter(r => !r.ok);
  return {
    score,
    posture: score >= 85 ? "strong-upstream-pack" : score >= 60 ? "usable-upstream-pack" : "thin-upstream-pack",
    failed_bridges: failed.map(r => r.id),
    evidence_count: evidence.length,
  };
}
function renderMd(pack) {
  const lines = [
    "# Upstream Evidence Pack — " + pack.topic,
    "",
    "- Generated: " + pack.generated_at,
    "- Posture: " + pack.assessment.posture + " (" + pack.assessment.score + ")",
    "- Evidence rows: " + pack.assessment.evidence_count,
    "- Failed bridges: " + (pack.assessment.failed_bridges.join(", ") || "none"),
    "",
    "## Bridge Status",
    "",
  ];
  for (const run of pack.runs) {
    lines.push("- " + run.id + ": " + (run.ok ? "ok" : "failed") + " (status " + run.status + ")");
  }
  lines.push("", "## Evidence Matrix", "");
  if (!pack.evidence.length) lines.push("- No upstream evidence found.");
  for (const row of pack.evidence) {
    lines.push("### " + row.title);
    lines.push("- Role: " + row.role);
    lines.push("- Source: " + row.source);
    lines.push("- Strength: " + row.strength);
    lines.push("- Note: " + (row.note || "n/a"));
    if (row.url) lines.push("- URL: " + row.url);
    lines.push("");
  }
  const kgab = pack.details.kgab;
  if (kgab?.summary) {
    lines.push("## KGAB Comparator", "");
    lines.push("- Posture: " + (kgab.summary.posture || "n/a"));
    lines.push("- Score: " + (kgab.summary.score || "n/a"));
    lines.push("- Route: " + (kgab.summary.route || "n/a"));
    lines.push("- Source gaps: " + ((kgab.summary.source_gaps || []).map(g => g.source).join(", ") || "none"));
    lines.push("");
  }
  const forecast = pack.details.forecast;
  if (forecast?.seeds?.length) {
    lines.push("## Forecast Seeds", "");
    for (const seed of forecast.seeds.slice(0, 3)) {
      lines.push("- " + seed.topic + " [" + seed.priority + "] → `" + seed.workflow_command + "`");
    }
    lines.push("");
  }
  lines.push("## Use", "");
  lines.push("- Use this pack before a casefile when you want external repo evidence first.");
  lines.push("- Use Kgov `issue.workflow.run` after selecting a forecast seed or confirming enough upstream evidence.");
  lines.push("- Official memos should still cite the original government URL/PDF where available.");
  return lines.join("\n");
}

const cfg = baseArgs();
const runs = [];
runs.push(runBridge("forecast", "scripts/question-forecast-seeds.mjs", ["--limit", arg("forecast-limit", "3")]));
runs.push(runBridge("kgab", "scripts/kgab-dossier-bridge.mjs", ["--auto-clone", "--topic", cfg.topic, "--policy-query", cfg.policyQuery, "--law-query", cfg.lawQuery, "--gazette-query", cfg.gazetteQuery, "--stat-query", cfg.statQuery, "--dataset-query", cfg.datasetQuery, "--bill-query", cfg.billQuery, "--lawmaking-query", cfg.lawmakingQuery, "--limit", arg("kgab-limit", "2")]));
runs.push(runBridge("gazette", "scripts/gazette-readable-bridge.mjs", ["--keyword", cfg.gazetteQuery, "--limit", cfg.limit, "--max-chars", cfg.maxChars, ...(hasFlag("no-readable") ? [] : ["--fetch-readable"])]));
runs.push(runBridge("press", "scripts/gov-press-md-bridge.mjs", ["--keyword", cfg.topic, "--date", cfg.date, "--limit", cfg.limit, "--max-chars", cfg.maxChars, ...(hasFlag("no-readable") ? [] : ["--fetch-readable"])]));
const evidence = collectEvidence(runs);
const pack = {
  source: "upstream-evidence-pack",
  topic: cfg.topic,
  generated_at: new Date().toISOString(),
  assessment: scorePack(runs, evidence),
  evidence,
  runs: runs.map(({ json, stdout_preview, stderr, ...rest }) => ({ ...rest, stderr: short(stderr, 500), stdout_preview: short(stdout_preview, 500) })),
  details: {
    forecast: runs.find(r => r.id === "forecast")?.json,
    kgab: runs.find(r => r.id === "kgab")?.json,
    gazette: runs.find(r => r.id === "gazette")?.json,
    press: runs.find(r => r.id === "press")?.json,
  },
};
if (arg("format", "md") === "json") console.log(JSON.stringify(pack, null, 2));
else console.log(renderMd(pack));
if (runs.some(r => !r.ok)) process.exitCode = 1;
