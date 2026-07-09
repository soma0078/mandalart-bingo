# OAuth 소셜 로그인 연동 가이드

> 작성일: 2026-07-01  
> 최종 업데이트: 2026-07-03  
> 대상 스택: Expo (React Native) + Supabase Auth + expo-router  
> 진행자: \_\_\_\_\_\_\_\_\_\_

---

## 참고 공식 문서

| 항목 | 링크 |
| --- | --- |
| Supabase OAuth 개요 | https://supabase.com/docs/guides/auth/social-login |
| Supabase Google Provider | https://supabase.com/docs/guides/auth/social-login/auth-google |
| Supabase Apple Provider | https://supabase.com/docs/guides/auth/social-login/auth-apple |
| expo-web-browser | https://docs.expo.dev/versions/latest/sdk/webbrowser/ |
| expo-auth-session | https://docs.expo.dev/versions/latest/sdk/auth-session/ |
| makeRedirectUri | https://docs.expo.dev/versions/latest/sdk/auth-session/#makeredirecturioptions |
| Expo 딥링크 설정 | https://docs.expo.dev/guides/linking/ |
| Google Cloud Console | https://console.cloud.google.com/apis/credentials |
| Apple Developer | https://developer.apple.com/account/resources/identifiers/list |

---

## Phase 0 — 사전 준비

### 패키지 설치

```bash
npx expo install expo-web-browser expo-auth-session
```

- [x] `expo-web-browser` 설치 완료
- [x] `expo-auth-session` 설치 완료
- [x] `package.json` 버전 확인

---

### app.json — Scheme 확인

현재 `app.json`에 이미 등록되어 있음:

```json
{
  "expo": {
    "scheme": "mandalartbingo"
  }
}
```

- [x] `app.json`에 `scheme` 필드 확인 (`mandalartbingo`)

---

## Phase 1 — Supabase 대시보드 설정

### 1-1. Redirect URL 등록

**위치:** Supabase Dashboard → Authentication → URL Configuration

등록할 URL 목록:

| 환경 | URL |
| --- | --- |
| 네이티브 앱 (개발 빌드 / 배포) | `mandalartbingo://` |
| Expo Go (개발) | `exp://localhost:8081` |
| 웹 로컬 | `http://localhost:8081/auth/callback` |
| 웹 프로덕션 | `https://<배포 도메인>/auth/callback` |

- [x] 네이티브 scheme `mandalartbingo://` 등록
- [x] Expo Go용 `exp://localhost:8081` 등록
- [x] 웹 로컬 `http://localhost:8081/auth/callback` 등록
- [ ] 웹 프로덕션 URL 등록 (배포 시)

> **⚠️ 이슈 — Site URL과 Redirect URLs의 차이**
>
> **현상:** Supabase Site URL에 `http://localhost:3000`이 자동으로 세팅되어 있었음 (프로젝트 생성 시 기본값)  
> **원인:** Site URL은 fallback 역할. `redirectTo`가 allowlist에 없으면 Site URL로 떨어짐  
> **해결:** Site URL을 실제 dev 서버 포트(`http://localhost:8081`)로 변경하고, Redirect URLs allowlist에 `/auth/callback` 경로까지 포함한 URL을 등록

> **⚠️ 이슈 — 포트 혼동**
>
> `package.json`의 `"web"` 스크립트: `expo start --web --port 8083`으로 되어 있었으나,  
> 실제 Expo dev 서버는 **8081 포트**로 실행됨 (스크립트 설정과 무관하게 Expo 기본값이 적용된 것으로 추정)  
> → Supabase allowlist에는 실제 접속 중인 포트 기준으로 등록해야 함

---

## Phase 2 — Google 로그인

### 2-1. Supabase Callback URL 확인

> **공식 문서:** https://supabase.com/docs/guides/auth/social-login/auth-google

승인된 리디렉션 URI는 Supabase 대시보드에서 직접 확인:

```
Authentication → Providers → Google → Callback URL (for OAuth)
```

형식:

```
https://<project-ref>.supabase.co/auth/v1/callback
```

> **참고:** Client Secret은 Google Cloud Console → API 및 서비스 → 사용자 인증 정보 →  
> 해당 OAuth 2.0 클라이언트 ID 우측 수정(연필) 아이콘 클릭 시 확인 가능

- [x] Supabase Google Provider 화면에서 Callback URL 복사

---

### 2-2. Google Cloud Console 설정

