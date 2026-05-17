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
    "--max-chars", arg("max-chars", "1400"),
  ];
  for (const k of ["start", "end", "ecos-series"]) if (arg(k)) args.push(`--${k}`, arg(k));
  const r = spawnSync("node", args, { encoding: "utf8", env: process.env, maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(r.status || 1);
  }
  return parseJsonOutput(r.stdout);
}
function oneLine(s, n = 180) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
}
function bullets(items, fn, limit = 5) {
  const arr = (items || []).slice(0, limit);
  return arr.length ? arr.map((x) => `- ${fn(x)}`).join("\n") : "- 확인된 항목 없음";
}
function makeQuestion(topic, packet) {
  const lead = packet.lead_readable?.title || topic;
  const law = packet.legal_context?.current_laws?.[0]?.law_name;
  const schedule = packet.official_signals?.assembly_schedule?.[0]?.title;
  return [
    `${topic} 이슈가 ${lead}처럼 정책 집행 단계로 이동할 때, 현재 ${law || "관련 법령"} 체계에서 부처 간 권한·책임 경계는 충분히 명확한가?`,
    schedule ? `국회 일정상 '${schedule}' 같은 논의가 이어질 경우, 정부는 어떤 근거자료와 통계로 설명 가능해야 하는가?` : `국회·관보·정책자료 신호를 함께 볼 때, 지금 추가 확인해야 할 공식 근거는 무엇인가?`,
    `현장 서비스나 국민 체감으로 연결되는 지점은 무엇이며, 정부24·관보·통계 중 어느 source를 우선 갱신해야 하는가?`,
  ];
}
function renderMarkdown(packet) {
  const m = packet.metadata;
  const lead = packet.lead_readable;
  const questions = makeQuestion(m.topic, packet);
  return `# Public Issue Brief — ${m.topic}

- Generated: ${m.retrieved_at}
- Strategy: ${m.strategy}
- Policy query: ${m.policy_query}
- Law query: ${m.law_query}

## 1. Lead signal

**${lead?.title || "No lead article"}**

- Agency: ${lead?.agency || ""}
- Source: ${lead?.source_url || ""}
- Readable length: ${lead?.markdown_length || 0}

${lead?.markdown || "lead readable 생성 실패"}

## 2. Legal context

### Current law candidates
${bullets(packet.legal_context?.current_laws, (x) => `**${x.law_name || x.title}** — 시행 ${x.enforcement_date || ""}, 소관 ${x.ministry || ""}`)}

### Law history candidates
${bullets(packet.legal_context?.history, (x) => `**${x.law_name}** — ${x.amendment_type || ""}, 공포 ${x.promulgation_date || ""}, 시행 ${x.enforcement_date || ""}, MST ${x.mst || ""}`)}

## 3. Official signals

### Gazette
${bullets(packet.official_signals?.gazette, (x) => `**${x.title}** — ${x.agency || ""}, ${x.publication_date || ""}`)}

### National Assembly schedule
${bullets(packet.official_signals?.assembly_schedule, (x) => `**${x.title}** — ${x.date || ""} ${x.time || ""}, ${x.host || ""}`)}

### Gov24 services
${bullets(packet.official_signals?.gov24_services, (x) => `**${x.title}** — ${x.agency || ""}; ${oneLine(x.summary, 120)}`)}

## 4. Statistic context

${bullets(packet.statistic_context?.ecos, (x) => `${x.period}: ${x.value}${x.unit ? ` ${x.unit}` : ""} (${x.item_name || "ECOS"})`, 8)}

## 5. Question forecast

${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

## 6. Suggested next actions

- 관련 법령은 current law만 보지 말고 law.history → history-detail로 시행일별 본문 차이를 확인한다.
- lead article의 근거가 정책자료인지 법적 근거인지 분리한다.
- 관보와 국회 일정은 같은 키워드로 다시 좁혀 시간순 timeline을 만든다.
- 통계는 ECOS 단일 series에 머물지 말고 사안별 보조 지표를 추가한다.

## 7. Source health

${Object.keys(packet.errors || {}).length ? Object.entries(packet.errors).map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`).join("\n") : "- All configured sources returned successfully."}
`;
}

const packet = runPacket();
const format = arg("format", "md");
if (format === "json") console.log(JSON.stringify({ packet, brief_markdown: renderMarkdown(packet) }, null, 2));
else console.log(renderMarkdown(packet));
