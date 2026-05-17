#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

function arg(name, fallback = "") {
  const i = process.argv.indexOf("--" + name);
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
function short(s, n = 130) {
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
  const m = index.match(new RegExp("^- " + label + ":\\s*(.+)$", "m"));
  return m ? m[1].replace(/^`|`$/g, "").trim() : "";
}
function priorityRank(p) {
  return { P0: 0, P1: 1, P2: 2, P3: 3 }[p] ?? 9;
}
function postureRank(p) {
  return {
    "ready-for-briefing": 3,
    "usable-but-thin": 2,
    "not-ready-critical-gap": 1,
  }[p] ?? 0;
}
function actionSummary(action) {
  if (!action) return null;
  return {
    id: action.id || "",
    priority: action.priority || "",
    lane: action.lane || "",
    command: action.command || "",
    blocker: action.blocker || "",
  };
}
function summarize(dir) {
  const manifest = readJson(path.join(dir, "manifest.json")) || {};
  const gap = readJson(path.join(dir, "gap.json")) || {};
  const router = readJson(path.join(dir, "router.json")) || {};
  const actions = readJson(path.join(dir, "actions.json")) || {};
  const workflow = readJson(path.join(dir, "workflow.json")) || {};
  const onepager = readJson(path.join(dir, "onepager.json")) || {};
  const packet = readJson(path.join(dir, "packet.json")) || {};
  const index = readText(path.join(dir, "index.md"));
  const artifacts = manifest.artifacts || [];
  const failed = artifacts.filter(a => !a.ok);
  const queue = Array.isArray(actions.queue) ? actions.queue.map(actionSummary).filter(Boolean) : [];
  const topic = manifest.topic || workflow.topic || packet.metadata?.topic || onepager.metadata?.topic || path.basename(dir).split("-")[0];
  const generated = manifest.generated_at || workflow.generated_at || extractIndexField(index, "Generated") || "";
  const lead = packet.lead_readable?.title || workflow.lead || onepager.title || extractIndexField(index, "Lead");
  const first = actionSummary(actions.recommended_first) || null;
  return {
    dir,
    topic,
    generated_at: generated,
    posture: gap.assessment?.posture || workflow.posture || router.context?.posture || extractIndexField(index, "Source posture"),
    score: Number(gap.assessment?.score ?? workflow.score ?? 0),
    route: router.recommendation?.id || workflow.route || extractIndexField(index, "Recommended route"),
    route_score: Number(router.recommendation?.score ?? workflow.route_score ?? 0),
    first_action: first?.id || workflow.recommended_first || extractIndexField(index, "Recommended first action"),
    first_priority: first?.priority || workflow.recommended_priority || "",
    first_lane: first?.lane || workflow.recommended_lane || "",
    lead: short(lead),
    artifact_count: artifacts.length,
    failed_count: failed.length,
    failed_files: failed.map(a => a.file),
    p0_count: queue.filter(a => a.priority === "P0").length,
    blocker_count: queue.filter(a => a.blocker).length,
    queue_count: queue.length,
    index: existsSync(path.join(dir, "index.md")) ? path.join(dir, "index.md") : "",
  };
}
function sortRows(rows) {
  return rows.sort((a, b) => String(b.generated_at || b.dir).localeCompare(String(a.generated_at || a.dir)));
}
function selectRows(rows) {
  const topic = arg("topic", "");
  const filtered = topic ? rows.filter(r => r.topic === topic || r.dir.includes(topic)) : rows;
  return sortRows(filtered);
}
function classify(delta) {
  if (!delta.previous) return "baseline";
  const bad = delta.failed_delta > 0 || delta.score_delta < 0 || delta.posture_delta < 0 || delta.blocker_delta > 0;
  const good = delta.failed_delta < 0 || delta.score_delta > 0 || delta.posture_delta > 0 || delta.blocker_delta < 0;
  if (bad && !good) return "regressed";
  if (good && !bad) return "improved";
  if (bad && good) return "mixed";
  return "stable";
}
function compare(current, previous) {
  const delta = {
    current,
    previous,
    score_delta: previous ? current.score - previous.score : 0,
    route_score_delta: previous ? current.route_score - previous.route_score : 0,
    posture_delta: previous ? postureRank(current.posture) - postureRank(previous.posture) : 0,
    failed_delta: previous ? current.failed_count - previous.failed_count : 0,
    p0_delta: previous ? current.p0_count - previous.p0_count : 0,
    blocker_delta: previous ? current.blocker_count - previous.blocker_count : 0,
    changed: [],
  };
  if (!previous) {
    delta.changed.push("no previous casefile for comparison");
  } else {
    if (current.posture !== previous.posture) delta.changed.push("posture: " + previous.posture + " -> " + current.posture);
    if (current.route !== previous.route) delta.changed.push("route: " + previous.route + " -> " + current.route);
    if (current.first_action !== previous.first_action) delta.changed.push("first action: " + previous.first_action + " -> " + current.first_action);
    if (current.failed_count !== previous.failed_count) delta.changed.push("failed artifacts: " + previous.failed_count + " -> " + current.failed_count);
    if (current.blocker_count !== previous.blocker_count) delta.changed.push("blockers: " + previous.blocker_count + " -> " + current.blocker_count);
    if (current.lead !== previous.lead) delta.changed.push("lead changed");
  }
  delta.status = classify(delta);
  return delta;
}
function recommendations(delta) {
  if (!delta.previous) return ["Treat this as the baseline casefile for future regression checks."];
  const recs = [];
  if (delta.failed_delta > 0) recs.push("Inspect newly failed artifacts before trusting the latest workflow.");
  if (delta.failed_delta < 0) recs.push("Artifact health improved; prefer the latest casefile for downstream briefs.");
  if (delta.posture_delta < 0) recs.push("Source posture regressed; rerun gap check and inspect source errors.");
  if (delta.posture_delta > 0) recs.push("Source posture improved; archive the older weaker casefile as superseded.");
  if (delta.blocker_delta > 0) recs.push("New blockers appeared; resolve them before external-facing memo work.");
  if (delta.current.route !== delta.previous.route) recs.push("Route changed; review why the router moved from " + delta.previous.route + " to " + delta.current.route + ".");
  if (!recs.length) recs.push("No operational drift detected; latest casefile is consistent with previous run.");
  return recs;
}
function renderMd(report) {
  const d = report.delta;
  const lines = [
    "# Issue Regression Check",
    "",
    "- Root: `" + report.root + "`",
    "- Topic: " + (report.topic || "latest"),
    "- Generated: " + report.generated_at,
    "- Status: " + d.status,
    "- Current: `" + d.current.dir + "`",
    "- Previous: " + (d.previous ? "`" + d.previous.dir + "`" : "n/a"),
    "",
    "## Delta",
    "",
    "- Source score: " + (d.previous ? d.previous.score + " -> " + d.current.score + " (" + signed(d.score_delta) + ")" : d.current.score),
    "- Posture: " + (d.previous ? d.previous.posture + " -> " + d.current.posture : d.current.posture),
    "- Route: " + (d.previous ? d.previous.route + " -> " + d.current.route : d.current.route),
    "- Route score: " + (d.previous ? d.previous.route_score + " -> " + d.current.route_score + " (" + signed(d.route_score_delta) + ")" : d.current.route_score),
    "- First action: " + (d.previous ? d.previous.first_action + " -> " + d.current.first_action : d.current.first_action),
    "- Failed artifacts: " + (d.previous ? d.previous.failed_count + " -> " + d.current.failed_count + " (" + signed(d.failed_delta) + ")" : d.current.failed_count),
    "- P0 actions: " + (d.previous ? d.previous.p0_count + " -> " + d.current.p0_count + " (" + signed(d.p0_delta) + ")" : d.current.p0_count),
    "- Blockers: " + (d.previous ? d.previous.blocker_count + " -> " + d.current.blocker_count + " (" + signed(d.blocker_delta) + ")" : d.current.blocker_count),
    "",
    "## Changes",
    "",
  ];
  d.changed.forEach(c => lines.push("- " + c));
  lines.push("", "## Recommendation", "");
  report.recommendations.forEach(r => lines.push("- " + r));
  lines.push("", "## Current Snapshot", "");
  lines.push("- Lead: " + (d.current.lead || "n/a"));
  lines.push("- Failed files: " + (d.current.failed_files.length ? d.current.failed_files.join(", ") : "none"));
  if (d.current.index) lines.push("- Index: `" + d.current.index + "`");
  return lines.join("\n");
}
function signed(n) {
  return n > 0 ? "+" + n : String(n);
}

const root = arg("root", "out/issue-casefiles");
const rows = selectRows(caseDirs(root).map(summarize));
const current = rows[0];
const previous = rows[1];
if (!current) {
  const empty = { source: "issue-regression-check", root, generated_at: new Date().toISOString(), topic: arg("topic", ""), status: "no-casefiles", rows: [] };
  if (arg("format", "md") === "json") console.log(JSON.stringify(empty, null, 2));
  else console.log("# Issue Regression Check\n\nNo casefiles found.");
  process.exit(0);
}
const delta = compare(current, previous);
const report = {
  source: "issue-regression-check",
  root,
  topic: arg("topic", current.topic),
  generated_at: new Date().toISOString(),
  candidates: rows.length,
  delta,
  recommendations: recommendations(delta),
};
if (arg("format", "md") === "json") console.log(JSON.stringify(report, null, 2));
else console.log(renderMd(report));