1. https://console.cloud.google.com → 프로젝트 선택 또는 생성
2. **API 및 서비스 → OAuth 동의 화면** 구성 (User Type: External)
3. **API 및 서비스 → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 만들기**
4. 애플리케이션 유형: **웹 애플리케이션**
5. **승인된 리디렉션 URI**에 Supabase Callback URL 추가

- [x] Google Cloud 프로젝트 생성 또는 선택
- [x] OAuth 동의 화면 구성 완료
- [x] 웹 클라이언트 ID 생성
- [x] Supabase Callback URL을 리디렉션 URI에 추가
- [x] Client ID, Client Secret 복사

---

### 2-3. Supabase Google Provider 활성화

**위치:** Authentication → Providers → Google

- [x] Google Provider 활성화
- [x] Client ID 입력
- [x] Client Secret 입력
- [x] 저장

---

### 2-4. 코드 구현

#### 구현 파일 목록

| 파일 | 역할 |
| --- | --- |
| `src/lib/oauth.ts` | OAuth 로직 (플랫폼별 분기) |
| `src/app/auth/callback.tsx` | OAuth 콜백 라우트 |
| `src/app/_layout.tsx` | 팝업 감지 및 자동 닫기 |
| `src/app/(auth)/login.tsx` | Google 로그인 버튼 UI |

#### `src/lib/oauth.ts`

```ts
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithOAuth(provider: 'google' | 'apple') {
  const redirectTo = makeRedirectUri({
    scheme: 'mandalartbingo',
    path: 'auth/callback',
  });

  if (Platform.OS === 'web') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) return { error: error?.message ?? 'OAuth URL 생성 실패' };

    // 팝업으로 열기 (화면 중앙 배치)
    const width = 500, height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(data.url, 'oauth-popup', `popup,width=${width},height=${height},left=${left},top=${top}`);
    return { error: null };
  }

  // 네이티브: 인앱 브라우저 시트
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) return { error: error?.message ?? 'OAuth URL 생성 실패' };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'success') {
    const url = new URL(result.url);
    const params = new URLSearchParams(url.hash.slice(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token });
    }
  }
  return { error: null };
}
```

#### `src/app/auth/callback.tsx`

```tsx
import { ActivityIndicator, View } from 'react-native';

export default function AuthCallback() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
```

#### `src/app/_layout.tsx` — 팝업 자동 닫기 추가

```ts
useEffect(() => {
  if (Platform.OS !== 'web') return;
  if (window.opener && window.opener !== window) {
    window.close(); // 팝업이면 인증 완료 후 자동 닫기
    return;
  }
  // ...
}, []);
```

#### 웹 동작 흐름

```
Google 버튼 클릭
  → window.open(oauthUrl, 'oauth-popup')   ← 팝업 창 열림
  → 사용자가 팝업에서 Google 계정 선택
  → Google → Supabase → redirectTo(localhost:8081/auth/callback) 리디렉트
  → 팝업에서 expo-router가 /auth/callback 매칭
  → Supabase SDK가 URL 해시에서 토큰 파싱 → localStorage 저장
  → _layout.tsx: window.opener 감지 → window.close()
  → 메인 창 onAuthStateChange 발동 → (tabs) 이동
```

#### 네이티브 동작 흐름

```
Google 버튼 탭
  → WebBrowser.openAuthSessionAsync() ← 인앱 브라우저 시트
  → Google 인증 완료 → mandalartbingo://auth/callback 딥링크
  → result.url 에서 토큰 파싱 → supabase.auth.setSession()
  → AuthContext onAuthStateChange → (tabs) 이동
```

- [x] `src/lib/oauth.ts` 파일 생성
- [x] `src/app/auth/callback.tsx` 콜백 라우트 생성
- [x] `_layout.tsx` 팝업 자동 닫기 추가
- [x] 로그인 화면에 Google 버튼 추가
- [ ] 실제 로그인 플로우 테스트 (웹 / 네이티브)

---

## 트러블슈팅 — 구현 중 발생한 이슈

### ❶ OAuth 후 Vercel 도메인으로 리디렉트됨

**현상:** 로컬에서 테스트했는데 인증 후 `mandalart-bingo.vercel.app`으로 이동  
**원인:**
- `makeRedirectUri()`가 생성하는 `http://localhost:8081/auth/callback`이 Supabase Redirect URLs allowlist에 없었음
- Supabase가 allowlist 불일치 → Site URL(Vercel)로 fallback  

**해결:** Supabase → Authentication → URL Configuration → Redirect URLs에 경로까지 포함해서 등록

```
http://localhost:8081/auth/callback
```

> 경로(`/auth/callback`) 없이 `http://localhost:8081`만 등록하면 매칭 안 됨

