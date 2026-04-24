import { ImageResponse } from "next/og";
import { MINISTRY_BY_SLUG } from "@/lib/ministries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const m = slug ? MINISTRY_BY_SLUG[slug] : null;
  const title = m?.nameKo ?? "K-Gov Agent-Ready 시안";
  const subtitle = m?.mission ?? "19개 중앙부처를 AI 에이전트용으로 다시 짠 시연";
  const accent = m?.accent ?? "#0b2e5a";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          background: "#fafaf7",
          color: "#0a0a0a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 4,
            color: accent,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          K-Gov · Agent-Ready Demo
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            color: "#525252",
            lineHeight: 1.4,
            maxWidth: 1040,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            alignItems: "center",
            gap: 20,
            fontSize: 22,
            color: "#737373",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "10px 20px",
              borderRadius: 999,
              background: accent,
              color: "white",
              fontWeight: 700,
            }}
          >
            23/23 checks
          </div>
          <div>llms.txt · MCP · OpenAPI · OIDC · JSON-LD</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
