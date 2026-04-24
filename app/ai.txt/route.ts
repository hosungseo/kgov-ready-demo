export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const body = [
    "# https://spawning.ai/ai-txt",
    "# K-Gov Agent-Ready demo — AI usage policy",
    "",
    "User-Agent: *",
    "Allow: /",
    "Disallow: /private/",
    "",
    "# 시연용 데모 콘텐츠입니다. 학습·인용은 자유롭게 가능하나",
    "# 출처 표기(attribution)를 권장합니다.",
    "Attribution: https://github.com/hosungseo/kgov-ready-demo",
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
