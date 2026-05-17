#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function arg(name, fallback = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function parseJsonOutput(stdout) {
  const start = stdout.indexOf("{");
  if (start < 0) throw new Error(`No JSON object in output: ${stdout.slice(0, 240)}`);
  return JSON.parse(stdout.slice(start));
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
    maxBuffer: 24 * 1024 * 1024,
  });
  if (r.status !== 0 && !(r.stdout || "").trim().startsWith("{")) throw new Error(`${script} failed: ${(r.stderr || r.stdout || "").slice(0, 1600)}`);
  return parseJsonOutput(r.stdout);
}
function shellQuote(s) {
  const v = String(s || "");
  return /^[A-Za-z0-9_./:-]+$/.test(v) ? v : `"${v.replace(/"/g, "\\\"")}"`;
}
function issueCmd(script, extra = []) {
  return ["node", script, ...baseArgs().map(shellQuote), ...extra.map(shellQuote)].join(" ");
}
function short(s, n = 140) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
}
function first(arr) {
  return Array.isArray(arr) && arr.length ? arr[0] : undefined;
}
function task({ id, priority, lane, command, reason, expected, dependsOn = [], blocker = "" }) {
  return { id, priority, lane, command, reason, expected_output: expected, depends_on: dependsOn, blocker };
}
function historyCommand(row) {
  const mst = row?.mst || row?.MST || row?.law_mst || row?.법령일련번호 || "";
  const ef = row?.ef_yd || row?.efYd || row?.enforcement_date || row?.시행일자 || "";
  if (!mst || !ef) return "";
  return `node scripts/moleg-law.mjs history-detail --mst ${shellQuote(mst)} --ef-yd ${shellQuote(String(ef).replace(/\D/g, ""))}`;
}
function buildQueue(packet, router, gap) {
  const topic = packet.metadata?.topic || arg("topic", "공급망");
  const route = router.recommendation?.id || "unknown";
  const weak = new Set(router.context?.weak_ids || []);
  const historyRows = packet.legal_context?.history || [];
  const firstHistoryDetail = historyCommand(first(historyRows));
  const lead = packet.lead_readable || {};
  const checks = gap.assessment?.checks || [];
  const failedChecks = checks.filter(c => c.status !== "ok");

  const queue = [
    task({
      id: "Q1-onepage-brief",
      priority: route === "brief-now" ? "P0" : "P1",
      lane: "briefing",
      command: issueCmd("scripts/issue-onepager.mjs"),
      reason: `현재 추천 경로가 ${router.recommendation?.label || route}입니다.`,
      expected: "보고용 1쪽 초안: bottom line, facts, risks, questions, next actions",
    }),
    task({
      id: "Q2-full-brief",
      priority: route === "brief-now" ? "P1" : "P2",
      lane: "briefing",
      command: issueCmd("scripts/issue-brief.mjs"),
      reason: "1쪽 보고서의 근거를 섹션별 briefing markdown으로 확장합니다.",
      expected: "lead/legal/official/statistics/question forecast/next actions",
      dependsOn: ["Q1-onepage-brief"],
    }),
    task({
      id: "Q3-law-history-detail",
      priority: weak.has("law_current") || weak.has("law_history") || route === "legal-deep-dive" ? "P0" : "P2",
      lane: "legal",
      command: firstHistoryDetail || issueCmd("scripts/issue-decision-router.mjs", ["--format", "json"]),
      reason: firstHistoryDetail ? "법령 연혁 MST/시행일 기준 본문을 대조할 수 있습니다." : "연혁 detail에 필요한 MST/efYd 후보를 먼저 재확인해야 합니다.",
      expected: firstHistoryDetail ? "시행일 기준 법령 본문 JSON/HTML metadata" : "law history 후보와 다음 legal route",
      blocker: firstHistoryDetail ? "" : "law.history 결과에 MST/efYd가 없으면 detail 조회 불가",
    }),
    task({
      id: "Q4-official-signal-narrowing",
      priority: weak.has("gazette") || weak.has("gov24_service") || route === "official-signal-narrowing" ? "P0" : "P2",
      lane: "official",
      command: `node scripts/gazette-search.mjs --from 2026-05-01 --to 2026-05-17 --keyword ${shellQuote(arg("policy-query", "조달청"))} --page-size 5`,
      reason: "관보 후보가 넓게 잡히면 정책명/기관명으로 좁혀 직접 관련 없는 공식 신호를 제거합니다.",
      expected: "기관명 또는 정책명으로 좁힌 관보 shortlist",
    }),
    task({
      id: "Q5-assembly-watch",
      priority: weak.has("assembly_schedule") || route === "assembly-watch" ? "P0" : "P2",
      lane: "political",
      command: `node scripts/assembly-openapi.mjs schedule --keyword ${shellQuote(arg("schedule-keyword", "AI"))} --limit 20`,
      reason: "국회 일정 신호를 넓게 유지하되 질의 가능성이 있는 행사부터 추적합니다.",
      expected: "국회 일정 후보와 주최/시간 metadata",
    }),
    task({
      id: "Q6-statistics-support",
      priority: weak.has("statistics") || route === "statistics-support" ? "P0" : "P2",
      lane: "statistics",
      command: "node scripts/ecos-stat.mjs series --series baseRate --start 202501 --end 202604 --limit 20",
      reason: "통계는 직접 인과 근거가 아니라 배경 조건으로 분리해 붙입니다.",
      expected: "ECOS 기준금리 시계열 rows",
    }),
  ];

  if (failedChecks.length) {
    queue.unshift(task({
      id: "Q0-repair-source-gaps",
      priority: "P0",
      lane: "source-health",
      command: issueCmd("scripts/issue-gap-check.mjs", ["--format", "json"]),
      reason: `약한 source 축: ${failedChecks.map(c => c.id).join(", ")}`,
      expected: "gap assessment JSON with priority fixes",
    }));
  }

  return {
    metadata: {
      source: "issue-action-queue",
      topic,
      generated_at: new Date().toISOString(),
      route,
      posture: router.context?.posture || gap.assessment?.posture || "unknown",
      lead: short(lead.title),
    },
    recommended_first: queue[0],
    queue,
    notes: [
      "Queue commands are suggestions; this script does not execute them.",
      "P0 means run before writing a confident external-facing memo.",
      "법령·관보·통계는 정책 발표의 역할과 분리해서 해석합니다.",
    ],
  };
}
function renderMd(q) {
  const lines = [
    `# Issue Action Queue — ${q.metadata.topic}`,
    "",
    `- Generated: ${q.metadata.generated_at}`,
    `- Route: ${q.metadata.route}`,
    `- Posture: ${q.metadata.posture}`,
    `- Lead: ${q.metadata.lead || "n/a"}`,
    "",
    "## Recommended first",
    "",
    `**${q.recommended_first.id}** [${q.recommended_first.priority}] ${q.recommended_first.lane}`,
    `- Command: \`${q.recommended_first.command}\``,
    `- Why: ${q.recommended_first.reason}`,
    `- Output: ${q.recommended_first.expected_output}`,
    "",
    "## Queue",
    "",
  ];
  for (const item of q.queue) {
    lines.push(`### ${item.id} [${item.priority}] ${item.lane}`);
    lines.push(`- Command: \`${item.command}\``);
    lines.push(`- Why: ${item.reason}`);
    lines.push(`- Output: ${item.expected_output}`);
    if (item.depends_on?.length) lines.push(`- Depends on: ${item.depends_on.join(", ")}`);
    if (item.blocker) lines.push(`- Blocker: ${item.blocker}`);
    lines.push("");
  }
  lines.push("## Notes", "");
  q.notes.forEach(n => lines.push(`- ${n}`));
  return lines.join("\n");
}

const packet = run("scripts/public-issue-packet.mjs", ["--max-chars", arg("max-chars", "900")]);
const router = run("scripts/issue-decision-router.mjs", ["--format", "json"]);
const gap = run("scripts/issue-gap-check.mjs", ["--format", "json"]);
const queue = buildQueue(packet, router, gap);

if (arg("format", "md") === "json") console.log(JSON.stringify(queue, null, 2));
else console.log(renderMd(queue));
