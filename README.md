# 만다라트 빙고 (Mandalart Bingo)

만다라트 기법으로 목표를 설정하고, 빙고처럼 달성을 추적하는 React Native 앱.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 플랫폼 | React Native 0.81 + Expo 54 |
| 라우팅 | expo-router (파일 기반) |
| 서버 상태 | TanStack Query v5 |
| 폼 | React Hook Form + Zod |
| 백엔드 | Supabase (PostgreSQL + Auth) |
| 언어 | TypeScript 5 |

## 시작하기

```bash
pnpm install
pnpm start
```

환경 변수 설정 (`.env`):

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_KEY=...
```

## 프로젝트 구조

```
src/
├── app/            # expo-router 화면 (파일 = 라우트)
├── components/     # UI 컴포넌트
├── hooks/          # TanStack Query 훅
├── lib/            # Supabase CRUD 함수
├── types/          # TypeScript 타입 정의
└── constants/      # 캐시 키 등 상수
```

## 데이터 모델

```
Board (만다라트)
└── SubGoal × 8  (세부 목표, position 0~7)
    └── Cell × 8 (실행 항목, position 0~7)
```

홈 화면에서 보이는 3×3 그리드의 position 매핑:

```
0 1 2
3 C 4   (C = 중앙 핵심 목표)
5 6 7
```

## 구현 현황

### 완료
- Supabase 익명 인증 연동
- Board / SubGoal / Cell CRUD 레이어
- TanStack Query 훅 (`useGetBoards`, `useGetBoardById`, `useCreateBoard`)
- 홈 화면: Empty State / 보드 생성 모달 / 3×3 그리드 표시

### Phase 1 미완성
- 드릴다운 뷰 (세부 목표 3×3 상세)
- 셀 완료 체크 및 진행률 표시
- 빙고 달성 감지
- 9×9 전체 그리드 뷰
- 통계 / 내역 / 설정 탭

자세한 기획은 [`docs/PRD-mandalart-bingo.md`](docs/PRD-mandalart-bingo.md), [`docs/IA-screen-flow.md`](docs/IA-screen-flow.md) 참고.
