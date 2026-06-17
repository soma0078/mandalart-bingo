import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useWebApp } from '@/contexts/WebAppContext';

export function AppHeader() {
  const C = useThemeColors();
  const pathname = usePathname();
  const { viewTab, setViewTab } = useWebApp();

  const isHome = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/';

  return (
    <View style={[styles.header, { backgroundColor: C.white, borderBottomColor: C.border }]}>
      {/* Left: "홈" 고정 텍스트 + 간략히/전체 토글 */}
      <View style={styles.left}>
        {isHome && (
          <View style={styles.titleRow}>
            <Text style={[styles.pageTitle, { color: C.textPrimary }]}>홈</Text>
            <View style={[styles.toggle, { backgroundColor: C.bg }]}>
              {(['brief', 'full'] as const).map((tab) => {
                const isActive = viewTab === tab;
                const label = tab === 'brief' ? '간략히' : '전체';
                if (isActive) {
                  return (
                    <LinearGradient
                      key={tab}
                      colors={[C.primary, C.primaryEnd]}
                      style={styles.togglePill}
                    >
                      <Text style={[styles.toggleText, { color: C.white }, styles.toggleTextActive]}>
                        {label}
                      </Text>
                    </LinearGradient>
                  );
                }
                return (
                  <Pressable key={tab} onPress={() => setViewTab(tab)} style={styles.togglePill}>
                    <Text style={[styles.toggleText, { color: C.textSecondary }]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Right: search + bell + avatar */}
      <View style={styles.right}>
        <View style={[styles.searchBox, { backgroundColor: C.bg, borderColor: C.border }]}>
          <Ionicons name="search" size={14} color={C.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: C.textPrimary }]}
            placeholder="검색..."
            placeholderTextColor={C.textMuted}
            editable={false}
          />
        </View>
        <Ionicons name="notifications-outline" size={20} color={C.textSecondary} />
        <View style={[styles.avatar, { backgroundColor: C.primary }]}>
          <Text style={[styles.avatarText, { color: C.white }]}>S</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  togglePill: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 13,
  },
  toggleTextActive: {
    fontWeight: '700',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 180,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 10,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: 34,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
