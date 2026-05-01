import { BOARD_REPORTS, validateBoardDraft } from "@/lib/agent-board";
export const runtime = "nodejs";
export async function GET() { return Response.json({ reports: BOARD_REPORTS }); }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const validation = validateBoardDraft(body);
  return Response.json({
    accepted: validation.ok,
    assigned_state: validation.state,
    validation,
    note: "Demo endpoint: this validates and echoes the report. A production board would persist it to a database and run duplicate clustering.",
    report: body,
  }, { status: validation.ok ? 202 : 400 });
}