---

### ❷ 팝업에서 "Unmatched Route" 에러

**현상:** 팝업 창에 expo-router의 "Unmatched Route — Page could not be found" 표시  
**원인:** `redirectTo`에 `/auth/callback` 경로를 사용했는데 해당 라우트 파일이 없었음  
**해결:** `src/app/auth/callback.tsx` 파일 생성

> `(auth)` 그룹(`src/app/(auth)/`)과 다름. `auth/callback`은 별도의 일반 라우트

---

### ❸ 팝업이 인증 후 닫히지 않음

**현상:** Google 인증 완료 후 팝업이 자동으로 닫히지 않고 콜백 페이지에 멈춤  
**원인:** 팝업을 닫는 코드가 없었음  
**해결:** `_layout.tsx`에 `window.opener` 감지 로직 추가

```ts
if (window.opener && window.opener !== window) {
  window.close();
}
```

> Supabase SDK는 앱 초기화 시점에 URL 해시에서 토큰을 파싱해 localStorage에 저장하므로,  
> `window.close()` 호출 전에 이미 토큰 저장이 완료됨.  
> 메인 창의 `onAuthStateChange`는 localStorage 변경 이벤트로 세션을 감지함.

---

## Phase 3 — Kakao 로그인

> **⚠️ 중요:** Supabase는 Kakao를 기본 OAuth Provider로 지원하지 않음.
> Kakao SDK로 토큰을 직접 획득한 뒤, **Supabase Edge Function**을 통해 Supabase 세션으로 교환하는 방식을 사용.

### 참고 문서

| 항목 | 링크 |
| --- | --- |
| Kakao Developers | https://developers.kakao.com |
| Kakao JS SDK | https://developers.kakao.com/docs/latest/ko/javascript/getting-started |
| @react-native-seoul/kakao-login | https://github.com/crossplatformkorea/react-native-kakao-login |
| Supabase Edge Functions | https://supabase.com/docs/guides/functions |
| Supabase Admin API (createUser) | https://supabase.com/docs/reference/javascript/auth-admin-createuser |

---

### 3-1. Kakao Developers 앱 등록

1. https://developers.kakao.com → 내 애플리케이션 → 애플리케이션 추가
2. **앱 키** 확인 (JavaScript 키, REST API 키, Native 앱 키)
3. **플랫폼 추가:**
   - Web: 사이트 도메인 등록 (`http://localhost:8081`, `https://<배포 도메인>`)
   - iOS: 번들 ID 등록 (`com.soma0078.mandalartbingo`)
   - Android: 패키지명 + 키 해시 등록
4. **카카오 로그인 → 활성화**
5. **Redirect URI 등록** (웹 방식 사용 시):
   ```
   http://localhost:8081/auth/callback
   https://<배포 도메인>/auth/callback
   ```
6. **동의항목** 설정: 이메일(선택), 프로필(닉네임/프로필사진) 등

- [ ] 애플리케이션 생성
- [ ] 앱 키 복사 (JavaScript 키, REST API 키)
- [ ] 플랫폼 등록 (Web / iOS / Android)
- [ ] 카카오 로그인 활성화
- [ ] Redirect URI 등록
- [ ] 동의항목 설정

---

### 3-2. Supabase Edge Function — 토큰 교환

Kakao 토큰을 Supabase 세션으로 교환하는 서버리스 함수.

```bash
npx supabase functions new kakao-auth
```

**`supabase/functions/kakao-auth/index.ts`:**

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // admin 권한
);

