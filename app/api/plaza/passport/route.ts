export const runtime = "nodejs";
export const dynamic = "force-static";

const passportSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kgov-ready-demo.vercel.app/schemas/agent-passport.v0.json",
  title: "K-Gov Agent Passport",
  type: "object",
  required: ["agent_id", "agent_type", "operator", "declared_purpose", "requested_capabilities", "prohibited_actions", "audit"],
  properties: {
    agent_id: { type: "string", description: "Globally understandable agent identifier" },
    agent_type: { type: "string", enum: ["institutional-agent", "citizen-assistant", "research-crawler", "service-router"] },
    operator: {
      type: "object",
      required: ["name", "contact"],
      properties: {
        name: { type: "string" },
        jurisdiction: { type: "string" },
        contact: { type: "string" },
      },
    },
    declared_purpose: { type: "string" },
    requested_capabilities: {
      type: "array",
      items: { type: "string" },
    },
    prohibited_actions: {
      type: "array",
      items: { type: "string" },
    },
    audit: {
      type: "object",
      properties: {
        source_retention: { type: "boolean" },
        decision_log_required: { type: "boolean" },
        human_review_on_risk: { type: "boolean" },
      },
    },
  },
};

export async function GET() {
  return Response.json({
    name: "K-Gov Agent Passport",
    purpose: "정부 광장에 접근하는 AI 에이전트가 정체, 목적, 권한, 금지행위, 감사 조건을 선언하는 최소 출입증 스키마.",
    schema: passportSchema,
    example: {
      agent_id: "citizen-assistant.example.kr",
      agent_type: "citizen-assistant",
      operator: {
        name: "Example Citizen Assistant",
        jurisdiction: "KR",
        contact: "ops@example.kr",
      },
      declared_purpose: "공개 정부 문서 검색, 제도 후보 정리, 신청 전 체크리스트 생성",
      requested_capabilities: ["read", "search", "summarize", "classify", "draft_before_submit"],
      prohibited_actions: ["final_submit_without_human_review", "sensitive_data_reuse", "rights_or_disposition_decision"],
      audit: {
        source_retention: true,
        decision_log_required: true,
        human_review_on_risk: true,
      },
    },
  });
}
