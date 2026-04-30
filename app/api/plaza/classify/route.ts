import { classifyIntent } from "@/lib/plaza";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  if (!q.trim()) {
    return Response.json({ error: "Missing q query parameter" }, { status: 400 });
  }
  return Response.json(classifyIntent(q));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const q = typeof body.q === "string" ? body.q : "";
  if (!q.trim()) {
    return Response.json({ error: "Missing q in JSON body" }, { status: 400 });
  }
  return Response.json(classifyIntent(q));
}
