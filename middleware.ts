import { NextResponse, type NextRequest } from "next/server";
import { MINISTRIES } from "@/lib/ministries";

const SLUGS = new Set(MINISTRIES.map((m) => m.slug));

export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept") ?? "";
  if (!accept.includes("text/markdown")) return NextResponse.next();

  const path = req.nextUrl.pathname;
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
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/:slug"],
};
