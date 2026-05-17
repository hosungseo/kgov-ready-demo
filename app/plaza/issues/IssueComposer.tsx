"use client";

import { useMemo, useState } from "react";
import { ISSUE_ARTIFACTS, ISSUE_PIPELINE } from "@/lib/issue-workflow";

const EXAMPLES = [
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

  return (
    <section className="border-b border-gov-navy/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">
              Try it
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">여기서 값만 바꿔보면 됩니다</h2>
            <p className="mt-4 text-sm leading-relaxed text-gov-navy/68">
              이 입력기는 실제 API를 호출하지 않고, 어떤 검색어 조합이 어떤 workflow command와
              산출물로 이어지는지 먼저 보여줍니다. 실제 실행은 같은 command를 adapter에서 돌립니다.
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
                  className="border border-gov-navy/15 bg-[#fbfaf6] px-3 py-2 text-sm font-semibold text-gov-navy hover:border-gov-blue hover:text-gov-blue"
                >
                  {example.label}
                </button>
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
            </div>

            <div className="border border-gov-navy/10 bg-[#151b2d] p-5 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">Command preview</div>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-white/78">{command}</pre>
            </div>

            <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border border-emerald-700/15 bg-emerald-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Geo behavior</div>
                <p className="mt-2 text-sm leading-relaxed text-emerald-950/75">
                  지오코더 키가 없어도 먼저 행정구역 centroid GeoJSON을 만듭니다.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ISSUE_ARTIFACTS.slice(0, 6).map((artifact) => (
                  <div key={artifact} className="border border-gov-navy/10 bg-[#fbfaf6] px-3 py-2 font-mono text-[11px] text-gov-navy/70">
                    {artifact}
                  </div>
                ))}
              </div>
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
