import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColors } from '@/contexts/ThemeContext';

function UserMenu({ onClose }: { onClose: () => void }) {
  const C = useThemeColors();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    onClose();
    await signOut();
    router.replace('/(auth)/login' as any);
  };

  return (
    <View style={[menu.container, { backgroundColor: C.white, borderColor: C.border }]}>
      {/* User info */}
      <View style={[menu.infoRow, { borderBottomColor: C.border }]}>
        <Text style={[menu.email, { color: C.textSecondary }]} numberOfLines={1}>
          {user?.email ?? ''}
        </Text>
      </View>

      {/* Sign out */}
      <Pressable
        onPress={handleSignOut}
        style={({ pressed }) => [menu.item, pressed && { backgroundColor: C.bg }]}
      >
        <Ionicons name="log-out-outline" size={15} color="#EF4444" />
        <Text style={menu.signOutText}>로그아웃</Text>
      </Pressable>
    </View>
  );
}

export function AppHeader() {
  const C = useThemeColors();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = user?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <View style={[styles.header, { backgroundColor: C.white, borderBottomColor: C.border }]}>
      <View style={styles.left} />

      <View style={styles.right}>
        {/* Search */}
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

        {/* Avatar button */}
        <View>
          <Pressable
            onPress={() => setMenuOpen((v) => !v)}
            style={({ pressed }) => [
              styles.avatar,
              { backgroundColor: C.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.avatarText, { color: '#fff' }]}>{initial}</Text>
          </Pressable>

          {menuOpen && (
            <>
              {/* Backdrop to close on outside click */}
              <Pressable
                style={styles.backdrop}
                onPress={() => setMenuOpen(false)}
              />
              <UserMenu onClose={() => setMenuOpen(false)} />
            </>
          )}
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
    zIndex: 10,
  },
  left: { flex: 1 },
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
    cursor: 'pointer' as any,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  backdrop: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});

const menu = StyleSheet.create({
  container: {
    position: 'absolute' as any,
    top: 40,
    right: 0,
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    overflow: 'hidden',
  },
  infoRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  email: {
    fontSize: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    cursor: 'pointer' as any,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
});
