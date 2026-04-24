import { MINISTRY_BY_SLUG } from "@/lib/ministries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const m = MINISTRY_BY_SLUG[slug];
  if (!m) return new Response("Not Found", { status: 404 });

  const lines = [
    `# ${m.nameKo}`,
    "",
    `> ${m.mission}`,
    "",
    `- 영문: ${m.nameEn}`,
    `- 사이트: ${SITE_URL}/${m.slug}`,
    `- 원사이트: ${m.originalUrl}`,
    "",
    "## 주요 서비스",
    ...m.services.map((s) => `- [${s.title}](${SITE_URL}/${m.slug}${s.href}): ${s.desc}`),
    "",
    "## 연락처",
    `- 이메일: ${m.contact.email}`,
    `- 전화: ${m.contact.phone}`,
    `- 주소: ${m.address}`,
    "",
    "## 마크다운 원문",
    `[${SITE_URL}/${m.slug}/index.md](${SITE_URL}/${m.slug}/index.md)`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
