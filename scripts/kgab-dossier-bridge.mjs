#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

function arg(name, fallback = "") {
  const i = process.argv.indexOf("--" + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function hasFlag(name) {
  return process.argv.includes("--" + name);
}
function loadEnv(file = ".env.local") {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0 && !process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = t.slice(i + 1);
  }
}
function mapEnv() {
  process.env.LAW_OC ||= process.env.MOLEG_OC || process.env.LAW_GO_KR_OC || process.env.LAW_API_OC || "";
  process.env.GAZETTE_SERVICE_KEY ||= process.env.GAZETTE_API_KEY || "";
  process.env.ECOS_API_KEY ||= process.env.BOK_ECOS_API_KEY || "";
  process.env.KOSIS_API_KEY ||= process.env.KOSIS_KEY || "";
}
function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    encoding: "utf8",
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
    ...opts,
  });
}
function shellQuote(s) {
  const v = String(s || "");
  return /^[A-Za-z0-9_./:-]+$/.test(v) ? v : "\"" + v.replace(/"/g, "\\\"") + "\"";
}
function ensureKgabRoot() {
  const explicit = arg("kgab-root", process.env.KGAB_ROOT || "");
  if (explicit) return explicit;
  if (!hasFlag("auto-clone")) return "";
  const root = arg("cache-dir", ".cache/upstreams/korean-government-api-bundle");
  if (!existsSync(root)) {
    mkdirSync(path.dirname(root), { recursive: true });
    const cloned = run("git", ["clone", "--depth", "1", "https://github.com/hosungseo/korean-government-api-bundle.git", root]);
    if (cloned.status !== 0) throw new Error(cloned.stderr || cloned.stdout || "failed to clone korean-government-api-bundle");
  }
  return root;
}
function ensureBuilt(root) {
  const cli = path.join(root, "dist/cli/index.js");
  if (existsSync(cli)) return cli;
  const installed = existsSync(path.join(root, "node_modules"));
  if (!installed) {
    const npmInstall = run("npm", ["install", "--silent"], { cwd: root });
    if (npmInstall.status !== 0) throw new Error(npmInstall.stderr || npmInstall.stdout || "npm install failed");
  }
  const built = run("npm", ["run", "build"], { cwd: root });
  if (built.status !== 0) throw new Error(built.stderr || built.stdout || "kgab build failed");
  return cli;
}
function kgabArgs() {
  const topic = arg("topic", "공급망");
  return [
    "build-issue-dossier-markdown",
    "--topic", topic,
    "--law-query", arg("law-query", "정부조직법"),
    "--gazette-query", arg("gazette-query", arg("gazette-keyword", "고시")),
    "--stat-query", arg("stat-query", "기준금리"),
    "--dataset-query", arg("dataset-query", "인구"),
    "--bill-query", arg("bill-query", topic),
    "--lawmaking-query", arg("lawmaking-query", topic),
    "--policy-query", arg("policy-query", "조달청"),
    "--limit", arg("limit", "3"),
  ];
}
function parseSummary(markdown) {
  const line = label => {
    const m = markdown.match(new RegExp("^- " + label + ":\\s*(.+)$", "m"));
    return m ? m[1].trim() : "";
  };
  const gapSection = markdown.match(/## Source gaps\s*\n([\s\S]*?)(?:\n## |$)/)?.[1] || "";
  const gaps = [...gapSection.matchAll(/^- \*\*([^*]+):\*\*\s*([^\n]+)/gm)].map(m => ({ source: m[1], note: m[2].trim() }));
  return {
    posture: line("Posture"),
    score: line("Score"),
    route: line("Recommended route"),
    source_gaps: gaps,
  };
}
function renderBridge(result) {
  const lines = [
    "# KGAB Dossier Bridge",
    "",
    "- Upstream: `hosungseo/korean-government-api-bundle`",
    "- KGAB root: `" + result.kgab_root + "`",
    "- Generated: " + result.generated_at,
    "- Status: " + result.status,
    "- Posture: " + (result.summary.posture || "n/a"),
    "- Score: " + (result.summary.score || "n/a"),
    "- Route: " + (result.summary.route || "n/a"),
    "- Command: `" + result.command + "`",
    "",
    "## Source Gaps",
    "",
  ];
  if (!result.summary.source_gaps.length) lines.push("- none");
  else result.summary.source_gaps.forEach(g => lines.push("- " + g.source + ": " + g.note));
  lines.push("", "## Dossier Markdown", "", result.markdown.trim());
  return lines.join("\n");
}

loadEnv();
mapEnv();
const root = ensureKgabRoot();
if (!root) {
  const msg = {
    source: "kgab-dossier-bridge",
    status: "missing-kgab-root",
    next: "Pass --kgab-root /path/to/korean-government-api-bundle, set KGAB_ROOT, or use --auto-clone.",
    setup_command: "node scripts/kgab-dossier-bridge.mjs --auto-clone --topic 공급망 --policy-query 조달청",
  };
  if (arg("format", "md") === "json") console.log(JSON.stringify(msg, null, 2));
  else console.log("# KGAB Dossier Bridge\n\n" + msg.next + "\n\n```bash\n" + msg.setup_command + "\n```");
  process.exit(0);
}
const cli = ensureBuilt(root);
const args = kgabArgs();
const executed = run("node", [cli, ...args]);
const markdown = executed.stdout || "";
const result = {
  source: "kgab-dossier-bridge",
  upstream_repo: "hosungseo/korean-government-api-bundle",
  kgab_root: root,
  generated_at: new Date().toISOString(),
  command: ["node", cli, ...args].map(shellQuote).join(" "),
  status: executed.status ?? 0,
  summary: parseSummary(markdown),
  markdown,
  stderr: executed.stderr || "",
};
if (arg("format", "md") === "json") console.log(JSON.stringify(result, null, 2));
else console.log(renderBridge(result));
if (executed.status !== 0) process.exitCode = executed.status || 1;
