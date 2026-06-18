import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';

export function AppHeader() {
  const C = useThemeColors();

  return (
    <View style={[styles.header, { backgroundColor: C.white, borderBottomColor: C.border }]}>
      <View style={styles.left} />

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
