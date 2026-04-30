import { AGENT_TYPES, CAPABILITIES, TASKS, TRUST_METRICS } from "@/lib/plaza";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return Response.json({
    name: "K-Gov Agent Plaza",
    description:
      "AI 에이전트가 정부 공식 문서, 부처 라우팅, API, 권한 경계를 발견하는 광장형 진입점.",
    page: "/plaza",
    entrance: [
      "/llms.txt",
      "/llms-full.txt",
      "/.well-known/agent.json",
      "/.well-known/mcp.json",
      "/openapi.json",
      "/robots.txt",
    ],
    principles: ["source first", "permission aware", "route before answer", "human on risk"],
    agents: AGENT_TYPES,
    capabilities: CAPABILITIES,
    tasks: TASKS,
    trustMetrics: TRUST_METRICS,
  });
}
