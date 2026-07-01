import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Input } from '@/components/ui/Input';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColors } from '@/contexts/ThemeContext';

const schema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const C = useThemeColors();
  const { signIn } = useAuth();

  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    const { error } = await signIn(values.email, values.password);
    if (error) {
      setError('root', { message: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }
    // 성공 시 AuthContext가 session을 업데이트하고 _layout에서 자동 리다이렉트
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.logo, { color: C.primary }]}>만다라트 빙고</Text>
            <Text style={[styles.title, { color: C.textPrimary }]}>로그인</Text>
            <Text style={[styles.subtitle, { color: C.textSecondary }]}>
              계정에 로그인하여 목표를 관리하세요
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: C.textSecondary }]}>이메일</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.email && (
                <Text style={[styles.error, { color: C.primary }]}>{errors.email.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: C.textSecondary }]}>비밀번호</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="6자 이상"
                    secureTextEntry
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.password && (
                <Text style={[styles.error, { color: C.primary }]}>{errors.password.message}</Text>
              )}
            </View>

            {errors.root && (
              <View style={[styles.errorBox, { backgroundColor: `${C.primary}15`, borderColor: `${C.primary}40` }]}>
                <Text style={[styles.errorBoxText, { color: C.primary }]}>{errors.root.message}</Text>
              </View>
            )}

            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: C.primary, opacity: pressed || isSubmitting ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? '로그인 중...' : '로그인'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: C.textSecondary }]}>계정이 없으신가요?</Text>
            <Link href={'/(auth)/signup' as any} asChild>
              <Pressable>
                <Text style={[styles.footerLink, { color: C.primary }]}>회원가입</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing['2xl'], justifyContent: 'center', gap: Spacing['3xl'] },
  header: { gap: Spacing.sm, alignItems: 'center' },
  logo: { fontSize: FontSize.caption, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.body, textAlign: 'center', lineHeight: 22 },
  form: { gap: Spacing.lg },
  field: { gap: Spacing.xs },
  label: { fontSize: FontSize.caption, fontWeight: '600', letterSpacing: 0.3, paddingLeft: 4 },
  error: { fontSize: FontSize.caption, paddingLeft: 4 },
  errorBox: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md },
  errorBoxText: { fontSize: FontSize.body, textAlign: 'center' },
  button: {
    height: 54,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  buttonText: { color: '#fff', fontSize: FontSize.body, fontWeight: '700' },
  footer: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: FontSize.body },
  footerLink: { fontSize: FontSize.body, fontWeight: '700' },
});
