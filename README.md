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

### Phase 1 — 완료
- Supabase 익명 인증 + Board / SubGoal / Cell CRUD
- 홈: 보드 생성 모달, 3×3 그리드, 뷰 모드 스위치 (3×3 ↔ 9×9)
- 드릴다운 뷰, 바텀시트 편집
- 셀 완료 체크 + 진행률 표시 + 빙고 감지 (가로/세로/대각선)
- 통계 탭, 내역 탭, 설정 탭

### Phase 2 — 완료
- 다크 모드 + 동적 테마 시스템
- 홈 Momentum 뷰 (진행률 기반 집중 목표 자동 추천)
- 빙고 달성 축하 애니메이션
- 템플릿 시스템
- 공유 기능 (이미지/PDF)

---

기획 문서: [`docs/PRD-mandalart-bingo.md`](docs/PRD-mandalart-bingo.md), [`docs/IA-screen-flow.md`](docs/IA-screen-flow.md)  
배포 전략: [`docs/deployment.md`](docs/deployment.md)
