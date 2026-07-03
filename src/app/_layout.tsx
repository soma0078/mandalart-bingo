import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

const queryClient = new QueryClient();

function RootNavigator() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // OAuth 팝업으로 열린 경우 세션 저장 후 자동 닫기
    // window.opener가 있으면 이 창은 팝업임
    if (window.opener && window.opener !== window) {
      window.close();
      return;
    }

    import('@vercel/speed-insights').then(({ injectSpeedInsights }) => {
      injectSpeedInsights();
    });
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
