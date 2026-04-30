export const DEEP_SAMPLES = [
  {
    slug: "safety-report",
    title: "안전신문고형 생활안전 신고",
    subtitle: "빗물받이 막힘·도로 침수 위험을 에이전트가 어디까지 처리할 수 있는가",
    citizenUtterance: "빗물받이가 막혀서 비가 오면 도로가 잠길 것 같아요. 어디에 신고해야 하나요?",
    currentFlow: [
      "국민이 안전신문고, 지자체, 도로관리청 중 어디인지 직접 추측한다.",
      "사진, 위치, 상황 설명을 수동으로 넣는다.",
      "접수 후 담당기관 배정과 긴급도 판단을 기다린다.",
      "긴급 위험이면 별도 전화·현장 확인이 다시 필요하다.",
    ],
    agentReadyFlow: [
      "에이전트가 위치 표현, 사진 여부, 위험 키워드를 먼저 정리한다.",
      "안전신문고·지자체·도로관리청 후보를 라우팅한다.",
      "침수·감전·교통사고 가능성 기준으로 긴급도 초안을 만든다.",
      "단순 정비 신고는 자동 접수 초안까지 만들고, 고위험 후보만 사람에게 올린다.",
    ],
    documents: ["안전신문고 신고 분류", "지자체 도로·하수 관리 안내", "재난안전 긴급신고 기준"],
    neededApis: ["location-normalization API", "local-jurisdiction routing API", "risk-triage schema", "attachment metadata schema"],
    bottleneck: "긴급 위험 여부와 현장 조치 우선순위 판단이 사람 확인에 묶인다.",
    redesign: "신고 접수 서식에 risk-triage.json을 붙여 에이전트가 위험도 초안을 제출하게 하고, 담당자는 고위험 후보만 검토한다.",
    humanStays: ["즉시 출동 필요성", "현장 조치 우선순위", "허위·장난 신고 판단"],
    agentCanDo: ["위치·사진·상황 구조화", "담당기관 후보 제시", "신고문 초안", "병목 리포트 작성"],
    successMetric: "담당자 1차 분류 시간을 줄이고 고위험 신고 선별 정확도를 높인다.",
  },
  {
    slug: "birth-care-support",
    title: "출산·보육 지원 통합 탐색",
    subtitle: "지원제도 누락을 줄이고 반복 입력을 없애는 에이전트형 복지 탐색",
    citizenUtterance: "아이가 태어났는데 받을 수 있는 지원을 한 번에 알고 싶어요.",
    currentFlow: [
      "부모가 복지로, 지자체, 보건소, 교육청 정보를 따로 찾는다.",
      "출생일, 거주지, 소득, 가구원 정보를 기관별로 반복 입력한다.",
      "신청 가능성은 사람이 직접 해석한다.",
      "나중에 누락된 지원을 알게 되는 경우가 생긴다.",
    ],
    agentReadyFlow: [
      "에이전트가 최소 질문으로 상황 프로필을 만든다.",
      "사용자 동의 기반으로 확인 가능한 정보와 직접 입력이 필요한 정보를 나눈다.",
      "지원 가능성이 높은 제도부터 신청 순서와 서류를 정렬한다.",
      "예외·이의신청·소득 산정 분쟁만 사람 검토로 넘긴다.",
    ],
    documents: ["복지로 서비스 안내", "지자체 출산지원금 안내", "보육료·아동수당 신청 안내"],
    neededApis: ["benefit-eligibility API", "consent-based household verification", "local-benefit catalog", "submission checklist schema"],
    bottleneck: "가구·소득·거주 정보가 기관별로 흩어져 에이전트가 자격을 확정하지 못한다.",
    redesign: "benefit-eligibility.json과 기관 간 확인 동의 흐름을 표준화해, 에이전트가 가능성 높은 제도와 미확인 항목을 분리하게 한다.",
    humanStays: ["예외 인정", "소득 산정 분쟁", "부정수급 의심", "이의신청"],
    agentCanDo: ["지원 후보 탐색", "필요 서류 정리", "신청 순서 제안", "누락 위험 알림"],
    successMetric: "같은 정보 반복 입력을 줄이고 지원제도 누락률을 낮춘다.",
  },
  {
    slug: "export-voucher",
    title: "수출 바우처·사업자 지원",
    subtitle: "PDF 공고를 agent-readable eligibility/submission 구조로 바꾸기",
    citizenUtterance: "우리 회사가 수출 바우처 신청 가능한지 자동으로 확인하고 싶어요.",
    currentFlow: [
      "사업자가 PDF 공고와 첨부 서식을 직접 읽는다.",
      "업력, 매출, 수출실적, 제외 업종을 수동 대조한다.",
      "마감일과 필수 서류를 따로 관리한다.",
      "신청서 초안을 반복 작성한다.",
    ],
    agentReadyFlow: [
      "공고에 eligibility.json과 submission.json을 함께 게시한다.",
      "에이전트가 사업자 정보와 요건을 자동 대조한다.",
      "부족한 서류와 마감 위험을 먼저 알려준다.",
      "신청 초안은 에이전트가 만들고 정성평가·부정수급 의심은 사람이 본다.",
    ],
    documents: ["수출바우처 사업 공고", "중소기업 지원사업 신청서", "제외 업종·우대 요건 안내"],
    neededApis: ["eligibility.json", "submission.json", "deadline feed", "business-profile consent API"],
    bottleneck: "공고 요건과 제출서류가 비정형 PDF·첨부파일에 흩어져 자동 비교가 어렵다.",
    redesign: "모든 지원사업 공고에 eligibility.json, submission.json, deadline.json을 의무 첨부한다.",
    humanStays: ["정성평가", "사업계획 타당성 판단", "부정수급 의심", "최종 선정"],
    agentCanDo: ["공고 비교", "자격 사전점검", "서류 체크리스트", "신청서 초안"],
    successMetric: "신청 전 탈락 가능성을 줄이고 담당자의 단순 문의 대응을 줄인다.",
  },
] as const;

export type DeepSample = (typeof DEEP_SAMPLES)[number];

export function getDeepSample(slug: string) {
  return DEEP_SAMPLES.find((sample) => sample.slug === slug);
}
