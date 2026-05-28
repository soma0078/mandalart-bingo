# Phase 1 (MVP)

> 최종 업데이트: 2026-05-27
> 기획 문서: [PRD](../PRD-mandalart-bingo.md) | [IA & 스크린 플로우](../IA-screen-flow.md)

## 구현

### 익명 인증
- 구현 범위: 앱 시작 시 `signInAnonymously` 자동 호출 (`_layout.tsx` AuthGate)
- Note: Phase 1에서 로그인 장벽 없이 즉시 사용 가능하도록. Phase 2에서 소셜 로그인 후 `linkIdentity`로 기존 데이터 연결 예정

### Board / SubGoal / Cell CRUD
- 구현 범위: `src/lib/` 아래 boards, sub-goals, cells CRUD 함수
- Note: UI와 Supabase 호출을 분리해 훅·컴포넌트의 관심사를 단순하게 유지. `createBoard`는 SubGoal 8개 + Cell 64개를 트랜잭션처럼 함께 생성 — 빈 셀이 항상 존재해야 이후 편집 UI가 단순해지기 때문

### TanStack Query 훅
- 구현 범위: `useGetBoards`, `useGetBoardById`, `useCreateBoard`
- Note: 서버 상태 캐싱·무효화를 Query에 위임해 로딩/에러 처리를 일관되게 관리

### 홈 — 보드 생성 모달
- 구현 범위: React Hook Form + Zod 검증, 바텀시트 애니메이션 (Reanimated)
- Note: 폼 검증을 Zod 스키마로 선언적으로 관리해 타입과 검증 로직을 일원화

### 홈 — 3×3 그리드 표시
- 구현 범위: `MandalaGrid3x3` 컴포넌트, SubGoal position → 그리드 인덱스 매핑
- Note: 보드 목록 나열보다 만다라트 구조를 바로 시각화하는 것이 앱의 핵심 가치에 부합

### 보드 목록 탭 (하단 탭 네비게이션)
- 구현 범위: expo-router `(tabs)` 그룹 도입, `(tabs)/index.tsx` (홈), `(tabs)/list.tsx` (목록), `BoardListItem` 컴포넌트
- Note: 홈 탭은 `boards[0]` 고정 표시를 유지하고 목록 탭은 전체 보드를 FlatList로 나열. `useGetBoards` 캐시를 두 탭이 공유하므로 별도 네트워크 요청 없음. 루트 `index.tsx`는 `(tabs)`로 Redirect만 담당해 진입점 단순화

### 보드 상세 뷰어 및 셀 편집
- 구현 범위: `app/board/[id].tsx` (보드 상세), `app/board/sub/[subGoalId].tsx` (세부 목표 드릴다운), `CellEditSheet` 바텀시트 컴포넌트, mutation 훅 3종 (`useUpdateBoard`, `useUpdateCell`, `useUpdateSubGoal`)
- Note: 보드 상세에서 중앙 셀 탭 → 핵심 목표 편집, 외곽 셀 탭 → 세부 목표 드릴다운으로 내비게이션 분기. 세부 목표 화면에서 중앙 셀 탭 → 세부 목표 제목 편집, 외곽 셀 탭 → 실행 항목 편집+완료 토글. `useGetBoardById` 캐시를 mutation 성공 시 invalidate해 별도 리패치 로직 없이 UI 갱신. 진행률은 실제 DB 셀 수 기준으로 계산해 부분 생성 보드에서도 정확하게 표시

### 보드 뷰 모드 스위치 (3×3 ↔ 9×9)
- 구현 범위: `MandalaGrid9x9` 컴포넌트 신규, `gridMapper.ts` 확장 (`boardToFullGrid`, `getCellMetadata`), `app/board/[id].tsx` 뷰 모드 토글 추가
- Note: 3×3은 세부 목표 8개 + 핵심 목표 중심 뷰 (드릴다운 유도), 9×9는 81칸 전체 표시 (핀치 줌 필요, Phase 2). 그리드 좌표 → SubGoal + Cell 메타데이터 변환 로직으로 모드별 셀 클릭 처리 일원화. 헤더 우측 토글 버튼으로 전환
