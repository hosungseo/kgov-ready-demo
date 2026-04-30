import type { Metadata } from "next";
import Link from "next/link";
import { BOTTLENECK_TYPES, SAMPLE_BOTTLENECK_REPORTS, createBottleneckReport } from "@/lib/bottlenecks";

export const metadata: Metadata = {
  title: "Bottleneck Reports · K-Gov Agent Plaza",
  description: "에이전트가 민원 처리 중 발견한 인간 병목을 구조화된 개선 건의로 남기는 레이어.",
};

const EXAMPLES = [
  "빗물받이가 막혀서 도로가 잠길 것 같아요",
  "아이가 태어났는데 받을 수 있는 지원을 한 번에 알고 싶어요",
  "수출 바우처 공고 신청 가능성을 자동으로 확인하고 싶어요",
];

export default async function BottlenecksPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = params?.q || EXAMPLES[0];
  const report = createBottleneckReport(q);

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/plaza" className="text-sm text-gov-navy/60 hover:text-gov-navy">← Agent Plaza</Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Bottleneck Reports</div>
            <h1 className="mt-4 text-5xl font-bold tracking-tight">에이전트가 남기는 개선 건의</h1>
          </div>
          <p className="text-lg leading-relaxed text-gov-navy/70">
            에이전트가 민원서비스를 끝까지 처리하지 못했다면, 실패로 끝내지 않습니다. 어디까지 자동 처리했고, 어느 인간 병목에서 멈췄고, 무엇을 바꾸면 다음에는 에이전트 처리가 가능한지 기록으로 남깁니다.
          </p>
        </div>

        <div className="mt-10 rounded-[1.5rem] border border-gov-navy/10 bg-white p-5 shadow-sm">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" action="/plaza/bottlenecks">
            <input name="q" defaultValue={q} className="rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 text-sm outline-none focus:border-gov-blue" aria-label="민원 과업 입력" />
            <button className="rounded-2xl bg-gov-navy px-5 py-3 text-sm font-semibold text-white hover:bg-gov-blue">병목 기록 생성</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <Link key={example} href={`/plaza/bottlenecks?q=${encodeURIComponent(example)}`} className="rounded-full border border-gov-navy/15 px-3 py-1 text-xs text-gov-navy/65 hover:border-gov-blue hover:text-gov-blue">{example}</Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
            <div className="font-mono text-xs text-neutral-400">{report.id}</div>
            <h2 className="mt-2 text-3xl font-bold">{report.service}</h2>
            <p className="mt-4 text-sm leading-relaxed text-gov-navy/65">사용자 의도: {report.userIntent}</p>
            <div className="mt-5 rounded-2xl bg-[#f7f4ec] p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-gov-blue">Agent handled</div>
              <ul className="mt-3 space-y-1 text-sm text-gov-navy/70">
                {report.agentHandled.map((item) => <li key={item}>· {item}</li>)}
              </ul>
            </div>
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-rose-700">Stopped at</div>
              <p className="mt-2 text-sm leading-relaxed text-rose-950/75">{report.stoppedAt}</p>
            </div>
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Proposed change</div>
              <p className="mt-2 text-sm leading-relaxed text-emerald-950/75">{report.proposedChange}</p>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-gov-navy/10 bg-gov-navy p-6 text-white shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">agent-bottleneck-report.json</div>
            <pre className="mt-4 max-h-[640px] overflow-auto rounded-2xl bg-black/25 p-4 text-xs leading-relaxed text-white/80">{JSON.stringify(report, null, 2)}</pre>
          </section>
        </div>
      </section>

      <section className="border-t border-gov-navy/10 bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-7 max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Bottleneck taxonomy</div>
            <h2 className="mt-3 text-3xl font-bold">사람을 없애자는 게 아니라, 사람 병목을 정확히 보자는 것</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-5">
            {BOTTLENECK_TYPES.map((type) => (
              <article key={type.id} className="rounded-2xl border border-gov-navy/10 bg-white p-5 shadow-sm">
                <div className="font-mono text-[11px] text-neutral-400">{type.id}</div>
                <h3 className="mt-2 font-bold">{type.name}</h3>
                <p className="mt-3 text-xs leading-relaxed text-neutral-600">{type.desc}</p>
                <p className="mt-3 border-l-2 border-gov-blue/30 pl-3 text-xs leading-relaxed text-neutral-600">{type.agentFix}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Sample reports</div>
        <div className="grid gap-4 lg:grid-cols-3">
          {SAMPLE_BOTTLENECK_REPORTS.map((sample) => (
            <Link key={sample.id} href={`/plaza/bottlenecks?q=${encodeURIComponent(sample.userIntent)}`} className="rounded-2xl border border-gov-navy/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gov-blue/40">
              <div className="font-mono text-[11px] text-neutral-400">{sample.id}</div>
              <div className="mt-2 font-bold">{sample.service}</div>
              <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-neutral-600">{sample.proposedChange}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
