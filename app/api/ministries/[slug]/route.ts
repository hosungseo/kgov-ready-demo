import { MINISTRY_BY_SLUG } from "@/lib/ministries";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const m = MINISTRY_BY_SLUG[slug];
  if (!m) return new Response("Not Found", { status: 404 });
  return Response.json(m);
}

export function generateStaticParams() {
  return Object.keys(MINISTRY_BY_SLUG).map((slug) => ({ slug }));
}
