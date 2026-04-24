import { MINISTRIES } from "@/lib/ministries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const out: string[] = [];
  out.push("# K-Gov Agent-Ready 시안 — 전체 본문");
  out.push("");
  out.push(
    "> 19개 중앙부처 시안의 전체 본문을 한 파일에 평탄화. 에이전트가 사이트 전체 맥락을 한 번에 학습/요약하기 위한 번들.",
  );
  out.push("");
  for (const m of MINISTRIES) {
    out.push(`## ${m.nameKo} (${m.nameEn})`);
    out.push("");
    out.push(`URL: ${SITE_URL}/${m.slug}`);
    out.push(`원사이트: ${m.originalUrl}`);
    out.push("");
    out.push(`### 미션`);
    out.push(m.mission);
    out.push("");
    out.push(`### 주요 서비스`);
    for (const s of m.services) {
      out.push(`- **${s.title}** — ${s.desc} (${SITE_URL}/${m.slug}${s.href})`);
    }
    out.push("");
    out.push(`### 연락처`);
    out.push(`- 이메일: ${m.contact.email}`);
    out.push(`- 전화: ${m.contact.phone}`);
    out.push(`- 주소: ${m.address}`);
    out.push("");
    out.push("---");
    out.push("");
  }
  return new Response(out.join("\n") + "\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
