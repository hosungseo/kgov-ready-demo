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
function normDate(s) {
  if (!s) return "";
  const raw = String(s).trim();
  let m = raw.match(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`;
  m = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[1].padStart(2,"0")}-${m[2].padStart(2,"0")}`;
  m = raw.match(/(\d{6})/);
  if (m) return `${m[1].slice(0,4)}-${m[1].slice(4,6)}-01`;
  return raw.slice(0, 10);
}
function add(events, date, source, title, note = "", url = "") {
  const d = normDate(date);
  if (!d || !title) return;
  events.push({ date: d, source, title, note, url });
}
function buildTimeline(packet) {
  const events = [];
  const lead = packet.lead_readable;
  add(events, packet.lead_readable?.date || packet.lead_readable?.raw_date || packet.lead_readable?.api_date || packet.metadata?.retrieved_at, "policy-news+crawl", lead?.title, lead?.agency, lead?.source_url);
  for (const x of packet.legal_context?.history || []) add(events, x.enforcement_date || x.promulgation_date, "law-history", `${x.law_name} ${x.amendment_type || ""}`.trim(), `MST ${x.mst || ""}`);
  for (const x of packet.official_signals?.gazette || []) add(events, x.publication_date, "gazette", x.title, x.agency, x.pdf_url);
  for (const x of packet.official_signals?.assembly_schedule || []) add(events, x.date, "assembly-schedule", x.title, `${x.time || ""} ${x.host || ""}`.trim());
  for (const x of packet.statistic_context?.ecos || []) add(events, x.period, "ecos", `${x.item_name || "ECOS"}: ${x.value}${x.unit ? ` ${x.unit}` : ""}`, x.stat_name);
  return events.sort((a, b) => a.date.localeCompare(b.date));
}
function renderMd(packet, events) {
  const topic = packet.metadata.topic;
  const lines = [`# Public Issue Timeline — ${topic}`, "", `- Generated: ${new Date().toISOString()}`, `- Events: ${events.length}`, ""];
  let lastYear = "";
  for (const e of events) {
    const year = e.date.slice(0, 4);
    if (year !== lastYear) {
      lines.push(`## ${year}`);
      lastYear = year;
    }
    lines.push(`- **${e.date}** [${e.source}] ${e.title}${e.note ? ` — ${e.note}` : ""}${e.url ? ` (${e.url})` : ""}`);
  }
  lines.push("", "## Reading order", "", "1. 정책뉴스/crawl lead로 이슈의 현재 서사를 잡는다.", "2. 법령 연혁으로 제도 변화 시점을 맞춘다.", "3. 관보·국회일정으로 공식 신호를 시간순으로 붙인다.", "4. ECOS 등 통계는 배경 조건 변화로 분리해 읽는다.");
  return lines.join("\n");
}

const packet = runPacket();
const events = buildTimeline(packet);
const format = arg("format", "md");
if (format === "json") console.log(JSON.stringify({ metadata: { source: "issue-timeline", topic: packet.metadata.topic, count: events.length }, events, packet_errors: packet.errors || {} }, null, 2));
else console.log(renderMd(packet, events));
process.exit(events.length ? 0 : 1);
