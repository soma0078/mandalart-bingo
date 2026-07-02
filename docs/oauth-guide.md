# OAuth 소셜 로그인 연동 가이드

> 작성일: 2026-07-01  
> 대상 스택: Expo (React Native) + Supabase Auth + expo-router  
> 진행자: \_\_\_\_\_\_\_\_\_\_

---

## 참고 공식 문서

| 항목                     | 링크                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ |
| Supabase OAuth 개요      | https://supabase.com/docs/guides/auth/social-login                             |
| Supabase Google Provider | https://supabase.com/docs/guides/auth/social-login/auth-google                 |
| Supabase Apple Provider  | https://supabase.com/docs/guides/auth/social-login/auth-apple                  |
| expo-web-browser         | https://docs.expo.dev/versions/latest/sdk/webbrowser/                          |
| expo-auth-session        | https://docs.expo.dev/versions/latest/sdk/auth-session/                        |
| makeRedirectUri          | https://docs.expo.dev/versions/latest/sdk/auth-session/#makeredirecturioptions |
| Expo 딥링크 설정         | https://docs.expo.dev/guides/linking/                                          |
| Google Cloud Console     | https://console.cloud.google.com/apis/credentials                              |
| Apple Developer          | https://developer.apple.com/account/resources/identifiers/list                 |

---

## Phase 0 — 사전 준비

### 패키지 설치

```bash
npx expo install expo-web-browser expo-auth-session
```

- [ ] `expo-web-browser` 설치 완료
- [ ] `expo-auth-session` 설치 완료
- [ ] `package.json` 버전 확인

**발생한 에러 및 해결:**

```
(기록)
```

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
- [ ] `npx expo start` 재시작 후 scheme 적용 확인

**발생한 에러 및 해결:**

```
(기록)
```

---

## Phase 1 — Supabase 대시보드 설정

### 1-1. Redirect URL 등록

**위치:** Supabase Dashboard → Authentication → URL Configuration

등록할 URL 목록:

| 환경                           | URL                     |
| ------------------------------ | ----------------------- |
| 네이티브 앱 (개발 빌드 / 배포) | `mandalartbingo://`     |
| Expo Go (개발)                 | `exp://localhost:8081`  |
| 웹 로컬                        | `http://localhost:8081` |
| 웹 프로덕션                    | `https://<배포 도메인>` |

> **주의:** Supabase Site URL의 `http://localhost:3000`은 프로젝트 생성 시 자동으로 채워진 초기값.
> 실제 웹 dev 서버는 `package.json`의 `"web"` 스크립트 기준 **8081 포트**.
> Site URL은 fallback 역할만 하며, Redirect URLs allowlist에 없으면 OAuth 콜백이 차단됨.

- [ ] 네이티브 scheme `mandalartbingo://` 등록
- [ ] Expo Go용 `exp://localhost:8081` 등록
- [ ] 웹 로컬 `http://localhost:8081` 등록 (`package.json` web 스크립트 기준)
- [ ] 웹 프로덕션 URL 등록 (배포 시)

**발생한 에러 및 해결:**

```
(기록)
```

---

## Phase 2 — Google 로그인

### 2-1. Google Cloud Console 설정

1. https://console.cloud.google.com → 프로젝트 선택 또는 생성
2. **API 및 서비스 → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 만들기**
3. 애플리케이션 유형: **웹 애플리케이션**
4. 승인된 리디렉션 URI 추가:
   ```
   https://<supabase-project-ref>.supabase.co/auth/v1/callback
   ```

- [ ] Google Cloud 프로젝트 생성 또는 선택
- [ ] OAuth 동의 화면 구성 완료
- [ ] 웹 클라이언트 ID 생성
- [ ] Supabase 콜백 URL을 리디렉션 URI에 추가
- [ ] Client ID, Client Secret 복사

**발생한 에러 및 해결:**

```
(기록)
```

### 2-2. Supabase Google Provider 활성화

**위치:** Authentication → Providers → Google

- [ ] Google Provider 활성화
- [ ] Client ID 입력
- [ ] Client Secret 입력
- [ ] 저장

**발생한 에러 및 해결:**

```
(기록)
```

### 2-3. 코드 구현

**`src/lib/oauth.ts` 생성:**

```ts
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { Platform } from "react-native";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithOAuth(provider: "google" | "apple") {
  const redirectTo = makeRedirectUri({
    scheme: "mandalartbingo",
    path: "auth/callback",
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url)
    return { error: error?.message ?? "OAuth URL 생성 실패" };

  // 웹은 브라우저 리디렉트 방식
  if (Platform.OS === "web") {
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    return { error: null };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === "success") {
    const url = new URL(result.url);
    const params = new URLSearchParams(url.hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token });
    }
  }

  return { error: null };
}
```

