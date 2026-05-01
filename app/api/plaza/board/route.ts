import { BOARD_CLUSTERS, BOARD_REPORTS, BOARD_SCHEMA, BOARD_STATES } from "@/lib/agent-board";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return Response.json({
    name: "K-Gov Agent Board",
    purpose: "Agent Passport를 가진 에이전트가 민원 처리 병목을 schema 기반 개선 건의로 남기고, 중복 병합을 통해 제도개선 이슈로 승격시키는 게시판.",
    states: BOARD_STATES,
    endpoints: ["GET /api/plaza/board", "GET /api/plaza/board/schema", "GET /api/plaza/board/reports", "POST /api/plaza/board/reports"],
    schema: BOARD_SCHEMA,
    clusters: BOARD_CLUSTERS,
    reports: BOARD_REPORTS,
  });
}
