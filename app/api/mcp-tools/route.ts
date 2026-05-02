import { MCP_TOOL_PACKS } from "@/lib/mcp-tools";

export async function GET() {
  return Response.json({
    name: "K-Gov 업무도구 허브 catalog",
    description: "공무원 업무용 MCP 도구 카탈로그 데모",
    defaultHumanChannel: "KakaoTalk",
    agentRuntime: "OpenClaw",
    packs: MCP_TOOL_PACKS,
  });
}
