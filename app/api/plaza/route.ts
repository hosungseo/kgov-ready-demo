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
    guardrails: {
      behaviorDriftMonitor: "/plaza/drift",
      behaviorDriftApi: "/api/plaza/drift",
      note: "친절함·해결률·자동처리율 보상이 사람 검토 경계와 근거 보존을 잠식하지 않는지 따로 감시한다.",
    },
    agents: AGENT_TYPES,
    capabilities: CAPABILITIES,
    tasks: TASKS,
    trustMetrics: TRUST_METRICS,
  });
}
