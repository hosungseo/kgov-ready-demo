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
function actionSummary(action) {
  if (!action) return null;
  return {
    id: action.id || "",
    priority: action.priority || "",
    lane: action.lane || "",
    command: action.command || "",
    reason: short(action.reason, 180),
    expected_output: short(action.expected_output, 180),
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
  const p0 = queue.filter(a => a.priority === "P0");
  const blockers = queue.filter(a => a.blocker);
  const topic = manifest.topic || workflow.topic || packet.metadata?.topic || onepager.metadata?.topic || path.basename(dir).split("-")[0];
  const generated = manifest.generated_at || workflow.generated_at || extractIndexField(index, "Generated") || "";
  const route = router.recommendation?.id || workflow.route || extractIndexField(index, "Recommended route");
  const routeScore = router.recommendation?.score ?? workflow.route_score ?? "";
  const posture = gap.assessment?.posture || workflow.posture || router.context?.posture || extractIndexField(index, "Source posture");
  const score = gap.assessment?.score ?? workflow.score ?? "";
  const lead = packet.lead_readable?.title || workflow.lead || onepager.title || extractIndexField(index, "Lead");
  const first = actionSummary(actions.recommended_first) || actionSummary(workflow.recommended_first) || null;
  return {
    dir,
    topic,
    generated_at: generated,
    posture,
    score,
    route,
    route_score: routeScore,
    lead: short(lead),
    first_action: first,
    p0_actions: p0,
    blockers,
    queue_count: queue.length,
    artifact_count: artifacts.length,
    failed_count: failed.length,
    failed_files: failed.map(a => a.file),
    index: existsSync(path.join(dir, "index.md")) ? path.join(dir, "index.md") : "",
    workflow: existsSync(path.join(dir, "workflow.md")) ? path.join(dir, "workflow.md") : "",
  };
}
function sortRows(rows) {
  return rows.sort((a, b) => String(b.generated_at || b.dir).localeCompare(String(a.generated_at || a.dir)));
}
function countBy(rows, getKey) {
  const m = new Map();
  for (const row of rows) {
    const key = getKey(row) || "unknown";
    m.set(key, (m.get(key) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
}
function allP0(rows) {
  return rows.flatMap(row => row.p0_actions.map(action => ({
    topic: row.topic,
    generated_at: row.generated_at,
    route: row.route,
    posture: row.posture,
    casefile: row.dir,
    index: row.index,
    ...action,
  })));
}
function renderMd(board) {
  const lines = [
    "# Issue Ops Board",
    "",
    "- Root: `" + board.root + "`",
    "- Casefiles: " + board.count,
    "- Generated: " + board.generated_at,
    "- P0 actions: " + board.p0_count,
    "- Blockers: " + board.blocker_count,
    "- Failed artifacts: " + board.failed_artifact_count,
    "",
  ];
  if (!board.rows.length) {
    lines.push("No casefiles found.");
    return lines.join("\n");
  }
  lines.push("## P0 Queue", "");
  if (!board.p0.length) {
    lines.push("- No P0 actions in the current casefile set.", "");
  } else {
    for (const item of board.p0) {
      lines.push("### " + item.topic + " — " + item.id);
      lines.push("- Lane: " + (item.lane || "n/a"));
      lines.push("- Route: " + (item.route || "n/a"));
      lines.push("- Command: `" + (item.command || "n/a") + "`");
      lines.push("- Why: " + (item.reason || "n/a"));
      lines.push("- Casefile: `" + item.casefile + "`");
      lines.push("");
    }
  }
  lines.push("## Route Counts", "");
  board.route_counts.forEach(([key, count]) => lines.push("- " + key + ": " + count));
  lines.push("", "## Lane Counts", "");
  board.lane_counts.forEach(([key, count]) => lines.push("- " + key + ": " + count));
  lines.push("", "## Artifact Health", "");
  const failedRows = board.rows.filter(row => row.failed_count > 0);
  if (!failedRows.length) lines.push("- All indexed casefiles have healthy artifacts.");
  else failedRows.forEach(row => lines.push("- " + row.topic + ": " + row.failed_count + " failed (" + row.failed_files.join(", ") + ")"));
  lines.push("", "## Latest Casefiles", "");
  for (const row of board.rows.slice(0, board.limit)) {
    lines.push("### " + row.topic + " — " + (row.generated_at || path.basename(row.dir)));
    lines.push("- Posture: " + (row.posture || "n/a") + (row.score !== "" ? " (" + row.score + ")" : ""));
    lines.push("- Route: " + (row.route || "n/a") + (row.route_score !== "" ? " (" + row.route_score + ")" : ""));
    lines.push("- First action: " + (row.first_action?.id || "n/a") + (row.first_action?.priority ? " [" + row.first_action.priority + "]" : ""));
    lines.push("- Lead: " + (row.lead || "n/a"));
    lines.push("- Queue: " + row.queue_count + ", P0: " + row.p0_actions.length + ", blockers: " + row.blockers.length);
    lines.push("- Artifacts: " + row.artifact_count + ", failed: " + row.failed_count);
    if (row.workflow) lines.push("- Workflow: `" + row.workflow + "`");
    else if (row.index) lines.push("- Index: `" + row.index + "`");
    lines.push("");
  }
  return lines.join("\n");
}

const root = arg("root", "out/issue-casefiles");
const limit = Number(arg("limit", "10"));
const rows = sortRows(caseDirs(root).map(summarize));
const p0 = allP0(rows);
const board = {
  source: "issue-ops-board",
  root,
  generated_at: new Date().toISOString(),
  count: rows.length,
  limit,
  p0_count: p0.length,
  blocker_count: rows.reduce((sum, row) => sum + row.blockers.length, 0),
  failed_artifact_count: rows.reduce((sum, row) => sum + row.failed_count, 0),
  route_counts: countBy(rows, row => row.route),
  posture_counts: countBy(rows, row => row.posture),
  lane_counts: countBy(p0, row => row.lane),
  p0,
  rows,
};

if (arg("format", "md") === "json") console.log(JSON.stringify(board, null, 2));
else console.log(renderMd(board));

