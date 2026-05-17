export type AdapterStrategy = "PUBLIC_API" | "KEYED_API" | "HTML_PARSE" | "BROWSER_UI";

export type AdapterCommand = {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  smoke: string;
};

export type OpenCliAdapter = {
  id: string;
  site: string;
  name: string;
  strategy: AdapterStrategy;
  status: "ready" | "planned" | "blocked";
  auth: "none" | "env-key" | "browser-session";
  source: string;
  agentUse: string;
  commands: AdapterCommand[];
  guardrails: string[];
};

export const OPENCLI_ADAPTERS: OpenCliAdapter[] = [
  {
    id: "policy-briefing-press",
    site: "korea.kr",
    name: "정책브리핑 보도자료 어댑터",
    strategy: "HTML_PARSE",
    status: "ready",
    auth: "none",
    source: "https://www.korea.kr/briefing/pressReleaseList.do",
    agentUse:
      "보도자료 목록을 keyword/page/limit 기준으로 조회하고 news_id, 기관, 날짜, 제목, 요약, 원문 URL을 보존한다.",
    commands: [
      {
        name: "press.search",
        description: "정책브리핑 보도자료 목록 검색",
        inputs: ["keyword", "page", "limit", "start_date", "end_date", "agency_code"],
        outputs: ["news_id", "date", "agency", "title", "summary", "source_url"],
        smoke: "node scripts/policy-briefing-press.mjs --keyword 정부조직 --limit 5 --format json",
      },
      {
        name: "press.detail",
        description: "정책브리핑 보도자료 상세 메타데이터와 첨부파일 링크 조회",
        inputs: ["news_id"],
        outputs: ["news_id", "title", "agency", "description", "content_iframe_url", "attachments", "source_url"],
        smoke: "node scripts/policy-briefing-press.mjs detail --news-id 156761598",
      },
    ],
    guardrails: ["source_url 필수", "retrieved_at 기록", "HTML 구조 변경 시 smoke 실패", "공식 정책자료와 법적 근거 구분"],
  },
  {
    id: "moleg-law-search",
    site: "law.go.kr",
    name: "법제처 국가법령정보 어댑터",
    strategy: "KEYED_API",
    status: "ready",
    auth: "env-key",
    source: "http://www.law.go.kr/DRF/lawSearch.do / lawService.do",
    agentUse:
      "법령명·조문 중심으로 현행 법령 원문과 법령 ID를 가져와 행정법 리서치의 primary source로 제공한다.",
    commands: [
      {
        name: "law.search",
        description: "법령명/키워드 검색",
        inputs: ["query", "target", "page", "limit"],
        outputs: ["law_id", "law_name", "promulgation_date", "enforcement_date", "source_url"],
        smoke: "MOLEG_OC=*** node scripts/moleg-law.mjs search --query 정부조직법 --limit 3",
      },
      {
        name: "law.article",
        description: "법령 조문 원문 조회",
        inputs: ["law_id", "article_no"],
        outputs: ["law_id", "article_no", "article_title", "article_text", "source_url"],
        smoke: "MOLEG_OC=*** node scripts/moleg-law.mjs article --law-id ... --article-no 2",
      },
    ],
    guardrails: ["API key는 env only", "조문 원문 우선", "시행일/currency 표시", "부칙과 본문 구분"],
  },
  {
    id: "gazette-metadata",
    site: "gwanbo.go.kr / data.go.kr",
    name: "관보 메타데이터 어댑터",
    strategy: "KEYED_API",
    status: "ready",
    auth: "env-key",
    source: "https://apis.data.go.kr/1741000/ApiTotalService/getApiTotalList",
    agentUse:
      "관보 항목을 날짜·기관·유형·제목 기준으로 검색하고 PDF/readable layer 연결점을 남긴다.",
    commands: [
      {
        name: "gazette.search",
        description: "관보 메타데이터 검색",
        inputs: ["from", "to", "keyword", "page", "page_size"],
        outputs: ["gazette_id", "publication_date", "agency", "title", "type", "pdf_url"],
        smoke: "GAZETTE_API_KEY=*** node scripts/gazette-search.mjs --from 2026-05-01 --to 2026-05-17 --keyword 고시 --page-size 5",
      },
    ],
    guardrails: ["PDF는 필요할 때만 cache", "metadata-first", "관보 원문 링크 보존", "timeout/rate-limit 방어"],
  },
];
