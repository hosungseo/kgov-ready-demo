import { EXISTING_ASSETS } from "@/lib/existing-assets";

export async function GET() {
  return Response.json({
    name: "K-Gov Environment Plaza asset catalog",
    description: "서호성님의 공개 행정업무 도구 자산을 에이전트가 발견하기 쉬운 형태로 정리한 카탈로그",
    authLegend: {
      none: "사용자 키 없이 공개 데이터/문서로 동작",
      "user-key-required": "사용자가 직접 API 활용신청 후 키를 제공해야 함",
      "optional-user-key": "키가 있으면 공식 API, 없으면 샘플/공개 코퍼스 중심",
    },
    assets: EXISTING_ASSETS,
  });
}
