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

    // 팝업으로 OAuth 창 열기
    // 인증 완료 시 팝업이 redirectTo로 이동 → Supabase SDK가 토큰을 localStorage에 저장
    // → 메인 창 onAuthStateChange가 storage 이벤트로 세션 감지
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      data.url,
      'oauth-popup',
      `popup,width=${width},height=${height},left=${left},top=${top}`,
    );
    return { error: null };
  }

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
