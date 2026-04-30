import type { Metadata } from "next";
import Link from "next/link";
import { DEEP_SAMPLES } from "@/lib/deep-samples";

export const metadata: Metadata = {
  title: "Deep Samples · K-Gov Agent Plaza",
  description: "안전신문고, 출산·보육 지원, 수출 바우처를 깊게 풀어낸 agent-ready 민원 샘플.",
};

export default function SamplesPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/plaza" className="text-sm text-gov-navy/60 hover:text-gov-navy">← Agent Plaza</Link>
        <div className="mt-10 max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">Deep Samples</div>
          <h1 className="mt-4 text-5xl font-bold tracking-tight">세 개 민원서비스를 깊게 보기</h1>
          <p className="mt-5 text-lg leading-relaxed text-gov-navy/70">
            얕은 기능 나열보다 설득력 있는 것은 실제 민원 하나를 끝까지 따라가 보는 것입니다. 에이전트가 할 수 있는 일, 막히는 지점, 바꿔야 할 서식과 API, 사람이 남아야 할 판단을 한 화면에 둡니다.
          </p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {DEEP_SAMPLES.map((s) => (
            <Link key={s.slug} href={`/plaza/samples/${s.slug}`} className="group rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gov-blue/40">
              <div className="font-mono text-xs text-neutral-400">{s.slug}</div>
              <h2 className="mt-3 text-2xl font-bold group-hover:text-gov-blue">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gov-navy/65">{s.subtitle}</p>
              <div className="mt-5 rounded-2xl bg-[#f7f4ec] p-4 text-sm text-gov-navy/70">“{s.citizenUtterance}”</div>
              <div className="mt-5 text-sm font-semibold text-gov-blue">상세 보기 →</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
