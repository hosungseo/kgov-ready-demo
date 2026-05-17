#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

function arg(name, fallback = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function slug(s) {
  return String(s || "issue")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "issue";
}
function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
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
function run(script, extraArgs = []) {
  const r = spawnSync("node", [script, ...baseArgs(), ...extraArgs], {
    encoding: "utf8",
    env: process.env,
    maxBuffer: 32 * 1024 * 1024,
  });
  return {
    command: ["node", script, ...baseArgs(), ...extraArgs].join(" "),
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
function short(s, n = 180) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
}
function writeArtifact(dir, spec) {
  const result = run(spec.script, spec.args || []);
  const parsed = spec.json ? parseJson(result.stdout) : null;
  const ok = result.status === 0 || Boolean(parsed) || Boolean(result.stdout.trim() && !result.stderr.trim());
  const file = ok ? spec.file : spec.file.replace(/\.[^.]+$/, ".error.txt");
  const body = ok ? result.stdout : [result.stderr, result.stdout].filter(Boolean).join("\n");
  writeFileSync(path.join(dir, file), body);
  return {
    file,
    ok,
    command: result.command,
    status: result.status,
    parsed,
  };
}
function renderIndex(ctx) {
  const gap = ctx.byFile["gap.json"]?.parsed?.assessment;
  const router = ctx.byFile["router.json"]?.parsed;
  const actions = ctx.byFile["actions.json"]?.parsed;
  const packet = ctx.byFile["packet.json"]?.parsed;
  const lead = packet?.lead_readable || {};
  const failures = ctx.artifacts.filter(a => !a.ok);
  const lines = [
    `# Issue Casefile — ${ctx.topic}`,
    "",
    `- Generated: ${ctx.generatedAt}`,
    `- Output dir: \`${ctx.dir}\``,
    `- Lead: ${short(lead.title) || "n/a"}`,
    `- Recommended route: ${router?.recommendation?.id || "n/a"}`,
    `- Source posture: ${gap?.posture || "n/a"}`,
    `- Gap score: ${gap?.score ?? "n/a"}`,
    `- Recommended first action: ${actions?.recommended_first?.id || "n/a"}`,
    "",
    "## Artifacts",
    "",
  ];
  for (const a of ctx.artifacts) {
    lines.push(`- ${a.ok ? "ok" : "failed"}: [${a.file}](./${a.file})`);
  }
  lines.push("", "## Reading order", "");
  [
    ["onepager.md", "Start here for the shortest decision-ready draft."],
    ["brief.md", "Use for full briefing context and question forecast."],
    ["timeline.md", "Use for chronology and event ordering."],
    ["gap.md", "Use to decide whether the evidence coverage is strong enough."],
    ["matrix.md", "Use to separate source role, strength, and caveats."],
    ["scenario.md", "Use for risks, question playbook, and counter-arguments."],
    ["actions.md", "Use for executable next commands."],
    ["geo.md", "Use for inferred location candidates, geocoder status, and map-ready GeoJSON."],
    ["packet.json", "Use as the raw multi-source packet."],
  ].forEach(([file, note]) => lines.push(`- \`${file}\`: ${note}`));
  if (failures.length) {
    lines.push("", "## Failures", "");
    failures.forEach(a => lines.push(`- \`${a.file}\` from \`${a.command}\``));
  }
  lines.push("", "## Commands", "");
  ctx.artifacts.forEach(a => {
    lines.push(`### ${a.file}`, "", `\`\`\`bash\n${a.command}\n\`\`\``, "");
  });
  return lines.join("\n");
}

const topic = arg("topic", "공급망");
const outBase = arg("out-dir", "out/issue-casefiles");
const dir = path.join(outBase, `${slug(topic)}-${stamp()}`);
mkdirSync(dir, { recursive: true });

const specs = [
  { file: "packet.json", script: "scripts/public-issue-packet.mjs", args: ["--max-chars", arg("max-chars", "900")], json: true },
  { file: "brief.md", script: "scripts/issue-brief.mjs", args: ["--max-chars", arg("max-chars", "900")] },
  { file: "timeline.md", script: "scripts/issue-timeline.mjs" },
  { file: "gap.md", script: "scripts/issue-gap-check.mjs" },
  { file: "gap.json", script: "scripts/issue-gap-check.mjs", args: ["--format", "json"], json: true },
  { file: "matrix.md", script: "scripts/issue-evidence-matrix.mjs" },
  { file: "matrix.json", script: "scripts/issue-evidence-matrix.mjs", args: ["--format", "json"], json: true },
  { file: "scenario.md", script: "scripts/issue-scenario-lab.mjs" },
  { file: "scenario.json", script: "scripts/issue-scenario-lab.mjs", args: ["--format", "json"], json: true },
  { file: "router.json", script: "scripts/issue-decision-router.mjs", args: ["--format", "json"], json: true },
  { file: "onepager.md", script: "scripts/issue-onepager.mjs" },
  { file: "onepager.json", script: "scripts/issue-onepager.mjs", args: ["--format", "json"], json: true },
  { file: "actions.md", script: "scripts/issue-action-queue.mjs" },
  { file: "actions.json", script: "scripts/issue-action-queue.mjs", args: ["--format", "json"], json: true },
  { file: "geo.md", script: "scripts/issue-geo-context.mjs" },
  { file: "geo.json", script: "scripts/issue-geo-context.mjs", args: ["--format", "json"], json: true },
];

const artifacts = specs.map(spec => writeArtifact(dir, spec));
const byFile = Object.fromEntries(artifacts.map(a => [a.file, a]));
const manifest = {
  source: "issue-casefile",
  topic,
  generated_at: new Date().toISOString(),
  dir,
  artifacts: artifacts.map(({ parsed, ...a }) => a),
};
writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));
writeFileSync(path.join(dir, "index.md"), renderIndex({ topic, dir, generatedAt: manifest.generated_at, artifacts, byFile }));

if (arg("format", "md") === "json") console.log(JSON.stringify(manifest, null, 2));
else {
  console.log(`# Issue Casefile Exported — ${topic}\n`);
  console.log(`- Directory: ${dir}`);
  console.log(`- Artifacts: ${artifacts.length + 2}`);
  console.log(`- Failed: ${artifacts.filter(a => !a.ok).length}`);
  console.log(`- Index: ${path.join(dir, "index.md")}`);
}
