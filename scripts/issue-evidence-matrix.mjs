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
function short(s, n = 120) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
}
function redactUrl(url) {
  return String(url || "").replace(/(OC|KEY|serviceKey|apiKey)=([^&]+)/g, "$1=***");
}
function add(rows, role, source, title, strength, use, caveat = "", url = "") {
  rows.push({ role, source, title: short(title, 160), strength, use, caveat, url: redactUrl(url) });
}
function buildMatrix(packet) {
  const rows = [];
  const lead = packet.lead_readable;
  if (lead) add(rows, "issue narrative", "policy-news+crawl", lead.title, "high", "현재 정책 발표의 서사와 행정 목적을 잡는다.", "정책자료이므로 법적 구속력과 분리해야 한다.", lead.source_url);
  for (const x of packet.legal_context?.current_laws || []) add(rows, "legal basis", "law.current", x.law_name, "high", "현행 법령상 소관·권한·제도 근거 후보를 확인한다.", "정확한 조문/하위법령 확인 전에는 포괄 근거다.", x.detail_url);
  for (const x of packet.legal_context?.history || []) add(rows, "legal change", "law.history", `${x.law_name} ${x.amendment_type || ""}`, "medium", "시행일별 제도 변화 시점을 맞춘다.", "MST/efYd로 본문 대조 필요.", x.detail_url);
  for (const x of packet.official_signals?.gazette || []) add(rows, "official notice", "gazette", x.title, "medium", "공식 고시·공고·처분 신호를 보강한다.", "키워드가 넓으면 issue와 직접 관련성이 약할 수 있다.", x.pdf_url);
  for (const x of packet.official_signals?.assembly_schedule || []) add(rows, "political attention", "assembly.schedule", x.title, "medium", "국회·토론회·위원회 관심 신호를 확인한다.", "행사 일정은 법안 처리 상태와 구분해야 한다.");
  for (const x of packet.official_signals?.gov24_services || []) add(rows, "citizen-facing service", "gov24.service", x.title, "medium", "국민 체감·신청 서비스 연결 가능성을 본다.", "topic과 직접 연결되는 서비스인지 별도 검토 필요.", x.source_url);
  for (const x of (packet.statistic_context?.ecos || []).slice(0, 3)) add(rows, "background condition", "ecos", `${x.period}: ${x.item_name} ${x.value}${x.unit || ""}`, "low", "거시 배경 조건으로 활용한다.", "단일 지표는 직접 인과 근거가 아니다.");
  return rows;
}
function renderMd(packet, rows) {
  const lines = [`# Evidence Matrix — ${packet.metadata.topic}`, "", `- Generated: ${new Date().toISOString()}`, `- Rows: ${rows.length}`, "", "| Role | Source | Evidence | Strength | Use | Caveat |", "|---|---|---|---|---|---|"];
  for (const r of rows) lines.push(`| ${r.role} | ${r.source} | ${r.title.replaceAll("|", "/")} | ${r.strength} | ${r.use.replaceAll("|", "/")} | ${r.caveat.replaceAll("|", "/")} |`);
  lines.push("", "## How to read", "", "- High strength rows can anchor the brief, but policy자료와 법령 근거는 분리한다.", "- Medium rows are official signals or context; direct relevance must be checked.", "- Low rows are background indicators; use them to frame conditions, not to prove causality.");
  return lines.join("\n");
}

const packet = runPacket();
const rows = buildMatrix(packet);
const format = arg("format", "md");
if (format === "json") console.log(JSON.stringify({ metadata: { source: "issue-evidence-matrix", topic: packet.metadata.topic, count: rows.length }, rows, packet_errors: packet.errors || {} }, null, 2));
else console.log(renderMd(packet, rows));
process.exit(rows.length ? 0 : 1);
