import type { Metadata } from "next";
import Link from "next/link";
import { MINISTRY_READINESS, READINESS_CRITERIA } from "@/lib/readiness";

export const metadata: Metadata = { title: "Ministry Readiness Ranking · K-Gov Agent Plaza", description: "19개 부처의 agent-ready 준비도를 비교하는 랭킹." };

export default function RankingPage() {
  const top = MINISTRY_READINESS.slice(0, 5);
  return <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
    <section className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/plaza" className="text-sm text-gov-navy/60 hover:text-gov-navy">← Agent Plaza</Link>
      <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div><div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Ministry Ranking</div><h1 className="mt-4 text-5xl font-bold tracking-tight">어느 부처가 에이전트 시대에 준비됐나</h1></div>
        <p className="text-lg leading-relaxed text-gov-navy/70">홈페이지가 예쁜지가 아니라, 에이전트가 공식 경로를 읽고 과업을 라우팅하고 병목을 기록할 수 있는지를 봅니다.</p>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-5">
        {top.map((m, i) => <article key={m.slug} className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-5 shadow-sm">
          <div className="text-xs text-neutral-400">#{i + 1}</div><div className="mt-2 text-3xl font-bold" style={{color:m.accent}}>{m.score}</div><div className="mt-2 font-bold">{m.nameKo}</div><p className="mt-3 line-clamp-3 text-xs leading-relaxed text-neutral-600">{m.nextMove}</p>
        </article>)}
      </div>
      <div className="mt-12 rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
        <div className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Criteria</div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{READINESS_CRITERIA.map(c => <div key={c.id} className="rounded-2xl bg-[#fbfaf6] p-4"><div className="flex justify-between gap-3"><b>{c.name}</b><span className="font-mono text-xs text-neutral-400">{c.weight}%</span></div><p className="mt-2 text-xs leading-relaxed text-neutral-600">{c.desc}</p></div>)}</div>
      </div>
      <div className="mt-8 space-y-3">
        {MINISTRY_READINESS.map((m) => <Link key={m.slug} href={`/${m.slug}`} className="grid gap-4 rounded-2xl border border-gov-navy/10 bg-white p-4 transition hover:border-gov-blue/40 md:grid-cols-[160px_1fr_140px] md:items-center">
          <div><div className="font-bold">{m.nameKo}</div><div className="font-mono text-xs text-neutral-400">{m.slug}</div></div>
          <div className="grid gap-2 sm:grid-cols-6">{m.criteria.map(c => <div key={c.id}><div className="h-2 rounded-full bg-neutral-100"><div className="h-2 rounded-full" style={{width:`${c.score}%`, backgroundColor:m.accent}} /></div><div className="mt-1 text-[10px] text-neutral-500">{c.id} {c.score}</div></div>)}</div>
          <div className="text-right text-2xl font-bold">{m.score}</div>
        </Link>)}
      </div>
    </section>
  </main>;
}
