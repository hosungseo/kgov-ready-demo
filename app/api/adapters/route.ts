import { OPENCLI_ADAPTERS } from "@/lib/opencli-adapters";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return Response.json({
    name: "K-Gov OpenCLI-style Adapter Catalog",
    description:
      "공공 웹사이트와 데이터포털을 agent가 발견·검증·호출할 수 있는 adapter-first catalog로 노출한다.",
    philosophy: [
      "command surface before screen surface",
      "official API before UI scraping",
      "metadata and source URL before summary",
      "small smoke-verified adapters before broad automation",
    ],
    adapters: OPENCLI_ADAPTERS,
  });
}
