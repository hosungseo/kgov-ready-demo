import { NextResponse, type NextRequest } from "next/server";
import { MINISTRIES } from "@/lib/ministries";
import { detectAgent, extractTargetSlug, logVisit } from "@/lib/tracking";

export const runtime = "nodejs";

const SLUGS = new Set(MINISTRIES.map((m) => m.slug));

function shouldSkip(path: string): boolean {
  return (
    path.startsWith("/_next/") ||
    path.startsWith("/api/_") ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|map|woff2?)$/.test(path)
  );
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // --- Agent visit telemetry ---
  if (!shouldSkip(path)) {
    const ua = req.headers.get("user-agent") ?? "";
    const agent = detectAgent(ua);
    if (agent) {
      await logVisit({
        ts: Date.now(),
        ua: ua.slice(0, 240),
        agent: agent.name,
        kind: agent.kind,
        path,
        slug: extractTargetSlug(path),
        accept: (req.headers.get("accept") ?? "").slice(0, 120),
        ref: (req.headers.get("referer") ?? "").slice(0, 240),
        country: req.headers.get("x-vercel-ip-country") ?? undefined,
      });
    }
  }

  // --- Markdown content negotiation ---
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/markdown")) {
    if (path === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/index.md";
      return NextResponse.rewrite(url);
    }
    const m = path.match(/^\/([a-z]+)\/?$/);
    if (m && SLUGS.has(m[1])) {
      const url = req.nextUrl.clone();
      url.pathname = `/${m[1]}/index.md`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals + static assets but match everything else including
    // dotfiles in .well-known/ and files with extensions like llms.txt
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
