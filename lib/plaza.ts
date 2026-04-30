export const AGENT_TYPES = [
  {
    id: "institutional-agent",
    name: "기관 에이전트",
    desc: "공공기관 내부 업무 보조나 공식 서비스 운영을 위해 등록된 에이전트.",
    permissions: ["공개 문서 읽기", "기관 API 호출", "업무 초안 작성", "사람 승인 요청"],
    limits: ["처분 자동 확정 금지", "민감정보 재사용 금지", "승인 없는 외부 발송 금지"],
    risk: "medium-high",
  },
  {
    id: "citizen-assistant",
    name: "개인 비서 에이전트",
    desc: "국민 개인을 대신해 공개 정보를 찾고 민원 준비를 돕는 에이전트.",
    permissions: ["공개 문서 검색", "제도 후보 정리", "신청서 초안", "누락 위험 알림"],
    limits: ["자격 확정 금지", "개인정보 최소 처리", "최종 제출 전 사람 확인"],
    risk: "medium",
  },
  {
    id: "research-crawler",
    name: "연구·언론 분석 에이전트",
    desc: "정책 문서, 보도자료, 관보, 통계를 분석하는 읽기 중심 에이전트.",
    permissions: ["공개 문서 대량 읽기", "출처 기반 요약", "변화 탐지", "인용 후보 생성"],
    limits: ["robots 정책 준수", "출처 보존", "인용 왜곡 금지"],
    risk: "low-medium",
  },
  {
    id: "service-router",
    name: "서비스 라우팅 에이전트",
    desc: "사용자 요청을 과업, 부처, 공식 문서, API, 사람 검토 지점으로 분기하는 에이전트.",
    permissions: ["민원 유형 분류", "부처 후보 추천", "공식 경로 안내", "human review 분기"],
    limits: ["최종 책임기관 단정 금지", "고위험 사안 자동 처리 금지", "근거 없는 추천 금지"],
    risk: "medium",
  },
];

export const CAPABILITIES = [
  { name: "읽기", risk: "low", desc: "공개 문서, llms.txt, sitemap, index.md를 읽는다." },
  { name: "검색", risk: "low", desc: "공식 문서와 부처 페이지 후보를 찾는다." },
  { name: "요약", risk: "low-medium", desc: "원문 출처를 보존하며 문서를 요약한다." },
  { name: "분류", risk: "medium", desc: "자연어 요청을 과업·부처·문서 후보로 나눈다." },
  { name: "신청서 초안", risk: "medium-high", desc: "제출 전 사람 확인을 전제로 민원·신청 초안을 만든다." },
  { name: "API 호출", risk: "medium-high", desc: "권한 있는 범위에서 API를 호출하고 로그를 남긴다." },
  { name: "사람 승인 요청", risk: "control", desc: "권리·처분·민감정보 경계에서 자동 실행을 멈춘다." },
];

