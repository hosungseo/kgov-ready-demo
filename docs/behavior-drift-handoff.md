# Behavior Drift Monitor handoff

이 메모는 이번 로컬 작업 묶음을 다음 세션에서 바로 이어받기 위한 handoff다.

## 이번에 로컬 반영된 범위

### 새 레이어
- `app/plaza/drift/page.tsx`
- `app/api/plaza/drift/route.ts`
- `lib/behavior-drift.ts`

### 연결된 표면
- Plaza 홈: `app/plaza/page.tsx`
- Agent Console UI + packet: `app/plaza/console/page.tsx`, `lib/agent-console.ts`
- Human Console UI + packet: `app/plaza/human/page.tsx`, `lib/human-console.ts`
- Deep Sample UI: `app/plaza/samples/[slug]/page.tsx`
- Plaza 메인 JSON: `app/api/plaza/route.ts`
- Deep Samples API: `app/api/plaza/samples/route.ts`, `app/api/plaza/samples/[slug]/route.ts`
- OpenAPI: `app/openapi.json/route.ts`
- llms discovery: `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`
- sitemap: `app/sitemap.ts`
- README: `README.md`

## 핵심 개념
- 공공 에이전트의 좋은 성능은 자동처리율보다 `stop quality`에 가깝다.
- drift monitor는 친절함·해결률·자동화율 보상이 사람 검토 경계와 근거 보존을 잠식하는지 감시한다.
- guardrail은 백엔드 규칙이 아니라 사람에게는 신뢰 문장, 에이전트에게는 stop-state 계기판이어야 한다.

## 현재 drift signal
- `overconfident-routing`
- `hidden-human-review`
- `citation-thinning`
- `empathy-overreach`

## concrete scenario
- `birth-support-deadline` → related sample: `/plaza/samples/birth-care-support`
- `misrouted-civil-complaint` → related sample: `/plaza/samples/safety-report`
- `voucher-summary-without-evidence` → related sample: `/plaza/samples/export-voucher`

이제 세 개 deep sample이 모두 drift coverage를 가진다.
각 시나리오에는 `bad`, `better`, `whyItMatters`, `relatedSample`이 들어가 있어 drift를 문장 수준 + 서비스 사례 수준에서 함께 보여준다.

## 지금까지 붙은 기계가독성 표면
- `/api/plaza`에 `guardrails` 블록 추가
- `/api/plaza/drift`에 signal/checklist/metrics/scenarios 노출
- `/api/plaza/console` packet에 `guardrailFocus` 추가
- `/api/plaza/human` packet에 `guardrails` 추가
- `/api/plaza/samples` 및 `/api/plaza/samples/[slug]`에 `relatedDriftScenarios` 추가
- `openapi.json`에
  - `/api/plaza/drift`
  - `/api/plaza/samples`
  - `/api/plaza/samples/{slug}`
  - `BehaviorDriftMonitor` schema + example
  - `DeepSample` schema + example
  반영 완료
- `llms.txt`, `llms-full.txt`에 drift layer와 scenario 존재를 노출

## UI/정보구조 상태
- Plaza 홈에서 `Trust Log → Agent Passport → Behavior Drift Monitor`가 한 묶음처럼 보이도록 카드 순서를 조정했다.
- `Behavior Drift Monitor` 카드는 amber 톤으로 분리해 guardrail 성격이 바로 읽히게 했다.
- drift page ↔ deep sample page ↔ sample API/OpenAPI가 같은 관계를 공유한다.

## 현재 검증 상태
- 반복적으로 `pnpm build` 통과 확인 완료.
- README/handoff/openapi/route marker는 `grep`으로 재확인했다.
- 아직 commit/push는 하지 않음.

## 추천 commit 단위
한 번에 아래를 묶어도 자연스럽다.
1. drift layer 생성
2. plaza/console/human 연결
3. OpenAPI + llms + sample API/schema 연결
4. scenario + deep sample cross-link + handoff 문서

### 추천 commit message 예시
- `feat: add behavior drift monitor to K-Gov Agent Plaza`

## push 전 빠른 재확인
- `/plaza/drift`
- `/api/plaza/drift`
- `/api/plaza`
- `/api/plaza/samples`
- `/api/plaza/samples/birth-care-support`
- `/api/plaza/samples/export-voucher`
- `/openapi.json`
- `/llms.txt`
- `/llms-full.txt`

## 남은 실제 작업
- local commit
- remote push
- live deploy 후 실제 HTML marker 검증
- canonical Vercel live surface 확인
