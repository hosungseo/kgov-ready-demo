import { MINISTRIES } from "@/lib/ministries";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return Response.json(MINISTRIES);
}
