# CLAUDE.md

만다라트 기법(9×9 그리드)으로 목표를 설정하고 빙고처럼 달성을 추적하는 React Native 앱.
기획 문서: `docs/PRD-mandalart-bingo.md`, `docs/IA-screen-flow.md`

## 기술 스택

React Native + Expo / expo-router / TanStack Query v5 / React Hook Form + Zod / Supabase v2 / TypeScript

## RN/Expo API 검증 원칙

RN 또는 Expo API를 사용하는 코드를 작성하기 전에:
1. `package.json`에서 현재 `react-native` 및 `expo` 버전을 확인
2. 사용할 API가 해당 버전 기준으로 deprecated되지 않았는지 WebSearch로 검증
3. deprecated된 경우 공식 문서의 대체 API를 사용

## 설계 및 구현 원칙

- 서버 상태는 TanStack Query로 관리. 별도 전역 상태는 반드시 필요한 근거가 있을 때만 도입
- 폼은 React Hook Form + Zod 조합으로 통일
- Supabase 호출은 `src/lib/`에서만. 컴포넌트나 훅에서 직접 호출 금지
- 새 쿼리 훅 추가 시 `src/constants/cacheKeys.ts`에 키 등록 후 사용

## 워크플로우

**구현·수정·개선 작업 완료 후 자동으로 다음을 수행:**
1. `docs/PRD-mandalart-bingo.md` 해당 항목 체크박스 `[ ]` → `[x]` 업데이트
2. 해당 Phase 문서(`docs/phases/`)에:
   - 작업 내용과 설계 근거 기록 (구현 범위, Note)
   - 최종 업데이트 날짜 갱신
3. 관련 파일 커밋
 