export const TASKS = [
  {
    id: "safety-report-routing",
    title: "재난·안전 신고 라우팅",
    intent: "도로 파손, 빗물받이 막힘, 시설물 위험 같은 생활 신고를 어느 기관으로 보낼지 찾는다.",
    route: "행정안전부 · 국토교통부 · 지자체",
    routeIds: ["mois", "molit", "local-government"],
    endpoints: ["/mois/llms.txt", "/molit/llms.txt", "/openapi.json"],
    caution: "긴급 위험, 생명·신체 위험, 처분 연결 지점은 사람 검토가 필요하다.",
    prompts: ["빗물받이가 막혀서 도로가 잠길 것 같아요", "가로등이 꺼져서 밤에 위험합니다"],
  },
  {
    id: "welfare-discovery",
    title: "복지·지원 제도 탐색",
    intent: "출산, 보육, 주거, 생계, 돌봄 상황에서 가능한 제도 후보를 좁힌다.",
    route: "보건복지부 · 국토교통부 · 교육부",
    routeIds: ["mohw", "molit", "moe"],
    endpoints: ["/mohw/index.md", "/molit/index.md", "/moe/index.md"],
    caution: "자격 확정이 아니라 가능성, 추가 확인 항목, 담당기관을 분리해 안내한다.",
    prompts: ["아이가 태어났는데 받을 수 있는 지원이 있나요", "전세 보증금 지원을 찾고 있어요"],
  },
  {
    id: "business-industry-support",
    title: "사업자·수출·산업 지원",
    intent: "창업, 수출, 산업 지원, R&D 공고를 과업 중심으로 연결한다.",
    route: "중소벤처기업부 · 산업통상부 · 과학기술정보통신부",
    routeIds: ["mss", "motie", "msit"],
    endpoints: ["/mss/llms.txt", "/motie/llms.txt", "/msit/llms.txt"],
    caution: "신청 요건과 마감일은 원문 공고와 담당기관 확인을 우선한다.",
    prompts: ["수출 바우처 신청 가능한지 알고 싶어요", "AI R&D 지원 공고를 찾고 있어요"],
  },
  {
    id: "legal-policy-reference",
    title: "법령·지침 확인",
    intent: "정책 질문을 법령, 지침, 소관 부처, 공식 문서 후보로 나눈다.",
    route: "법무부 · 행정안전부 · 해당 소관 부처",
    routeIds: ["moj", "mois", "responsible-ministry"],
    endpoints: ["/moj/index.md", "/mois/index.md", "/llms-full.txt"],
    caution: "법률 자문이나 처분 판단은 자동화하지 않고 근거 문서 발견에 머문다.",
    prompts: ["이 제도의 근거 법령을 찾아줘", "처리 권한이 어느 기관에 있는지 알고 싶어"],
  },
  {
    id: "official-document-reading",
    title: "정부 문서 읽기",
    intent: "보도자료, 관보, 국무회의 자료처럼 공개 문서를 읽고 출처를 따라간다.",
    route: "부처별 공식 문서 · readable corpus",
    routeIds: ["official-documents", "readable-corpus"],
    endpoints: ["/llms.txt", "/sitemap.xml", "/openapi.json"],
    caution: "요약보다 출처, 원문 링크, 문서 날짜, 기관명을 먼저 보존한다.",
    prompts: ["행안부 최신 보도자료를 공식 출처로 찾아줘", "관보에서 고시 원문을 확인해줘"],
  },
  {
    id: "civil-complaint-classification",
    title: "민원 유형 분류",
    intent: "사용자의 자연어 요청을 담당 도메인과 처리 단계로 바꾼다.",
    route: "과업 → 부처 → 문서/API → 사람 검토",
    routeIds: ["task", "ministry", "document-or-api", "human-review"],
    endpoints: ["/.well-known/agent.json", "/openapi.json", "/llms-full.txt"],
    caution: "자동 답변보다 라우팅, 누락 위험, 다음 행동 제시를 우선한다.",
    prompts: ["이 민원은 어디에 넣어야 하나요", "필요 서류와 먼저 할 일을 알려줘"],
  },
];

export const TRUST_METRICS = [
  { name: "출처 표시율", desc: "답변·요약이 공식 문서와 원문 링크를 얼마나 보존하는가." },
  { name: "오분류 정정률", desc: "잘못 라우팅된 과업을 얼마나 빨리 수정하고 학습에 반영하는가." },
  { name: "human review 준수율", desc: "권리·처분·민감정보 경계에서 사람 검토를 제대로 요청하는가." },
  { name: "민감정보 차단율", desc: "필요 이상의 개인정보·민감정보 접근을 얼마나 차단하는가." },
  { name: "공식 문서 인용률", desc: "비공식 요약보다 공식 근거를 얼마나 우선하는가." },
];

export function classifyIntent(input: string) {
  const text = input.toLowerCase();
  const scores = TASKS.map((task) => {
    let score = 0;
    const haystack = `${task.title} ${task.intent} ${task.route} ${task.prompts.join(" ")}`.toLowerCase();
    for (const token of text.split(/\s+/).filter(Boolean)) {
      if (haystack.includes(token)) score += 2;
    }
    if (/도로|가로등|빗물|침수|위험|신고|파손|시설물/.test(input)) score += task.id === "safety-report-routing" ? 8 : 0;
    if (/복지|지원|출산|보육|주거|생계|돌봄|아동/.test(input)) score += task.id === "welfare-discovery" ? 8 : 0;
    if (/사업|수출|창업|r&d|연구|공고|산업/.test(input)) score += task.id === "business-industry-support" ? 8 : 0;
    if (/법령|지침|근거|권한|처분|법/.test(input)) score += task.id === "legal-policy-reference" ? 8 : 0;
    if (/보도자료|관보|문서|회의|원문|출처/.test(input)) score += task.id === "official-document-reading" ? 8 : 0;
    if (/민원|어디|서류|절차|담당|신청/.test(input)) score += task.id === "civil-complaint-classification" ? 6 : 0;
    return { task, score };
  }).sort((a, b) => b.score - a.score);
  const best = scores[0];
  return {
    input,
    matchedTask: best.task,
    confidence: best.score >= 8 ? "medium" : "low",
    reason: best.score >= 8 ? "키워드와 과업 설명이 일치합니다." : "명확한 과업 신호가 약해 기본 라우팅 후보를 제시합니다.",
    mustStopForHuman: best.task.caution,
  };
}
