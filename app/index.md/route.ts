import { MINISTRIES } from "@/lib/ministries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const md = [
    `# K-Gov Agent-Ready 시안`,
    "",
    `대한민국 19개 중앙부처 사이트를 AI 에이전트용으로 다시 짠 시연 모음.`,
    "",
    `## 19개 부처`,
    "",
    ...MINISTRIES.map((m) => `- [${m.nameKo}](${SITE_URL}/${m.slug}): ${m.mission}`),
    "",
    `본 사이트는 시연용 데모. 자세한 사용법은 [llms.txt](${SITE_URL}/llms.txt) 참고.`,
    "",
  ].join("\n");
  return new Response(md, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
