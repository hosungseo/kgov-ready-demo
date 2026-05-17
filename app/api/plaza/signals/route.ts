import {
  GOV_SIGNAL_AGENT_FIELDS,
  GOV_SIGNAL_BRIEFS,
  GOV_SIGNAL_SCORE_AXES,
  GOV_SIGNAL_SOURCES,
  GOV_SIGNAL_WATCH,
} from "@/lib/gov-signal-watch";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return Response.json({
    ...GOV_SIGNAL_WATCH,
    agentFields: GOV_SIGNAL_AGENT_FIELDS,
    scoreAxes: GOV_SIGNAL_SCORE_AXES,
    sourceBank: GOV_SIGNAL_SOURCES,
    briefs: GOV_SIGNAL_BRIEFS,
    machineReadable:
      "Each brief is designed to become an issue.workflow command, casefile, onepager, or watch task without scraping the visual page.",
  });
}
