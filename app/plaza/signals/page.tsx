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

const scanTones: Record<string, string> = {
  "10:00": "bg-[#d9f99d] text-[#203012] border-[#d9f99d]/40",
  "14:00": "bg-[#93c5fd] text-[#082f49] border-[#93c5fd]/40",
  "18:00": "bg-[#fbbf24] text-[#3a2600] border-[#fbbf24]/40",
  "22:00": "bg-[#fda4af] text-[#3f0712] border-[#fda4af]/40",
};

function average(scores: Record<string, number>) {
  const values = Object.values(scores);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
function scoreBar(value: number) {
  return `${Math.max(8, Math.min(100, value))}%`;
}

export default function GovSignalWatchPage() {
  const leadBrief = GOV_SIGNAL_BRIEFS[0];

  return (
    <main className="min-h-screen bg-[#f4f0e6] text-[#121826]">
      <section className="relative min-h-[92svh] overflow-hidden bg-[#101624] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(217,249,157,0.12),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,rgba(217,249,157,0.65),transparent)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col px-6 py-8 min-h-[92svh]">
          <nav className="flex items-center justify-between text-sm">
            <Link href="/plaza" className="text-white/58 transition hover:text-white">
              ← Agent Plaza
            </Link>
            <a
              href={GOV_SIGNAL_WATCH.api}
              className="border border-white/18 bg-white/8 px-4 py-2 font-mono text-xs text-[#d9f99d] transition hover:border-[#d9f99d]/60 hover:bg-[#d9f99d]/10"
            >
              /api/plaza/signals
            </a>
          </nav>

          <div className="grid flex-1 gap-10 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="font-mono text-xs uppercase tracking-[0.34em] text-[#d9f99d]">
                Gov Signal Watch
              </div>
              <h1 className="mt-5 text-5xl font-semibold leading-[0.98] sm:text-7xl lg:text-8xl">
                정부 신호를
                <br />
                읽는 계기판
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-white/72">
                {GOV_SIGNAL_WATCH.thesis}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={GOV_SIGNAL_WATCH.api}
                  className="bg-[#d9f99d] px-5 py-3 text-sm font-semibold text-[#101624] transition hover:bg-white"
                >
                  machine JSON 열기
                </a>
                <Link
                  href="/plaza/issues"
                  className="border border-white/20 px-5 py-3 text-sm font-semibold text-white/78 transition hover:border-white/55 hover:text-white"
                >
                  issue workflow로 이동
                </Link>
              </div>
            </div>

            <div className="relative min-h-[520px] overflow-hidden lg:min-h-[640px]" aria-label="Government signal scan visualization">
              <div className="absolute inset-0 border border-white/10 bg-[#0c111d]/70" />
              <div className="absolute inset-6 border border-[#d9f99d]/20" />
              <div className="absolute inset-12 bg-[linear-gradient(120deg,transparent_0%,rgba(217,249,157,0.14)_48%,transparent_54%)]" />
              <div className="absolute left-[12%] top-[18%] h-px w-[76%] bg-[#d9f99d]/50" />
              <div className="absolute left-[18%] top-[28%] h-px w-[68%] bg-white/16" />
              <div className="absolute left-[10%] top-[42%] h-px w-[80%] bg-white/16" />
              <div className="absolute left-[24%] top-[56%] h-px w-[58%] bg-white/16" />
              <div className="absolute left-[14%] top-[70%] h-px w-[70%] bg-[#fbbf24]/40" />

              <div className="absolute left-[12%] top-[15%] w-[74%] border-t border-dashed border-white/16" />
              <div className="absolute left-[20%] top-[15%] h-[62%] border-l border-dashed border-white/16" />
              <div className="absolute left-[50%] top-[15%] h-[62%] border-l border-dashed border-white/16" />
              <div className="absolute left-[80%] top-[15%] h-[62%] border-l border-dashed border-white/16" />

              <div className="absolute left-[10%] top-[9%] font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
                official source scan
              </div>
              <div className="absolute right-[8%] top-[9%] font-mono text-[11px] text-[#d9f99d]">
                latest {GOV_SIGNAL_WATCH.latestScan}
              </div>

              {GOV_SIGNAL_WATCH.cadence.map((slot, index) => (
                <div
                  key={slot}
                  className="absolute hidden border border-white/14 bg-white/9 p-4 backdrop-blur-sm sm:block"
                  style={{
                    left: `${14 + index * 19}%`,
                    top: `${24 + (index % 2) * 30}%`,
                    width: "150px",
                  }}
                >
                  <div className="font-mono text-2xl font-semibold text-white">{slot}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/48">
                    {slotLabels[slot]}
                  </div>
                  <div className={`mt-4 h-1.5 border ${scanTones[slot]}`} />
                </div>
              ))}

              <div className="absolute bottom-8 left-8 right-8 border border-white/12 bg-[#101624]/86 p-5">
                <div className="grid gap-4 sm:grid-cols-[0.34fr_0.66fr]">
                  <div>
                    <div className="font-mono text-5xl font-semibold text-[#d9f99d]">
                      {average(leadBrief.scores)}
                    </div>
                    <div className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-white/40">
                      composite readiness
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{leadBrief.title}</div>
                    <p className="mt-2 text-xs leading-5 text-white/58">{leadBrief.nextAction}</p>
                    <div className="mt-4 font-mono text-[11px] text-[#d9f99d]/80">{leadBrief.route}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-white/12 pt-5 sm:grid-cols-4">
            {GOV_SIGNAL_WATCH.stats.map((stat) => (
              <div key={stat.label} className="py-3 sm:border-l sm:border-white/10 sm:first:border-l-0 sm:px-5">
                <div className="font-mono text-2xl font-semibold text-white">{stat.value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/42">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#121826]/10 bg-[#f4f0e6]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.34fr_0.66fr]">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-[#2454a6]">
              Calendar scan
            </div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight">
              하루 네 번, 공식 source의 움직임만 남깁니다
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#121826]/68">
              뉴스 달력이 아니라 scan log입니다. 각 칸은 큐레이션 결과가 아니라 법령, 관보,
              국회, 서비스, 데이터로 이어지는 행정 신호의 위치입니다.
            </p>
          </div>

          <div className="bg-white shadow-[0_24px_80px_rgba(18,24,38,0.10)]">
            <div className="flex items-center justify-between border-b border-[#121826]/10 px-5 py-4">
              <button className="font-mono text-2xl text-[#121826]/35" type="button" aria-label="Previous month">
                ‹
              </button>
              <div className="font-mono text-sm uppercase tracking-[0.22em] text-[#121826]/58">
                May 2026
              </div>
              <button className="font-mono text-2xl text-[#121826]/35" type="button" aria-label="Next month">
                ›
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
              {days.map((day) => (
                <div key={day} className="min-h-32 border-b border-r border-[#121826]/8 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-[#121826]/58">{day}</span>
                    {day === "18" ? (
                      <span className="bg-[#121826] px-2 py-0.5 font-mono text-[10px] uppercase text-white">
                        live
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-1.5">
                    {GOV_SIGNAL_WATCH.cadence.map((slot) => (
                      <span
                        key={slot}
                        className={`border px-2 py-1.5 text-center font-mono text-[10px] ${scanTones[slot]}`}
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

      <section className="bg-[#111827] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 border-b border-white/12 pb-8 lg:grid-cols-[0.38fr_0.62fr]">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.28em] text-[#d9f99d]">
                Brief queue
              </div>
              <h2 className="mt-4 text-4xl font-semibold leading-tight">
                흥미도 대신 행정 가능성을 점수화합니다
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/64 lg:justify-self-end">
              brief는 읽을거리에서 멈추지 않습니다. source family, 소관, 법령 결합도,
              route, next action으로 변환되어 에이전트가 바로 다음 작업을 선택합니다.
            </p>
          </div>

          <div className="divide-y divide-white/12">
            {GOV_SIGNAL_BRIEFS.map((brief, index) => (
              <article key={brief.id} className="grid gap-8 py-8 lg:grid-cols-[0.1fr_0.5fr_0.4fr]">
                <div>
                  <div className="font-mono text-3xl font-semibold text-[#d9f99d]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-2 font-mono text-xs text-white/42">{brief.time}</div>
                </div>

                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#fbbf24]">
                    {brief.category}
                  </div>
                  <h3 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight">{brief.title}</h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66">{brief.summary}</p>
                  <div className="mt-5 font-mono text-xs text-white/38">{brief.sourceLine}</div>
                </div>

                <aside className="border-l border-white/12 pl-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="font-mono text-xs uppercase tracking-[0.16em] text-white/38">
                        composite
                      </div>
                      <div className="mt-1 font-mono text-5xl font-semibold text-[#d9f99d]">
                        {average(brief.scores)}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-[#d9f99d]/80">{brief.route}</div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {Object.entries(brief.scores).map(([key, value]) => (
                      <div key={key}>
                        <div className="mb-1 flex items-center justify-between font-mono text-[11px] text-white/46">
                          <span>{key}</span>
                          <span>{value}</span>
                        </div>
                        <div className="h-1.5 bg-white/10">
                          <div className="h-full bg-[#d9f99d]" style={{ width: scoreBar(value) }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 border-t border-white/12 pt-4 text-xs leading-5 text-white/58">
                    {brief.nextAction}
                  </p>
                </aside>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#121826]/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.32fr_0.68fr]">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-[#2454a6]">
              Source bank
            </div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight">
              빠른 feed보다 공식 source family가 먼저입니다
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#121826]/64">
              정부 버전의 품질은 많은 링크보다 출처 위계, 담당기관, 법령 연결, 실패 기록에서 나옵니다.
            </p>
          </div>

          <div className="divide-y divide-[#121826]/10 border-y border-[#121826]/10">
            {GOV_SIGNAL_SOURCES.map((source) => (
              <div key={source.source} className="grid gap-4 py-5 sm:grid-cols-[0.22fr_0.28fr_0.5fr]">
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#2454a6]">
                  {source.family}
                </div>
                <div className="font-mono text-sm text-[#121826]">{source.source}</div>
                <div>
                  <p className="text-sm leading-6 text-[#121826]/72">{source.signal}</p>
                  <p className="mt-2 text-xs leading-5 text-[#121826]/48">{source.agentUse}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f0e6]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-[#2454a6]">
              Agent schema
            </div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight">화면보다 JSON을 먼저 신뢰하게 합니다</h2>
            <p className="mt-5 text-sm leading-7 text-[#121826]/64">
              검색, 태그, 그래프맵은 이 필드 위에 얹습니다. 사람은 읽고, 에이전트는 바로 호출합니다.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {GOV_SIGNAL_AGENT_FIELDS.map((field) => (
                <div key={field} className="bg-white px-3 py-3 font-mono text-xs text-[#121826]/72">
                  {field}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#121826] p-6 text-white">
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-[#d9f99d]">
              Score axes
            </div>
            <div className="mt-6 divide-y divide-white/12">
              {GOV_SIGNAL_SCORE_AXES.map((axis) => (
                <div key={axis.axis} className="grid gap-4 py-4 sm:grid-cols-[0.36fr_0.64fr]">
                  <div className="font-mono text-sm text-[#d9f99d]">{axis.axis}</div>
                  <p className="text-sm leading-6 text-white/64">{axis.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
