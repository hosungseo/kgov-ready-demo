import { DRIFT_SCENARIOS, DRIFT_SIGNALS, REWARD_AUDIT_CHECKS, REWARD_AUDIT_PACKET } from "@/lib/behavior-drift";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return Response.json({
    ...REWARD_AUDIT_PACKET,
    signals: DRIFT_SIGNALS,
    rewardAuditChecks: REWARD_AUDIT_CHECKS,
    scenarios: DRIFT_SCENARIOS,
  });
}
