export async function GET() {
  return Response.json({
    name: "K-Gov Agent Recipes",
    description: "바이브코딩 공무원이 Claude Code, Codex, OpenClaw에서 바로 시도할 수 있는 환경광장 레시피",
    recipes: [
      {
        id: "public-data-first-call",
        title: "공공데이터포털 API 첫 호출 준비",
        prompt: "공공데이터포털에서 행안부 인구 관련 API를 찾고, 활용신청 필요 여부와 serviceKey 환경변수명을 정리해줘.",
        assets: ["korean-government-api-bundle", "public-data-portal-intelligence"],
        expectedOutput: ["API 후보", "신청/키 필요 여부", "파라미터 초안", "키 없을 때 fallback"],
      },
      {
        id: "gazette-jikje-watch",
        title: "관보에서 직제·정원 관련 고시 찾기",
        prompt: "최근 관보에서 직제, 정원, 조직개편 관련 문서를 찾아 기관명·문서일·근거 링크로 표를 만들어줘.",
        assets: ["ai-readable-gazette-kr", "gov-gazette-md"],
        expectedOutput: ["문서 목록", "기관/일자", "원문 링크", "검토 쟁점"],
      },
      {
        id: "press-briefing-by-ministry",
        title: "부처별 보도자료 브리핑",
        prompt: "행정안전부 최근 보도자료 중 조직·지방행정·디지털정부 관련 항목을 골라 업무 브리핑으로 요약해줘.",
        assets: ["gov-press-md", "ai-readable-government"],
        expectedOutput: ["핵심 요약", "업무 관련성", "출처", "후속 확인 질문"],
      },
    ],
  });
}
