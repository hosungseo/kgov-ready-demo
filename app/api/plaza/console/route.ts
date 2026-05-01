import { AGENT_CONSOLE_PACKET, AGENT_CONSOLE_STEPS, AGENT_UI_PRINCIPLES } from "@/lib/agent-console";
export const runtime = "nodejs"; export const dynamic = "force-static";
export async function GET() { return Response.json({ ...AGENT_CONSOLE_PACKET, steps: AGENT_CONSOLE_STEPS, uiPrinciples: AGENT_UI_PRINCIPLES }); }
