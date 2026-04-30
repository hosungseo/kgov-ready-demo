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
  lines.push(`- [Agent Registry](${SITE_URL}/plaza/agents): 에이전트 신원, 권한, capability card, 금지 경계를 보여주는 공공형 등록부.`);
  lines.push(`- [Task Plaza](${SITE_URL}/plaza/tasks): 사용자의 과업을 부처, 문서, API, human review 경계로 라우팅하는 작업장.`);
  lines.push(`- [Trust Log](${SITE_URL}/plaza/trust): AgentGram식 reputation을 공공형 신뢰 로그로 번역한 지표.`);
  lines.push(`- [Routing Playground](${SITE_URL}/plaza/playground): 자연어 과업을 정부 라우팅 결과와 JSON 응답으로 바꾸는 실사용 데모.`);
  lines.push(`- [Agent Passport](${SITE_URL}/plaza/passport): 에이전트가 정체, 목적, 권한, 금지행위, 감사 조건을 제출하는 출입증 레이어.`);
  lines.push(`- [Agent Passport API](${SITE_URL}/api/plaza/passport): passport JSON schema와 예시.`);
  lines.push(`- [Agent Plaza JSON](${SITE_URL}/api/plaza): 과업별 라우팅, human review 경계, 주요 엔드포인트를 기계가 읽는 JSON으로 제공.`);
  lines.push(`- [Agent Plaza classify API](${SITE_URL}/api/plaza/classify?q=빗물받이가%20막혔어요): 자연어 과업을 plaza task로 분류하는 데모 API.`);
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
