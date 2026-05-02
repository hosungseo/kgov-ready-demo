export const HUMAN_JOURNEY = [
  {
    id: "say-it-naturally",
    label: "말하기",
    citizen: "부처명이나 메뉴명을 몰라도 자연어로 상황을 말한다.",
    official: "사용자 발화를 과업·위험도·필요 정보로 나눠 받는다.",
    reassurance: "처음부터 정확한 양식을 알 필요가 없습니다.",
  },
  {
    id: "see-the-route",
    label: "경로 보기",
    citizen: "에이전트가 어떤 기관·문서·API 후보를 찾았는지 본다.",
    official: "자동 라우팅 근거와 담당 후보를 함께 확인한다.",
    reassurance: "어디로 가는지 숨기지 않고 보여줍니다.",
  },
  {
    id: "approve-boundaries",
    label: "경계 승인",
    citizen: "개인정보, 제출, 권리 판단처럼 중요한 지점에서 멈춤을 확인한다.",
    official: "사람 판단이 필요한 부분과 자동 처리 가능한 부분을 분리한다.",
    reassurance: "에이전트가 마음대로 제출하거나 판단하지 않습니다.",
  },
  {
    id: "track-progress",
    label: "진행 추적",
    citizen: "내 요청이 접수·분류·검토·완료 중 어디에 있는지 본다.",
    official: "병목과 반복 문의를 기록으로 남겨 업무 개선에 쓴다.",
    reassurance: "처리 과정이 블랙박스가 되지 않습니다.",
  },
  {
    id: "leave-feedback",
    label: "개선 남기기",
    citizen: "막힌 지점이 있었다면 쉽게 불편과 개선 제안을 남긴다.",
    official: "자유글을 병목 report로 구조화해 제도개선 이슈로 묶는다.",
    reassurance: "불편은 민원이 아니라 개선 데이터가 됩니다.",
  },
];

export const HUMAN_TRUST_CARDS = [
  { title: "에이전트가 한 일", body: "읽은 문서, 만든 초안, 추천한 경로를 사람이 이해할 수 있는 말로 보여준다." },
  { title: "에이전트가 하지 않은 일", body: "제출, 처분 판단, 민감정보 재사용처럼 멈춘 지점을 명확히 표시한다." },
  { title: "사람이 확인할 일", body: "담당자·시민이 확인해야 할 항목을 체크리스트로 남긴다." },
  { title: "왜 이 경로인가", body: "부처·문서·API 후보를 추천한 근거를 숨기지 않는다." },
  { title: "왜 여기서 멈췄는가", body: "친절함이나 자동화율보다 사람 검토가 우선되는 순간을 별도 표시하고, 그 이유를 drift/guardrail 관점에서 설명한다." },
];

export const HUMAN_CONSOLE_PACKET = {
  name: "K-Gov Human Console",
  goal: "A human-facing surface that makes agentic public service understandable, consentful, and accountable.",
  audience: ["citizen", "public official", "service designer"],
  journey: HUMAN_JOURNEY.map((j) => j.id),
  trustCards: HUMAN_TRUST_CARDS.map((c) => c.title),
  guardrails: {
    driftMonitor: "/plaza/drift",
    driftApi: "/api/plaza/drift",
    humanQuestion: "왜 여기서 멈췄는가?",
    promise: "매끄러운 자동처리보다 멈춤 이유와 사람 확인 지점을 먼저 보여준다.",
  },
};
