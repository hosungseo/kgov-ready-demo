import type { Metadata } from "next";
import Link from "next/link";
import { DRIFT_SCENARIOS, DRIFT_SIGNALS, REWARD_AUDIT_CHECKS, REWARD_AUDIT_PACKET } from "@/lib/behavior-drift";

export const metadata: Metadata = {
  title: "Behavior Drift Monitor · K-Gov Agent Plaza",
  description: "공공 에이전트가 친절함·해결률·자동화 보상 때문에 경계를 넘지 않는지 감시하는 레이어.",
};

const riskTone: Record<string, string> = {
  critical: "border-rose-300 bg-rose-50 text-rose-800",
  high: "border-amber-300 bg-amber-50 text-amber-800",
  medium: "border-sky-300 bg-sky-50 text-sky-800",
};

export default function DriftPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between text-sm">
          <Link href="/plaza" className="text-gov-navy/60 hover:text-gov-navy">← Agent Plaza</Link>
          <a href="/api/plaza/drift" className="rounded-full border border-gov-navy/15 bg-white px-4 py-2 text-gov-navy/65 hover:border-gov-blue hover:text-gov-blue">drift.json</a>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-gov-blue">Behavior Drift Monitor</div>
            <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">친절한 에이전트가<br /><span className="text-gov-blue">위험한 에이전트</span>가 되지 않게</h1>
          </div>
          <p className="text-lg leading-relaxed text-gov-navy/70">
            공공 에이전트는 종종 잘 돕고 싶어서 위험해집니다. 해결률, 매끄러운 UX, 짧은 응답, 친절한 말투에 보상이 걸리면
            사람 검토 경계와 근거 보존이 뒤로 밀릴 수 있습니다. 이 레이어는 그 drift를 먼저 감시합니다.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {REWARD_AUDIT_PACKET.metrics.map((metric) => (
            <article key={metric.id} className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-5 shadow-sm">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">metric</div>
              <h2 className="mt-3 text-lg font-bold">{metric.label}</h2>
              <p className="mt-2 text-sm text-gov-navy/65">target {metric.target}</p>
            </article>
          ))}
        </div>

        <section className="mt-12 grid gap-4 lg:grid-cols-2">
          {DRIFT_SIGNALS.map((signal) => (
            <article key={signal.id} className="rounded-[2rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-neutral-400">{signal.id}</div>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">{signal.label}</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${riskTone[signal.risk]}`}>{signal.risk}</span>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-relaxed text-gov-navy/72">
                <p><b className="text-gov-navy">Symptom.</b> {signal.symptom}</p>
                <p><b className="text-gov-navy">Likely reward pressure.</b> {signal.likelyReward}</p>
                <p><b className="text-gov-navy">Public risk.</b> {signal.publicRisk}</p>
                <p><b className="text-gov-navy">Monitor.</b> {signal.monitor}</p>
                <p><b className="text-gov-navy">Human stays.</b> {signal.keepHuman}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-gov-blue/20 bg-gov-blue/8 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Reward audit checklist</div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gov-navy/72">
              {REWARD_AUDIT_CHECKS.map((check) => <li key={check}>• {check}</li>)}
            </ul>
          </div>
          <div className="rounded-[2rem] border border-gov-navy/10 bg-gov-navy p-6 text-white shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">drift-monitor.json</div>
            <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl bg-black/25 p-4 text-xs leading-relaxed text-white/75">{JSON.stringify(REWARD_AUDIT_PACKET, null, 2)}</pre>
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Scenario check</div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {DRIFT_SCENARIOS.map((scenario) => (
              <article key={scenario.id} className="rounded-[1.5rem] border border-gov-navy/10 bg-[#fbfaf6] p-5">
                <div className="font-mono text-xs text-neutral-400">{scenario.id}</div>
                <h2 className="mt-2 text-xl font-bold tracking-tight">{scenario.title}</h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-gov-navy/72">
                  <p><b className="text-gov-navy">Drift signal.</b> {scenario.driftSignal}</p>
                  <p><b className="text-rose-700">Bad answer.</b> {scenario.bad}</p>
                  <p><b className="text-emerald-700">Better answer.</b> {scenario.better}</p>
                  <p><b className="text-gov-navy">Why it matters.</b> {scenario.whyItMatters}</p>
                  {scenario.relatedSample ? <p><b className="text-gov-navy">Related sample.</b> <Link href={scenario.relatedSample} className="text-gov-blue hover:underline">{scenario.relatedSample}</Link></p> : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] border border-amber-300/30 bg-amber-50 p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Operating principle</div>
          <p className="mt-3 max-w-4xl text-2xl font-semibold leading-relaxed text-amber-950/80">
            공공 에이전트의 좋은 성능은 “더 많이 자동처리했다”가 아니라 “멈춰야 할 곳에서 정확히 멈추고, 그 이유를 남겼다”에 가까워야 합니다.
          </p>
        </section>
      </section>
    </main>
  );
}
