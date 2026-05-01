import { BOARD_SCHEMA } from "@/lib/agent-board";
export const runtime = "nodejs"; export const dynamic = "force-static";
export async function GET() { return Response.json(BOARD_SCHEMA); }
