"use client";

import { useMemo, useState } from "react";
import { ISSUE_ARTIFACTS, ISSUE_CASEFILE_STEPS, ISSUE_PIPELINE } from "@/lib/issue-workflow";

const EXAMPLES = [
  { label: "국민참여", topic: "국민참여형 공공서비스", policyQuery: "민간위탁", lawQuery: "행정권한의 위임 및 위탁에 관한 규정", scheduleKeyword: "국민참여", gov24Keyword: "민간위탁" },
  { label: "공급망", topic: "공급망", policyQuery: "조달청", lawQuery: "정부조직법", scheduleKeyword: "AI", gov24Keyword: "보육" },
  { label: "보육", topic: "보육 지원", policyQuery: "보육", lawQuery: "영유아보육법", scheduleKeyword: "저출생", gov24Keyword: "보육" },
  { label: "주거", topic: "전세 보증", policyQuery: "전세", lawQuery: "주택도시기금법", scheduleKeyword: "주거", gov24Keyword: "전세" },
  { label: "수출", topic: "수출 지원", policyQuery: "수출", lawQuery: "대외무역법", scheduleKeyword: "통상", gov24Keyword: "수출" },
];

function quote(value: string) {
  return value.replace(/"/g, '\\"');
}

export default function IssueComposer() {
  const [topic, setTopic] = useState(EXAMPLES[0].topic);
  const [policyQuery, setPolicyQuery] = useState(EXAMPLES[0].policyQuery);
  const [lawQuery, setLawQuery] = useState(EXAMPLES[0].lawQuery);
  const [scheduleKeyword, setScheduleKeyword] = useState(EXAMPLES[0].scheduleKeyword);
  const [gov24Keyword, setGov24Keyword] = useState(EXAMPLES[0].gov24Keyword);
  const [copied, setCopied] = useState(false);

  const command = useMemo(() => {
    return [
      "node scripts/issue-workflow.mjs",
      "--topic \"" + quote(topic) + "\"",
      "--policy-query \"" + quote(policyQuery) + "\"",
      "--law-query \"" + quote(lawQuery) + "\"",
      "--schedule-keyword \"" + quote(scheduleKeyword) + "\"",
      "--gov24-keyword \"" + quote(gov24Keyword) + "\"",
    ].join(" \\\n  ");
  }, [gov24Keyword, lawQuery, policyQuery, scheduleKeyword, topic]);

  const prompt = topic + " 이슈를 " + policyQuery + " 정책자료, " + lawQuery + " 법령 근거, 국회 일정 " + scheduleKeyword + ", 정부24 " + gov24Keyword + " 신호로 묶어 브리핑 가능한 casefile로 만든다.";
  const casefilePath = "out/issue-casefiles/" + topic.replace(/\s+/g, "-") + "-<timestamp>";

  return (
    <section className="border-b border-gov-navy/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">
              Run composer
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">검색어를 casefile 실행 단위로 만듭니다</h2>
            <p className="mt-4 text-sm leading-relaxed text-gov-navy/68">
              이 화면은 API를 호출하지 않고 run command와 산출 폴더를 먼저 고정합니다.
              같은 command를 실행하면 packet, onepager, workflow handoff, ops 입력값이 함께 생성됩니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => {
                    setTopic(example.topic);
                    setPolicyQuery(example.policyQuery);
                    setLawQuery(example.lawQuery);
                    setScheduleKeyword(example.scheduleKeyword);
                    setGov24Keyword(example.gov24Keyword);
                  }}
                  className="border border-gov-navy/15 bg-[#fbfaf6] px-3 py-2 text-sm font-semibold text-gov-navy transition hover:border-gov-blue hover:text-gov-blue"
                >
                  {example.label}
                </button>
              ))}
            </div>
            <div className="mt-8 grid gap-3">
              {ISSUE_CASEFILE_STEPS.map((step) => (
                <div key={step.file} className="grid gap-3 border-l-2 border-gov-blue/35 bg-[#fbfaf6] px-4 py-3 sm:grid-cols-[0.34fr_0.66fr]">
                  <div>
                    <div className="font-mono text-xs text-gov-blue">{step.file}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-gov-navy/40">{step.role}</div>
                  </div>
                  <p className="text-sm leading-relaxed text-gov-navy/68">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gov-navy/45">topic</span>
                <input className="mt-2 w-full border border-gov-navy/15 bg-[#fbfaf6] px-3 py-2 text-sm outline-none focus:border-gov-blue" value={topic} onChange={(event) => setTopic(event.target.value)} />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gov-navy/45">policy query</span>
                <input className="mt-2 w-full border border-gov-navy/15 bg-[#fbfaf6] px-3 py-2 text-sm outline-none focus:border-gov-blue" value={policyQuery} onChange={(event) => setPolicyQuery(event.target.value)} />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gov-navy/45">law query</span>
                <input className="mt-2 w-full border border-gov-navy/15 bg-[#fbfaf6] px-3 py-2 text-sm outline-none focus:border-gov-blue" value={lawQuery} onChange={(event) => setLawQuery(event.target.value)} />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gov-navy/45">assembly / gov24</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input className="w-full border border-gov-navy/15 bg-[#fbfaf6] px-3 py-2 text-sm outline-none focus:border-gov-blue" value={scheduleKeyword} onChange={(event) => setScheduleKeyword(event.target.value)} />
                  <input className="w-full border border-gov-navy/15 bg-[#fbfaf6] px-3 py-2 text-sm outline-none focus:border-gov-blue" value={gov24Keyword} onChange={(event) => setGov24Keyword(event.target.value)} />
                </div>
              </label>
            </div>

            <div className="border border-gov-blue/20 bg-gov-blue/8 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gov-blue">Generated intent</div>
              <p className="mt-3 text-sm leading-relaxed text-gov-navy/75">{prompt}</p>
              <div className="mt-4 border-t border-gov-blue/15 pt-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gov-navy/45">casefile path</div>
                <code className="mt-2 block break-words font-mono text-xs text-gov-navy/78">{casefilePath}</code>
              </div>
            </div>

            <div className="border border-gov-navy/10 bg-[#151b2d] p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">Command preview</div>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard?.writeText(command);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  }}
                  className="border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:border-yellow-300 hover:text-yellow-100"
                >
                  {copied ? "copied" : "copy"}
                </button>
              </div>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-white/78">{command}</pre>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {ISSUE_ARTIFACTS.slice(0, 6).map((artifact) => (
                <div key={artifact} className="min-h-12 border border-gov-navy/10 bg-[#fbfaf6] px-3 py-2 font-mono text-[11px] text-gov-navy/70">
                  {artifact}
                </div>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-4">
              {ISSUE_PIPELINE.slice(0, 4).map((step) => (
                <div key={step.id} className="border border-gov-navy/10 bg-white px-3 py-2">
                  <div className="text-sm font-semibold text-gov-blue">{step.label}</div>
                  <div className="mt-1 text-[11px] text-gov-navy/50">{step.output}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
