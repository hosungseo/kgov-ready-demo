import { MINISTRIES } from "@/lib/ministries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const card = {
    name: "K-Gov Agent-Ready",
    description:
      "대한민국 19개 중앙부처 시안 — 에이전트가 한 곳에서 부처별 서비스·연락처·구조화 데이터에 접근.",
    version: "0.1",
    language: "ko",
    homepage: SITE_URL,
    endpoints: {
      llms_txt: `${SITE_URL}/llms.txt`,
      llms_full: `${SITE_URL}/llms-full.txt`,
      openapi: `${SITE_URL}/openapi.json`,
      mcp: `${SITE_URL}/.well-known/mcp.json`,
      oidc: `${SITE_URL}/.well-known/openid-configuration`,
      sitemap: `${SITE_URL}/sitemap.xml`,
    },
    ministries: MINISTRIES.map((m) => ({
      slug: m.slug,
      name: m.nameKo,
      name_en: m.nameEn,
      url: `${SITE_URL}/${m.slug}`,
      llms: `${SITE_URL}/${m.slug}/llms.txt`,
      markdown: `${SITE_URL}/${m.slug}/index.md`,
      original: m.originalUrl,
    })),
    contact: "agent@kgov-ready-demo.vercel.app",
    license: "MIT (code) · CC-BY-4.0 (content)",
  };
  return new Response(JSON.stringify(card, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
