import type { Metadata } from "next";
import Link from "next/link";
import { AGENT_TYPES, CAPABILITIES } from "@/lib/plaza";

export const metadata: Metadata = {
  title: "Agent Passport · K-Gov Agent Plaza",
  description: "AI 에이전트가 정부 광장에 들어올 때 제출하는 신원·권한·감사 출입증 시안.",
};

const PASSPORT = {
  schema: "https://kgov-ready-demo.vercel.app/schemas/agent-passport.v0.json",
  agent_id: "citizen-assistant.example.kr",
  agent_type: "citizen-assistant",
  operator: {
    name: "Example Citizen Assistant",
    jurisdiction: "KR",
    contact: "ops@example.kr",
  },
  declared_purpose: "공개 정부 문서 검색, 제도 후보 정리, 신청 전 체크리스트 생성",
  requested_capabilities: ["read", "search", "summarize", "classify", "draft_before_submit"],
  prohibited_actions: [
    "final_submit_without_human_review",
    "sensitive_data_reuse",
    "rights_or_disposition_decision",
  ],
  audit: {
    source_retention: true,
    decision_log_required: true,
    human_review_on_risk: true,
  },
};

const CHECKS = [
  ["정체", "에이전트 유형과 운영 주체가 보이는가"],
  ["목적", "정부 정보를 왜 읽는지 선언했는가"],
  ["권한", "읽기·검색·요약·분류·초안 작성 범위가 분리되어 있는가"],
  ["금지", "자동 제출, 민감정보 재사용, 처분 판단을 금지했는가"],
  ["감사", "출처 보존, 의사결정 로그, human review 조건이 있는가"],
];

export default function PassportPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/plaza" className="text-sm text-gov-navy/60 hover:text-gov-navy">← Agent Plaza</Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Agent Passport</div>
            <h1 className="mt-4 text-5xl font-bold tracking-tight">에이전트 출입증</h1>
          </div>
          <p className="text-lg leading-relaxed text-gov-navy/70">
            공공 사이트는 에이전트를 무조건 막거나 무조건 허용하는 방식으로 갈 수 없습니다. 에이전트가 먼저 정체, 목적, 권한, 금지행위, 감사 조건을 제출하고 그 범위 안에서 움직이게 해야 합니다.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Gate checks</div>
            <div className="mt-5 space-y-3">
              {CHECKS.map(([title, desc], idx) => (
                <div key={title} className="rounded-2xl border border-neutral-200 bg-[#fbfaf6] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gov-blue text-xs font-bold text-white">{idx + 1}</span>
                    <div className="font-bold">{title}</div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-gov-navy/10 bg-gov-navy p-6 text-white shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">passport.json</div>
            <pre className="mt-4 max-h-[620px] overflow-auto rounded-2xl bg-black/25 p-4 text-xs leading-relaxed text-white/80">
{JSON.stringify(PASSPORT, null, 2)}
            </pre>
          </section>
        </div>

        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Known agent types</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {AGENT_TYPES.map((agent) => (
                <Link key={agent.id} href="/plaza/agents" className="rounded-2xl border border-neutral-200 bg-[#fbfaf6] p-4 hover:border-gov-blue">
                  <div className="font-mono text-[11px] text-neutral-400">{agent.id}</div>
                  <div className="mt-1 font-bold">{agent.name}</div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-600">{agent.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Capability boundary</div>
            <div className="mt-5 flex flex-wrap gap-2">
              {CAPABILITIES.map((cap) => (
                <span key={cap.name} className="rounded-full border border-gov-navy/15 px-3 py-1 text-xs text-gov-navy/70">
                  {cap.name} · {cap.risk}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-gov-navy/65">
              이 출입증은 완성된 표준이 아니라 방향 제안입니다. 하지만 정부형 Agent Plaza가 단순 링크 모음에서 벗어나려면, 에이전트의 신원과 권한을 읽을 수 있는 최소한의 passport layer가 필요합니다.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
