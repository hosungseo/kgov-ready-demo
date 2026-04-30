import { DEEP_SAMPLES, getDeepSample } from "@/lib/deep-samples";

export const runtime = "nodejs";

export function generateStaticParams() {
  return DEEP_SAMPLES.map((sample) => ({ slug: sample.slug }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sample = getDeepSample(slug);
  if (!sample) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(sample);
}
