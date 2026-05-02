# Behavior Drift Monitor handoff

이 메모는 이번 작업 묶음의 최종 handoff다.

## 최종 상태
- 로컬 구현 완료
- local commit 완료: `2402e9c docs: finalize drift monitor handoff and plaza hierarchy`
- remote push 완료 (`origin/main`)
- live verification 완료

## 이번에 반영된 범위

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

## 기계가독성 표면
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

## 검증 완료 항목
- 반복적으로 `pnpm build` 통과 확인 완료.
- README/handoff/openapi/route marker는 `grep`으로 재확인했다.
- live surface 확인 완료:
  - `/plaza`에서 `Trust Log → Agent Passport → Behavior Drift Monitor` 순서 반영 확인
  - `/api/plaza/drift`에서 3개 scenario 반영 확인
  - `/api/plaza/samples/export-voucher`에서 `relatedDriftScenarios` 반영 확인

## 후속 작업이 있다면
- 이제 남은 일은 새 기능 추가나 후속 확장이지, 이번 drift-monitor 묶음의 마감 작업은 아니다.
- 다음 확장 후보:
  - 추가 drift signal 설계
  - 더 많은 deep sample 축적
  - drift metrics를 실제 운영 로그와 연결