- [ ] `src/lib/oauth.ts` 파일 생성
- [ ] `WebBrowser.maybeCompleteAuthSession()` 최상단 호출 확인
- [ ] 로그인 화면에 Google 버튼 추가
- [ ] 실제 로그인 플로우 테스트

**실제 테스트 결과:**

```
(기록 — Expo Go / 개발 빌드 / 웹 각각)
```

**발생한 에러 및 해결:**

```
(기록)
```

---

## Phase 3 — Apple 로그인

> Apple 로그인은 **App Store 배포 시 필수** (타사 OAuth를 제공하는 앱 기준, Apple 가이드라인 4.8)

### 3-1. Apple Developer 설정

1. https://developer.apple.com → Certificates, Identifiers & Profiles
2. **Identifiers → 앱 ID 선택 → Sign in with Apple 활성화**
3. **Identifiers → Services IDs → 새 Services ID 생성**
   - Description: Mandalart Bingo Web
   - Identifier: `im.pppp.mandalart-bingo`
   - Sign in with Apple 활성화 → Configure
   - Return URLs에 추가: `https://<supabase-project-ref>.supabase.co/auth/v1/callback`
4. **Keys → 새 Key 생성 → Sign in with Apple 체크**
   - `.p8` 파일 다운로드 (재다운로드 불가 — 안전하게 보관)

- [ ] 앱 ID에 Sign in with Apple 활성화
- [ ] Services ID 생성
- [ ] Return URL 등록
- [ ] Key 생성 및 `.p8` 파일 저장
- [ ] Key ID, Team ID 기록

**Key ID:** `__________`  
**Team ID:** `__________`

**발생한 에러 및 해결:**

```
(기록)
```

### 3-2. Supabase Apple Provider 활성화

**위치:** Authentication → Providers → Apple

- [ ] Apple Provider 활성화
- [ ] Service ID (Client ID) 입력
- [ ] Team ID 입력
- [ ] Key ID 입력
- [ ] `.p8` 파일 내용 붙여넣기
- [ ] 저장

**발생한 에러 및 해결:**

```
(기록)
```

### 3-3. 네이티브 Apple 로그인 (권장)

네이티브 iOS에서는 `expo-apple-authentication` 사용이 UX상 권장됨 (시스템 다이얼로그 방식):

```bash
npx expo install expo-apple-authentication
```

```ts
import * as AppleAuthentication from "expo-apple-authentication";

const credential = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
});

const { data, error } = await supabase.auth.signInWithIdToken({
  provider: "apple",
  token: credential.identityToken!,
});
```

- [ ] `expo-apple-authentication` 설치
- [ ] `app.json`에 `usesAppleSignIn: true` 추가
- [ ] 네이티브 Apple 로그인 구현
- [ ] 실기기(iOS) 테스트

**발생한 에러 및 해결:**

```
(기록)
```

---

## Phase 4 — 통합 테스트

### 체크리스트

| 시나리오                                 | Expo Go | 개발 빌드 | 웹  | 결과 |
| ---------------------------------------- | ------- | --------- | --- | ---- |
| Google 로그인 성공                       |         |           |     |      |
| Google 로그인 후 세션 유지               |         |           |     |      |
| Google 로그인 → 앱 재시작 후 자동 로그인 |         |           |     |      |
| Apple 로그인 성공 (iOS)                  | —       |           | —   |      |
| 로그아웃 후 재로그인                     |         |           |     |      |
| OAuth 취소 시 에러 없이 복귀             |         |           |     |      |

**범례:** ✅ 통과 / ❌ 실패 / ⏳ 미진행

---

## 주의사항 및 자주 발생하는 에러

| 에러                             | 원인                              | 해결                            |
| -------------------------------- | --------------------------------- | ------------------------------- |
| `redirect_uri_mismatch`          | Google Console에 콜백 URL 미등록  | Supabase 콜백 URL 정확히 등록   |
| `WebBrowser` 열림 없이 바로 닫힘 | `maybeCompleteAuthSession()` 누락 | 파일 최상단에 호출 추가         |
| Expo Go에서 scheme 미작동        | 커스텀 scheme은 Expo Go 미지원    | 개발 빌드(`expo run:ios`) 사용  |
| Apple Key 재발급 불가            | `.p8` 분실                        | Key 삭제 후 재생성              |
| 세션 미설정 (토큰 파싱 실패)     | URL hash 파싱 오류                | `url.hash` vs `url.search` 확인 |

---

## 변경 이력

| 날짜       | 작성자 | 내용      |
| ---------- | ------ | --------- |
| 2026-07-01 | —      | 초안 작성 |
