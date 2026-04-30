import { BOTTLENECK_TYPES, SAMPLE_BOTTLENECK_REPORTS, createBottleneckReport } from "@/lib/bottlenecks";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (q?.trim()) {
    return Response.json(createBottleneckReport(q));
  }

  return Response.json({
    name: "K-Gov Agent Bottleneck Reports",
    purpose:
      "에이전트가 민원 처리 중 발견한 인간 병목, 제도 병목, 서식 병목을 구조화된 개선 건의로 남긴다.",
    types: BOTTLENECK_TYPES,
    samples: SAMPLE_BOTTLENECK_REPORTS,
    reportSchema: {
      reportKind: "agent-bottleneck-report",
      service: "string",
      userIntent: "string",
      agentHandled: "string[]",
      stoppedAt: "string",
      bottleneckType: "string",
      proposedChange: "string",
      expectedImpact: "string",
      humanReviewStillNeeded: "string",
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const q = typeof body.q === "string" ? body.q : "";
  if (!q.trim()) {
    return Response.json({ error: "Missing q in JSON body" }, { status: 400 });
  }
  return Response.json(createBottleneckReport(q));
}
