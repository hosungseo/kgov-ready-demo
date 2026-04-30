import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DEEP_SAMPLES, getDeepSample } from "@/lib/deep-samples";

export function generateStaticParams() {
  return DEEP_SAMPLES.map((sample) => ({ slug: sample.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sample = getDeepSample(slug);
  return { title: sample ? `${sample.title} · Deep Sample` : "Deep Sample" };
}

function List({ title, items, tone = "neutral" }: { title: string; items: readonly string[]; tone?: "neutral" | "bad" | "good" }) {
  const cls = tone === "bad" ? "bg-rose-50 text-rose-950/75" : tone === "good" ? "bg-emerald-50 text-emerald-950/75" : "bg-[#fbfaf6] text-gov-navy/70";
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-gov-blue">{title}</div>
      <ol className="mt-3 space-y-2">
        {items.map((item, i) => <li key={item} className={`rounded-2xl p-3 text-sm leading-relaxed ${cls}`}><b>{i + 1}.</b> {item}</li>)}
      </ol>
    </div>
  );
}

export default async function SampleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sample = getDeepSample(slug);
  if (!sample) notFound();

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/plaza/samples" className="text-sm text-gov-navy/60 hover:text-gov-navy">← Deep Samples</Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div><div className="font-mono text-xs text-neutral-400">{sample.slug}</div><h1 className="mt-3 text-5xl font-bold tracking-tight">{sample.title}</h1></div>
          <p className="text-lg leading-relaxed text-gov-navy/70">{sample.subtitle}</p>
        </div>
        <div className="mt-8 rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-widest text-gov-blue">Citizen utterance</div>
          <p className="mt-3 text-2xl font-semibold leading-relaxed">“{sample.citizenUtterance}”</p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm"><List title="Current flow" items={sample.currentFlow} tone="bad" /></section>
          <section className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm"><List title="Agent-ready flow" items={sample.agentReadyFlow} tone="good" /></section>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm"><List title="Agent can do" items={sample.agentCanDo} /></article>
          <article className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm"><List title="Human stays" items={sample.humanStays} /></article>
          <article className="rounded-[1.5rem] border border-gov-navy/10 bg-white p-6 shadow-sm"><List title="Needed APIs / schemas" items={sample.neededApis} /></article>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6"><div className="text-xs font-semibold uppercase tracking-widest text-rose-700">Bottleneck</div><p className="mt-3 text-lg leading-relaxed text-rose-950/80">{sample.bottleneck}</p></section>
          <section className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6"><div className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Redesign proposal</div><p className="mt-3 text-lg leading-relaxed text-emerald-950/80">{sample.redesign}</p></section>
        </div>
        <section className="mt-8 rounded-[1.5rem] border border-gov-navy/10 bg-gov-navy p-6 text-white shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">deep-sample.json</div>
          <pre className="mt-4 max-h-[620px] overflow-auto rounded-2xl bg-black/25 p-4 text-xs leading-relaxed text-white/80">{JSON.stringify(sample, null, 2)}</pre>
        </section>
      </section>
    </main>
  );
}
