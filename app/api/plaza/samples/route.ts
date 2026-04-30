import { DEEP_SAMPLES } from "@/lib/deep-samples";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return Response.json({ name: "K-Gov Agent Plaza Deep Samples", samples: DEEP_SAMPLES });
}
