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
    positioning: "바이브코딩에 관심 있는 공무원을 위한 행정업무 스킬/레시피 저장소",
    authModel: "공공 API key는 사용자가 직접 신청한다. 키가 없으면 신청 안내와 fallback을 제공한다."
  });
}
