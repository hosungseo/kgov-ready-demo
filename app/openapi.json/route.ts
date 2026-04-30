import { MINISTRIES } from "@/lib/ministries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "K-Gov Agent-Ready Demo API",
      version: "0.1.0",
      description:
        "19개 중앙부처 시안의 데이터 API (데모). 부처 목록·개별 부처 조회·서비스 탐색·Agent Plaza 라우팅 엔드포인트 제공.",
      contact: { email: "agent@kgov-ready-demo.vercel.app" },
      license: { name: "MIT" },
    },
    servers: [{ url: SITE_URL }],
    paths: {
      "/api/ministries": {
        get: {
          summary: "19개 부처 목록",
          operationId: "listMinistries",
          responses: {
            "200": {
              description: "부처 배열",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/Ministry" } },
                },
              },
            },
          },
        },
      },
      "/api/plaza": {
        get: {
          summary: "Agent Plaza 과업 라우팅",
          operationId: "getAgentPlaza",
          responses: {
            "200": {
              description: "에이전트용 광장 진입점과 과업별 라우팅 정보",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AgentPlaza" },
                },
              },
            },
          },
        },
      },
      "/api/ministries/{slug}": {
        get: {
          summary: "특정 부처 조회",
          operationId: "getMinistry",
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string", enum: MINISTRIES.map((m) => m.slug) },
            },
          ],
          responses: {
            "200": {
              description: "부처 객체",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Ministry" },
                },
              },
            },
            "404": { description: "해당 슬러그 없음" },
          },
        },
      },
    },
    components: {
      schemas: {
        AgentPlaza: {
          type: "object",
          required: ["name", "description", "entrance", "tasks"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            page: { type: "string" },
            entrance: { type: "array", items: { type: "string" } },
            principles: { type: "array", items: { type: "string" } },
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  route: { type: "array", items: { type: "string" } },
                  endpoints: { type: "array", items: { type: "string" } },
                  humanReview: { type: "string" },
                },
              },
            },
          },
        },
        Ministry: {
          type: "object",
          required: ["slug", "nameKo", "nameEn", "mission"],
          properties: {
            slug: { type: "string" },
            nameKo: { type: "string" },
            nameEn: { type: "string" },
            originalUrl: { type: "string", format: "uri" },
            mission: { type: "string" },
            services: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  desc: { type: "string" },
                  href: { type: "string" },
                },
              },
            },
            contact: {
              type: "object",
              properties: {
                email: { type: "string", format: "email" },
                phone: { type: "string" },
              },
            },
            address: { type: "string" },
          },
        },
      },
    },
  };
  return new Response(JSON.stringify(spec, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
