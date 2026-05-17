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
  return parseJsonOutput(r.stdout);
}
function short(s, n = 160) { return String(s || "").replace(/\s+/g, " ").trim().slice(0, n); }
function first(arr) { return Array.isArray(arr) && arr.length ? arr[0] : {}; }

const packet = run("scripts/public-issue-packet.mjs", ["--max-chars", arg("max-chars", "900")]);
const router = run("scripts/issue-decision-router.mjs", ["--format", "json"]);
const scenario = run("scripts/issue-scenario-lab.mjs", ["--format", "json"]);
const matrix = run("scripts/issue-evidence-matrix.mjs", ["--format", "json"]);

function buildOnepager() {
  const topic = packet.metadata.topic;
  const lead = packet.lead_readable || {};
  const legal = first((matrix.rows || []).filter(r => r.role === "legal basis"));
  const notice = first((matrix.rows || []).filter(r => r.role === "official notice"));
  const political = first((matrix.rows || []).filter(r => r.role === "political attention"));
  const service = first((matrix.rows || []).filter(r => r.role === "citizen-facing service"));
  const stat = first((matrix.rows || []).filter(r => r.role === "background condition"));
  return {
    metadata: {
      source: "issue-onepager",
      topic,
      generated_at: new Date().toISOString(),
      route: router.recommendation?.id,
      route_score: router.recommendation?.score,
      posture: router.context?.posture,
    },
    title: `${topic} 이슈 점검: ${short(lead.title, 80)}`,
    bottom_line: `${router.recommendation?.label || "다음 경로 판단"}이 우선입니다. 현재 source coverage는 ${router.context?.posture || "unknown"}이며, 정책 발표·법령·공식신호·통계가 함께 확인됩니다.`,
    facts: [
      `정책 lead: ${lead.title || "확인 필요"} (${lead.agency || "기관 미상"})`,
      `법령 근거 후보: ${legal.title || "확인 필요"}`,
      `공식 신호: ${notice.title || "관보/공식신호 확인 필요"}`,
      `국회/정치 신호: ${political.title || "국회 일정 확인 필요"}`,
      `국민 접점: ${service.title || "서비스 연결 확인 필요"}`,
      `배경 지표: ${stat.title || "통계 보강 필요"}`,
    ],
    risks: (scenario.risks || []).slice(0, 3).map(r => ({ risk: r.risk, mitigation: r.mitigation })),
    likely_questions: (scenario.questionPlaybook || []).slice(0, 3).map(q => ({ audience: q.audience, question: q.question, answer_frame: q.answerFrame })),
    next_actions: (scenario.actionPacket || []).slice(0, 4).map(a => `${a.lane}: ${a.action} → ${a.output}`),
    caveats: (scenario.counterArguments || []).slice(0, 3).map(c => `${c.claim} / ${c.response}`),
    sources: [lead.source_url, legal.url, notice.url].filter(Boolean),
  };
}
function renderMd(p) {
  const lines = [`# One-page Brief — ${p.metadata.topic}`, "", `- Generated: ${p.metadata.generated_at}`, `- Recommended route: ${p.metadata.route} (${p.metadata.route_score})`, `- Posture: ${p.metadata.posture}`, "", `## ${p.title}`, "", `**Bottom line.** ${p.bottom_line}`, "", "## Key facts", ""];
  p.facts.forEach(x => lines.push(`- ${x}`));
  lines.push("", "## Risks and mitigations", "");
  p.risks.forEach(x => lines.push(`- **${x.risk}:** ${x.mitigation}`));
  lines.push("", "## Likely questions", "");
  p.likely_questions.forEach(x => lines.push(`- **${x.audience}:** ${x.question}\n  - Frame: ${x.answer_frame}`));
  lines.push("", "## Next actions", "");
  p.next_actions.forEach(x => lines.push(`- ${x}`));
  lines.push("", "## Caveats", "");
  p.caveats.forEach(x => lines.push(`- ${x}`));
  lines.push("", "## Source links", "");
  p.sources.forEach(x => lines.push(`- ${x}`));
  return lines.join("\n");
}

const onepager = buildOnepager();
if (arg("format", "md") === "json") console.log(JSON.stringify(onepager, null, 2));
else console.log(renderMd(onepager));
