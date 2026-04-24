import type { Metadata } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kgov-ready-demo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "K-Gov Agent-Ready 시안 — 19개 부처 데모",
    template: "%s · K-Gov Agent-Ready",
  },
  description:
    "대한민국 19개 중앙부처 사이트를 AI 에이전트가 읽을 수 있게 다시 짠 시안. llms.txt · MCP · JSON-LD · OpenAPI · OIDC 등 23가지 표준을 모두 만족합니다.",
  alternates: {
    canonical: "/",
    types: {
      "text/markdown": "/index.md",
      "application/rss+xml": "/feed.xml",
    },
    languages: {
      "ko-KR": "/",
      "en-US": "/en/",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "K-Gov Agent-Ready 시안",
    description: "19개 중앙부처를 AI 에이전트용으로 다시 짠 시안",
    url: SITE_URL,
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  other: {
    "agent-ready": "23/23",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* hreflang */}
        <link rel="alternate" hrefLang="ko" href={SITE_URL + "/"} />
        <link rel="alternate" hrefLang="en" href={SITE_URL + "/en/"} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL + "/"} />
        {/* AI bot policy hint */}
        <meta name="ai-policy" content="/ai.txt" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
