export async function GET() {
  return Response.json({
    name: "K-Gov Skill Hub",
    repository: "https://github.com/hosungseo/k-gov-skill",
    llms: "https://raw.githubusercontent.com/hosungseo/k-gov-skill/main/llms.txt",
    catalog: "https://raw.githubusercontent.com/hosungseo/k-gov-skill/main/examples/skill-catalog.json",
    firstRun: "https://github.com/hosungseo/k-gov-skill/blob/main/docs/getting-started.md",
    skills: [
      "public-data-portal",
      "korean-law-search",
      "official-gazette-search",
      "national-assembly-search",
      "hwp-document-tools",
      "org-quota-review"
    ],
    runnableExamples: [
      {
        id: "public-data-first-call",
        command: "npm run example:public-data",
        url: "https://github.com/hosungseo/k-gov-skill/tree/main/examples/public-data-first-call",
        purpose: "공공데이터포털 API key가 없을 때도 활용신청/파라미터/fallback을 안내"
      },
      {
        id: "gazette-jikje-watch",
        command: "npm run example:gazette",
        url: "https://github.com/hosungseo/k-gov-skill/tree/main/examples/gazette-jikje-watch",
        purpose: "관보에서 직제·정원 관련 문서 후보를 찾는 업무 패킷 생성"
      },
      {
        id: "org-quota-review-packet",
        command: "npm run example:org-quota",
        url: "https://github.com/hosungseo/k-gov-skill/tree/main/examples/org-quota-review-packet",
        purpose: "기구·정원 요구자료를 검토 패킷으로 분해"
      },
      {
        id: "hwp-document-packet",
        command: "npm run example:hwp",
        url: "https://github.com/hosungseo/k-gov-skill/tree/main/examples/hwp-document-packet",
        purpose: "HWP/HWPX 문서의 로컬 처리 전략과 검토표 생성"
      },
      {
        id: "korean-law-citation-packet",
        command: "npm run example:law",
        url: "https://github.com/hosungseo/k-gov-skill/tree/main/examples/korean-law-citation-packet",
        purpose: "법령 조문을 원문 인용·시행일·출처 중심 citation packet으로 정리"
      }
    ],
    positioning: "바이브코딩에 관심 있는 공무원을 위한 행정업무 스킬/레시피 저장소",
    authModel: "공공 API key는 사용자가 직접 신청한다. 키가 없으면 신청 안내와 fallback을 제공한다."
  });
}