Deno.serve(async (req) => {
  const { kakao_access_token } = await req.json();

  // 1. Kakao API로 사용자 정보 조회
  const kakaoRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${kakao_access_token}` },
  });
  if (!kakaoRes.ok) {
    return new Response(JSON.stringify({ error: 'Kakao 사용자 조회 실패' }), { status: 400 });
  }
  const kakaoUser = await kakaoRes.json();

  const kakaoId = String(kakaoUser.id);
  const email = kakaoUser.kakao_account?.email;
  const name = kakaoUser.kakao_account?.profile?.nickname;

  // 2. 기존 유저 조회 또는 신규 생성
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users.find(
    (u) => u.user_metadata?.kakao_id === kakaoId,
  );

  let userId: string;

  if (existing) {
    userId = existing.id;
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: email ?? `kakao_${kakaoId}@kakao.local`,
      email_confirm: true,
      user_metadata: { kakao_id: kakaoId, full_name: name, provider: 'kakao' },
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    userId = newUser.user!.id;
  }

  // 3. 해당 유저의 세션 생성
  const { data: session, error: sessionError } = await supabase.auth.admin.createSession({ userId });
  if (sessionError) return new Response(JSON.stringify({ error: sessionError.message }), { status: 500 });

  return new Response(JSON.stringify(session), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

```bash
npx supabase functions deploy kakao-auth
```

- [ ] Edge Function 생성
- [ ] 코드 작성
- [ ] 배포 완료
- [ ] Supabase 대시보드에서 함수 확인

---

### 3-3. 클라이언트 코드 구현

#### 웹 (Kakao JS SDK)

`index.html` 또는 루트 레이아웃에 SDK 로드 (웹 전용):

```html
<script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"></script>
```

```ts
// src/lib/oauth.ts에 추가
export async function signInWithKakao() {
  if (Platform.OS === 'web') {
    const Kakao = (window as any).Kakao;
    if (!Kakao.isInitialized()) {
      Kakao.init(process.env.EXPO_PUBLIC_KAKAO_JS_KEY);
    }

    return new Promise<{ error: string | null }>((resolve) => {
      Kakao.Auth.login({
        success: async (authObj: { access_token: string }) => {
          const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/kakao-auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_KEY}`,
            },
            body: JSON.stringify({ kakao_access_token: authObj.access_token }),
          });
          const session = await res.json();
          if (session.error) return resolve({ error: session.error });
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
          resolve({ error: null });
        },
        fail: () => resolve({ error: '카카오 로그인 실패' }),
      });
    });
  }

  // 네이티브는 아래 참고
  return { error: '네이티브 미구현' };
}
```

#### 네이티브 (`@react-native-seoul/kakao-login`)

> **⚠️ Expo Go 미지원** — 개발 빌드(`expo run:ios`) 필요

```bash
npx expo install @react-native-seoul/kakao-login
```

`app.json`에 config plugin 추가:

```json
{
  "expo": {
    "plugins": [
      ["@react-native-seoul/kakao-login", {
        "kakaoAppKey": "YOUR_NATIVE_APP_KEY",
        "kotlinVersion": "1.8.0"
      }]
    ]
  }
}
```

```ts
import { login } from '@react-native-seoul/kakao-login';

const { accessToken } = await login();

const res = await fetch(`${SUPABASE_URL}/functions/v1/kakao-auth`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_KEY}`,
  },
  body: JSON.stringify({ kakao_access_token: accessToken }),
});
const session = await res.json();
await supabase.auth.setSession({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
});
```

- [ ] 웹: Kakao JS SDK 초기화 및 로그인 구현
- [ ] 네이티브: `@react-native-seoul/kakao-login` 설치 및 config plugin 설정
- [ ] Edge Function 연동 테스트
- [ ] `EXPO_PUBLIC_KAKAO_JS_KEY` 환경변수 `.env`에 추가

---

### 3-4. Google과의 구현 차이

| 항목 | Google | Kakao |
| --- | --- | --- |
| Supabase 기본 지원 | ✅ | ❌ (Edge Function 필요) |
| 토큰 교환 주체 | Supabase 서버 자동 처리 | 직접 Edge Function 구현 |
| 웹 방식 | `window.open()` 팝업 | Kakao JS SDK 팝업 |
| 네이티브 방식 | `WebBrowser.openAuthSessionAsync` | `@react-native-seoul/kakao-login` |
| Expo Go 지원 | ⚠️ 제한적 | ❌ 불가 |

---

## Phase 4 — 통합 테스트

| 시나리오 | Expo Go | 개발 빌드 | 웹 | 결과 |
| --- | --- | --- | --- | --- |
| Google 로그인 성공 | | | | |
| Google 로그인 후 세션 유지 | | | | |
| 앱 재시작 후 자동 로그인 | | | | |
| Kakao 로그인 성공 | — | | | |
| Kakao 로그인 후 세션 유지 | — | | | |
| 로그아웃 후 재로그인 | | | | |
| OAuth 취소 시 에러 없이 복귀 | | | | |

**범례:** ✅ 통과 / ❌ 실패 / ⏳ 미진행

---

## 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-07-01 | 초안 작성 |
| 2026-07-02 | scheme 오류 수정 (`mandalart-bingo` → `mandalartbingo`), 포트 정정, Redirect URL 목록 업데이트 |
| 2026-07-03 | Google 로그인 구현 완료, 트러블슈팅 3건 기록 (Vercel fallback / Unmatched Route / 팝업 미닫힘) |
| 2026-07-09 | Phase 3 Apple → Kakao 로그인으로 교체 (Edge Function 방식) |
