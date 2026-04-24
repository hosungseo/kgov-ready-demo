import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardData, isTrackingConfigured } from "@/lib/tracking";
import { MINISTRY_BY_SLUG } from "@/lib/ministries";

export const metadata: Metadata = {
  title: "에이전트 방문 대시보드",
  description: "이 사이트에 방문한 AI 에이전트의 UA·경로·Accept 헤더 통계.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const KIND_COLORS: Record<string, string> = {
  ai: "bg-emerald-500",
  search: "bg-blue-500",
  seo: "bg-amber-500",
  scanner: "bg-purple-500",
  misc: "bg-neutral-400",
};

function Bar({
  label,
  count,
  total,
  tint,
}: {
  label: string;
  count: number;
  total: number;
  tint?: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <li className="flex items-center gap-3 text-sm py-1.5">
      <div className="w-40 shrink-0 truncate font-medium" title={label}>
        {label}
      </div>
      <div className="flex-1 h-3 bg-neutral-100 rounded overflow-hidden">
        <div
          className={`h-full ${tint ?? "bg-gov-blue"}`}
          style={{ width: `${Math.max(pct, 1.5)}%` }}
        />
      </div>
      <div className="w-20 text-right tabular-nums text-neutral-600 text-xs">
        {count.toLocaleString()} ({pct.toFixed(1)}%)
      </div>
    </li>
  );
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}초 전`;
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}시간 전`;
  return new Date(ts).toLocaleString("ko-KR");
}

