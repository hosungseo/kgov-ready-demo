export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const body = [
    "Contact: mailto:security@kgov-ready-demo.vercel.app",
    "Expires: 2028-01-01T00:00:00Z",
    "Preferred-Languages: ko, en",
    "Canonical: https://kgov-ready-demo.vercel.app/.well-known/security.txt",
    "Policy: https://kgov-ready-demo.vercel.app/about",
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
