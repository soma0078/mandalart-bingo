# 배포 전략

최종 업데이트: 2026-06-17

## GitHub Actions CI/CD

### 워크플로우 구조

```
main 브랜치 push
  └── deploy-pwa.yml → Vercel PWA 자동 배포 (~2분)

v*.*.* 태그 push
  └── deploy-android.yml → EAS Android 빌드 (~15분)
```

EAS 빌드는 크레딧 소모가 크므로 태그 기반으로만 트리거.

### 워크플로우 파일

| 파일 | 트리거 | 동작 |
|---|---|---|
| `.github/workflows/deploy-pwa.yml` | `main` push | Expo 웹 빌드 → Vercel 배포 |
| `.github/workflows/deploy-android.yml` | `v*.*.*` 태그 push | EAS preview 빌드 (APK) |

### GitHub Secrets

| Secret | 용도 |
|---|---|
| `EXPO_TOKEN` | EAS 인증 (expo.dev → Account Settings → Access Tokens) |
| `VERCEL_TOKEN` | Vercel 배포 인증 |
| `VERCEL_ORG_ID` | Vercel Team ID |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID (`.vercel/project.json`) |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase URL |
| `EXPO_PUBLIC_SUPABASE_KEY` | Supabase anon key |

### Android 릴리즈 방법

```bash
git tag v1.0.0
git push origin v1.0.0
```

태그 push 시 EAS 빌드가 자동 실행되고, 완료 후 APK 다운로드 링크가 expo.dev에서 확인 가능.

### 배포 확인
- **PWA**: GitHub Actions 탭 → `Deploy PWA to Vercel` 워크플로우 green → Vercel URL 접속
- **Android**: expo.dev → 프로젝트 → Builds → APK 다운로드 링크 생성 확인

---

## 플랫폼별 배포 방식

| 플랫폼 | 방식 |
|---|---|
| Android | EAS Internal Distribution (APK) |
| Web/iOS | PWA (Vercel 호스팅) |
| iOS 네이티브 | 보류 |

---

## Android — EAS

### 설정
- 패키지명: `com.soma0078.mandalartbingo`
- EAS Project ID: `71040ce8-967b-4472-ba35-0f4f17211f1f`
- 키스토어: EAS 클라우드 관리

### 빌드 프로파일 (`eas.json`)
- `development`: 개발 클라이언트, internal distribution
- `preview`: Internal Distribution (APK 링크 공유) ← 테스트 배포용
- `production`: 스토어 배포용 (autoIncrement)

### 테스트 배포 명령
```bash
eas build --profile preview --platform android
```

빌드 완료 후 APK 다운로드 링크로 직접 설치.

---

## PWA — Vercel

### Vercel 빌드 설정
| 항목 | 값 |
|---|---|
| Framework Preset | Other |
| Build Command | `npx expo export --platform web` |
| Output Directory | `dist` |

### PWA 사용자 접근 흐름
```
브라우저에서 URL 접속 → "홈 화면에 추가" → 앱 아이콘으로 실행
```

- iOS(Safari)에서도 Apple Developer 계정 없이 설치 가능
- `app.json`에 `display: "standalone"` 등 PWA 설정 이미 적용됨
