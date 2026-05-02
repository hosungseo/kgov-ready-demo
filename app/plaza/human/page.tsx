import type { Metadata } from "next";
import Link from "next/link";
import { HUMAN_CONSOLE_PACKET, HUMAN_JOURNEY, HUMAN_TRUST_CARDS } from "@/lib/human-console";

export const metadata: Metadata = { title: "Human Console · K-Gov Agent Plaza", description: "시민과 공무원이 에이전트형 민원서비스를 이해하고 통제하는 인간 관점 UI." };

export default function HumanConsolePage() {
  return <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between text-sm"><Link href="/plaza" className="text-gov-navy/60 hover:text-gov-navy">← Agent Plaza</Link><a href="/api/plaza/human" className="rounded-full border border-gov-navy/15 bg-white px-4 py-2 text-gov-navy/65 hover:border-gov-blue">human.json</a></div>
      <div className="mt-14 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div><div className="text-xs font-semibold uppercase tracking-[0.28em] text-gov-blue">Human-facing UX</div><h1 className="mt-4 text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl">에이전트가 아니라<br/><span className="text-gov-blue">사람이 안심하는 화면</span></h1></div>
        <p className="text-lg leading-relaxed text-gov-navy/70">사람에게 필요한 것은 endpoint가 아니라 통제감입니다. 무엇을 맡겼는지, 에이전트가 어디까지 했는지, 어디서 멈췄는지, 누가 확인해야 하는지를 한눈에 보여줘야 합니다.</p>
      </div>
      <section className="mt-12 rounded-[2rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]"><div><div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Human journey</div><h2 className="mt-3 text-3xl font-bold">자연어에서 책임 있는 처리까지</h2><p className="mt-4 text-sm leading-relaxed text-gov-navy/65">시민과 공무원이 같은 화면을 보되, 각자 필요한 정보를 다르게 읽을 수 있게 구성합니다.</p></div><div className="grid gap-3">{HUMAN_JOURNEY.map((j, i)=><article key={j.id} className="grid gap-4 rounded-2xl border border-neutral-200 bg-[#fbfaf6] p-4 md:grid-cols-[80px_1fr_1fr]"><div><div className="font-mono text-xs text-neutral-400">0{i+1}</div><div className="mt-2 font-bold text-gov-blue">{j.label}</div></div><div><div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Citizen sees</div><p className="mt-2 text-sm leading-relaxed text-gov-navy/70">{j.citizen}</p></div><div><div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Official sees</div><p className="mt-2 text-sm leading-relaxed text-gov-navy/70">{j.official}</p><p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs text-gov-blue">{j.reassurance}</p></div></article>)}</div></div>
      </section>
      <section className="mt-12 grid gap-5 lg:grid-cols-4">{HUMAN_TRUST_CARDS.map((card)=><article key={card.title} className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm"><h3 className="text-xl font-bold">{card.title}</h3><p className="mt-3 text-sm leading-relaxed text-gov-navy/65">{card.body}</p></article>)}</section>
      <section className="mt-12 grid gap-5 lg:grid-cols-[1fr_1fr]"><div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6"><div className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Good human UX</div><ul className="mt-4 space-y-3 text-sm leading-relaxed text-emerald-950/75"><li>· “에이전트가 대신 처리한 부분”과 “사람이 확인할 부분”을 분리한다.</li><li>· 제출 전 승인, 민감정보 사용, 법적 판단 경계를 크게 보여준다.</li><li>· 시민에게는 다음 행동을, 공무원에게는 판단 근거를 보여준다.</li><li>· 실패를 끝으로 보지 않고 개선 건의로 전환한다.</li></ul></div><div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6"><div className="text-xs font-semibold uppercase tracking-widest text-rose-700">Bad human UX</div><ul className="mt-4 space-y-3 text-sm leading-relaxed text-rose-950/75"><li>· “AI가 처리 중입니다”만 보여주고 근거와 멈춤 지점을 숨긴다.</li><li>· 자동 제출과 초안 작성을 구분하지 않는다.</li><li>· 담당기관 추천 이유를 설명하지 않는다.</li><li>· 병목을 사용자 탓이나 담당자 탓으로 남긴다.</li></ul></div></section>
      <section className="mt-12 rounded-[2rem] border border-amber-300/40 bg-amber-50 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Why the stop matters</div>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-amber-950/80">사람이 안심하는 화면은 매끄럽게 끝나는 화면이 아니라, 왜 여기서 멈췄는지 납득하게 해주는 화면입니다. guardrail은 백엔드 규칙이 아니라 신뢰의 문장이어야 합니다.</p>
          </div>
          <Link href="/plaza/drift" className="rounded-full border border-amber-400/60 bg-white px-4 py-2 text-sm text-amber-800 hover:bg-amber-100">멈춤 기준 보기 →</Link>
        </div>
      </section>
      <section className="mt-12 rounded-[2rem] border border-gov-navy/10 bg-gov-navy p-6 text-white shadow-sm"><div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">human-console.json</div><pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl bg-black/25 p-4 text-xs leading-relaxed text-white/75">{JSON.stringify(HUMAN_CONSOLE_PACKET, null, 2)}</pre></section>
    </section>
  </main>;
}
