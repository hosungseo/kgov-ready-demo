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

  const md = [
    `# ${m.nameKo} (${m.nameEn})`,
    "",
    m.mission,
    "",
    "## 주요 서비스",
    "",
    ...m.services.flatMap((s) => [
      `### ${s.title}`,
      "",
      s.desc,
      "",
      `- URL: ${SITE_URL}/${m.slug}${s.href}`,
      "",
    ]),
    "## 연락처",
    "",
    `- 이메일: ${m.contact.email}`,
    `- 전화: ${m.contact.phone}`,
    `- 주소: ${m.address}`,
    "",
    "---",
    "",
    `* 원본 사이트: ${m.originalUrl}`,
    `* 본 페이지는 시연용 데모.`,
  ].join("\n");

  return new Response(md, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
