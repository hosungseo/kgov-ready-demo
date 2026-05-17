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
      {
        name: "press.read",
        description: "정책브리핑 보도자료를 Crawl4AI readable Markdown으로 추출하고 korea-press postprocess 적용",
        inputs: ["news_id", "max_chars"],
        outputs: ["source_url", "retrieved_at", "strategy", "postprocess", "markdown"],
        smoke: "python3.10 scripts/crawl-readable.py --korea-press-news-id 156761598 --max-chars 12000",
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
  {
    id: "crawl4ai-readable",
    site: "public-web",
    name: "Crawl4AI readable layer",
    strategy: "BROWSER_UI",
    status: "ready",
    auth: "none",
    source: "https://github.com/unclecode/crawl4ai",
    agentUse:
      "API나 단순 HTML 파서로 읽기 어려운 정부 웹페이지를 Crawl4AI 기반 Markdown readable layer로 변환한다.",
    commands: [
      {
        name: "crawl.read",
        description: "공공 웹페이지를 LLM-ready Markdown으로 추출",
        inputs: ["url", "wait_for", "max_chars"],
        outputs: ["source_url", "retrieved_at", "strategy", "markdown", "links", "media"],
        smoke: "python3 scripts/crawl-readable.py --url https://www.korea.kr/briefing/pressReleaseView.do?newsId=156761598",
      },
    ],
    guardrails: ["공식 API/직접 parser 이후 fallback으로 사용", "robots/이용조건 존중", "대량 크롤링 금지", "crawl4ai optional dependency 필요"],
  },

  {
    id: "assembly-bill-search",
    site: "open.assembly.go.kr / likms.assembly.go.kr",
    name: "국회 의안정보 어댑터",
    strategy: "KEYED_API",
    status: "ready",
    auth: "env-key",
    source: "https://open.assembly.go.kr/portal/openapi + https://likms.assembly.go.kr/bill",
    agentUse:
      "의안명/키워드 기준으로 국회 의안 목록을 검색하고 의안번호, 제안자, 소관위원회, 처리상태, 상세 URL을 보존한다.",
    commands: [
      {
        name: "assembly.bill.search",
        description: "국회 의안 키워드 검색",
        inputs: ["query", "page", "page_size", "age", "endpoint"],
        outputs: ["bill_id", "bill_no", "title", "proposer", "proposed_date", "committee", "status", "source_url"],
        smoke: "ASSEMBLY_API_KEY=*** node scripts/assembly-bill.mjs search --query 정부조직 --limit 5",
      },
      {
        name: "assembly.bill.detail",
        description: "국회 의안 단건 조회/상세 URL 보존",
        inputs: ["bill_id", "bill_no", "endpoint"],
        outputs: ["bill_id", "bill_no", "title", "proposer", "proposed_date", "committee", "status", "source_url"],
        smoke: "ASSEMBLY_API_KEY=*** node scripts/assembly-bill.mjs detail --bill-id ...",
      },
    ],
    guardrails: ["API key는 env only", "국회 OpenAPI endpoint ID는 drift 가능", "의안 상세 원문은 likms source_url에서 재확인", "pending/proposed와 passed/enforced 구분"],
  },

];
