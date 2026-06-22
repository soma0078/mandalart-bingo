import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useTheme, useThemeColors } from '@/contexts/ThemeContext';
import { THEME_COLOR_OPTIONS } from '@/constants/themeColors';

// ─── 상수 ─────────────────────────────────────────────────

const THEME_OPTIONS = [
  { label: '시스템', value: 'system', icon: 'phone-portrait-outline' as const },
  { label: '라이트', value: 'light',  icon: 'sunny-outline' as const },
  { label: '다크',   value: 'dark',   icon: 'moon-outline' as const },
] as const;

// ─── 서브 컴포넌트 ─────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  const C = useThemeColors();
  return <Text style={[s.sectionTitle, { color: C.textMuted }]}>{label}</Text>;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  const C = useThemeColors();
  return <View style={[s.card, { backgroundColor: C.white }]}>{children}</View>;
}

function SettingRow({
  icon,
  iconColor,
  label,
  value,
  isLast = false,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value?: string;
  isLast?: boolean;
  children?: React.ReactNode;
}) {
  const C = useThemeColors();
  const color = iconColor ?? C.primary;

  return (
    <View style={[s.row, !isLast && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
      <View style={s.rowLeft}>
        <View style={[s.iconWrap, { backgroundColor: `${color}18` }]}>
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text style={[s.rowLabel, { color: C.textPrimary }]}>{label}</Text>
      </View>
      <View style={s.rowRight}>
        {value && <Text style={[s.rowValue, { color: C.textMuted }]}>{value}</Text>}
        {children}
      </View>
    </View>
  );
}

// ─── 메인 ─────────────────────────────────────────────────

export default function SettingsWebScreen() {
  const C = useThemeColors();
  const { colorSet, setColorSet, appTheme, setAppTheme } = useTheme();

  return (
    <ScrollView
      style={[s.root, { backgroundColor: C.bg }]}
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[s.pageTitle, { color: C.textPrimary }]}>설정</Text>

      {/* 화면 섹션 */}
      <View style={s.section}>
        <SectionTitle label="화면" />
        <SectionCard>
          {/* 앱 테마 — 인라인 세그먼트 컨트롤 */}
          <SettingRow icon="sunny-outline" label="앱 테마">
            <View style={[s.segWrap, { backgroundColor: C.border }]}>
              {THEME_OPTIONS.map((opt) => {
                const active = appTheme === opt.value;
                return active ? (
                  <LinearGradient
                    key={opt.value}
                    colors={[C.primary, C.primaryEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.segPill}
                  >
                    <Ionicons name={opt.icon} size={13} color="#fff" />
                    <Text style={[s.segText, { color: '#fff', fontWeight: '700' }]}>{opt.label}</Text>
                  </LinearGradient>
                ) : (
                  <Pressable
                    key={opt.value}
                    onPress={() => setAppTheme(opt.value)}
                    style={({ pressed }) => [s.segPill, pressed && { opacity: 0.7 }]}
                  >
                    <Ionicons name={opt.icon} size={13} color={C.textMuted} />
                    <Text style={[s.segText, { color: C.textMuted }]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </SettingRow>

          {/* 테마 색상 — 현재 선택값 표시 */}
          <SettingRow
            icon="color-palette-outline"
            iconColor={colorSet.primary}
            label="테마 색상"
            value={colorSet.name}
            isLast
          />
        </SectionCard>

        {/* 색상 팔레트 */}
        <View style={s.palette}>
          {THEME_COLOR_OPTIONS.map((c) => (
            <Pressable
              key={c.primary}
              onPress={() => setColorSet(c)}
              style={({ pressed }) => [
                s.swatch,
                { backgroundColor: c.primary },
                colorSet.primary === c.primary && s.swatchActive,
                pressed && { opacity: 0.8 },
              ]}
            >
              {colorSet.primary === c.primary && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* 앱 정보 섹션 */}
      <View style={s.section}>
        <SectionTitle label="앱 정보" />
        <SectionCard>
          <SettingRow
            icon="information-circle-outline"
            iconColor={C.textSecondary}
            label="버전"
            value="1.0.0"
          />
          <SettingRow
            icon="document-text-outline"
            iconColor={C.textSecondary}
            label="오픈소스 라이선스"
            isLast
          >
            <Text style={[s.licenseText, { color: C.textMuted }]}>
              expo · react-native · supabase · tanstack/query · react-hook-form · zod
            </Text>
          </SettingRow>
        </SectionCard>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 24, gap: 20, maxWidth: 640, width: '100%' as any, alignSelf: 'center' as any },
  pageTitle: { fontSize: 28, fontWeight: '800' },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, paddingLeft: 4 },
  card: { borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' },
  rowValue: { fontSize: 14 },
  // 세그먼트 컨트롤
  segWrap: { flexDirection: 'row', borderRadius: 12, padding: 3, gap: 2 },
  segPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9, paddingVertical: 6, paddingHorizontal: 12 },
  segText: { fontSize: 13 },
  // 색상 팔레트
  palette: { flexDirection: 'row', gap: 8 },
  swatch: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  swatchActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  licenseText: { fontSize: 11, flex: 1, textAlign: 'right' as any, lineHeight: 16 },
});
