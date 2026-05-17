#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

function arg(name, fallback = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}
function readText(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}
function short(s, n = 110) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
}
function caseDirs(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .map(name => path.join(root, name))
    .filter(p => {
      try {
        return statSync(p).isDirectory();
      } catch {
        return false;
      }
    });
}
function extractIndexField(index, label) {
  const m = index.match(new RegExp(`^- ${label}:\\s*(.+)$`, "m"));
  return m ? m[1].replace(/^`|`$/g, "").trim() : "";
}
function summarize(dir) {
  const manifest = readJson(path.join(dir, "manifest.json")) || {};
  const packet = readJson(path.join(dir, "packet.json")) || {};
  const gap = readJson(path.join(dir, "gap.json")) || {};
  const router = readJson(path.join(dir, "router.json")) || {};
  const actions = readJson(path.join(dir, "actions.json")) || {};
  const onepager = readJson(path.join(dir, "onepager.json")) || {};
  const geo = readJson(path.join(dir, "geo.json")) || {};
  const index = readText(path.join(dir, "index.md"));
  const artifacts = manifest.artifacts || [];
  const failed = artifacts.filter(a => !a.ok);
  const topic = manifest.topic || packet.metadata?.topic || onepager.metadata?.topic || path.basename(dir).split("-")[0];
  const lead = packet.lead_readable?.title || onepager.title || extractIndexField(index, "Lead");
  const posture = gap.assessment?.posture || router.context?.posture || extractIndexField(index, "Source posture");
  const score = gap.assessment?.score ?? "";
  const route = router.recommendation?.id || onepager.metadata?.route || extractIndexField(index, "Recommended route");
  const routeScore = router.recommendation?.score ?? onepager.metadata?.route_score ?? "";
  const first = actions.recommended_first || {};
  return {
    dir,
    topic,
    generated_at: manifest.generated_at || extractIndexField(index, "Generated") || "",
    posture,
    score,
    route,
    route_score: routeScore,
    recommended_first: first.id || extractIndexField(index, "Recommended first action"),
    recommended_priority: first.priority || "",
    recommended_lane: first.lane || "",
    lead: short(lead),
    artifact_count: artifacts.length,
    failed_count: failed.length,
    failed_files: failed.map(a => a.file),
    geo_status: geo.status || "",
    geo_feature_count: geo.geojson?.features?.length ?? "",
    index: existsSync(path.join(dir, "index.md")) ? path.join(dir, "index.md") : "",
  };
}
function sortRows(rows) {
  return rows.sort((a, b) => String(b.generated_at || b.dir).localeCompare(String(a.generated_at || a.dir)));
}
function renderMd(rows, root) {
  const lines = [
    "# Issue Casefile Index",
    "",
    `- Root: \`${root}\``,
    `- Casefiles: ${rows.length}`,
    `- Generated: ${new Date().toISOString()}`,
    "",
  ];
  if (!rows.length) {
    lines.push("No casefiles found.");
    return lines.join("\n");
  }
  lines.push("## Latest", "");
  for (const row of rows.slice(0, Number(arg("limit", "10")))) {
    lines.push(`### ${row.topic} — ${row.generated_at || path.basename(row.dir)}`);
    lines.push(`- Posture: ${row.posture || "n/a"}${row.score !== "" ? ` (${row.score})` : ""}`);
    lines.push(`- Route: ${row.route || "n/a"}${row.route_score !== "" ? ` (${row.route_score})` : ""}`);
    lines.push(`- First action: ${row.recommended_first || "n/a"}${row.recommended_priority ? ` [${row.recommended_priority}]` : ""}`);
    lines.push(`- Lead: ${row.lead || "n/a"}`);
    lines.push(`- Artifacts: ${row.artifact_count}, failed: ${row.failed_count}`);
    if (row.geo_status) lines.push(`- Geo: ${row.geo_status}${row.geo_feature_count !== "" ? ` (${row.geo_feature_count} features)` : ""}`);
    if (row.failed_files.length) lines.push(`- Failed files: ${row.failed_files.join(", ")}`);
    if (row.index) lines.push(`- Index: ${row.index}`);
    lines.push("");
  }
  const grouped = new Map();
  for (const row of rows) {
    const key = row.posture || "unknown";
    grouped.set(key, (grouped.get(key) || 0) + 1);
  }
  lines.push("## Posture counts", "");
  for (const [posture, count] of [...grouped.entries()].sort()) {
    lines.push(`- ${posture}: ${count}`);
  }
  return lines.join("\n");
}

const root = arg("root", "out/issue-casefiles");
const rows = sortRows(caseDirs(root).map(summarize));
if (arg("format", "md") === "json") {
  console.log(JSON.stringify({ source: "issue-casefile-index", root, generated_at: new Date().toISOString(), count: rows.length, rows }, null, 2));
} else {
  console.log(renderMd(rows, root));
}
