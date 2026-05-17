import type { Metadata } from "next";
import Link from "next/link";
import {
  ISSUE_ARTIFACTS,
  ISSUE_CASEFILE_STEPS,
  ISSUE_GEO_FLOW,
  ISSUE_HANDOFF_LANES,
  ISSUE_PIPELINE,
  ISSUE_RUNBOOK,
  ISSUE_WORKFLOW,
} from "@/lib/issue-workflow";
import IssueComposer from "./IssueComposer";

export const metadata: Metadata = {
  title: "Public Issue Workflow · K-Gov Agent Plaza",
  description:
    "공공 source를 evidence packet으로 묶어 브리핑, 타임라인, 검증, 질문, 액션, 지도, 케이스파일로 변환하는 K-Gov workflow.",
};

export default function IssueWorkflowPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
      <section className="border-b border-gov-navy/10">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between text-sm">
            <Link href="/plaza" className="text-gov-navy/60 hover:text-gov-navy">
              ← Agent Plaza
            </Link>
            <a
              href="/api/adapters"
              className="rounded-full border border-gov-navy/20 bg-white/70 px-4 py-2 text-gov-navy/70 hover:border-gov-blue hover:text-gov-blue"
            >
              adapter catalog
            </a>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-gov-blue">
                Public Issue Workflow
              </div>
              <h1 className="mt-4 max-w-4xl text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl">
                이슈를 실행하고
                <br />
                <span className="text-gov-blue">casefile</span>로 넘깁니다
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gov-navy/72">
                {ISSUE_WORKFLOW.thesis}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#composer"
                  className="inline-flex border border-gov-blue bg-gov-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-gov-navy"
                >
                  workflow command 만들기
                </a>
                <a
                  href="#handoff"
                  className="inline-flex border border-gov-navy/20 bg-white/70 px-4 py-2 text-sm font-semibold text-gov-navy/75 transition hover:border-gov-blue hover:text-gov-blue"
                >
                  handoff 보기
                </a>
              </div>
            </div>

            <div className="border border-gov-navy/10 bg-white/82 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-5 border-b border-gov-navy/10 pb-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                    Operations snapshot
                  </div>
                  <div className="mt-3 text-3xl font-bold">{ISSUE_WORKFLOW.topic}</div>
                </div>
                <div className="border border-emerald-700/20 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                  {ISSUE_WORKFLOW.posture}
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {ISSUE_RUNBOOK.map((step, index) => (
                  <div key={step.label} className="min-h-32 border border-gov-navy/10 bg-[#fbfaf6] p-4">
                    <div className="font-mono text-xs text-gov-navy/35">{String(index + 1).padStart(2, "0")}</div>
                    <div className="mt-2 text-lg font-bold text-gov-blue">{step.label}</div>
                    <div className="mt-1 font-mono text-xs text-gov-navy/55">{step.value}</div>
                    <p className="mt-3 text-sm leading-relaxed text-gov-navy/65">{step.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-gov-navy/10 pt-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gov-navy/45">full run</div>
                <code className="mt-2 block break-words font-mono text-xs text-gov-navy/75">{ISSUE_WORKFLOW.command}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="composer">
      <IssueComposer />
      </div>

      <section id="handoff" className="border-b border-gov-navy/10 bg-white/72">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">
                Handoff lanes
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">casefile은 다음 담당자에게 바로 넘어갑니다</h2>
              <p className="mt-4 text-sm leading-relaxed text-gov-navy/68">
                같은 run에서 브리핑, 법령 심화, 신호 추적, 운영 관리를 분리합니다.
                그래서 생성된 파일은 설명 자료가 아니라 작업 인계 단위가 됩니다.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {ISSUE_HANDOFF_LANES.map((lane) => (
                <div key={lane.lane} className="border border-gov-navy/10 bg-[#fbfaf6] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xl font-bold text-gov-blue">{lane.lane}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-gov-navy/42">{lane.owner}</div>
                    </div>
                    <code className="font-mono text-xs text-gov-navy/55">{lane.output}</code>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-gov-navy/68">{lane.use}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">
            Pipeline
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">하나의 packet에서 운영 산출물로 갈라집니다</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {ISSUE_PIPELINE.map((step, index) => (
            <article key={step.id} className="border border-gov-navy/10 bg-white p-5 shadow-sm">
              <div className="font-mono text-xs text-gov-navy/35">{String(index + 1).padStart(2, "0")}</div>
              <h3 className="mt-3 text-xl font-bold text-gov-blue">{step.label}</h3>
              <p className="mt-3 min-h-20 text-sm leading-relaxed text-gov-navy/68">{step.desc}</p>
              <div className="mt-4 border-t border-gov-navy/10 pt-3">
                <code className="block break-words font-mono text-[11px] text-gov-navy/70">{step.command}</code>
                <div className="mt-2 text-xs text-gov-navy/45">output: {step.output}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-gov-navy/10 bg-[#151b2d] text-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
                Keyless geo
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">지도는 운영키 없이 먼저 작동합니다</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/68">
                정책지도는 건물 좌표보다 행정구역 맥락이 먼저입니다. 그래서
                gonpunclaw-policymap의 경계 GeoJSON을 기본값으로 쓰고, geocoder는
                정밀 주소가 필요할 때만 붙입니다.
              </p>
            </div>
            <div className="grid gap-3">
              {ISSUE_GEO_FLOW.map((item) => (
                <div key={item.label} className="grid gap-4 border border-white/10 bg-white/8 p-5 sm:grid-cols-[0.35fr_0.65fr]">
                  <div>
                    <div className="text-sm font-semibold text-yellow-200">{item.label}</div>
                    <div className="mt-2 font-mono text-xs text-white/50">{item.value}</div>
                  </div>
                  <p className="text-sm leading-relaxed text-white/70">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">
              Casefile output
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">읽는 순서가 있는 폴더로 남깁니다</h2>
            <p className="mt-4 text-sm leading-relaxed text-gov-navy/68">
              issue-casefile과 issue-workflow는 live API 결과를 파일로 고정합니다.
              이후 ops board와 regression check는 다시 API를 때리지 않고 저장된 casefile만 읽습니다.
            </p>
          </div>
          <div className="grid gap-3">
            {ISSUE_CASEFILE_STEPS.map((step) => (
              <div key={step.file} className="grid gap-4 border border-gov-navy/10 bg-white p-4 sm:grid-cols-[0.32fr_0.68fr]">
                <div>
                  <div className="font-mono text-sm font-semibold text-gov-blue">{step.file}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-gov-navy/42">{step.role}</div>
                </div>
                <p className="text-sm leading-relaxed text-gov-navy/68">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ISSUE_ARTIFACTS.map((artifact) => (
            <div key={artifact} className="min-h-11 border border-gov-navy/10 bg-white px-4 py-3 font-mono text-xs text-gov-navy/70">
              {artifact}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