export default async function Dashboard() {
  if (!isTrackingConfigured()) {
    return <ConfigureHint />;
  }
  const data = await getDashboardData();
  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-neutral-600 mt-4">
          Redis 연결에 실패했습니다. KV_REST_API_URL / KV_REST_API_TOKEN 환경변수를
          확인하세요.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
          <Link href="/" className="underline hover:text-gov-navy">
            ← K-Gov Agent-Ready
          </Link>
          <span>agent-visit dashboard · live</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          에이전트가 여기에 왜 왔는지 실시간으로 추적합니다.
        </h1>
        <p className="text-neutral-600 mt-3 max-w-3xl">
          middleware가 User-Agent에서 GPTBot / ClaudeBot / Perplexity 등{" "}
          {Object.keys(data.byAgent).length > 0
            ? `${data.byAgent.length}`
            : "30여"}
          종을 식별해 방문 경로·Accept 헤더·대상 부처를 로그합니다. 데이터는 Upstash
          Redis에 최대 500건 순환 저장.
        </p>
        <div className="mt-6 flex items-baseline gap-6">
          <div>
            <div className="text-6xl font-bold tracking-tight text-gov-navy tabular-nums">
              {data.total.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-500">총 에이전트 방문</div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-neutral-700 tabular-nums">
              {data.byAgent.length}
            </div>
            <div className="text-sm text-neutral-500">식별된 봇 종류</div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-neutral-700 tabular-nums">
              {data.bySlug.length}
            </div>
            <div className="text-sm text-neutral-500">방문된 부처</div>
          </div>
        </div>
      </div>

      {data.total === 0 ? (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-md text-sm">
          <div className="font-semibold mb-1">아직 방문이 없습니다.</div>
          <div className="text-neutral-700">
            봇 User-Agent로 한번 방문해보세요:
            <pre className="mt-2 p-3 bg-neutral-900 text-neutral-100 rounded overflow-x-auto text-xs">
{`curl -A "GPTBot/1.0" https://kgov-ready-demo.vercel.app/
curl -A "ClaudeBot/1.0" -H "Accept: text/markdown" https://kgov-ready-demo.vercel.app/mois
curl -A "PerplexityBot" https://kgov-ready-demo.vercel.app/llms.txt`}
            </pre>
          </div>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          <Panel title="에이전트별 방문수" note="상위 15종">
            <ul>
              {data.byAgent.slice(0, 15).map((a) => {
                const kind = data.byKind.find(() => true); // not accurate per-agent; tint by ai default
                void kind;
                return (
                  <Bar
                    key={a.name}
                    label={a.name}
                    count={a.count}
                    total={data.total}
                    tint={KIND_COLORS.ai}
                  />
                );
              })}
            </ul>
          </Panel>

          <Panel title="에이전트 유형별" note="ai/search/seo/scanner/misc">
            <ul>
              {data.byKind.map((k) => (
                <Bar
                  key={k.name}
                  label={k.name}
                  count={k.count}
                  total={data.total}
                  tint={KIND_COLORS[k.name] ?? "bg-neutral-400"}
                />
              ))}
            </ul>
          </Panel>

          <Panel title="방문된 부처 (Top 20)" note="/[slug] 이하 히트">
            <ul>
              {data.bySlug.slice(0, 20).map((s) => {
                const m = MINISTRY_BY_SLUG[s.name];
                return (
                  <Bar
                    key={s.name}
                    label={m ? `${m.nameKo} (${s.name})` : s.name}
                    count={s.count}
                    total={data.total}
                  />
                );
              })}
            </ul>
          </Panel>

          <Panel title="Accept 헤더 분포" note="html/markdown/json/other">
            <ul>
              {data.byAccept.map((a) => (
                <Bar
                  key={a.name}
                  label={a.name}
                  count={a.count}
                  total={data.total}
                  tint={a.name === "markdown" ? "bg-emerald-500" : "bg-gov-blue"}
                />
              ))}
            </ul>
          </Panel>

          <Panel title="인기 경로 (Top 20)" note="전체 방문 기준">
            <ul>
              {data.byPath.slice(0, 20).map((p) => (
                <Bar
                  key={p.name}
                  label={p.name}
                  count={p.count}
                  total={data.total}
                />
              ))}
            </ul>
          </Panel>

          <Panel title="일자별 방문" note={`${data.byDay.length}일치`}>
            <ul>
              {data.byDay.slice(-14).map((d) => (
                <Bar
                  key={d.name}
                  label={d.name}
                  count={d.count}
                  total={data.total}
                />
              ))}
            </ul>
          </Panel>
        </div>
      )}

      <section className="mt-14">
        <h2 className="text-xl font-bold mb-4">최근 방문 (최대 100건)</h2>
        {data.visits.length === 0 ? (
          <p className="text-sm text-neutral-500">아직 기록이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-neutral-200 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider">
                  <th className="py-2 px-3">시각</th>
                  <th className="py-2 px-3">에이전트</th>
                  <th className="py-2 px-3">경로</th>
                  <th className="py-2 px-3">대상 부처</th>
                  <th className="py-2 px-3">Accept</th>
                  <th className="py-2 px-3">UA</th>
                </tr>
              </thead>
              <tbody>
                {data.visits.map((v, i) => {
                  const m = v.slug ? MINISTRY_BY_SLUG[v.slug] : null;
                  return (
                    <tr
                      key={`${v.ts}-${i}`}
                      className="border-b border-neutral-100 hover:bg-neutral-50"
                    >
                      <td className="py-2 px-3 text-neutral-600 whitespace-nowrap">
                        {formatRelative(v.ts)}
                      </td>
                      <td className="py-2 px-3 font-medium">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${KIND_COLORS[v.kind] ?? "bg-neutral-400"}`}
                        />
                        {v.agent}
                      </td>
                      <td className="py-2 px-3 font-mono text-xs max-w-xs truncate">
                        {v.path}
                      </td>
                      <td className="py-2 px-3">
                        {m ? (
                          <Link
                            href={`/${v.slug}`}
                            className="text-gov-blue underline"
                          >
                            {m.nameKo}
                          </Link>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-xs text-neutral-600">
                        {v.accept.includes("markdown")
                          ? "md"
                          : v.accept.includes("json")
                            ? "json"
                            : v.accept.includes("html")
                              ? "html"
                              : "—"}
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-neutral-500 max-w-md truncate">
                        {v.ua}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="mt-16 pt-6 border-t border-neutral-200 text-xs text-neutral-500">
        <p>
          로그 보관: 최근 500건 순환 (Upstash Redis). 개인정보 저장 없음 — User-Agent,
          경로, Accept, 국가 코드만 저장.
        </p>
      </footer>
    </main>
  );
}

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-neutral-200 rounded-lg p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-700">
          {title}
        </h3>
        {note && <span className="text-xs text-neutral-400">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function ConfigureHint() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-gov-navy">
        ← 메인
      </Link>
      <h1 className="mt-4 text-3xl font-bold">대시보드 설정 필요</h1>
      <p className="text-neutral-700 mt-3 leading-relaxed">
        에이전트 방문을 저장하려면 Upstash Redis(무료)를 연결해야 합니다. Vercel
        대시보드에서 한 번만 설정하면 됩니다.
      </p>
      <ol className="mt-6 space-y-4 text-sm list-decimal list-inside">
        <li>
          Vercel 프로젝트 페이지 →{" "}
          <b>Storage</b> 탭 → <b>Create Database</b> → <b>Upstash (Redis)</b>{" "}
          선택.
        </li>
        <li>
          리전 선택 → <b>Create</b>. 생성되면 이 프로젝트에 <b>Connect</b>. 환경변수
          <code className="font-mono mx-1">KV_REST_API_URL</code>과
          <code className="font-mono mx-1">KV_REST_API_TOKEN</code>이 자동
          주입됩니다.
        </li>
        <li>
          변경사항 적용 위해 재배포:{" "}
          <code className="font-mono">git commit --allow-empty -m "chore: pick up KV env" && git push</code>
        </li>
        <li>
          재배포 후 이 페이지가 실시간 방문 대시보드로 전환됩니다.
        </li>
      </ol>
      <p className="mt-6 text-xs text-neutral-500">
        Upstash 무료 플랜: 10K 요청/일, 256MB — 이 규모 데모엔 충분합니다.
      </p>
    </main>
  );
}
