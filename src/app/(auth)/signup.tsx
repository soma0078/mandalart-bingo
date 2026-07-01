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
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
});

type FormValues = z.infer<typeof schema>;

export default function SignUpScreen() {
  const C = useThemeColors();
  const { signUp } = useAuth();

  const { control, handleSubmit, setError, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    const { error, needsVerification } = await signUp(values.email, values.password);
    if (error) {
      setError('root', { message: error });
      return;
    }
    if (needsVerification) {
      // 이메일 인증이 필요한 경우 안내 메시지 표시
      setError('root', {
        type: 'verification',
        message: `${values.email}로 인증 메일을 발송했습니다. 메일함을 확인해 주세요.`,
      });
      reset();
    }
    // 이메일 인증이 불필요한 경우(session 바로 발급) → AuthContext가 session 업데이트 → 자동 리다이렉트
  }

  const isVerificationMessage = errors.root?.type === 'verification';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.logo, { color: C.primary }]}>만다라트 빙고</Text>
            <Text style={[styles.title, { color: C.textPrimary }]}>회원가입</Text>
            <Text style={[styles.subtitle, { color: C.textSecondary }]}>
              계정을 만들고 목표 달성을 시작하세요
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

            <View style={styles.field}>
              <Text style={[styles.label, { color: C.textSecondary }]}>비밀번호 확인</Text>
              <Controller
                control={control}
                name="passwordConfirm"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="비밀번호를 다시 입력하세요"
                    secureTextEntry
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.passwordConfirm && (
                <Text style={[styles.error, { color: C.primary }]}>{errors.passwordConfirm.message}</Text>
              )}
            </View>

            {errors.root && (
              <View style={[
                styles.messageBox,
                isVerificationMessage
                  ? { backgroundColor: `${C.success}15`, borderColor: `${C.success}40` }
                  : { backgroundColor: `${C.primary}15`, borderColor: `${C.primary}40` },
              ]}>
                <Text style={[
                  styles.messageBoxText,
                  { color: isVerificationMessage ? C.success : C.primary },
                ]}>
                  {errors.root.message}
                </Text>
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
                {isSubmitting ? '가입 중...' : '회원가입'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: C.textSecondary }]}>이미 계정이 있으신가요?</Text>
            <Link href={'/(auth)/login' as any} asChild>
              <Pressable>
                <Text style={[styles.footerLink, { color: C.primary }]}>로그인</Text>
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
  messageBox: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md },
  messageBoxText: { fontSize: FontSize.body, textAlign: 'center', lineHeight: 20 },
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
