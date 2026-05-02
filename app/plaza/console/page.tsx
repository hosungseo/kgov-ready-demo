import type { Metadata } from "next";
import Link from "next/link";
import { AGENT_CONSOLE_PACKET, AGENT_CONSOLE_STEPS, AGENT_UI_PRINCIPLES } from "@/lib/agent-console";
import { DRIFT_SIGNALS } from "@/lib/behavior-drift";

export const metadata: Metadata = { title: "Agent Console · K-Gov Agent Plaza", description: "에이전트 관점에서 정부 광장을 탐색하고 기록하는 작전판 UI." };

export default function AgentConsolePage() {
  return <main className="min-h-screen bg-[#0d1b2a] text-white">
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between text-sm"><Link href="/plaza" className="text-white/55 hover:text-white">← Agent Plaza</Link><a href="/api/plaza/console" className="rounded-full border border-white/15 px-4 py-2 text-white/65 hover:bg-white/10">console.json</a></div>
      <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div><div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">Agent-facing UX</div><h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">사람용 홈페이지가 아니라<br/><span className="text-sky-300">에이전트 작전판</span></h1></div>
        <p className="text-lg leading-relaxed text-white/68">에이전트는 메뉴를 감상하지 않습니다. 자기 신원, 다음 호출, 허용 권한, 멈춤 지점, 기록 위치를 찾아야 합니다. 이 화면은 그 다섯 가지를 한 번에 보여주는 콘솔입니다.</p>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {AGENT_CONSOLE_STEPS.map((step, i) => <Link key={step.id} href={step.primary} className="group rounded-3xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-0.5 hover:border-sky-300/50 hover:bg-white/[0.09]"><div className="font-mono text-xs text-white/35">0{i+1}</div><div className="mt-3 text-xl font-bold text-sky-200">{step.label}</div><p className="mt-3 min-h-16 text-sm leading-relaxed text-white/62">{step.question}</p><div className="mt-4 rounded-2xl bg-black/25 p-3 font-mono text-[11px] text-white/55">{step.api}</div><div className="mt-3 text-xs font-semibold text-sky-300">output: {step.output}</div></Link>)}
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6"><div className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Run packet</div><pre className="mt-4 max-h-[620px] overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-relaxed text-white/72">{JSON.stringify(AGENT_CONSOLE_PACKET, null, 2)}</pre></section>
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6"><div className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">UX rules for agents</div><div className="mt-5 space-y-3">{AGENT_UI_PRINCIPLES.map((rule, i)=><div key={rule} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-xs text-white/35">rule {i+1}</div><p className="mt-2 text-sm leading-relaxed text-white/75">{rule}</p></div>)}</div></section>
      </div>
      <section className="mt-12 rounded-[2rem] border border-amber-300/25 bg-amber-300/10 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Guardrail surface</div>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-white/78">빠르게 끝내는 에이전트보다, 멈춰야 할 곳에서 멈추는 에이전트가 더 낫습니다. 그래서 콘솔 안에 drift monitor를 별도 계기판으로 둡니다.</p>
          </div>
          <Link href="/plaza/drift" className="rounded-full border border-amber-200/40 px-4 py-2 text-sm text-amber-100 hover:bg-amber-100/10">Drift monitor →</Link>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {DRIFT_SIGNALS.slice(0, 3).map((signal) => <article key={signal.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="font-mono text-[11px] text-white/35">{signal.id}</div><h3 className="mt-2 text-base font-semibold text-amber-100">{signal.label}</h3><p className="mt-2 text-sm leading-relaxed text-white/70">{signal.monitor}</p></article>)}
        </div>
      </section>
      <section className="mt-12 rounded-[2rem] border border-sky-300/20 bg-sky-300/10 p-6"><div className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Design shift</div><p className="mt-3 max-w-4xl text-2xl font-semibold leading-relaxed">사람 UI는 설명하고 설득합니다. 에이전트 UI는 방향을 잃지 않게 합니다. 그래서 모든 요소는 “다음 호출”, “필요 권한”, “멈춤 기준”, “남길 기록” 중 하나여야 합니다.</p></section>
    </section>
  </main>;
}
