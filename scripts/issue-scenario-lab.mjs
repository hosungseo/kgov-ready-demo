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
  const base = [script, "--topic", arg("topic", "공급망"), "--policy-query", arg("policy-query", "조달청"), "--law-query", arg("law-query", "정부조직법"), "--schedule-keyword", arg("schedule-keyword", "AI"), "--gov24-keyword", arg("gov24-keyword", "보육")];
  const r = spawnSync("node", [...base, ...extraArgs], { encoding: "utf8", env: process.env, maxBuffer: 20 * 1024 * 1024 });
  if (r.status !== 0) {
    return { ok: false, error: (r.stderr || r.stdout || "").slice(0, 1600) };
  }
  return { ok: true, stdout: r.stdout };
}
function packet() { return parseJsonOutput(run("scripts/public-issue-packet.mjs", ["--max-chars", arg("max-chars", "900")]).stdout); }
function gap() { return parseJsonOutput(run("scripts/issue-gap-check.mjs", ["--format", "json"]).stdout); }
function matrix() { return parseJsonOutput(run("scripts/issue-evidence-matrix.mjs", ["--format", "json"]).stdout); }
function short(s, n = 120) { return String(s || "").replace(/\s+/g, " ").trim().slice(0, n); }
function pick(rows, role) { return (rows || []).filter(r => r.role === role); }
function buildLab(p, g, mx) {
  const rows = mx.rows || [];
  const lead = p.lead_readable || {};
  const legal = pick(rows, "legal basis")[0];
  const legalChanges = pick(rows, "legal change").slice(0, 2);
  const notices = pick(rows, "official notice").slice(0, 2);
  const politics = pick(rows, "political attention").slice(0, 2);
  const services = pick(rows, "citizen-facing service").slice(0, 2);
  const stats = pick(rows, "background condition").slice(0, 2);
  const posture = g.assessment?.posture || "unknown";
  const score = g.assessment?.score ?? 0;
  const topic = p.metadata.topic;

  const risks = [
    {
      risk: "정책 발표와 법적 권한의 불일치",
      trigger: lead.title,
      evidence: legal?.title || "법령 근거 미확인",
      mitigation: "발표자료의 정책목표와 실제 권한 조문·하위법령을 분리해 설명한다.",
    },
    {
      risk: "공식 신호의 직접 관련성 부족",
      trigger: notices.map(n => n.title).join(" / ") || "관보 신호 없음",
      evidence: "관보 키워드가 넓으면 같은 날짜의 공식 신호라도 이슈 직접 근거가 아닐 수 있음",
      mitigation: "관보 keyword/date를 정책명·기관명·근거법령명으로 재검색한다.",
    },
    {
      risk: "국회 관심 신호와 정부 설명자료의 불균형",
      trigger: politics.map(x => x.title).join(" / ") || "국회 일정 없음",
      evidence: `source posture=${posture}, score=${score}`,
      mitigation: "국회 일정은 의안/회의록/검토보고서와 연결해 질의 가능성을 재분류한다.",
    },
  ];

  const questionPlaybook = [
    {
      audience: "장관/차관 예상질문",
      question: `${topic} 대책이 발표 수준을 넘어 실제 집행권한과 예산·인력 배분까지 연결되어 있는가?`,
      answerFrame: `${legal?.title || "관련 법령"}상 소관 근거와 ${lead.title || "정책자료"}의 집행수단을 분리해 답변한다.`,
    },
    {
      audience: "국회/상임위 예상질문",
      question: `국회에서 ${politics[0]?.title || topic} 같은 논의가 제기될 경우 정부는 어떤 공식자료로 설명할 수 있는가?`,
      answerFrame: "정책뉴스는 취지, 관보는 공식 조치, 법령은 권한, 통계는 배경조건으로 역할을 나눠 제시한다.",
    },
    {
      audience: "실무검토 질문",
      question: `국민 체감 서비스나 현장 집행과 연결되는 지점은 어디인가?`,
      answerFrame: `${services[0]?.title || "정부24 서비스"} 같은 service-facing evidence를 별도 확인하고, 직접 관련 없으면 제외한다.`,
    },
  ];

  const actionPacket = [
    { lane: "legal", action: `law.history-detail로 ${legalChanges[0]?.title || "핵심 법령"} 시행일별 본문 차이 확인`, output: "조문/시행일 diff note" },
    { lane: "official", action: `관보를 '${arg("gazette-keyword", "고시")}'보다 좁은 기관·정책명으로 재검색`, output: "official notice shortlist" },
    { lane: "political", action: `국회 일정 '${politics[0]?.title || "관련 일정"}'을 의안/회의록으로 후속 추적`, output: "question-risk memo" },
    { lane: "statistics", action: `${stats[0]?.title || "ECOS 지표"} 외 직접 지표 1개 추가`, output: "background indicator pair" },
  ];

  const counterArguments = [
    { claim: "정책뉴스는 발표자료일 뿐 법적 근거가 아니다.", response: "맞다. 그래서 lead narrative로만 쓰고 legal basis는 법령/API 원문으로 분리한다." },
    { claim: "관보·정부24 신호가 주제와 느슨하게 연결되어 있다.", response: "맞다. matrix caveat에 표시하고, 좁은 keyword 재검색을 next action으로 둔다." },
    { claim: "ECOS 기준금리는 공급망 정책의 직접 인과 근거가 아니다.", response: "맞다. background condition으로만 쓰고 causal proof로 쓰지 않는다." },
  ];

  return { metadata: { source: "issue-scenario-lab", topic, score, posture, generated_at: new Date().toISOString() }, lead: { title: lead.title, agency: lead.agency, source_url: lead.source_url, summary: short(lead.markdown, 260) }, risks, questionPlaybook, actionPacket, counterArguments };
}
function renderMd(lab) {
  const lines = [`# Issue Scenario Lab — ${lab.metadata.topic}`, "", `- Score: ${lab.metadata.score}`, `- Posture: ${lab.metadata.posture}`, `- Generated: ${lab.metadata.generated_at}`, "", "## Lead", "", `**${lab.lead.title || "No lead"}**`, `- Agency: ${lab.lead.agency || ""}`, `- Source: ${lab.lead.source_url || ""}`, `- Summary: ${lab.lead.summary || ""}`, "", "## 1. Administrative risk scenarios", ""];
  lab.risks.forEach((r, i) => lines.push(`### ${i + 1}. ${r.risk}\n- Trigger: ${r.trigger}\n- Evidence: ${r.evidence}\n- Mitigation: ${r.mitigation}\n`));
  lines.push("## 2. Question playbook", "");
  lab.questionPlaybook.forEach(q => lines.push(`- **${q.audience}:** ${q.question}\n  - Answer frame: ${q.answerFrame}`));
  lines.push("", "## 3. Action packet", "");
  lab.actionPacket.forEach(a => lines.push(`- **${a.lane}:** ${a.action} → ${a.output}`));
  lines.push("", "## 4. Counter-arguments", "");
  lab.counterArguments.forEach(c => lines.push(`- **Objection:** ${c.claim}\n  - Response: ${c.response}`));
  return lines.join("\n");
}

const p = packet();
const g = gap();
const mx = matrix();
const lab = buildLab(p, g, mx);
if (arg("format", "md") === "json") console.log(JSON.stringify(lab, null, 2));
else console.log(renderMd(lab));
