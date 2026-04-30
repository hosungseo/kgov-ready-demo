import { MINISTRY_READINESS, READINESS_CRITERIA, BEFORE_AFTER_FLOWS } from "@/lib/readiness";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return Response.json({
    name: "K-Gov Agent Readiness Ranking",
    criteria: READINESS_CRITERIA,
    ministries: MINISTRY_READINESS,
    flows: BEFORE_AFTER_FLOWS,
  });
}
