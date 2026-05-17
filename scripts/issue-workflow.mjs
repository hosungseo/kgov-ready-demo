#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

function arg(name, fallback = "") {
  const i = process.argv.indexOf("--" + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function baseArgs() {
  return [
    "--topic", arg("topic", "공급망"),
    "--policy-query", arg("policy-query", "조달청"),
    "--law-query", arg("law-query", "정부조직법"),
    "--schedule-keyword", arg("schedule-keyword", "AI"),
    "--gov24-keyword", arg("gov24-keyword", "보육"),
  ];
}
function runNode(script, args = []) {
  const r = spawnSync("node", [script, ...args], {
    encoding: "utf8",
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    command: ["node", script, ...args].join(" "),
    status: r.status,
    stdout: r.stdout || "",
    stderr: r.stderr || "",
  };
}
function parseJson(stdout) {
  const start = stdout.indexOf("{");
  if (start < 0) return null;
  try {
    return JSON.parse(stdout.slice(start));
  } catch {
    return null;
  }
}
function short(s, n = 160) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
}
function renderSummary(summary) {
  const lines = [
    "# Issue Workflow — " + summary.topic,
    "",
    "- Generated: " + summary.generated_at,
    "- Casefile: `" + summary.casefile_dir + "`",
    "- Registry: `" + summary.registry_md + "`",
    "- Posture: " + (summary.posture || "n/a") + (summary.score !== "" ? " (" + summary.score + ")" : ""),
    "- Route: " + (summary.route || "n/a") + (summary.route_score !== "" ? " (" + summary.route_score + ")" : ""),
    "- First action: " + (summary.recommended_first || "n/a") + (summary.recommended_priority ? " [" + summary.recommended_priority + "]" : ""),
    "- Lead: " + (summary.lead || "n/a"),
    "- Artifacts: " + summary.artifact_count + ", failed: " + summary.failed_count,
    "",
    "## Handoff",
    "",
    "1. Open the casefile index first.",
    "2. Use the workflow registry to compare this issue against previous exports.",
    "3. Execute the recommended first action only after checking any blocker in `actions.md`.",
    "",
    "## Commands",
    "",
    "```bash",
    summary.casefile_command,
    summary.index_command,
    "```",
  ];
  if (summary.failed_files.length) {
    lines.push("", "## Failed Artifacts", "");
    summary.failed_files.forEach(file => lines.push("- `" + file + "`"));
  }
  return lines.join("\n");
}

const topic = arg("topic", "공급망");
const root = arg("root", arg("out-dir", "out/issue-casefiles"));
mkdirSync(root, { recursive: true });

const casefileArgs = [
  ...baseArgs(),
  "--out-dir", root,
  "--max-chars", arg("max-chars", "900"),
  "--format", "json",
];
const casefile = runNode("scripts/issue-casefile.mjs", casefileArgs);
const manifest = parseJson(casefile.stdout);

if (!manifest?.dir) {
  console.error(casefile.stderr || casefile.stdout || "issue-casefile did not return a manifest");
  process.exit(casefile.status || 1);
}

const indexArgs = ["--root", root, "--limit", arg("limit", "10")];
const indexMd = runNode("scripts/issue-casefile-index.mjs", indexArgs);
const registryMd = path.join(root, "INDEX.md");
writeFileSync(registryMd, indexMd.stdout);

const indexJson = runNode("scripts/issue-casefile-index.mjs", [...indexArgs, "--format", "json"]);
const registry = parseJson(indexJson.stdout) || { rows: [] };
const registryJson = path.join(root, "index.json");
writeFileSync(registryJson, JSON.stringify(registry, null, 2));

const row = (registry.rows || []).find(r => path.resolve(r.dir) === path.resolve(manifest.dir)) || {};
const failed = (manifest.artifacts || []).filter(a => !a.ok);
const summary = {
  source: "issue-workflow",
  topic,
  generated_at: new Date().toISOString(),
  casefile_dir: manifest.dir,
  casefile_index: path.join(manifest.dir, "index.md"),
  registry_md: registryMd,
  registry_json: registryJson,
  posture: row.posture || "",
  score: row.score ?? "",
  route: row.route || "",
  route_score: row.route_score ?? "",
  recommended_first: row.recommended_first || "",
  recommended_priority: row.recommended_priority || "",
  recommended_lane: row.recommended_lane || "",
  lead: short(row.lead),
  artifact_count: manifest.artifacts?.length || 0,
  failed_count: failed.length,
  failed_files: failed.map(a => a.file),
  casefile_command: casefile.command,
  index_command: indexMd.command,
};

writeFileSync(path.join(manifest.dir, "workflow.json"), JSON.stringify(summary, null, 2));
writeFileSync(path.join(manifest.dir, "workflow.md"), renderSummary(summary));

if (arg("format", "md") === "json") console.log(JSON.stringify(summary, null, 2));
else console.log(renderSummary(summary));

