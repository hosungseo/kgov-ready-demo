const PLAZA_TASKS = [
  {
    id: "safety-report-routing",
    title: "재난·안전 신고 라우팅",
    route: ["mois", "molit", "local-government"],
    endpoints: ["/mois/llms.txt", "/molit/llms.txt", "/openapi.json"],
    humanReview: "긴급 위험, 생명·신체 위험, 처분 연결 지점",
  },
  {
    id: "welfare-discovery",
    title: "복지·지원 제도 탐색",
    route: ["mohw", "molit", "moe"],
    endpoints: ["/mohw/index.md", "/molit/index.md", "/moe/index.md"],
    humanReview: "자격 확정, 소득·가구정보 등 민감정보 판단",
  },
  {
    id: "business-industry-support",
    title: "사업자·수출·산업 지원",
    route: ["mss", "motie", "msit"],
    endpoints: ["/mss/llms.txt", "/motie/llms.txt", "/msit/llms.txt"],
    humanReview: "신청 요건 확정과 마감일 확인",
  },
  {
    id: "legal-policy-reference",
    title: "법령·지침 확인",
    route: ["moj", "mois", "responsible-ministry"],
    endpoints: ["/moj/index.md", "/mois/index.md", "/llms-full.txt"],
    humanReview: "법률 자문, 처분 판단, 권리구제 판단",
  },
  {
    id: "official-document-reading",
    title: "정부 문서 읽기",
    route: ["official-documents", "readable-corpus"],
    endpoints: ["/llms.txt", "/sitemap.xml", "/openapi.json"],
    humanReview: "출처 불명확, 문서 최신성 충돌, 인용 위험",
  },
  {
    id: "civil-complaint-classification",
    title: "민원 유형 분류",
    route: ["task", "ministry", "document-or-api", "human-review"],
    endpoints: ["/.well-known/agent.json", "/openapi.json", "/llms-full.txt"],
    humanReview: "권리 판단, 민감정보 접근, 처분 연결 지점",
  },
];

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return Response.json({
    name: "K-Gov Agent Plaza",
    description:
      "AI 에이전트가 정부 공식 문서, 부처 라우팅, API, 권한 경계를 발견하는 광장형 진입점.",
    page: "/plaza",
    entrance: [
      "/llms.txt",
      "/llms-full.txt",
      "/.well-known/agent.json",
      "/.well-known/mcp.json",
      "/openapi.json",
      "/robots.txt",
    ],
    principles: ["source first", "permission aware", "route before answer", "human on risk"],
    tasks: PLAZA_TASKS,
  });
}
