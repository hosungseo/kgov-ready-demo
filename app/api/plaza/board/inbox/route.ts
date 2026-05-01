import { FREEFORM_NOTES, parseFreeformNote } from "@/lib/agent-board";
export const runtime = "nodejs";
export async function GET() { return Response.json({ name: "Agent Board Freeform Inbox", flow: ["freeform", "parsed", "queued", "reviewed", "published", "merged"], notes: FREEFORM_NOTES }); }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const raw = typeof body.raw_note === "string" ? body.raw_note : "";
  if (!raw.trim()) return Response.json({ error: "Missing raw_note" }, { status: 400 });
  return Response.json({ accepted: true, note: parseFreeformNote(raw, body.agent_id || "anonymous-agent") }, { status: 202 });
}
