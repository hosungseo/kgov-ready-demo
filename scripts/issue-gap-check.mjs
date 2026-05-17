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
function runPacket() {
  const args = [
    "scripts/public-issue-packet.mjs",
    "--topic", arg("topic", "공급망"),
    "--policy-query", arg("policy-query", "조달청"),
    "--law-query", arg("law-query", "정부조직법"),
    "--gazette-keyword", arg("gazette-keyword", "고시"),
    "--schedule-keyword", arg("schedule-keyword", "AI"),
    "--gov24-keyword", arg("gov24-keyword", "보육"),
    "--max-chars", arg("max-chars", "900"),
  ];
  for (const k of ["start", "end", "ecos-series"]) if (arg(k)) args.push(`--${k}`, arg(k));
  const r = spawnSync("node", args, { encoding: "utf8", env: process.env, maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(r.status || 1);
  }
  return parseJsonOutput(r.stdout);
}
function count(x) { return Array.isArray(x) ? x.length : 0; }
function add(checks, id, label, severity, ok, evidence, recommendation) {
  checks.push({ id, label, severity, status: ok ? "ok" : severity === "critical" ? "gap" : "weak", evidence, recommendation });
}
function assess(packet) {
  const checks = [];
  const leadOk = !!packet.lead_readable?.markdown;
  const lawCount = count(packet.legal_context?.current_laws);
  const histCount = count(packet.legal_context?.history);
  const gazetteCount = count(packet.official_signals?.gazette);
  const scheduleCount = count(packet.official_signals?.assembly_schedule);
  const gov24Count = count(packet.official_signals?.gov24_services);
  const statCount = count(packet.statistic_context?.ecos);
  const errors = Object.keys(packet.errors || {});

  add(checks, "lead_readable", "정책 lead + 본문", "critical", leadOk, `${leadOk ? "readable 생성" : "lead 없음"}`, "정책뉴스/보도자료 query를 조정하거나 source_url crawl profile을 보강한다.");
  add(checks, "law_current", "현행 법령 근거", "critical", lawCount > 0, `${lawCount} law rows`, "law-query를 더 구체화하고 관련 시행령/시행규칙까지 확장한다.");
  add(checks, "law_history", "법령 연혁 맥락", "warning", histCount > 0, `${histCount} history rows`, "law.history-detail로 시행일별 본문 차이를 확인한다.");
  add(checks, "gazette", "관보/고시 신호", "warning", gazetteCount > 0, `${gazetteCount} gazette rows`, "gazette-keyword와 날짜 범위를 issue에 맞게 좁힌다.");
  add(checks, "assembly_schedule", "국회 일정/논의 신호", "info", scheduleCount > 0, `${scheduleCount} schedule rows`, "국회 의안 검색과 회의록/검토보고서 축으로 확장한다.");
  add(checks, "gov24_service", "국민 서비스 연결", "info", gov24Count > 0, `${gov24Count} gov24 rows`, "서비스 키워드가 issue와 무관하면 별도 서비스 후보 탐색이 필요하다.");
  add(checks, "statistics", "통계/배경 지표", "warning", statCount > 0, `${statCount} ECOS rows`, "ECOS 단일 지표 외 KOSIS/R-ONE/국토부 보조 지표를 추가한다.");
  add(checks, "source_errors", "source 실행 오류", "critical", errors.length === 0, errors.length ? errors.join(", ") : "no errors", "errors에 나온 source부터 인증/파서/날짜 범위를 수리한다.");

  const gaps = checks.filter(c => c.status === "gap");
  const weak = checks.filter(c => c.status === "weak");
  const score = Math.max(0, 100 - gaps.length * 25 - weak.length * 10);
  let posture = "ready-for-briefing";
  if (gaps.length) posture = "not-ready-critical-gap";
  else if (weak.length >= 2) posture = "usable-but-thin";
  else if (weak.length === 1) posture = "usable-with-one-caveat";
  return { score, posture, checks, gaps, weak };
}
function renderMd(packet, assessment) {
  const lines = [`# Issue Gap Check — ${packet.metadata.topic}`, "", `- Score: ${assessment.score}`, `- Posture: ${assessment.posture}`, `- Generated: ${new Date().toISOString()}`, ""];
  lines.push("## Checks", "");
  for (const c of assessment.checks) {
    const icon = c.status === "ok" ? "✅" : c.status === "gap" ? "🔴" : "🟡";
    lines.push(`- ${icon} **${c.label}** (${c.id}) — ${c.status}; ${c.evidence}`);
  }
  lines.push("", "## Priority fixes", "");
  const fixes = [...assessment.gaps, ...assessment.weak].slice(0, 5);
  if (!fixes.length) lines.push("- 현재 configured source 기준으로 즉시 보이는 공백은 없습니다.");
  for (const c of fixes) lines.push(`- **${c.label}:** ${c.recommendation}`);
  lines.push("", "## Interpretation", "");
  if (assessment.posture === "ready-for-briefing") lines.push("- 정책 lead, 법령, 관보/국회/서비스/통계 축이 모두 살아 있어 브리핑 초안으로 사용 가능합니다.");
  else if (assessment.posture === "usable-but-thin") lines.push("- 브리핑은 가능하지만 일부 축이 얇습니다. 결론보다 확인 과제 중심으로 제시하는 편이 안전합니다.");
  else lines.push("- 핵심 source 공백이 있어 판단형 브리핑으로 쓰기 어렵습니다. 먼저 priority fixes를 처리하세요.");
  return lines.join("\n");
}

const packet = runPacket();
const assessment = assess(packet);
const format = arg("format", "md");
if (format === "json") console.log(JSON.stringify({ metadata: { source: "issue-gap-check", topic: packet.metadata.topic }, assessment, packet_errors: packet.errors || {} }, null, 2));
else console.log(renderMd(packet, assessment));
process.exit(assessment.gaps.length ? 1 : 0);
