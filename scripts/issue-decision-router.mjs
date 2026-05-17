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
function run(script, extraArgs = []) {
  const base = [
    script,
    "--topic", arg("topic", "공급망"),
    "--policy-query", arg("policy-query", "조달청"),
    "--law-query", arg("law-query", "정부조직법"),
    "--schedule-keyword", arg("schedule-keyword", "AI"),
    "--gov24-keyword", arg("gov24-keyword", "보육"),
  ];
  const r = spawnSync("node", [...base, ...extraArgs], { encoding: "utf8", env: process.env, maxBuffer: 24 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${script} failed: ${(r.stderr || r.stdout || "").slice(0, 1600)}`);
  return r.stdout;
}
function getScenario() { return parseJsonOutput(run("scripts/issue-scenario-lab.mjs", ["--format", "json"])); }
function getGap() { return parseJsonOutput(run("scripts/issue-gap-check.mjs", ["--format", "json"])); }
function getMatrix() { return parseJsonOutput(run("scripts/issue-evidence-matrix.mjs", ["--format", "json"])); }
function scoreRoute(route, ctx) {
  let score = route.base;
  for (const c of route.conditions) if (c.when(ctx)) score += c.weight;
  return Math.max(0, Math.min(100, score));
}
function buildRouter(scenario, gap, matrix) {
  const checks = gap.assessment?.checks || [];
  const weakIds = new Set(checks.filter(c => c.status !== "ok").map(c => c.id));
  const rows = matrix.rows || [];
  const high = rows.filter(r => r.strength === "high").length;
  const medium = rows.filter(r => r.strength === "medium").length;
  const low = rows.filter(r => r.strength === "low").length;
  const ctx = {
    posture: gap.assessment?.posture || "unknown",
    gapScore: gap.assessment?.score || 0,
    weakIds,
    high,
    medium,
    low,
    riskCount: scenario.risks?.length || 0,
    counterCount: scenario.counterArguments?.length || 0,
  };
  const routes = [
    {
      id: "brief-now",
      label: "브리핑 초안으로 바로 전환",
      base: 45,
      conditions: [
        { weight: 25, when: c => c.posture === "ready-for-briefing" },
        { weight: 10, when: c => c.high >= 2 },
        { weight: 10, when: c => c.medium >= 5 },
        { weight: -20, when: c => c.weakIds.size > 0 },
      ],
      next: "issue.brief.render 결과를 요약본/보고용 목차로 압축한다.",
    },
    {
      id: "legal-deep-dive",
      label: "법령·연혁 본문 대조로 심화",
      base: 35,
      conditions: [
        { weight: 30, when: c => c.weakIds.has("law_current") || c.weakIds.has("law_history") },
        { weight: 15, when: c => c.high < 2 },
        { weight: 10, when: c => c.riskCount >= 2 },
      ],
      next: "law.history-detail로 시행일별 조문 diff를 만들고 권한/소관/집행수단을 분리한다.",
    },
    {
      id: "official-signal-narrowing",
      label: "관보·정부24 키워드 좁히기",
      base: 35,
      conditions: [
        { weight: 25, when: c => c.weakIds.has("gazette") || c.weakIds.has("gov24_service") },
        { weight: 10, when: c => c.medium >= 5 },
        { weight: 10, when: c => c.counterCount >= 2 },
      ],
      next: "기관명/정책명/법령명 조합으로 관보와 정부24 후보를 재검색해 직접 관련 없는 행을 제거한다.",
    },
    {
      id: "assembly-watch",
      label: "국회 질의·일정 추적",
      base: 30,
      conditions: [
        { weight: 25, when: c => c.weakIds.has("assembly_schedule") },
        { weight: 15, when: c => c.riskCount >= 3 },
        { weight: 10, when: c => c.posture !== "not-ready-critical-gap" },
      ],
      next: "관련 일정에서 의안·회의록·검토보고서로 이어지는 후속 추적 큐를 만든다.",
    },
    {
      id: "statistics-support",
      label: "통계 보강 후 판단",
      base: 30,
      conditions: [
        { weight: 25, when: c => c.weakIds.has("statistics") },
        { weight: 10, when: c => c.low < 2 },
        { weight: 10, when: c => c.posture === "usable-but-thin" },
      ],
      next: "ECOS 외 KOSIS/R-ONE/MOLIT 등 직접 지표를 1개 이상 추가하고 배경조건과 인과근거를 분리한다.",
    },
  ].map(r => ({ ...r, score: scoreRoute(r, ctx) })).sort((a, b) => b.score - a.score);
  return {
    metadata: { source: "issue-decision-router", topic: scenario.metadata.topic, generated_at: new Date().toISOString() },
    context: { posture: ctx.posture, gap_score: ctx.gapScore, evidence_strength: { high, medium, low }, weak_ids: [...weakIds] },
    recommendation: routes[0],
    alternatives: routes.slice(1, 4),
    routes,
  };
}
function renderMd(router) {
  const lines = [`# Issue Decision Router — ${router.metadata.topic}`, "", `- Generated: ${router.metadata.generated_at}`, `- Posture: ${router.context.posture}`, `- Gap score: ${router.context.gap_score}`, `- Evidence strength: high ${router.context.evidence_strength.high}, medium ${router.context.evidence_strength.medium}, low ${router.context.evidence_strength.low}`, "", "## Recommended route", "", `**${router.recommendation.label}** (${router.recommendation.id})`, `- Score: ${router.recommendation.score}`, `- Next: ${router.recommendation.next}`, "", "## Alternatives", ""];
  for (const r of router.alternatives) lines.push(`- **${r.label}** (${r.id}) — score ${r.score}; ${r.next}`);
  lines.push("", "## All route scores", "");
  for (const r of router.routes) lines.push(`- ${r.id}: ${r.score}`);
  return lines.join("\n");
}

const scenario = getScenario();
const gap = getGap();
const matrix = getMatrix();
const router = buildRouter(scenario, gap, matrix);
if (arg("format", "md") === "json") console.log(JSON.stringify(router, null, 2));
else console.log(renderMd(router));
