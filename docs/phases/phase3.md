# Phase 3 (클라우드 및 팀 기능)

> 최종 업데이트: 2026-07-01
> 기획 문서: [PRD](../PRD-mandalart-bingo.md) | [IA & 스크린 플로우](../IA-screen-flow.md)

## 구현

### 사용자 인증 (이메일/비밀번호)

- 구현 범위:
  - `src/contexts/AuthContext.tsx` — Supabase session 구독, `signIn` / `signUp` / `signOut` 제공
  - `src/app/(auth)/_layout.tsx` + `login.tsx` + `signup.tsx` — 로그인·회원가입 화면
  - `src/app/_layout.tsx` — AuthProvider 래핑 + `useSegments` / `useRouter` 기반 세션 리다이렉트 (비로그인 → `/(auth)/login`, 로그인 → `/(tabs)`)
  - `src/app/(tabs)/settings.tsx` — 계정 섹션 (이메일 표시 + 로그아웃)
- Note:
  - Phase 1에서 사용하던 테스트 크레덴셜(EXPO_PUBLIC_TEST_EMAIL/PASSWORD) 기반 AuthGate를 제거하고 실제 이메일 인증 플로우로 교체
  - 회원가입 시 이메일 인증이 필요한 경우(Supabase 설정에 따라) `needsVerification` 플래그로 안내 메시지 분기
  - RLS가 `user_id` 기준으로 보드를 필터링하므로 `boards.ts`의 기존 코드 변경 없이 멀티유저 지원 가능
  - React Hook Form + Zod로 폼 검증 일원화
