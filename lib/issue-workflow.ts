export const ISSUE_WORKFLOW = {
  name: "Public Issue Workflow",
  topic: "공급망",
  posture: "map-ready-region",
  command: "pnpm adapter:issue-workflow",
  thesis:
    "공공 source를 evidence packet으로 묶고, 브리핑·타임라인·검증·질문·액션·지도·케이스파일까지 한 번에 생성한다.",
  inputs: [
    "topic",
    "policy_query",
    "law_query",
    "gazette_keyword",
    "schedule_keyword",
    "gov24_keyword",
    "ecos_series",
  ],
  sources: [
    "policy.news.search",
    "crawl.readable",
    "law.search",
    "law.history",
    "gazette.search",
    "assembly.schedule",
    "gov24.service",
    "ecos.series",
  ],
};

export const ISSUE_PIPELINE = [
  {
    id: "packet",
    label: "Packet",
    command: "pnpm adapter:issue-packet",
    output: "lead_readable, legal_context, official_signals, statistic_context, errors",
    desc: "정책뉴스, 법령, 관보, 국회 일정, 정부24, 통계를 하나의 근거 묶음으로 합성한다.",
  },
  {
    id: "brief",
    label: "Brief",
    command: "pnpm adapter:issue-brief",
    output: "Markdown briefing",
    desc: "실무자가 바로 읽을 수 있는 lead, 법령 맥락, 공식 신호, 예상 질문을 만든다.",
  },
  {
    id: "timeline",
    label: "Timeline",
    command: "pnpm adapter:issue-timeline",
    output: "chronological events",
    desc: "날짜가 있는 source를 시간순으로 재배열해 이슈가 움직인 방향을 보여준다.",
  },
  {
    id: "gap",
    label: "Gap",
    command: "pnpm adapter:issue-gap",
    output: "score, posture, priority_fixes",
    desc: "정책자료만 있는지, 법령·관보·국회·통계 축이 살아 있는지 점검한다.",
  },
  {
    id: "matrix",
    label: "Matrix",
    command: "pnpm adapter:issue-matrix",
    output: "role, source, strength, caveat",
    desc: "각 source가 어떤 근거 역할을 하는지와 어떤 주의점을 붙여야 하는지 정리한다.",
  },
  {
    id: "router",
    label: "Router",
    command: "pnpm adapter:issue-router",
    output: "recommended route",
    desc: "지금 바로 브리핑할지, 법령 심화·공식 신호 좁히기·통계 보강으로 갈지 추천한다.",
  },
  {
    id: "geo",
    label: "Geo",
    command: "pnpm adapter:issue-geo",
    output: "map-ready-region GeoJSON",
    desc: "지오코더 키 없이 policymap 경계 GeoJSON으로 행정구역 centroid를 붙인다.",
  },
  {
    id: "casefile",
    label: "Casefile",
    command: "pnpm adapter:issue-casefile",
    output: "out/issue-casefiles/<topic>-<timestamp>",
    desc: "모든 산출물을 폴더 단위로 export해 이후 ops, regression, handoff가 읽게 한다.",
  },
];

export const ISSUE_GEO_FLOW = [
  {
    label: "Region first",
    value: "sido/sigg/emd boundary GeoJSON",
    desc: "정책지도 기본값. 키 없이 행정구역 단위 맥락을 만든다.",
  },
  {
    label: "Centroid output",
    value: "map-ready-region",
    desc: "조달청 예시는 대전광역시 서구 centroid GeoJSON으로 생성된다.",
  },
  {
    label: "Optional precision",
    value: "Kakao / VWorld / Juso",
    desc: "건물 단위 좌표가 필요할 때만 운영키를 붙인다.",
  },
];

export const ISSUE_ARTIFACTS = [
  "packet.json",
  "brief.md",
  "timeline.md",
  "gap.md",
  "matrix.md",
  "scenario.md",
  "onepager.md",
  "actions.md",
  "geo.json",
  "index.md",
  "manifest.json",
];
