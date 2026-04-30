import { MINISTRIES } from "@/lib/ministries";
import { SAMPLE_BOTTLENECK_REPORTS } from "@/lib/bottlenecks";

export const READINESS_CRITERIA = [
  { id: "llms", name: "Agent entrance", weight: 18, desc: "llms.txt, sitemap, agent manifest처럼 에이전트가 먼저 읽는 입구" },
  { id: "api", name: "Machine-readable APIs", weight: 18, desc: "openapi, structured JSON, eligibility/submission schema" },
  { id: "routing", name: "Task routing clarity", weight: 18, desc: "국민 과업을 담당 부처·문서·API·검토 경계로 나누는 명확성" },
  { id: "documents", name: "Document readability", weight: 14, desc: "공고·지침·보도자료가 날짜·출처·근거 중심으로 읽히는 정도" },
  { id: "humanReview", name: "Human review boundary", weight: 18, desc: "사람 판단이 필요한 지점과 자동 처리 가능 지점의 분리" },
  { id: "feedback", name: "Bottleneck feedback", weight: 14, desc: "에이전트가 막힌 지점을 개선 건의로 남길 수 있는 구조" },
];

const OVERRIDES: Record<string, Partial<Record<(typeof READINESS_CRITERIA)[number]["id"], number>>> = {
  mois: { routing: 86, humanReview: 82, feedback: 84, documents: 76, api: 68, llms: 72 },
  molit: { routing: 78, humanReview: 70, feedback: 74, documents: 72, api: 76, llms: 70 },
  mohw: { routing: 74, humanReview: 78, feedback: 80, documents: 70, api: 66, llms: 68 },
  mss: { routing: 72, humanReview: 64, feedback: 76, documents: 66, api: 70, llms: 66 },
  msit: { routing: 70, humanReview: 66, feedback: 72, documents: 68, api: 78, llms: 72 },
};

function stableScore(slug: string, id: string) {
  const seed = [...`${slug}-${id}`].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return 50 + (seed % 28);
}

export const MINISTRY_READINESS = MINISTRIES.map((m) => {
  const criteria = READINESS_CRITERIA.map((c) => {
    const score = OVERRIDES[m.slug]?.[c.id] ?? stableScore(m.slug, c.id);
    return { ...c, score };
  });
  const total = Math.round(criteria.reduce((sum, c) => sum + c.score * c.weight, 0) / criteria.reduce((sum, c) => sum + c.weight, 0));
  const topGap = [...criteria].sort((a, b) => a.score - b.score)[0];
  return {
    slug: m.slug,
    nameKo: m.nameKo,
    nameEn: m.nameEn,
    accent: m.accent,
    mission: m.mission,
    score: total,
    criteria,
    nextMove: `${topGap.name} 보강: ${topGap.desc}`,
  };
}).sort((a, b) => b.score - a.score);

export const BEFORE_AFTER_FLOWS = [
  {
    id: "safety-report",
    title: "생활안전 신고",
    before: ["국민이 메뉴를 찾음", "사진·위치를 수동 입력", "담당기관 판단 대기", "긴급도 확인을 사람이 반복"],
    after: ["에이전트가 위치·사진·위험 키워드 정리", "안전신문고/지자체 후보 라우팅", "긴급도 초안 생성", "고위험 후보만 사람 검토"],
    bottleneck: SAMPLE_BOTTLENECK_REPORTS[0],
  },
  {
    id: "welfare-discovery",
    title: "출산·보육 지원",
    before: ["기관별 사이트를 따로 탐색", "같은 가족·소득 정보를 반복 입력", "지원 가능성을 사람이 직접 비교", "누락된 제도를 뒤늦게 발견"],
    after: ["에이전트가 상황 질문을 최소화", "동의 기반 기관 간 확인", "가능성 높은 제도부터 정렬", "미확인 항목만 사람에게 요청"],
    bottleneck: SAMPLE_BOTTLENECK_REPORTS[1],
  },
  {
    id: "business-support",
    title: "수출·사업자 지원",
    before: ["PDF 공고와 첨부서식을 사람이 읽음", "요건을 사업자 정보와 수동 대조", "마감일·서류 누락 확인이 늦음", "신청 초안 작성이 반복됨"],
    after: ["eligibility.json으로 자격 자동 비교", "submission.json으로 서류 체크", "에이전트가 신청 초안 작성", "정성평가·부정수급 의심만 사람 검토"],
    bottleneck: SAMPLE_BOTTLENECK_REPORTS[2],
  },
];
