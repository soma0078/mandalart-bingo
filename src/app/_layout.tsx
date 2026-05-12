import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const queryClient = new QueryClient();

// 로그인 구현 전까지 익명 세션으로 RLS auth.uid() 충족
// Phase 2 소셜 로그인 시 linkIdentity로 기존 데이터 연결
function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        await supabase.auth.signInAnonymously();
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <Stack />
      </AuthGate>
    </QueryClientProvider>
  );
}
