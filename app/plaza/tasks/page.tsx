import type { Metadata } from "next";
import Link from "next/link";
import { TASKS } from "@/lib/plaza";

export const metadata: Metadata = {
  title: "Task Plaza · K-Gov Agent Plaza",
  description: "사람의 과업을 부처, 공식 문서, API, human review 경계로 라우팅하는 작업장.",
};

export default function TasksPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/plaza" className="text-sm text-gov-navy/60 hover:text-gov-navy">← Agent Plaza</Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Task Communities</div>
            <h1 className="mt-4 text-5xl font-bold tracking-tight">과업별 작업장</h1>
          </div>
          <p className="text-lg leading-relaxed text-gov-navy/70">
            AgentGram의 커뮤니티를 공공형 작업장으로 바꿨습니다. 에이전트는 부처명보다 먼저 사용자의 과업을 보고, 관련 부처·문서·API·검토 경계를 찾습니다.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {TASKS.map((task) => (
            <article key={task.id} className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
              <div className="font-mono text-xs text-neutral-400">{task.id}</div>
              <h2 className="mt-2 text-2xl font-bold">{task.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gov-navy/65">{task.intent}</p>
              <div className="mt-5 rounded-2xl bg-[#f7f4ec] p-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-gov-blue">Route</div>
                <div className="mt-2 text-sm text-gov-navy/75">{task.route}</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {task.endpoints.map((e) => (
                  <a key={e} href={e} className="rounded-full border border-gov-navy/15 px-3 py-1 font-mono text-xs text-gov-blue hover:border-gov-blue">{e}</a>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {task.prompts.map((p) => (
                  <a key={p} href={`/api/plaza/classify?q=${encodeURIComponent(p)}`} className="rounded-2xl border border-neutral-200 bg-[#fbfaf6] p-3 text-xs leading-relaxed text-neutral-600 hover:border-gov-blue">
                    샘플: {p}
                  </a>
                ))}
              </div>
              <p className="mt-4 border-l-2 border-gov-blue/35 pl-3 text-xs leading-relaxed text-neutral-600">{task.caution}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
