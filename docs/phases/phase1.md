# Phase 1 (MVP)

> 최종 업데이트: 2026-05-13
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
