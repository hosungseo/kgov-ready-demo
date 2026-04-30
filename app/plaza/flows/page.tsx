import type { Metadata } from "next";
import Link from "next/link";
import { BEFORE_AFTER_FLOWS } from "@/lib/readiness";

export const metadata: Metadata = { title: "Before / After Flows · K-Gov Agent Plaza", description: "민원서비스가 에이전트 처리 가능 구조로 바뀌는 전후 흐름." };

export default function FlowsPage() {
  return <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
    <section className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/plaza" className="text-sm text-gov-navy/60 hover:text-gov-navy">← Agent Plaza</Link>
      <div className="mt-10 max-w-3xl"><div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Before / After</div><h1 className="mt-4 text-5xl font-bold tracking-tight">민원 흐름을 에이전트 처리 가능 구조로 바꾸기</h1><p className="mt-5 text-lg leading-relaxed text-gov-navy/70">사람 병목을 모두 없애자는 게 아니라, 에이전트가 처리할 수 있는 구간과 사람이 남아야 하는 구간을 다시 그립니다.</p></div>
      <div className="mt-12 space-y-8">{BEFORE_AFTER_FLOWS.map(flow => <article key={flow.id} className="overflow-hidden rounded-[1.5rem] border border-gov-navy/10 bg-white shadow-sm">
        <div className="border-b border-gov-navy/10 p-6"><div className="font-mono text-xs text-neutral-400">{flow.id}</div><h2 className="mt-2 text-3xl font-bold">{flow.title}</h2></div>
        <div className="grid lg:grid-cols-2">
          <div className="p-6"><div className="text-xs font-semibold uppercase tracking-widest text-rose-700">Current flow</div><ol className="mt-4 space-y-3">{flow.before.map((x,i)=><li key={x} className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-950/75"><b>{i+1}.</b> {x}</li>)}</ol></div>
          <div className="border-t border-gov-navy/10 p-6 lg:border-l lg:border-t-0"><div className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Agent-ready flow</div><ol className="mt-4 space-y-3">{flow.after.map((x,i)=><li key={x} className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950/75"><b>{i+1}.</b> {x}</li>)}</ol></div>
        </div>
        <div className="border-t border-gov-navy/10 bg-[#fbfaf6] p-6"><div className="text-xs font-semibold uppercase tracking-widest text-gov-blue">Bottleneck to redesign</div><p className="mt-2 text-sm leading-relaxed text-gov-navy/70">{flow.bottleneck.proposedChange}</p></div>
      </article>)}</div>
    </section>
  </main>;
}
