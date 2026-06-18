import { supabase } from "@/lib/supabase";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        // Sign in with email and password for testing purposes
        await supabase.auth.signInWithPassword({
          email: process.env.EXPO_PUBLIC_TEST_EMAIL!,
          password: process.env.EXPO_PUBLIC_TEST_PASSWORD!,
        });
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;

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
