import { AGENT_TYPES, CAPABILITIES, TASKS, TRUST_METRICS } from "@/lib/plaza";
import { GOV_SIGNAL_SCORE_AXES, GOV_SIGNAL_WATCH } from "@/lib/gov-signal-watch";
import { OPENCLI_ADAPTERS } from "@/lib/opencli-adapters";
import { ISSUE_ARTIFACTS, ISSUE_GEO_FLOW, ISSUE_PIPELINE, ISSUE_WORKFLOW } from "@/lib/issue-workflow";

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
    adapterCatalog: {
      endpoint: "/api/adapters",
      philosophy: "OpenCLI-style: command surface before screen surface, smoke-verified adapters before broad automation.",
      adapters: OPENCLI_ADAPTERS,
    },
    issueWorkflow: {
      page: "/plaza/issues",
      ...ISSUE_WORKFLOW,
      pipeline: ISSUE_PIPELINE,
      geo: ISSUE_GEO_FLOW,
      artifacts: ISSUE_ARTIFACTS,
    },
    signalWatch: {
      ...GOV_SIGNAL_WATCH,
      scoreAxes: GOV_SIGNAL_SCORE_AXES,
      endpoint: GOV_SIGNAL_WATCH.api,
      note: "Trend-style recurring scan feed를 정부 공식 source, 법령 결합도, next action 중심으로 변환한 agent-friendly signal layer.",
    },
    agents: AGENT_TYPES,
    capabilities: CAPABILITIES,
    tasks: TASKS,
    trustMetrics: TRUST_METRICS,
  });
}
