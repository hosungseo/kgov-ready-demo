# K-Gov Agent-Ready 시안

대한민국 19개 중앙부처 사이트를 **AI 에이전트용으로 다시 짠 시안**. 모든 페이지와 엔드포인트가 agent-ready-check 스캐너의 23가지 표준을 모두 만족하도록 설계.

- **라이브**: https://kgov-ready-demo.vercel.app
- **스캐너**: https://agent-ready-check.vercel.app — 이 데모 점수 즉시 확인

## 포함 부처 (2026 정부조직 개편 기준)

재정경제부 · 과학기술정보통신부 · 교육부 · 외교부 · 통일부 · 법무부 · 국방부 · 행정안전부 · 국가보훈부 · 문화체육관광부 · 농림축산식품부 · 산업통상부 · 보건복지부 · 기후에너지환경부 · 고용노동부 · 성평등가족부 · 국토교통부 · 해양수산부 · 중소벤처기업부

## 구현된 에이전트 표준 (23종)

| 분류 | 엔드포인트 |
|---|---|
| 검색 | `/robots.txt` (+AI 봇 11종 명시), `/sitemap.xml` |
| 콘텐츠 | `/llms.txt`, `/llms-full.txt`, `/[slug]/llms.txt`, `/[slug]/index.md`, 마크다운 협상 (middleware), JSON-LD, OpenGraph, hreflang, RSS |
| 프로토콜 | `/.well-known/mcp.json`, `/.well-known/ai-plugin.json`, `/.well-known/openid-configuration`, `/.well-known/agent.json`, `/.well-known/security.txt`, `/openapi.json`, `/api/ministries`, `/api/ministries/{slug}` |
| 기타 | `/ai.txt`, `/humans.txt`, `/manifest.webmanifest`, favicon, og:image |

## 실행

```bash
pnpm install
pnpm dev   # http://localhost:3031
pnpm build
```

## 면책

시연용 데모. 정부 공식 입장/정책/서비스 아님. 서비스 링크 및 일부 연락처는 예시. 실제 부처 정보는 원 사이트 참조.

MIT (code) · CC-BY-4.0 (content)
