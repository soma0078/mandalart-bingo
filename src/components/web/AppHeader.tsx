import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useWebApp, type WebViewTab } from '@/contexts/WebAppContext';

const TABS: { key: WebViewTab; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'brief', label: '간략히' },
  { key: 'full', label: '전체' },
];

export function AppHeader() {
  const C = useThemeColors();
  const pathname = usePathname();
  const { viewTab, setViewTab } = useWebApp();

  const isHome = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/';

  return (
    <View style={[styles.header, { backgroundColor: C.white, borderBottomColor: C.border }]}>
      {/* Left: tabs (home only) */}
      <View style={styles.left}>
        {isHome && (
          <View style={[styles.tabContainer, { backgroundColor: C.bg }]}>
            {TABS.map((tab) => {
              const isActive = viewTab === tab.key;
              if (isActive) {
                return (
                  <LinearGradient
                    key={tab.key}
                    colors={[C.primary, C.primaryEnd]}
                    style={styles.tabPill}
                  >
                    <Text style={[styles.tabText, { color: C.white }, styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                  </LinearGradient>
                );
              }
              return (
                <Pressable key={tab.key} onPress={() => setViewTab(tab.key)} style={styles.tabPill}>
                  <Text style={[styles.tabText, { color: C.textSecondary }]}>{tab.label}</Text>
                </Pressable>
              );
            })}
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
          <Text style={styles.avatarText}>S</Text>
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
  tabContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  tabPill: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  tabTextActive: {
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
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
