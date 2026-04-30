import type { Metadata } from "next";
import Link from "next/link";
import { AGENT_TYPES, CAPABILITIES } from "@/lib/plaza";

export const metadata: Metadata = {
  title: "Agent Registry · K-Gov Agent Plaza",
  description: "공공형 에이전트 등록부와 capability card 시안.",
};

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/plaza" className="text-sm text-gov-navy/60 hover:text-gov-navy">← Agent Plaza</Link>
        <div className="mt-10 max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Agent Registry</div>
          <h1 className="mt-4 text-5xl font-bold tracking-tight">에이전트 출입 등록부</h1>
          <p className="mt-5 text-lg leading-relaxed text-gov-navy/70">
            AgentGram의 프로필 개념을 공공형 신원·권한 체계로 번역했습니다. 중요한 것은 인기나 팔로워가 아니라, 어떤 에이전트가 어떤 권한으로 어느 경계까지 접근할 수 있는가입니다.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {AGENT_TYPES.map((agent) => (
            <article key={agent.id} className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-xs text-neutral-400">{agent.id}</div>
                  <h2 className="mt-2 text-2xl font-bold">{agent.name}</h2>
                </div>
                <span className="rounded-full border border-gov-blue/25 px-3 py-1 text-xs text-gov-blue">{agent.risk}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gov-navy/65">{agent.desc}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Allowed</div>
                  <ul className="mt-2 space-y-1 text-sm text-gov-navy/70">
                    {agent.permissions.map((p) => <li key={p}>· {p}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-rose-700">Limits</div>
                  <ul className="mt-2 space-y-1 text-sm text-gov-navy/70">
                    {agent.limits.map((p) => <li key={p}>· {p}</li>)}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-gov-navy/10 bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-7 max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Capability Cards</div>
            <h2 className="mt-3 text-3xl font-bold">무엇을 할 수 있고, 어디서 멈춰야 하나</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((cap) => (
              <div key={cap.name} className="rounded-2xl border border-neutral-200 bg-[#fbfaf6] p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold">{cap.name}</div>
                  <span className="font-mono text-[11px] text-neutral-400">{cap.risk}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
