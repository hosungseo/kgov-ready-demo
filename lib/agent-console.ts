export const AGENT_CONSOLE_STEPS = [
  {
    id: "identify",
    label: "Identify",
    question: "나는 누구이고 어떤 권한으로 들어왔나?",
    primary: "/plaza/passport",
    api: "/api/plaza/passport",
    output: "agent_passport_ref",
  },
  {
    id: "orient",
    label: "Orient",
    question: "사용자 과업은 어느 서비스·부처·문서로 가야 하나?",
    primary: "/plaza/playground",
    api: "/api/plaza/classify?q=...",
    output: "matched_task",
  },
  {
    id: "route",
    label: "Route",
    question: "공식 문서·API·담당기관 후보는 무엇인가?",
    primary: "/plaza/tasks",
    api: "/api/plaza",
    output: "route_candidates",
  },
  {
    id: "act-or-stop",
    label: "Act or Stop",
    question: "자동 처리해도 되는가, 사람 검토가 필요한가?",
    primary: "/plaza/trust",
    api: "/api/plaza/board/schema",
    output: "human_review_boundary",
  },
  {
    id: "record",
    label: "Record",
    question: "막힌 병목과 개선 건의는 어디에 남기는가?",
    primary: "/plaza/board/inbox",
    api: "/api/plaza/board/inbox",
    output: "bottleneck_report",
  },
];

export const AGENT_UI_PRINCIPLES = [
  "No mystery navigation: every card exposes the next URL and API endpoint.",
  "Permission before action: passport and capability boundaries appear before task execution.",
  "Stop states are first-class: human review is an output, not an error.",
  "Raw note is allowed: agents can write freeform observations before schema completion.",
  "Evidence sticks: source URLs, official documents, and confidence travel with every report.",
  "Reward pressure is audited: faster completion must not erase stop states, citations, or consent.",
];

export const AGENT_CONSOLE_PACKET = {
  name: "K-Gov Agent Console",
  goal: "An agent-facing operational surface for entering, routing, stopping, and recording public-service bottlenecks.",
  recommendedFlow: AGENT_CONSOLE_STEPS.map((s) => s.id),
  principles: AGENT_UI_PRINCIPLES,
  fastLinks: {
    entrance: ["/llms.txt", "/llms-full.txt", "/.well-known/agent.json", "/openapi.json"],
    work: ["/plaza/playground", "/plaza/tasks", "/plaza/samples"],
    record: ["/plaza/board", "/plaza/board/inbox", "/api/plaza/board/reports"],
    guardrails: ["/plaza/drift", "/api/plaza/drift"],
  },
  guardrailFocus: {
    question: "Did speed or confidence hide a stop state?",
    watchFor: ["overconfident-routing", "hidden-human-review", "citation-thinning"],
    preferredMetric: "human-review-compliance",
  },
};
