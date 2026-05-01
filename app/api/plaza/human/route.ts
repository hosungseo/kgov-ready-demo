import { HUMAN_CONSOLE_PACKET, HUMAN_JOURNEY, HUMAN_TRUST_CARDS } from "@/lib/human-console";
export const runtime = "nodejs"; export const dynamic = "force-static";
export async function GET() { return Response.json({ ...HUMAN_CONSOLE_PACKET, journey: HUMAN_JOURNEY, trustCards: HUMAN_TRUST_CARDS }); }
