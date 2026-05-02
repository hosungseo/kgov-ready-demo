# Featured skill scenario

이 메모는 `kgov-ready-demo` Plaza에서 현재 가장 설득력 있는 대표 사용 시나리오 1개를 짧게 고정해두기 위한 문서다.

## 시나리오 제목

**비전산직 공무원이 공공데이터포털 API 호출을 처음 준비하는 흐름**

## 왜 이 시나리오가 좋은가

지금 Plaza에는 `k-gov-skill` featured asset, `/api/skills`, existing assets, `korean-government-api-bundle`, `Behavior Drift Monitor`가 이미 있다. 그러나 첫 방문자가 “그래서 이걸 실제로 어떻게 쓰는가”를 한 번에 잡는 대표 흐름은 아직 문서로 고정돼 있지 않았다.

이 시나리오는 그 빈칸을 가장 싸게 메운다.

- 사용자는 공무원 실무와 가깝다.
- `k-gov-skill`의 `public-data-portal` 예제를 바로 쓸 수 있다.
- `korean-government-api-bundle`의 dataset/stat surface와도 자연스럽게 이어진다.
- 키가 없을 때 fallback 안내가 있어 agent-ready 원칙을 설명하기 좋다.
- 위험한 자동화보다 discovery → preparation → human-approved execution 구조를 보여주기 쉽다.

## 대표 사용자 utterance

- "행안부 주민등록 인구 API를 처음 써보려는데, 신청부터 호출 준비까지 한 번에 잡고 싶어요."

## Plaza에서의 권장 동선

1. `/plaza`에서 featured `k-gov-skill` 카드를 본다.
2. `Try first`에서 `npm run example:public-data` 또는 `Getting started`로 들어간다.
3. `/api/skills`에서 `catalog`, `firstRun`, `runnableExamples`를 기계가 읽는다.
4. 필요하면 `korean-government-api-bundle`의 `search_public_dataset` / `get_dataset_metadata`로 dataset 메타데이터를 확인한다.
5. 실제 호출 전에는 key 신청 여부, 파라미터, fallback, safety를 검토한다.

## 연결되는 실제 표면

### Skill side
- repo: `https://github.com/hosungseo/k-gov-skill`
- first run: `https://github.com/hosungseo/k-gov-skill/blob/main/docs/getting-started.md`
- catalog: `https://raw.githubusercontent.com/hosungseo/k-gov-skill/main/examples/skill-catalog.json`
- public data API catalog: `https://raw.githubusercontent.com/hosungseo/k-gov-skill/main/examples/public-data-api-catalog.json`
- 대표 예제: `npm run example:public-data`

### Plaza side
- live page: `https://kgov-ready-demo.vercel.app/plaza`
- skill API: `https://kgov-ready-demo.vercel.app/api/skills`

### Bundle side
- `kgab search-public-dataset 주민등록 인구 --limit 5`
- `kgab get-dataset-metadata --dataset-id 15108065`

## 왜 지금 바로 구현을 더 늘리지 않았는가

지금 필요한 것은 새 기능 수보다 **대표 흐름의 선명도**다. 이미 있는 자산들이 서로 어떻게 이어지는지 한 문단으로 설명되지 않으면, 다음 구현도 산발적으로 느껴질 가능성이 크다.

따라서 다음 확장 전 기준선으로 이 시나리오를 먼저 고정한다.

## 다음 확장 후보

- 이 시나리오를 Plaza 내 별도 카드나 walkthrough 문구로 승격
- `/api/skills`와 `korean-government-api-bundle` CLI 예시를 한 화면의 before/after packet으로 연결
- `Behavior Drift Monitor` 관점에서 "키가 없는데도 호출 성공처럼 과장하지 않기" 시나리오를 추가
