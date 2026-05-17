import type { Metadata } from "next";
import Link from "next/link";
import {
  GOV_SIGNAL_AGENT_FIELDS,
  GOV_SIGNAL_BRIEFS,
  GOV_SIGNAL_SCORE_AXES,
  GOV_SIGNAL_SOURCES,
  GOV_SIGNAL_WATCH,
} from "@/lib/gov-signal-watch";

export const metadata: Metadata = {
  title: "Gov Signal Watch · K-Gov Agent Plaza",
  description:
    "정부 공식 source를 주기적으로 스캔해 정책 신호를 agent-friendly brief, score, route, next action으로 정리하는 K-Gov signal watch.",
};

const days = Array.from({ length: 18 }, (_, index) => String(index + 1).padStart(2, "0"));

const slotLabels: Record<string, string> = {
  "10:00": "morning",
  "14:00": "afternoon",
  "18:00": "evening",
  "22:00": "night",
};

function average(scores: Record<string, number>) {
  const values = Object.values(scores);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export default function GovSignalWatchPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ec] text-gov-navy">
      <section className="border-b border-gov-navy/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between text-sm">
            <Link href="/plaza" className="text-gov-navy/60 hover:text-gov-navy">
              ← Agent Plaza
            </Link>
            <a
              href={GOV_SIGNAL_WATCH.api}
              className="border border-gov-navy/20 bg-[#fbfaf6] px-4 py-2 text-gov-navy/70 hover:border-gov-blue hover:text-gov-blue"
            >
              machine JSON
            </a>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-gov-blue">
                Gov Signal Watch
              </div>
              <h1 className="mt-4 max-w-4xl text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl">
                정부 신호를
                <br />
                <span className="text-gov-blue">에이전트가 읽는 brief</span>로
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gov-navy/72">
                {GOV_SIGNAL_WATCH.thesis}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gov-navy/58">
                {GOV_SIGNAL_WATCH.agentThesis}
              </p>
            </div>

            <div className="border border-gov-navy/10 bg-[#fbfaf6] p-6 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gov-navy/45">
                Scan rhythm
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {GOV_SIGNAL_WATCH.cadence.map((slot) => (
                  <div key={slot} className="border border-gov-navy/10 bg-white p-3">
                    <div className="font-mono text-lg font-bold text-gov-blue">{slot}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-gov-navy/42">
                      {slotLabels[slot]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-4">
                {GOV_SIGNAL_WATCH.stats.map((stat) => (
                  <div key={stat.label} className="border-t border-gov-navy/10 pt-3">
                    <div className="font-mono text-2xl font-bold">{stat.value}</div>
                    <div className="mt-1 text-xs text-gov-navy/50">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-gov-navy/10 pt-4 text-sm text-gov-navy/62">
                Latest scan: <span className="font-semibold text-gov-navy">{GOV_SIGNAL_WATCH.latestScan}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gov-navy/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">
              Calendar scan
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">뉴스 달력이 아니라 공식 source scan log입니다</h2>
            <p className="mt-4 text-sm leading-relaxed text-gov-navy/68">
              Trendchaser의 하루 4회 cadence를 정부 버전으로 옮기되, 각 점은 기사 수가 아니라
              공식성, 법령 결합도, 국민 영향, 다음 action을 가진 정책 신호입니다.
            </p>
          </div>
          <div className="border border-gov-navy/10 bg-white p-5">
            <div className="flex items-center justify-between border-b border-gov-navy/10 pb-4">
              <button className="font-mono text-xl text-gov-navy/45" type="button">‹</button>
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-gov-navy/55">MAY 2026</div>
              <button className="font-mono text-xl text-gov-navy/45" type="button">›</button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {days.map((day) => (
                <div key={day} className="min-h-24 border border-gov-navy/10 bg-[#fbfaf6] p-3">
                  <div className="font-mono text-sm font-semibold text-gov-navy/60">{day}</div>
                  <div className="mt-3 grid grid-cols-2 gap-1">
                    {GOV_SIGNAL_WATCH.cadence.map((slot) => (
                      <span
                        key={slot}
                        className="h-7 border border-gov-blue/20 bg-gov-blue/8 px-2 py-1 text-center font-mono text-[10px] text-gov-blue"
                      >
                        {slot.slice(0, 2)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gov-navy/10 bg-[#151b2d] text-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="mb-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
                Brief queue
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">점수는 흥미도가 아니라 행정 가능성입니다</h2>
            </div>
            <p className="text-sm leading-relaxed text-white/68">
              각 brief는 원문 링크를 사람이 읽는 데서 끝나지 않습니다. 에이전트가 소관기관,
              법령 결합도, route, next action command로 바로 전환할 수 있어야 합니다.
            </p>
          </div>

          <div className="grid gap-4">
            {GOV_SIGNAL_BRIEFS.map((brief, index) => (
              <article key={brief.id} className="grid gap-5 border border-white/10 bg-white/8 p-5 lg:grid-cols-[0.12fr_0.58fr_0.3fr]">
                <div>
                  <div className="font-mono text-2xl font-bold text-yellow-200">{String(index + 1).padStart(2, "0")}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.16em] text-white/45">{brief.time}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">{brief.category}</div>
                  <h3 className="mt-2 text-2xl font-bold">{brief.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{brief.summary}</p>
                  <div className="mt-4 font-mono text-xs text-white/45">{brief.sourceLine}</div>
                </div>
                <aside className="border border-white/10 bg-black/15 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-white/45">Composite</div>
                  <div className="mt-1 font-mono text-4xl font-bold text-yellow-200">{average(brief.scores)}</div>
                  <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-white/62">
                    {Object.entries(brief.scores).map(([key, value]) => (
                      <div key={key} className="border-t border-white/10 pt-2">
                        <div className="font-mono text-white/45">{key}</div>
                        <div className="font-semibold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-white/45">route</div>
                    <div className="mt-1 font-mono text-xs text-yellow-100">{brief.route}</div>
                    <p className="mt-3 text-xs leading-relaxed text-white/62">{brief.nextAction}</p>
                  </div>
                </aside>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-gov-navy/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">
                Source bank
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">150개 feed 대신 공식 source family를 먼저 고정합니다</h2>
              <p className="mt-4 text-sm leading-relaxed text-gov-navy/68">
                정부 버전은 빠른 바이럴보다 출처 신뢰와 소관 라우팅이 중요합니다.
                그래서 source family마다 agent가 해야 할 역할을 같이 둡니다.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {GOV_SIGNAL_SOURCES.map((source) => (
                <div key={source.source} className="border border-gov-navy/10 bg-[#fbfaf6] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gov-blue">{source.family}</div>
                  <div className="mt-2 font-mono text-sm text-gov-navy">{source.source}</div>
                  <p className="mt-3 text-sm leading-relaxed text-gov-navy/68">{source.signal}</p>
                  <div className="mt-4 border-t border-gov-navy/10 pt-3 text-xs leading-relaxed text-gov-navy/55">
                    {source.agentUse}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">
              Agent schema
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">화면보다 JSON을 먼저 믿게 합니다</h2>
            <p className="mt-4 text-sm leading-relaxed text-gov-navy/68">
              에이전트 친화형 정부 신호는 visual feed보다 구조화 필드가 우선입니다.
              검색과 태그, 그래프맵은 이 schema 위에 얹습니다.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {GOV_SIGNAL_AGENT_FIELDS.map((field) => (
                <div key={field} className="border border-gov-navy/10 bg-white px-3 py-2 font-mono text-xs text-gov-navy/70">
                  {field}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gov-blue">
              Score axes
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">정부 신호에는 다른 점수표가 필요합니다</h2>
            <div className="mt-6 grid gap-3">
              {GOV_SIGNAL_SCORE_AXES.map((axis) => (
                <div key={axis.axis} className="grid gap-4 border border-gov-navy/10 bg-white p-4 sm:grid-cols-[0.34fr_0.66fr]">
                  <div className="font-mono text-sm font-semibold text-gov-blue">{axis.axis}</div>
                  <p className="text-sm leading-relaxed text-gov-navy/68">{axis.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
