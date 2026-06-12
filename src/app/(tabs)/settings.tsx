import { Alert, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme, useThemeColors } from '@/contexts/ThemeContext';
import { THEME_COLOR_OPTIONS } from '@/constants/themeColors';

// ─── 상수 ─────────────────────────────────────────────────

const THEME_OPTIONS = [
  { label: '시스템', value: 'system' },
  { label: '라이트', value: 'light' },
  { label: '다크', value: 'dark' },
] as const;

// ─── 서브 컴포넌트 ─────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function SettingRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  showChevron = false,
  isLast = false,
}: {
  icon: string;
  iconColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
}) {
  const C = useThemeColors();
  const color = iconColor ?? C.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && onPress && { opacity: 0.6 },
      ]}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
          <SymbolView name={icon as any} size={16} tintColor={color} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {showChevron && (
          <SymbolView name="chevron.right" size={16} tintColor={Colors.border} />
        )}
      </View>
    </Pressable>
  );
}

// ─── 메인 ─────────────────────────────────────────────────

export default function SettingsScreen() {
  const { colorSet, setColorSet, appTheme, setAppTheme } = useTheme();

  const currentThemeLabel = THEME_OPTIONS.find((t) => t.value === appTheme)?.label ?? '시스템';

  const handleThemePress = () => {
    Alert.alert('앱 테마', '테마를 선택하세요', [
      ...THEME_OPTIONS.map((t) => ({
        text: t.label,
        onPress: () => setAppTheme(t.value),
      })),
      { text: '취소', style: 'cancel' },
    ]);
  };

  const handleLicensePress = () => {
    Alert.alert('오픈소스 라이선스', 'expo, react-native, @supabase/supabase-js, @tanstack/react-query, react-hook-form, zod 등의 오픈소스 라이브러리를 사용합니다.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>설정</Text>

        {/* 화면 섹션 */}
        <View style={styles.section}>
          <SectionTitle label="화면" />
          <SectionCard>
            <SettingRow
              icon="sun.max"
              label="앱 테마"
              value={currentThemeLabel}
              onPress={handleThemePress}
            />
            <SettingRow
              icon="circle.fill"
              iconColor={colorSet.primary}
              label="테마 색상"
              value={colorSet.name}
              isLast
            />
          </SectionCard>

          {/* 색상 팔레트 */}
          <View style={styles.palette}>
            {THEME_COLOR_OPTIONS.map((c) => (
              <Pressable
                key={c.primary}
                onPress={() => setColorSet(c)}
                style={[styles.colorSwatch, { backgroundColor: c.primary }]}
              >
                {colorSet.primary === c.primary && (
                  <SymbolView name="checkmark" size={14} tintColor="#fff" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* 앱 정보 섹션 */}
        <View style={styles.section}>
          <SectionTitle label="앱 정보" />
          <SectionCard>
            <SettingRow
              icon="info.circle"
              iconColor={Colors.textSecondary}
              label="버전"
              value="1.0.0"
            />
            <SettingRow
              icon="doc.text"
              iconColor={Colors.textSecondary}
              label="오픈소스 라이선스"
              onPress={handleLicensePress}
              showChevron
              isLast
            />
          </SectionCard>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, gap: Spacing.xl },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.5, paddingLeft: 4 },
  card: { backgroundColor: Colors.white, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14, color: Colors.textPrimary },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 14, color: Colors.textMuted },
  palette: { flexDirection: 'row', gap: 8 },
  colorSwatch: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
