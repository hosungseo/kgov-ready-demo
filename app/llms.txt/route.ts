import { MINISTRIES } from "@/lib/ministries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const lines: string[] = [];
  lines.push("# K-Gov Agent-Ready 시안");
  lines.push("");
  lines.push(
    "> 대한민국 19개 중앙부처 사이트를 AI 에이전트가 읽을 수 있게 다시 짠 시연. 23가지 표준(robots, sitemap, llms.txt, MCP, OpenAPI, JSON-LD, OIDC, OpenGraph, hreflang, manifest, security.txt 등) 모두 구현.",
  );
  lines.push("");
  lines.push("## Agent Plaza");
  lines.push(`- [K-Gov Agent Plaza](${SITE_URL}/plaza): 에이전트를 위한 정부 광장. 공식 문서, 부처 라우팅, API, 권한 경계를 한곳에서 발견하는 표준 출입구.`);
  lines.push(`- [Agent Plaza JSON](${SITE_URL}/api/plaza): 과업별 라우팅, human review 경계, 주요 엔드포인트를 기계가 읽는 JSON으로 제공.`);
  lines.push("");
  lines.push("## 19개 중앙부처");
  for (const m of MINISTRIES) {
    lines.push(
      `- [${m.nameKo}](${SITE_URL}/${m.slug}): ${m.mission} (Before: ${m.originalUrl})`,
    );
  }
  lines.push("");
  lines.push("## 디스커버리 엔드포인트");
  lines.push(`- [robots.txt](${SITE_URL}/robots.txt)`);
  lines.push(`- [sitemap.xml](${SITE_URL}/sitemap.xml)`);
  lines.push(`- [openapi.json](${SITE_URL}/openapi.json)`);
  lines.push(`- [api/plaza](${SITE_URL}/api/plaza)`);
  lines.push(`- [.well-known/mcp.json](${SITE_URL}/.well-known/mcp.json)`);
  lines.push(`- [.well-known/agent.json](${SITE_URL}/.well-known/agent.json)`);
  lines.push(`- [.well-known/openid-configuration](${SITE_URL}/.well-known/openid-configuration)`);
  lines.push(`- [.well-known/security.txt](${SITE_URL}/.well-known/security.txt)`);
  lines.push("");
  lines.push("## 외부 도구");
  lines.push("- [agent-ready-check 스캐너](https://agent-ready-check.vercel.app)");
  lines.push("");
  lines.push("## 면책");
  lines.push(
    "본 사이트는 시연용 데모로, 정부 공식 입장이나 정책을 대변하지 않습니다. 서비스·연락처는 예시.",
  );

  return new Response(lines.join("\n") + "\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
