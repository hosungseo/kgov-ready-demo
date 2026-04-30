import Link from "next/link";
import { MINISTRIES } from "@/lib/ministries";

const SCANNER_URL = "https://agent-ready-check.vercel.app";

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "K-Gov Agent-Ready 시안",
  description:
    "대한민국 19개 중앙부처 사이트를 AI 에이전트용으로 다시 짠 시연 모음",
  inLanguage: "ko",
  publisher: {
    "@type": "Organization",
    name: "agent-ready-check 데모 프로젝트",
    url: "https://agent-ready-check.vercel.app",
  },
};

export default function Home() {
  return (
    <main className="gov-hero min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-16 max-w-3xl">
          <div className="text-xs uppercase tracking-[0.2em] text-gov-blue mb-4 font-semibold">
            K-Gov · Agent-Ready Demo
          </div>
          <h1 className="text-5xl font-bold tracking-tight leading-[1.1] mb-5">
            중앙부처 19곳을
            <br />
            <span className="text-gov-blue">AI 에이전트용으로</span> 다시 짰습니다.
          </h1>
          <p className="text-neutral-700 text-lg leading-relaxed">
            현재 정부 사이트는 사람을 위해 설계되었지만, 앞으로 사이트를 가장 많이 방문할
            대상은 사람이 아니라 <b>AI 에이전트</b>가 됩니다. 이 데모는 19개 중앙부처
            홈페이지를 <b>llms.txt · MCP · OpenAPI · JSON-LD · OIDC</b> 등 23가지 표준에
            맞춰 다시 짜본 시안입니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <a
              href={SCANNER_URL}
              className="px-4 py-2 bg-gov-navy text-white rounded-md hover:bg-gov-blue transition"
            >
              ← Agent-Ready 스캐너
            </a>
            <a
              href={`${SCANNER_URL}/?url=https://kgov-ready-demo.vercel.app`}
              className="px-4 py-2 border border-gov-navy text-gov-navy rounded-md hover:bg-gov-navy hover:text-white transition"
            >
              이 데모 점수 확인 →
            </a>
            <Link
              href="/plaza"
              className="px-4 py-2 bg-white border border-gov-blue text-gov-blue rounded-md hover:bg-gov-blue hover:text-white transition"
            >
              Agent Plaza →
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 underline text-neutral-600 hover:text-gov-navy"
            >
              에이전트 방문 대시보드
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 underline text-neutral-600 hover:text-gov-navy"
            >
              왜 이런 시안을 만들었나?
            </Link>
          </div>
        </header>

        <section className="mb-16 rounded-[2rem] border border-gov-navy/10 bg-white/70 p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gov-blue mb-3 font-semibold">
                Agent Plaza
              </div>
              <h2 className="text-3xl font-bold tracking-tight">에이전트를 위한 정부 광장</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                부처별 홈페이지를 넘어서, 에이전트가 공식 문서·API·권한 경계·담당 도메인을
                한곳에서 발견하는 표준 출입구입니다.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f7f4ec] p-4">
                <div className="font-semibold text-gov-navy">Agent Entrance</div>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600">llms.txt, MCP, OpenAPI 등 먼저 읽는 입구</p>
              </div>
              <div className="rounded-2xl bg-[#f7f4ec] p-4">
                <div className="font-semibold text-gov-navy">Ministry Directory</div>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600">19개 부처를 에이전트 라우팅 맵으로 정렬</p>
              </div>
              <div className="rounded-2xl bg-[#f7f4ec] p-4">
                <div className="font-semibold text-gov-navy">Task Plaza</div>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600">사람의 과업을 부처·문서·API로 연결</p>
              </div>
            </div>
          </div>
          <Link href="/plaza" className="mt-6 inline-flex rounded-md bg-gov-navy px-4 py-2 text-sm text-white hover:bg-gov-blue">
            광장으로 들어가기 →
          </Link>
        </section>

        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold">19개 중앙부처</h2>
            <p className="text-sm text-neutral-500">
              각 카드 클릭 → After 시안 / 외부 링크 → 실제 부처 사이트
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MINISTRIES.map((m, i) => (
              <li
                key={m.slug}
                className="group relative bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <Link
                  href={`/${m.slug}`}
                  className="block p-5 pb-3"
                  prefetch={false}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-neutral-400 mb-1">
                        {String(i + 1).padStart(2, "0")} · {m.nameEn}
                      </div>
                      <div
                        className="text-lg font-bold leading-tight"
                        style={{ color: m.accent }}
                      >
                        {m.nameKo}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 shrink-0">
                      A++
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-3 leading-relaxed line-clamp-3">
                    {m.mission}
                  </p>
                </Link>
                <div className="px-5 pb-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
                  <a
                    href={m.originalUrl}
                    className="text-neutral-500 hover:text-gov-navy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Before · {m.originalUrl.replace(/^https?:\/\//, "")}
                  </a>
                  <Link
                    href={`/${m.slug}`}
                    className="text-gov-blue font-semibold hover:underline"
                  >
                    After 시안 →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-24 pt-10 border-t border-neutral-200 text-sm text-neutral-500">
          <p>
            본 사이트는 <b>시연용 데모</b>입니다. 정부 공식 입장이나 정책을 대변하지
            않으며, 서비스·연락처 일부는 가상의 예시입니다. 코드:{" "}
            <a
              href="https://github.com/hosungseo/kgov-ready-demo"
              className="underline hover:text-gov-navy"
            >
              github.com/hosungseo/kgov-ready-demo
            </a>
          </p>
          <p className="mt-2">
            Agent-ready 표준 23종 모두 구현 →{" "}
            <a href="/llms.txt" className="underline">
              /llms.txt
            </a>{" "}
            ·{" "}
            <a href="/sitemap.xml" className="underline">
              /sitemap.xml
            </a>{" "}
            ·{" "}
            <a href="/.well-known/mcp.json" className="underline">
              /.well-known/mcp.json
            </a>{" "}
            ·{" "}
            <a href="/openapi.json" className="underline">
              /openapi.json
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
