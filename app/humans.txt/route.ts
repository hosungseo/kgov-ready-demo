export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const body = [
    "/* TEAM */",
    "  Project: K-Gov Agent-Ready demo",
    "  Author:  서호성 (ghtjd10855@gmail.com)",
    "  Purpose: 19개 중앙부처 사이트의 에이전트 준비도 시연",
    "",
    "/* SITE */",
    "  Last update: 2026-04-25",
    "  Standards:   HTML5, CSS3, llms.txt, MCP 0.1, OpenAPI 3.1, OIDC, RFC 9116",
    "  Components:  Next.js 15, React 19, Tailwind 3, TypeScript",
    "  Source:      https://github.com/hosungseo/kgov-ready-demo",
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
