import { supabase } from "@/lib/supabase";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function runAuthCheck() {
      setReady(false);
      setError(null);

      const email = process.env.EXPO_PUBLIC_TEST_EMAIL;
      const password = process.env.EXPO_PUBLIC_TEST_PASSWORD;

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("[AuthGate] getSession failed", sessionError);
        if (!cancelled) {
          setError(`getSession failed: ${sessionError.message}`);
        }
        return;
      }

      if (!data.session) {
        if (!email || !password) {
          const message = "Missing EXPO_PUBLIC_TEST_EMAIL or EXPO_PUBLIC_TEST_PASSWORD";
          console.error("[AuthGate] missing test credentials");
          if (!cancelled) setError(message);
          return;
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("[AuthGate] signInWithPassword failed", signInError);
          if (!cancelled) {
            setError(`signInWithPassword failed: ${signInError.message}`);
          }
          return;
        }

        if (!signInData.session) {
          const message = "Sign-in returned no session";
          console.error("[AuthGate] signInWithPassword returned no session");
          if (!cancelled) setError(message);
          return;
        }
      }

      if (!cancelled) {
        setReady(true);
      }
    }

    runAuthCheck();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (error) {
    return (
      <View style={styles.authError}>
        <Text style={styles.authTitle}>인증 실패</Text>
        <Text style={styles.authMessage}>{error}</Text>
        <Pressable onPress={() => setAttempt((current) => current + 1)} style={styles.retryButton}>
          <Text style={styles.retryText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.authLoading}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>인증 확인 중...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      import('@vercel/speed-insights').then(({ injectSpeedInsights }) => {
        injectSpeedInsights();
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthGate>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  authLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  authError: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  authMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#111827",
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
