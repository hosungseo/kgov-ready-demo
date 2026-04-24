const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const manifest = {
    schema_version: "0.1",
    name: "kgov-ready-demo",
    description:
      "대한민국 19개 중앙부처 시안의 데이터·엔드포인트 MCP 디스커버리 (데모)",
    transports: [
      {
        type: "http",
        url: `${SITE_URL}/mcp`,
        auth: { type: "oauth2", discovery: `${SITE_URL}/.well-known/openid-configuration` },
      },
    ],
    capabilities: {
      resources: [
        { uri: `${SITE_URL}/llms.txt`, description: "사이트 루트 llms.txt" },
        { uri: `${SITE_URL}/llms-full.txt`, description: "전체 본문 번들" },
        { uri: `${SITE_URL}/openapi.json`, description: "OpenAPI 3.1 스펙" },
      ],
      tools: [
        {
          name: "search_ministries",
          description: "부처 이름/영문명/미션/서비스에서 키워드로 검색",
          inputSchema: {
            type: "object",
            properties: { q: { type: "string" } },
            required: ["q"],
          },
        },
        {
          name: "get_ministry",
          description: "슬러그로 특정 부처의 구조화 정보 반환",
          inputSchema: {
            type: "object",
            properties: { slug: { type: "string" } },
            required: ["slug"],
          },
        },
      ],
    },
    contact: "agent@kgov-ready-demo.vercel.app",
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
