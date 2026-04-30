import type { Metadata } from "next";
import Link from "next/link";
import { TASKS, classifyIntent } from "@/lib/plaza";

export const metadata: Metadata = {
  title: "Routing Playground · K-Gov Agent Plaza",
  description: "자연어 과업을 공공 라우팅 결과로 바꾸는 Agent Plaza 데모.",
};

const EXAMPLES = [
  "빗물받이가 막혀서 비가 오면 도로가 잠길 것 같아요",
  "아이가 태어났는데 받을 수 있는 지원이 있나요",
  "수출 바우처 신청 가능한지 알고 싶어요",
  "이 제도의 근거 법령과 담당 부처를 찾아줘",
  "행안부 최신 보도자료 원문을 공식 출처로 확인해줘",
  "이 민원은 어디에 넣고 어떤 서류부터 챙겨야 하나요",
];

export default async function PlaygroundPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params?.q || EXAMPLES[0];
  const result = classifyIntent(q);

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/plaza" className="text-sm text-gov-navy/60 hover:text-gov-navy">← Agent Plaza</Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Routing Playground</div>
            <h1 className="mt-4 text-5xl font-bold tracking-tight">에이전트 입장 연습장</h1>
          </div>
          <p className="text-lg leading-relaxed text-gov-navy/70">
            정부 광장은 안내판이 아니라 라우터여야 합니다. 자연어 과업을 던지면 부처, 공식 문서, API, human review 경계를 함께 돌려주는 흐름을 시연합니다.
          </p>
        </div>

        <div className="mt-10 rounded-[1.5rem] border border-gov-navy/10 bg-white p-5 shadow-sm">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" action="/plaza/playground">
            <input
              name="q"
              defaultValue={q}
              className="rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 text-sm outline-none focus:border-gov-blue"
              aria-label="과업 입력"
            />
            <button className="rounded-2xl bg-gov-navy px-5 py-3 text-sm font-semibold text-white hover:bg-gov-blue">
              라우팅하기
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <Link key={example} href={`/plaza/playground?q=${encodeURIComponent(example)}`} className="rounded-full border border-gov-navy/15 px-3 py-1 text-xs text-gov-navy/65 hover:border-gov-blue hover:text-gov-blue">
                {example}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
            <div className="font-mono text-xs text-neutral-400">matched task</div>
            <h2 className="mt-2 text-3xl font-bold">{result.matchedTask.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-gov-navy/65">{result.matchedTask.intent}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f7f4ec] p-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-gov-blue">Confidence</div>
                <div className="mt-2 font-mono text-sm">{result.confidence}</div>
              </div>
              <div className="rounded-2xl bg-[#f7f4ec] p-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-gov-blue">Reason</div>
                <div className="mt-2 text-sm text-gov-navy/70">{result.reason}</div>
              </div>
            </div>
            <p className="mt-5 border-l-2 border-gov-blue/35 pl-3 text-sm leading-relaxed text-neutral-600">
              멈춤 지점: {result.mustStopForHuman}
            </p>
          </section>

          <section className="rounded-[1.5rem] border border-gov-navy/10 bg-gov-navy p-6 text-white shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Machine-readable response</div>
            <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl bg-black/25 p-4 text-xs leading-relaxed text-white/80">
{JSON.stringify(result, null, 2)}
            </pre>
          </section>
        </div>

        <section className="mt-12">
          <div className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">All available routes</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TASKS.map((task) => (
              <Link key={task.id} href={`/plaza/playground?q=${encodeURIComponent(task.prompts[0])}`} className="rounded-2xl border border-gov-navy/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-gov-blue/40">
                <div className="font-bold">{task.title}</div>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gov-navy/60">{task.intent}</p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
