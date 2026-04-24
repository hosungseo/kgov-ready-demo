const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const plugin = {
    schema_version: "v1",
    name_for_human: "K-Gov Agent-Ready",
    name_for_model: "kgov_ready",
    description_for_human:
      "대한민국 19개 중앙부처 시안 데이터 접근 (데모)",
    description_for_model:
      "Query Korean central ministries (mission, services, contact) via the K-Gov Agent-Ready demo. All data is for demonstration purposes.",
    auth: { type: "none" },
    api: { type: "openapi", url: `${SITE_URL}/openapi.json` },
    logo_url: `${SITE_URL}/icon-512.png`,
    contact_email: "agent@kgov-ready-demo.vercel.app",
    legal_info_url: `${SITE_URL}/about`,
  };
  return new Response(JSON.stringify(plugin, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
