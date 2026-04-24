export type Service = {
  title: string;
  desc: string;
  href: string;
};

export type Ministry = {
  slug: string;
  nameKo: string;
  nameEn: string;
  originalUrl: string;
  accent: string;
  mission: string;
  services: Service[];
  contact: { email: string; phone: string };
  address: string;
};

/**
 * 2026 정부조직 개편안 기준 19개 중앙부처 (국무조정실/대통령실 제외 장관급).
 * 일부는 개편 후 새 명칭(재정경제부/산업통상부/기후에너지환경부/국가보훈부/성평등가족부 등)을 반영.
 * URL은 기존 도메인을 유지한다고 가정 — 실제 공식 URL은 추후 교체.
 */
export const MINISTRIES: Ministry[] = [
  {
    slug: "moef",
    nameKo: "재정경제부",
    nameEn: "Ministry of Economy and Finance",
    originalUrl: "https://www.moef.go.kr",
    accent: "#1e5aad",
    mission: "지속 가능한 재정·경제 정책을 수립해 국민의 경제적 안정과 성장을 뒷받침합니다.",
    services: [
      { title: "국세청 납세 안내", desc: "연말정산·종합소득세 등 국민 납세 절차 종합 안내", href: "/services/tax" },
      { title: "재정 통계 공개", desc: "연도별 세입·세출·국가부채 공개 데이터", href: "/services/fiscal" },
      { title: "경제정책 브리핑", desc: "거시경제·산업·금융 주요 정책 보도자료", href: "/services/briefing" },
    ],
    contact: { email: "moef@korea.kr", phone: "044-215-2114" },
    address: "세종특별자치시 갈매로 477",
  },
  {
    slug: "msit",
    nameKo: "과학기술정보통신부",
    nameEn: "Ministry of Science and ICT",
    originalUrl: "https://www.msit.go.kr",
    accent: "#1f6fbf",
    mission: "과학기술과 정보통신 혁신으로 디지털 대전환과 AI 주권을 이끕니다.",
    services: [
      { title: "연구개발 지원", desc: "국가 R&D 과제 공고·신청", href: "/services/rnd" },
      { title: "AI·데이터 인프라", desc: "공공 AI 학습데이터·초거대 AI 정책", href: "/services/ai" },
      { title: "통신·방송 규제", desc: "주파수·통신요금·방송 정책", href: "/services/comm" },
    ],
    contact: { email: "msit@korea.kr", phone: "044-202-6114" },
    address: "세종특별자치시 한누리대로 402",
  },
  {
    slug: "moe",
    nameKo: "교육부",
    nameEn: "Ministry of Education",
    originalUrl: "https://www.moe.go.kr",
    accent: "#1a8c6f",
    mission: "모두를 위한 평생학습 사회를 설계하고 AI 시대의 교육 체계를 혁신합니다.",
    services: [
      { title: "대학 입시 안내", desc: "수능·대입전형·정시·수시 통합 정보", href: "/services/admission" },
      { title: "평생교육 바우처", desc: "국민내일배움카드 및 평생교육 지원", href: "/services/lifelong" },
      { title: "디지털 교과서", desc: "AI 맞춤형 디지털 교과서 도입 현황", href: "/services/textbook" },
    ],
    contact: { email: "moe@korea.kr", phone: "044-203-6114" },
    address: "세종특별자치시 갈매로 408",
  },
  {
    slug: "mofa",
    nameKo: "외교부",
    nameEn: "Ministry of Foreign Affairs",
    originalUrl: "https://www.mofa.go.kr",
    accent: "#1e3a8a",
    mission: "국민과 재외동포를 보호하고 국익에 부합하는 외교를 추진합니다.",
    services: [
      { title: "여권 발급 안내", desc: "여권 발급·갱신·재발급 절차", href: "/services/passport" },
      { title: "영사 콜센터", desc: "해외 사건·사고 24시간 지원", href: "/services/consular" },
      { title: "재외공관 찾기", desc: "전세계 대사관·총영사관 연락처", href: "/services/mission" },
    ],
    contact: { email: "mofa@korea.kr", phone: "02-2100-2114" },
    address: "서울특별시 종로구 사직로8길 60",
  },
  {
    slug: "unikorea",
    nameKo: "통일부",
    nameEn: "Ministry of Unification",
    originalUrl: "https://www.unikorea.go.kr",
    accent: "#2563eb",
    mission: "한반도 평화와 미래지향적 남북관계를 설계합니다.",
    services: [
      { title: "이산가족 상봉 신청", desc: "생사확인·상봉 신청 창구", href: "/services/family" },
      { title: "북한이탈주민 정착", desc: "하나원 교육·정착금 제도", href: "/services/defector" },
      { title: "남북교류 자료실", desc: "합의서·회담 기록 아카이브", href: "/services/archive" },
    ],
    contact: { email: "unikorea@korea.kr", phone: "02-2100-5600" },
    address: "서울특별시 종로구 세종대로 209",
  },
  {
    slug: "moj",
    nameKo: "법무부",
    nameEn: "Ministry of Justice",
    originalUrl: "https://www.moj.go.kr",
    accent: "#4b5563",
    mission: "법치와 인권을 바로 세우고 공정한 사법행정을 구현합니다.",
    services: [
      { title: "출입국·외국인정책", desc: "비자·체류·귀화 종합 안내", href: "/services/immigration" },
      { title: "교정·보호", desc: "수형자 정보·보호관찰 제도", href: "/services/correction" },
      { title: "법률구조", desc: "무료 법률상담·소송 지원", href: "/services/legal-aid" },
    ],
    contact: { email: "moj@korea.kr", phone: "02-2110-3000" },
    address: "경기도 과천시 관문로 47",
  },
  {
    slug: "mnd",
    nameKo: "국방부",
    nameEn: "Ministry of National Defense",
    originalUrl: "https://www.mnd.go.kr",
    accent: "#1f2937",
    mission: "강한 국방으로 국민의 생명과 주권을 지킵니다.",
    services: [
      { title: "병무청 입영 안내", desc: "병역판정검사·입영·대체복무", href: "/services/enlistment" },
      { title: "국방 예산·정책", desc: "연도별 국방비·전력 증강 계획", href: "/services/budget" },
      { title: "민·군 협력", desc: "방위산업·군 시설 개방 일정", href: "/services/civil-military" },
    ],
    contact: { email: "mnd@korea.kr", phone: "02-748-1111" },
    address: "서울특별시 용산구 이태원로 22",
  },
  {
    slug: "mois",
    nameKo: "행정안전부",
    nameEn: "Ministry of the Interior and Safety",
    originalUrl: "https://www.mois.go.kr",
    accent: "#0f766e",
    mission: "정부 혁신과 국민안전, 지방자치를 이끌어 신뢰받는 행정을 만듭니다.",
    services: [
      { title: "정부24", desc: "민원·증명서·정책정보 통합 포털", href: "/services/gov24" },
      { title: "국민재난안전포털", desc: "재난경보·대피·보험 안내", href: "/services/safety" },
      { title: "지방자치 통계", desc: "전국 243개 지자체 행정·재정 현황", href: "/services/local" },
    ],
    contact: { email: "mois@korea.kr", phone: "044-205-2114" },
    address: "세종특별자치시 정부2청사로 13",
  },
  {
    slug: "mpva",
    nameKo: "국가보훈부",
    nameEn: "Ministry of Patriots and Veterans Affairs",
    originalUrl: "https://www.mpva.go.kr",
    accent: "#92400e",
    mission: "독립·호국·민주 유공자의 희생에 보답하고 보훈 가족을 예우합니다.",
    services: [
      { title: "보훈 대상자 등록", desc: "유공자·유족 등록 절차", href: "/services/registration" },
      { title: "보훈 의료·요양", desc: "보훈병원·요양시설 이용", href: "/services/medical" },
      { title: "현충 시설 안내", desc: "국립묘지·기념관 참배 정보", href: "/services/memorial" },
    ],
    contact: { email: "mpva@korea.kr", phone: "044-202-5114" },
    address: "세종특별자치시 도움4로 9",
  },
  {
    slug: "mcst",
    nameKo: "문화체육관광부",
    nameEn: "Ministry of Culture, Sports and Tourism",
    originalUrl: "https://www.mcst.go.kr",
    accent: "#9333ea",
    mission: "문화·체육·관광으로 국민 삶의 질을 높이고 한류 확산을 지원합니다.",
    services: [
      { title: "한국문화 콘텐츠", desc: "K-콘텐츠 해외진출 지원·공모", href: "/services/culture" },
      { title: "국민체육진흥", desc: "생활체육·스포츠클럽 지원", href: "/services/sports" },
      { title: "관광 한국", desc: "방한 여행 안내·관광두레", href: "/services/tourism" },
    ],
    contact: { email: "mcst@korea.kr", phone: "044-203-2000" },
    address: "세종특별자치시 갈매로 388",
  },
  {
    slug: "mafra",
    nameKo: "농림축산식품부",
    nameEn: "Ministry of Agriculture, Food and Rural Affairs",
    originalUrl: "https://www.mafra.go.kr",
    accent: "#15803d",
    mission: "농업·농촌의 지속 가능성과 식량안보를 지킵니다.",
    services: [
      { title: "농업경영체 등록", desc: "농업인·법인 등록과 직불금 신청", href: "/services/farmer" },
      { title: "농산물 수급 현황", desc: "품목별 가격·수급 동향", href: "/services/price" },
      { title: "농촌 생활 SOS", desc: "귀농·귀촌 정착 지원", href: "/services/rural" },
    ],
    contact: { email: "mafra@korea.kr", phone: "044-201-1000" },
    address: "세종특별자치시 다솜2로 94",
  },
  {
    slug: "motie",
    nameKo: "산업통상부",
    nameEn: "Ministry of Industry and Trade",
    originalUrl: "https://www.motie.go.kr",
    accent: "#b91c1c",
    mission: "첨단산업 경쟁력과 통상 협력으로 경제 안보를 다집니다.",
    services: [
      { title: "수출지원", desc: "중소·중견기업 수출 바우처", href: "/services/export" },
      { title: "산업정책 브리핑", desc: "반도체·배터리·미래차 정책", href: "/services/industry" },
      { title: "FTA 종합지원", desc: "협정 활용 원산지·관세 안내", href: "/services/fta" },
    ],
    contact: { email: "motie@korea.kr", phone: "044-203-4000" },
    address: "세종특별자치시 한누리대로 402",
  },
  {
    slug: "mohw",
    nameKo: "보건복지부",
    nameEn: "Ministry of Health and Welfare",
    originalUrl: "https://www.mohw.go.kr",
    accent: "#0891b2",
    mission: "모든 세대의 건강과 복지를 보장하고 인구위기에 대응합니다.",
    services: [
      { title: "국민건강보험 안내", desc: "보험료·본인부담·건강검진", href: "/services/nhis" },
      { title: "복지로 통합 신청", desc: "기초·돌봄·아동수당 통합 신청", href: "/services/welfare" },
      { title: "저출생 대응", desc: "부모급여·육아휴직 급여 안내", href: "/services/birth" },
    ],
    contact: { email: "mohw@korea.kr", phone: "129" },
    address: "세종특별자치시 도움4로 13",
  },
  {
    slug: "me",
    nameKo: "기후에너지환경부",
    nameEn: "Ministry of Climate, Energy and Environment",
    originalUrl: "https://www.me.go.kr",
    accent: "#059669",
    mission: "탄소중립과 에너지 전환, 맑은 환경으로 기후위기에 대응합니다.",
    services: [
      { title: "대기질 실시간 정보", desc: "미세먼지·오존 전국 관측", href: "/services/air" },
      { title: "재생에너지 보급", desc: "태양광·풍력 지원사업", href: "/services/energy" },
      { title: "폐기물·재활용", desc: "분리배출·순환경제 안내", href: "/services/recycle" },
    ],
    contact: { email: "me@korea.kr", phone: "044-201-6000" },
    address: "세종특별자치시 도움6로 11",
  },
  {
    slug: "moel",
    nameKo: "고용노동부",
    nameEn: "Ministry of Employment and Labor",
    originalUrl: "https://www.moel.go.kr",
    accent: "#d97706",
    mission: "일하는 사람의 권리와 안전, 좋은 일자리를 책임집니다.",
    services: [
      { title: "고용보험 신청", desc: "실업급여·육아휴직급여", href: "/services/unemployment" },
      { title: "일자리 매칭", desc: "국민취업지원제도·직업훈련", href: "/services/jobs" },
      { title: "산업안전", desc: "산재 예방·신고 창구", href: "/services/safety" },
    ],
    contact: { email: "moel@korea.kr", phone: "1350" },
    address: "세종특별자치시 한누리대로 422",
  },
  {
    slug: "mogef",
    nameKo: "성평등가족부",
    nameEn: "Ministry of Gender Equality and Family",
    originalUrl: "https://www.mogef.go.kr",
    accent: "#a21caf",
    mission: "성평등 사회와 돌봄 중심 가족정책을 추진합니다.",
    services: [
      { title: "아이돌봄 서비스", desc: "시간제·종일제 돌봄 신청", href: "/services/childcare" },
      { title: "여성폭력 1366", desc: "가정폭력·성폭력 긴급지원", href: "/services/1366" },
      { title: "청소년 상담", desc: "청소년전화 1388 연계", href: "/services/youth" },
    ],
    contact: { email: "mogef@korea.kr", phone: "02-2100-6000" },
    address: "서울특별시 종로구 세종대로 209",
  },
  {
    slug: "molit",
    nameKo: "국토교통부",
    nameEn: "Ministry of Land, Infrastructure and Transport",
    originalUrl: "https://www.molit.go.kr",
    accent: "#1d4ed8",
    mission: "국토·주택·교통의 균형 있는 발전과 안전을 지킵니다.",
    services: [
      { title: "부동산 공시가격", desc: "실거래가·공시지가 조회", href: "/services/real-estate" },
      { title: "주택청약", desc: "주택청약·신혼희망타운 안내", href: "/services/housing" },
      { title: "교통카드·도로", desc: "교통요금·도로건설 정보", href: "/services/transport" },
    ],
    contact: { email: "molit@korea.kr", phone: "044-201-3000" },
    address: "세종특별자치시 도움6로 11",
  },
  {
    slug: "mof",
    nameKo: "해양수산부",
    nameEn: "Ministry of Oceans and Fisheries",
    originalUrl: "https://www.mof.go.kr",
    accent: "#0e7490",
    mission: "해양 주권과 수산자원, 해양안전을 지키고 푸른 경제를 이끕니다.",
    services: [
      { title: "항만·물류", desc: "컨테이너·해운 통계", href: "/services/port" },
      { title: "수산자원 관리", desc: "어업허가·금어기 안내", href: "/services/fishery" },
      { title: "해양안전·기상", desc: "해상특보·조석표", href: "/services/marine" },
    ],
    contact: { email: "mof@korea.kr", phone: "044-200-5114" },
    address: "세종특별자치시 다솜2로 94",
  },
  {
    slug: "mss",
    nameKo: "중소벤처기업부",
    nameEn: "Ministry of SMEs and Startups",
    originalUrl: "https://www.mss.go.kr",
    accent: "#ea580c",
    mission: "중소·벤처·소상공인을 지원해 창업과 혁신성장을 촉진합니다.",
    services: [
      { title: "창업 정책자금", desc: "예비·초기창업 자금·보증", href: "/services/startup" },
      { title: "소상공인 지원", desc: "경영안정자금·상권분석", href: "/services/smb" },
      { title: "수출 바우처", desc: "중소기업 해외진출 지원", href: "/services/export" },
    ],
    contact: { email: "mss@korea.kr", phone: "1357" },
    address: "대전광역시 서구 청사로 189",
  },
];

export const MINISTRY_BY_SLUG = Object.fromEntries(
  MINISTRIES.map((m) => [m.slug, m]),
) as Record<string, Ministry>;
