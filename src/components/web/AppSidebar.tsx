import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useWebApp } from '@/contexts/WebAppContext';
import { useGertBoards } from '@/hooks/useGetBoards';
import { useGetBoardById } from '@/hooks/useGetBoardById';
import type { Board } from '@/types/boards';

const NAV_ITEMS = [
  { label: '홈', route: '/(tabs)/', activeIcon: 'home' as const, inactiveIcon: 'home-outline' as const, match: ['/', '/(tabs)/'] },
  { label: '통계', route: '/(tabs)/stats', activeIcon: 'bar-chart' as const, inactiveIcon: 'bar-chart-outline' as const, match: ['/stats', '/(tabs)/stats'] },
  { label: '내역', route: '/(tabs)/list', activeIcon: 'list' as const, inactiveIcon: 'list-outline' as const, match: ['/list', '/(tabs)/list'] },
  { label: '설정', route: '/(tabs)/settings', activeIcon: 'settings' as const, inactiveIcon: 'settings-outline' as const, match: ['/settings', '/(tabs)/settings'] },
];

function BoardListItem({ board, isActive }: { board: Board; isActive: boolean }) {
  const C = useThemeColors();
  const { setActiveBoardId } = useWebApp();
  const { data: detail } = useGetBoardById(board.id);

  const completed = detail?.sub_goals.reduce((acc, sg) => acc + sg.cells.filter((c) => c.is_completed).length, 0) ?? 0;
  const total = detail?.sub_goals.reduce((acc, sg) => acc + sg.cells.length, 0) ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Pressable
      onPress={() => setActiveBoardId(board.id)}
      style={[styles.boardItem, isActive && { backgroundColor: C.accentLight }]}
    >
      <View style={styles.boardItemRow}>
        <Ionicons name="ellipse" size={8} color={isActive ? C.primary : C.border} />
        <Text style={[styles.boardTitle, { color: isActive ? C.primary : C.textPrimary }]} numberOfLines={1}>
          {board.title}
        </Text>
        <Text style={[styles.boardPct, { color: isActive ? C.primary : C.textMuted }]}>{pct}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: C.border }]}>
        <View style={[styles.progressFill, { backgroundColor: C.primary, width: `${pct}%` as any }]} />
      </View>
    </Pressable>
  );
}

export function AppSidebar() {
  const C = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
  const { activeBoardId, setActiveBoardId } = useWebApp();
  const { data: boards = [] } = useGertBoards();

  const effectiveBoardId = activeBoardId ?? boards[0]?.id;
  const activeBoard = boards.find((b: Board) => b.id === effectiveBoardId);

  const handleBoardCycle = () => {
    if (boards.length < 2) return;
    const idx = boards.findIndex((b: Board) => b.id === effectiveBoardId);
    const next = boards[(idx + 1) % boards.length];
    setActiveBoardId(next.id);
  };

  return (
    <View style={[styles.sidebar, { backgroundColor: C.white, borderRightColor: C.border }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.inner}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={[styles.logoBox, { backgroundColor: C.primary }]} />
          <Text style={[styles.logoText, { color: C.textPrimary }]}>만다라트 빙고</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        {/* Board selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.textMuted }]}>현재 만다라트</Text>
          <Pressable style={[styles.boardSelector, { borderColor: C.border }]} onPress={handleBoardCycle}>
            <Text style={[styles.boardSelectorText, { color: C.textPrimary }]} numberOfLines={1}>
              {activeBoard?.title ?? '보드 선택'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={C.textMuted} />
          </Pressable>
        </View>

        {/* Navigation */}
        <View style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.match.some((m) => pathname === m || pathname?.startsWith(m.replace(/\/$/, '') + '/'));
            return (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.route as any)}
                style={[styles.navItem, isActive && { backgroundColor: C.accentLight }]}
              >
                <Ionicons
                  name={isActive ? item.activeIcon : item.inactiveIcon}
                  size={18}
                  color={isActive ? C.primary : C.textSecondary}
                />
                <Text style={[styles.navLabel, { color: isActive ? C.primary : C.textSecondary }, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        {/* Board list */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.textMuted }]}>내 만다라트</Text>
          {boards.map((board: Board) => (
            <BoardListItem key={board.id} board={board} isActive={board.id === effectiveBoardId} />
          ))}
        </View>

        {/* New board button */}
        <Pressable style={styles.newBoardBtn}>
          <Ionicons name="add" size={16} color={C.primary} />
          <Text style={[styles.newBoardText, { color: C.primary }]}>새 만다라트</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    height: '100%' as any,
    borderRightWidth: 1,
  },
  inner: {
    padding: 16,
    gap: 4,
    paddingBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  logoBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  section: {
    gap: 4,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginLeft: 4,
  },
  boardSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  boardSelectorText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  nav: {
    gap: 2,
    marginVertical: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navLabel: {
    fontSize: 14,
  },
  navLabelActive: {
    fontWeight: '600',
  },
  boardItem: {
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    gap: 5,
  },
  boardItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boardTitle: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  boardPct: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginLeft: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  newBoardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  newBoardText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
