# Phase PWA

> 최종 업데이트: 2026-06-24
> 기획 문서: [PRD](../PRD-mandalart-bingo.md)

## 목표

웹 앱을 설치 가능한 PWA로 전환하고, 오프라인에서도 기존 데이터 조회 및 목표 완료 체크가 가능하도록 한다.

---

## 현황 (설계 시점)

| 항목 | 상태 |
|------|------|
| `display: "standalone"` | ✅ app.json 설정됨 |
| manifest (name, themeColor 등) | ✅ Expo 자동 생성 |
| Vercel 배포 | ✅ |
| 서비스 워커 | ❌ 없음 |
| 오프라인 데이터 | ❌ 없음 |
| PWA 아이콘 전 사이즈 | ❌ favicon만 존재 |
| Apple PWA 메타태그 | ❌ 없음 |

---

## 구현 범위

### Layer 1 — 앱쉘 (Service Worker)
JS/CSS 등 정적 자산을 SW가 캐시 → 오프라인에서도 앱 UI 로딩

### Layer 2 — 읽기 오프라인 (TanStack Query 캐시 지속)
`persistQueryClient` + IndexedDB(웹) / AsyncStorage(네이티브) 로 쿼리 캐시 유지  
→ 기존 `useGetBoards`, `useGetBoardById` 등 훅 수정 없음

### Layer 3 — 쓰기 오프라인 (뮤테이션 큐)
`networkMode: 'offlineFirst'` 설정 → 오프라인 중 뮤테이션 큐잉 → 재연결 시 자동 재시도

---

## 변경 범위

### 새 패키지
```
@tanstack/react-query-persist-client
@tanstack/query-async-storage-persister
idb-keyval   (웹 IndexedDB 어댑터)
```
네이티브는 기존 `@react-native-async-storage/async-storage` 재사용

### 새 파일
```
src/lib/queryPersister.web.ts     idb-keyval 기반 웹 어댑터
src/lib/queryPersister.native.ts  AsyncStorage 기반 네이티브 어댑터
public/sw.js                      앱쉘 캐시 서비스 워커
public/icons/icon-192.png         PWA 설치 필수 아이콘
public/icons/icon-512.png         PWA 설치 필수 아이콘
scripts/patch-pwa.js              빌드 후 HTML 패치 (SW 등록, Apple 메타태그, manifest icons 보완)
```

### 수정 파일
```
src/app/_layout.tsx
  QueryClientProvider → PersistQueryClientProvider
  QueryClient defaultOptions에 networkMode: 'offlineFirst' 추가

package.json
  "build:web": "expo export --platform web && node scripts/patch-pwa.js"
```

---

## _layout.tsx 변경 모양

```ts
// 변경 전
const queryClient = new QueryClient();
<QueryClientProvider client={queryClient}>

// 변경 후
const queryClient = new QueryClient({
  defaultOptions: {
    queries:   { networkMode: 'offlineFirst', staleTime: 1000 * 60 * 5 },
    mutations: { networkMode: 'offlineFirst' },
  },
});
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister }}  // web: idb-keyval, native: AsyncStorage
>
```

---

## 오프라인 UX

| 상황 | 경험 |
|------|------|
| 오프라인에서 앱 열기 | 마지막 캐시 데이터 즉시 표시 |
| 오프라인에서 목표 완료 체크 | 낙관적 업데이트 → 온라인 복귀 시 자동 동기화 |
| 오프라인에서 새 만다라트 생성 | 뮤테이션 큐 → 온라인 복귀 시 전송 |
| 캐시 없는 첫 방문 오프라인 | "인터넷 연결이 필요합니다" 안내 |

---

## 성공 기준

1. **읽기 오프라인**: 한 번 데이터 로드 후 Network > Offline 체크 → 새로고침해도 만다라트 표시됨
2. **쓰기 오프라인**: 오프라인에서 목표 완료 → 온라인 복귀 → Supabase에 반영됨
3. **설치 가능**: Lighthouse PWA 항목 통과
4. **앱쉘**: 오프라인에서 완전 새 탭 열어도 앱 UI 로딩됨

---

## 구현 순서

1. 패키지 설치
2. `queryPersister.web.ts` / `queryPersister.native.ts`
3. `_layout.tsx` 수정
4. `public/sw.js` 작성
5. `scripts/patch-pwa.js` 작성 + 아이콘 생성
6. CI (`deploy-pwa.yml`) 빌드 커맨드 업데이트
