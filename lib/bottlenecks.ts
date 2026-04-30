export const BOTTLENECK_TYPES = [
  {
    id: "human-confirmation",
    name: "사람 확인 병목",
    desc: "에이전트가 서류와 요건을 정리했지만 최종 확인이 오프라인 또는 담당자 재검토에 묶이는 경우.",
    agentFix: "확인 항목을 체크리스트·증빙 링크·전자동의로 분해하고, 고위험 항목만 사람 검토로 남긴다.",
  },
  {
    id: "paper-original",
    name: "원본·방문 제출 병목",
    desc: "온라인으로 준비 가능한 민원인데 종이 원본, 방문 제출, 수기 서명 때문에 멈추는 경우.",
    agentFix: "원본 필요 사유를 분리하고 전자문서·전자서명·기관 간 확인으로 대체 가능한 항목을 표시한다.",
  },
  {
    id: "cross-agency-check",
    name: "기관 간 확인 병목",
    desc: "한 기관이 이미 가진 정보를 다른 기관이 다시 제출받거나 전화·공문 확인에 의존하는 경우.",
    agentFix: "공동 이용 가능한 데이터 항목과 확인 API 후보를 남겨 재제출을 줄인다.",
  },
  {
    id: "unclear-responsibility",
    name: "담당기관 불명확 병목",
    desc: "사용자는 문제를 설명했지만 어느 기관·부서·창구가 처리해야 하는지 불명확한 경우.",
    agentFix: "라우팅 근거, 후보 기관, 반려 시 재라우팅 규칙을 기록한다.",
  },
  {
    id: "legal-risk-boundary",
    name: "법적 판단 경계 병목",
    desc: "권리·의무·처분 판단이 포함되어 에이전트가 멈춰야 하는 경우.",
    agentFix: "사실관계 정리, 근거 법령 후보, 담당자 판단 필요 항목을 분리한다.",
  },
];

export const SAMPLE_BOTTLENECK_REPORTS = [
  {
    id: "br-safety-drain-001",
    service: "생활안전 신고 / 빗물받이 막힘",
    userIntent: "비가 오면 도로가 잠길 것 같아 시설물 정비를 요청하고 싶다.",
    agentHandled: ["위치 설명 정리", "신고 유형 후보 분류", "담당 지자체·안전신문고 경로 제시", "사진 첨부 필요성 안내"],
    stoppedAt: "긴급 위험 여부와 현장 조치 우선순위를 사람이 판단해야 함",
    bottleneckType: "human-confirmation",
    proposedChange: "에이전트가 사진·위치·위험 키워드를 기반으로 긴급도 초안을 만들고, 담당자는 고위험 후보만 확인하도록 전환",
    expectedImpact: "단순 생활불편 신고는 자동 접수·분류하고, 담당자는 위험도 높은 건에 집중 가능",
    humanReviewStillNeeded: "침수·감전·교통사고 위험처럼 즉시 출동이 필요한 사안",
  },
  {
    id: "br-welfare-birth-001",
    service: "출산·보육 지원 제도 탐색",
    userIntent: "아이가 태어났을 때 받을 수 있는 지원과 신청 순서를 알고 싶다.",
    agentHandled: ["가구 상황 질문 목록 생성", "지원 제도 후보 정리", "신청 순서 초안", "필요 서류 체크리스트"],
    stoppedAt: "소득·거주·가구원 정보가 기관별로 흩어져 자격을 자동 확인하지 못함",
    bottleneckType: "cross-agency-check",
    proposedChange: "사용자 동의 기반으로 자격 확인 항목을 기관 간 확인 API로 대체하고, 미확인 항목만 사용자에게 요청",
    expectedImpact: "사용자는 같은 정보를 반복 입력하지 않고, 에이전트가 신청 가능성 높은 제도부터 정렬 가능",
    humanReviewStillNeeded: "이의신청, 예외 인정, 소득 산정 분쟁",
  },
  {
    id: "br-smallbiz-export-001",
    service: "수출 바우처·사업자 지원",
    userIntent: "내 회사가 수출 지원사업에 신청 가능한지 확인하고 싶다.",
    agentHandled: ["공고 후보 검색", "요건 항목 추출", "사업자 정보와 매칭할 질문 생성", "마감일·제출서류 정리"],
    stoppedAt: "공고별 서식과 심사 요건이 비정형 PDF·첨부파일에 흩어져 있음",
    bottleneckType: "paper-original",
    proposedChange: "지원사업 공고에 machine-readable eligibility.json과 submission.json을 의무 첨부",
    expectedImpact: "에이전트가 공고별 자격·서류·마감일을 자동 비교하고 신청 초안을 생성 가능",
    humanReviewStillNeeded: "평가위원 판단, 정성평가, 부정수급 의심",
  },
];

export function createBottleneckReport(input: string) {
  const matched = SAMPLE_BOTTLENECK_REPORTS.find((report) =>
    input.includes("빗물") || input.includes("안전")
      ? report.id === "br-safety-drain-001"
      : input.includes("출산") || input.includes("보육") || input.includes("지원")
        ? report.id === "br-welfare-birth-001"
        : input.includes("수출") || input.includes("사업") || input.includes("공고")
          ? report.id === "br-smallbiz-export-001"
          : false,
  ) || SAMPLE_BOTTLENECK_REPORTS[0];

  return {
    reportKind: "agent-bottleneck-report",
    status: "draft-suggestion",
    createdBy: "agent",
    input,
    ...matched,
    nextAction: "담당기관은 proposedChange를 검토해 자동처리 가능 항목, human review 유지 항목, 제도·서식 변경 필요 항목으로 나눈다.",
  };
}
