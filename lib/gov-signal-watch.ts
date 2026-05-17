export const GOV_SIGNAL_WATCH = {
  name: "Gov Signal Watch",
  slug: "gov-signal-watch",
  page: "/plaza/signals",
  api: "/api/plaza/signals",
  cadence: ["10:00", "14:00", "18:00", "22:00"],
  latestScan: "05.18 · 00:00 KST",
  thesis:
    "정부 공식 source를 하루 여러 번 스캔해 정책 신호를 짧은 brief, 근거 점수, 다음 행정행동으로 정리한다.",
  agentThesis:
    "사람용 뉴스피드가 아니라 에이전트가 바로 route, verify, brief, watch 할 수 있는 공식 신호 계기판.",
  stats: [
    { label: "source families", value: "12" },
    { label: "scan slots / day", value: "4" },
    { label: "agent fields", value: "9" },
    { label: "latest posture", value: "brief-ready" },
  ],
};

export const GOV_SIGNAL_SOURCES = [
  {
    family: "Policy",
    source: "policy.news + korea.kr readable",
    signal: "부처 보도자료, 정책뉴스, 설명자료",
    agentUse: "lead narrative와 발표 주체를 잡되 법적 근거와 분리한다.",
  },
  {
    family: "Law",
    source: "law.go.kr current/history",
    signal: "현행 법령, 시행일, 연혁",
    agentUse: "근거 조문, 위임 근거, 개정 시점을 확인한다.",
  },
  {
    family: "Official notice",
    source: "전자관보",
    signal: "고시, 공고, 입법예고, 행정예고",
    agentUse: "발표가 공식 행정행위로 이어졌는지 확인한다.",
  },
  {
    family: "Assembly",
    source: "국회 의안/일정",
    signal: "토론회, 법안, 상임위 신호",
    agentUse: "정치·입법 관심도와 예상 질의 축을 만든다.",
  },
  {
    family: "Citizen service",
    source: "정부24 / 보조금24",
    signal: "신청 서비스, 민원, 지원사업",
    agentUse: "국민 체감 접점을 찾고 action으로 연결한다.",
  },
  {
    family: "Data",
    source: "공공데이터포털 / KOSIS / ECOS",
    signal: "통계, 지표, 행정 데이터셋",
    agentUse: "주장의 배경 조건과 수치 근거를 보강한다.",
  },
];

export const GOV_SIGNAL_SCORE_AXES = [
  { axis: "authority", desc: "공식 source인지, 소관기관이 명확한지" },
  { axis: "recency", desc: "최근 scan에서 새로 들어온 신호인지" },
  { axis: "public impact", desc: "국민 서비스, 권리·의무, 예산에 닿는지" },
  { axis: "legal coupling", desc: "법령·관보·행정규칙으로 이어지는지" },
  { axis: "agent actionability", desc: "route, brief, compare, watch 명령으로 바로 바뀌는지" },
  { axis: "source health", desc: "API/readable/crawl이 정상이고 오류가 기록되는지" },
];

export const GOV_SIGNAL_BRIEFS = [
  {
    id: "participation-outsourcing",
    slot: "night",
    time: "22:00",
    category: "국민참여",
    title: "국민참여형 공공서비스와 민간위탁 제도 개선",
    summary:
      "국민참여 활성화를 단순 의견수렴이 아니라 민간·비영리·지역사회가 공공서비스 설계와 전달에 참여하는 구조로 확장한다. 민간위탁은 효율성 수단을 넘어 참여형 서비스 전달체계의 제도적 통로로 재해석할 수 있다.",
    sourceLine: "policy query 민간위탁 · law query 행정권한의 위임 및 위탁에 관한 규정",
    route: "legal-deep-dive",
    nextAction: "위탁 사무 유형, 수탁자 선정, 이용자 의견 반영, 감독책임 기준을 비교표로 만든다.",
    scores: { authority: 82, recency: 70, publicImpact: 78, legalCoupling: 88, actionability: 92, sourceHealth: 76 },
  },
  {
    id: "supply-chain-procurement",
    slot: "evening",
    time: "18:00",
    category: "공급망",
    title: "조달·비축 정책 신호와 법령·관보 follow-up",
    summary:
      "정책 발표는 lead narrative가 되지만, 브리핑 신뢰도는 법령 연혁, 관보 고시, 국회 일정, 통계 지표가 함께 살아 있는지에 따라 달라진다.",
    sourceLine: "policy.news 조달청 · law.go.kr 정부조직법 · ECOS 기준금리",
    route: "brief-now",
    nextAction: "casefile을 export하고 onepager.md를 정책 briefing 초안으로 사용한다.",
    scores: { authority: 88, recency: 74, publicImpact: 70, legalCoupling: 72, actionability: 86, sourceHealth: 92 },
  },
  {
    id: "ai-public-service",
    slot: "afternoon",
    time: "14:00",
    category: "공공AX",
    title: "AI 기반 공공서비스 전환과 책임성 경계",
    summary:
      "AI 활용 정책은 속도가 빠르지만 권한행사, 개인정보, 설명가능성, 민간 솔루션 의존 문제가 함께 움직인다. agent는 편의보다 권한경계와 human review를 먼저 표시해야 한다.",
    sourceLine: "국회 AI 일정 · 정부24 서비스 · 정책자료 readable",
    route: "official-signal-narrowing",
    nextAction: "국회 일정과 관보·입법예고를 좁혀 공식 follow-up 신호를 찾는다.",
    scores: { authority: 76, recency: 84, publicImpact: 80, legalCoupling: 62, actionability: 78, sourceHealth: 74 },
  },
];

export const GOV_SIGNAL_AGENT_FIELDS = [
  "id",
  "generated_at",
  "source_family",
  "official_url",
  "ministry_or_agency",
  "authority_score",
  "legal_coupling",
  "recommended_route",
  "next_action_command",
];
