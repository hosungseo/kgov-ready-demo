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
      {
        name: "law.history",
        description: "법령 연혁 목록 조회(lsHistory) — MST/efYd 추출",
        inputs: ["query", "page", "limit", "org", "knd"],
        outputs: ["law_name", "mst", "ef_yd", "amendment_type", "promulgation_date", "enforcement_date", "detail_url"],
        smoke: "MOLEG_OC=*** node scripts/moleg-law.mjs history --query 정부조직법 --limit 3",
      },
      {
        name: "law.history_detail",
        description: "연혁 항목의 시행일 기준 본문 조회(eflaw)",
        inputs: ["mst", "ef_yd"],
        outputs: ["law", "raw_keys", "source_url"],
        smoke: "MOLEG_OC=*** node scripts/moleg-law.mjs history-detail --mst ... --ef-yd 20260102",
      },
    ],
    guardrails: ["API key는 env only", "조문 원문 우선", "시행일/currency 표시", "부칙과 본문 구분"],
  },
  {
    id: "policy-news-api",
    site: "apis.data.go.kr / korea.kr",
    name: "정책브리핑 정책뉴스 API 어댑터",
    strategy: "KEYED_API",
    status: "ready",
    auth: "env-key",
    source: "https://apis.data.go.kr/1371000/policyNewsService/policyNewsList",
    agentUse: "문화체육관광부 정책뉴스 OpenAPI에서 3일 단위 정책뉴스 메타데이터와 원문 URL을 조회한다.",
    commands: [
      {
        name: "policy.news.search",
        description: "정책뉴스 목록 조회(최대 3일 범위)",
        inputs: ["start", "end", "page", "limit"],
        outputs: ["news_id", "title", "subtitle", "date", "agency", "summary", "source_url", "raw"],
        smoke: "DATA_GO_KR_SERVICE_KEY=*** node scripts/policy-news.mjs --start 20250515 --end 20250517 --limit 3",
      },
    ],
    guardrails: ["API key는 env only", "조회 범위는 3일 이하", "사진 저작권 문구 보존", "source_url 보존"],
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
    id: "odcloud-government-data",
    site: "api.odcloud.kr / gov24",
    name: "공공데이터포털·정부24 어댑터",
    strategy: "KEYED_API",
    status: "ready",
    auth: "env-key",
    source: "https://api.odcloud.kr/api + https://api.odcloud.kr/api/gov24/v3",
    agentUse: "공공데이터포털의 행안부 기능분류체계와 정부24 공공서비스 목록/상세를 metadata-first JSON으로 조회한다.",
    commands: [
      {
        name: "odcloud.dataset",
        description: "행안부 정부기능/목적별/지자체 기능분류체계 조회",
        inputs: ["dataset", "page", "per_page"],
        outputs: ["classification_id", "classification_name", "parent_id", "agency", "path", "raw"],
        smoke: "DATA_GO_KR_SERVICE_KEY=*** node scripts/odcloud-gov.mjs dataset --dataset centralFunction --limit 5",
      },
      {
        name: "gov24.service.search",
        description: "정부24 공공서비스 목록 검색",
        inputs: ["keyword", "field", "page", "per_page"],
        outputs: ["service_id", "title", "summary", "target", "agency", "category", "source_url"],
        smoke: "DATA_GO_KR_SERVICE_KEY=*** node scripts/odcloud-gov.mjs gov24 --keyword 보육 --limit 5",
      },
      {
        name: "gov24.service.detail",
        description: "정부24 공공서비스 상세 조회",
        inputs: ["service_id"],
        outputs: ["service_id", "law", "local_rule", "admin_rule", "documents", "raw"],
        smoke: "DATA_GO_KR_SERVICE_KEY=*** node scripts/odcloud-gov.mjs gov24-detail --service-id ...",
      },
    ],
    guardrails: ["API key는 env only", "조건 필터는 URL에 보존", "대량 조회 금지", "raw row 보존"],
  },
  {
    id: "kosis-statistics",
    site: "kosis.kr",
    name: "KOSIS 국가통계 어댑터",
    strategy: "KEYED_API",
    status: "blocked",
    auth: "env-key",
    source: "https://kosis.kr/openapi/statisticsList.do / statisticsData.do",
    agentUse: "KOSIS 통계목록, 파라미터, 통계자료를 표 ID·기관 ID 중심으로 조회한다.",
    commands: [
      {
        name: "kosis.list",
        description: "KOSIS 통계 목록 조회",
        inputs: ["vw_cd", "parent", "limit"],
        outputs: ["list_id", "list_name", "org_id", "tbl_id", "tbl_name", "raw"],
        smoke: "KOSIS_API_KEY=*** node scripts/kosis-stats.mjs list --vw-cd MT_ZTITLE --limit 5",
      },
      {
        name: "kosis.params",
        description: "KOSIS 표 파라미터 조회",
        inputs: ["org_id", "tbl_id"],
        outputs: ["parameter rows", "raw"],
        smoke: "KOSIS_API_KEY=*** node scripts/kosis-stats.mjs params --org-id ... --tbl-id ...",
      },
      {
        name: "kosis.data",
        description: "KOSIS 통계자료 조회",
        inputs: ["org_id", "tbl_id", "itm_id", "obj_l1", "prd_se", "start", "end"],
        outputs: ["period", "value", "unit", "raw"],
        smoke: "KOSIS_API_KEY=*** node scripts/kosis-stats.mjs data --org-id ... --tbl-id ...",
      },
    ],
    guardrails: ["표 ID와 파라미터를 먼저 확인", "KOSIS SSL/응답 drift 가능", "소량 조회", "raw row 보존"],
  },
  {
    id: "work24-job-dictionary",
    site: "work24.go.kr",
    name: "고용24 직업사전 어댑터",
    strategy: "KEYED_API",
    status: "blocked",
    auth: "env-key",
    source: "https://www.work24.go.kr/cm/openApi/call/wk/",
    agentUse: "직업명 키워드로 직업사전 코드를 찾고 상세 직무 설명을 XML API에서 조회한다.",
    commands: [
      {
        name: "work24.job.search",
        description: "고용24 직업사전 키워드 검색",
        inputs: ["keyword", "page", "limit", "srch_type"],
        outputs: ["job_code", "job_seq", "job_name"],
        smoke: "WORK24_AUTH_KEY=*** node scripts/work24-job.mjs search --keyword 행정 --limit 5",
      },
      {
        name: "work24.job.detail",
        description: "고용24 직업사전 상세 조회",
        inputs: ["job_code", "job_seq"],
        outputs: ["job_name", "overview", "duties", "raw"],
        smoke: "WORK24_AUTH_KEY=*** node scripts/work24-job.mjs detail --job-code ... --job-seq ...",
      },
    ],
    guardrails: ["XML parser는 최소 필드 중심", "상세는 search 결과 code/seq 후속 호출", "API key는 env only"],
  },

  {
    id: "ecos-statistics",
    site: "ecos.bok.or.kr",
    name: "한국은행 ECOS 통계 어댑터",
    strategy: "KEYED_API",
    status: "ready",
    auth: "env-key",
    source: "https://ecos.bok.or.kr/api/StatisticSearch",
    agentUse: "기준금리·주담대금리·CPI·M2 같은 주요 경제 시계열을 ECOS 공식 API에서 조회한다.",
    commands: [
      {
        name: "ecos.catalog",
        description: "kgov demo용 curated ECOS series catalog 조회",
        inputs: [],
        outputs: ["id", "table", "item", "cycle", "name"],
        smoke: "ECOS_API_KEY=*** node scripts/ecos-stat.mjs catalog",
      },
      {
        name: "ecos.series",
        description: "ECOS StatisticSearch 시계열 조회",
        inputs: ["series", "table", "item", "cycle", "start", "end", "limit"],
        outputs: ["period", "value", "unit", "item_name", "stat_name", "raw"],
        smoke: "ECOS_API_KEY=*** node scripts/ecos-stat.mjs series --series baseRate --start 202501 --end 202604",
      },
    ],
    guardrails: ["API key는 env only", "original URL key redaction", "table/item/cycle 보존", "작은 기간부터 조회"],
  },
  {
    id: "molit-realestate",
    site: "apis.data.go.kr / 국토교통부",
    name: "국토교통부 실거래가 어댑터",
    strategy: "KEYED_API",
    status: "ready",
    auth: "env-key",
    source: "https://apis.data.go.kr/1613000/RTMSDataSvc*",
    agentUse: "법정동코드·거래월 기준으로 아파트 매매/전월세 등 실거래 XML을 조회하고 거래금액·면적·층·단지명을 정규화한다.",
    commands: [
      {
        name: "molit.realestate.search",
        description: "국토부 실거래가 조회",
        inputs: ["kind", "lawd", "ym", "page", "limit"],
        outputs: ["property_name", "deal_amount", "deposit", "monthly_rent", "area", "floor", "deal_date", "dong", "contract_type", "dealing_type", "raw"],
        smoke: "DATA_GO_KR_SERVICE_KEY=*** node scripts/molit-realestate.mjs --kind aptTrade --lawd 36110 --ym 202604 --limit 3",
      },
    ],
    guardrails: ["kind는 aptTrade/aptRent/officetelTrade/officetelRent", "API key는 env only", "LAWD_CD/DEAL_YMD 보존", "월 단위 소량 조회", "취소거래/직거래 여부는 raw 확인"],
  },

  {
    id: "schoolinfo-disclosure",
    site: "schoolinfo.go.kr",
    name: "학교알리미 공시정보 어댑터",
    strategy: "KEYED_API",
    status: "ready",
    auth: "env-key",
    source: "https://www.schoolinfo.go.kr/openApi.do",
    agentUse: "학교급·공시연도·항목별 학교알리미 공시자료를 조회하고 학교코드, 학교명, 교육청, 지역, 학생수 등 핵심 필드를 정규화한다.",
    commands: [
      {
        name: "schoolinfo.disclosure.search",
        description: "학교알리미 공시 항목 조회(students/budget/facilities/safety 프리셋)",
        inputs: ["type", "year", "school_kind", "depth_no", "limit"],
        outputs: ["school_code", "school_name", "office", "region", "foundation", "student_total", "raw"],
        smoke: "SCHOOLINFO_API_KEY=*** node scripts/schoolinfo.mjs --type students --year 2025 --school-kind 04 --limit 3",
      },
    ],
    guardrails: ["type 프리셋은 students/budget/facilities/safety", "API key는 env only", "apiType/year/schoolKind 보존", "공시연도별 항목 제공 여부 drift 가능", "COL_* 필드는 raw로 보존"],
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
        smoke: "ASSEMBLY_API_KEY=*** node scripts/assembly-bill.mjs search --endpoint ALLBILLV2 --eraco 제22대 --limit 5",
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
