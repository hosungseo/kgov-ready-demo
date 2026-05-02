# K-Gov Agent-Ready 시안

대한민국 19개 중앙부처 사이트를 **AI 에이전트용으로 다시 짠 시안**. 모든 페이지와 엔드포인트가 agent-ready-check 스캐너의 23가지 표준을 모두 만족하도록 설계.

- **라이브**: https://kgov-ready-demo.vercel.app
- **Agent Plaza**: https://kgov-ready-demo.vercel.app/plaza
- **스캐너**: https://agent-ready-check.vercel.app — 이 데모 점수 즉시 확인

## 포함 부처 (2026 정부조직 개편 기준)

재정경제부 · 과학기술정보통신부 · 교육부 · 외교부 · 통일부 · 법무부 · 국방부 · 행정안전부 · 국가보훈부 · 문화체육관광부 · 농림축산식품부 · 산업통상부 · 보건복지부 · 기후에너지환경부 · 고용노동부 · 성평등가족부 · 국토교통부 · 해양수산부 · 중소벤처기업부

## 구현된 에이전트 표준 (23종)

| 분류 | 엔드포인트 |
|---|---|
| 검색 | `/robots.txt` (+AI 봇 11종 명시), `/sitemap.xml` |
| 콘텐츠 | `/llms.txt`, `/llms-full.txt`, `/[slug]/llms.txt`, `/[slug]/index.md`, 마크다운 협상 (middleware), JSON-LD, OpenGraph, hreflang, RSS |
| 프로토콜 | `/.well-known/mcp.json`, `/.well-known/ai-plugin.json`, `/.well-known/openid-configuration`, `/.well-known/agent.json`, `/.well-known/security.txt`, `/openapi.json`, `/api/ministries`, `/api/ministries/{slug}`, `/api/plaza` |
| 기타 | `/ai.txt`, `/humans.txt`, `/manifest.webmanifest`, favicon, og:image |

## K-Gov Agent Plaza

`/plaza`는 에이전트를 위한 정부 광장입니다. 부처별 홈페이지를 넘어 Agent Entrance, Ministry Directory, Task Plaza를 한 화면에 묶어 공식 문서, API, 담당 도메인, 권한 경계, human review 지점을 안내합니다.

## K-Gov 업무도구 허브 방향

이 데모는 공무원 업무도구 허브의 전시·검증 레이어로 확장합니다. 목표는 공공데이터포털 API, 법령, 관보, 국회, 문서분석 도구를 MCP 카탈로그로 묶고 OpenClaw 같은 에이전트가 호출하게 하는 것입니다. 비전산직 공무원 UX는 텔레그램보다 익숙한 **카카오톡 업무 채널**을 기본 진입점으로 둡니다.

- MCP 도구 카탈로그: `/api/mcp-tools`
- 기본 사용자 채널: KakaoTalk
- 에이전트 런타임: OpenClaw
- 1차 도구 팩: 공공데이터포털 API, 카카오톡 업무 채널, K-Gov Ready Demo 연결

AgentGram의 에이전트 소셜 네트워크 아이디어를 공공형으로 번역해 `/plaza/agents`(Agent Registry + Capability Cards), `/plaza/tasks`(과업별 작업장), `/plaza/trust`(인기 점수가 아닌 Trust Log)를 추가했습니다.

여기에 `/plaza/drift`를 더해, 공공 에이전트가 친절함·해결률·자동화율 보상 때문에 사람 검토 경계나 근거 보존을 잠식하지 않는지 감시하는 guardrail 레이어도 붙였습니다.

이 로컬 작업 묶음을 다음 세션에서 바로 이어받으려면 아래 문서를 보면 됩니다.

- drift monitor handoff: `docs/behavior-drift-handoff.md`
- featured skill scenario: `docs/featured-skill-scenario.md`

`docs/featured-skill-scenario.md`는 현재 Plaza에서 가장 설득력 있는 대표 흐름을 고정한 메모입니다. 지금 기준 대표 시나리오는 **비전산직 공무원이 공공데이터포털 API 호출을 처음 준비하는 흐름**이며, `k-gov-skill` featured asset → `/api/skills` → `korean-government-api-bundle` dataset metadata surface로 이어지는 동선을 설명합니다.

`/api/plaza`는 같은 내용을 기계가 읽는 JSON으로 제공하고, `/api/plaza/classify?q=...`는 자연어 과업을 plaza task로 분류하는 데모 API입니다.

## 실행

```bash
pnpm install
pnpm dev   # http://localhost:3031
pnpm build
```

## 면책

시연용 데모. 정부 공식 입장/정책/서비스 아님. 서비스 링크 및 일부 연락처는 예시. 실제 부처 정보는 원 사이트 참조.

MIT (code) · CC-BY-4.0 (content)
