import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이 시안에 대하여",
  description:
    "왜 정부 사이트를 AI 에이전트용으로 다시 짰는가 — 목적, 점검 표준, 한계, 라이선스.",
};

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 prose prose-neutral">
      <Link href="/" className="text-sm text-neutral-500 hover:text-gov-navy no-underline">
        ← 메인
      </Link>
      <h1 className="mt-4 text-3xl font-bold">왜 이런 시안을 만들었나?</h1>
      <p className="text-neutral-700 leading-relaxed">
        현재 대한민국 중앙부처 홈페이지는 <b>AI 에이전트가 읽기 매우 어렵습니다</b>.
        <a
          href="https://agent-ready-check.vercel.app/rankings"
          className="text-gov-blue underline ml-1"
        >
          agent-ready-check 스캐너
        </a>
        로 측정했을 때, 20개 부처 중 절반 이상이 F 등급을 받습니다.
      </p>

      <h2>이 시안이 한 일</h2>
      <ul>
        <li>19개 중앙부처를 <b>하나의 Next.js 앱</b>으로 재현</li>
        <li>각 부처별 <code>/slug/llms.txt</code>, <code>/slug/index.md</code>, JSON-LD 구조화 데이터</li>
        <li>
          사이트 레벨 에이전트 엔드포인트:
          <ul>
            <li>
              <a href="/.well-known/mcp.json" className="font-mono">/.well-known/mcp.json</a> — MCP 매니페스트
            </li>
            <li>
              <a href="/.well-known/openid-configuration" className="font-mono">
                /.well-known/openid-configuration
              </a>{" "}
              — OIDC 디스커버리
            </li>
            <li>
              <a href="/.well-known/agent.json" className="font-mono">/.well-known/agent.json</a> — 에이전트 카드
            </li>
            <li>
              <a href="/openapi.json" className="font-mono">/openapi.json</a> — OpenAPI 3.1
            </li>
            <li>
              <a href="/llms.txt" className="font-mono">/llms.txt</a>,{" "}
              <a href="/llms-full.txt" className="font-mono">/llms-full.txt</a>
            </li>
          </ul>
        </li>
        <li>
          마크다운 콘텐츠 협상 (Accept: text/markdown) —{" "}
          <code>curl -H "Accept: text/markdown" https://kgov-ready-demo.vercel.app/</code>
        </li>
        <li>AI 봇별 명시적 robots 정책 (GPTBot, ClaudeBot, CCBot, PerplexityBot 등 11종)</li>
      </ul>

      <h2>한계와 면책</h2>
      <ul>
        <li>
          <b>공식 사이트 아님</b>. 디자인·구조는 시연을 위한 단순화. 실제 정부 정책·서비스는
          각 부처의 원사이트를 참조.
        </li>
        <li>서비스 링크(<code>/slug/services/*</code>)는 작동하지 않습니다 (404).</li>
        <li>OIDC 엔드포인트는 실제 토큰을 발급하지 않는 스텁 문서만 제공.</li>
        <li>MCP 서버(/mcp)는 매니페스트만 있고 실제 JSON-RPC는 구현되지 않음.</li>
      </ul>

      <h2>기술</h2>
      <p>
        Next.js 15 · React 19 · Tailwind CSS · TypeScript. 전체 소스:{" "}
        <a href="https://github.com/hosungseo/kgov-ready-demo">
          github.com/hosungseo/kgov-ready-demo
        </a>
        .
      </p>

      <h2>라이선스</h2>
      <p>코드는 MIT, 콘텐츠(시안 텍스트)는 CC-BY-4.0. 자유롭게 가져가서 고치시면 됩니다.</p>
    </main>
  );
}
