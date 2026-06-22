import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useGertBoards } from '@/hooks/useGetBoards';
import { getBoardById } from '@/lib/boards';
import { detectBingos } from '@/utils/gridMapper';
import { CACHE_KEYS } from '@/constants/cacheKeys';
import { CreateBoardSheet } from '@/components/CreateBoardSheet';
import { EmptyBoardsState } from '@/components/EmptyBoardsState';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import type { BoardDetail } from '@/types/boards';

// ─── 유틸 ─────────────────────────────────────────────────

function getBoardPct(board: BoardDetail): number {
  const allCells = board.sub_goals.flatMap((sg) => sg.cells);
  if (allCells.length === 0) return 0;
  return Math.round((allCells.filter((c) => c.is_completed).length / allCells.length) * 100);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} 시작`;
}

type FilterType = '전체' | '진행중' | '완료';

// ─── BoardCard ─────────────────────────────────────────────

function BoardCard({ board, pct, bingoCount, onPress }: {
  board: BoardDetail;
  pct: number;
  bingoCount: number;
  onPress: () => void;
}) {
  const C = useThemeColors();
  const isDone = pct === 100;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [card.container, { backgroundColor: C.white }, pressed && { opacity: 0.85 }]}
    >
      {/* 상단 */}
      <View style={card.top}>
        <View style={card.left}>
          <View style={card.nameRow}>
            <Text style={[card.name, { color: C.textPrimary }]} numberOfLines={1}>{board.title}</Text>
          </View>
          <Text style={[card.date, { color: C.textMuted }]}>{formatDate(board.created_at)}</Text>
        </View>
        <View style={card.right}>
          <View style={[
            card.badge,
            isDone ? { backgroundColor: `${C.success}22` } : { backgroundColor: C.accentLight },
          ]}>
            <Text style={[
              card.badgeText,
              isDone ? card.badgeTextDone : { color: C.primary },
            ]}>
              {isDone ? '완료' : '진행중'}
            </Text>
          </View>
          <SymbolView name="chevron.right" size={16} tintColor={C.border} />
        </View>
      </View>

      {/* 프로그레스 바 */}
      <View style={[card.pbBg, { backgroundColor: C.border }]}>
        {isDone ? (
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[card.pbFill, { width: '100%' }]}
          />
        ) : (
          <LinearGradient
            colors={[C.primary, C.primaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[card.pbFill, { width: `${pct}%` as any }]}
          />
        )}
      </View>

      {/* 하단 통계 */}
      <View style={card.stats}>
        <Text style={[card.statPct, isDone ? card.statPctDone : { color: C.primary }]}>{pct}% 달성</Text>
        <Text style={[card.statBingo, { color: C.textMuted }]}>빙고 {bingoCount}개</Text>
      </View>
    </Pressable>
  );
}

const card = StyleSheet.create({
  container: { borderRadius: 20, padding: 18, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  left: { gap: 4, flex: 1, marginRight: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '700' },
  date: { fontSize: 12 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextDone: { color: '#10B981' },
  pbBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  pbFill: { height: '100%', borderRadius: 3 },
  stats: { flexDirection: 'row', gap: 16 },
  statPct: { fontSize: 12, fontWeight: '600' },
  statPctDone: { color: '#10B981' },
  statBingo: { fontSize: 12 },
});

// ─── 메인 ─────────────────────────────────────────────────

const FILTERS: FilterType[] = ['전체', '진행중', '완료'];

export default function ListScreen() {
  const C = useThemeColors();
  const [filter, setFilter] = useState<FilterType>('전체');
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();

  const { data: boards = [], isLoading } = useGertBoards();

  const boardDetails = useQueries({
    queries: boards.map((b) => ({
      queryKey: [CACHE_KEYS.boards, b.id],
      queryFn: () => getBoardById(b.id),
      enabled: !!b.id,
    })),
  });

  const allBoards = useMemo(
    () => boardDetails.map((q) => q.data).filter(Boolean) as BoardDetail[],
    [boardDetails],
  );

  const filtered = useMemo(() => {
    if (filter === '전체') return allBoards;
    return allBoards.filter((b) => {
      const pct = getBoardPct(b);
      return filter === '완료' ? pct === 100 : pct < 100;
    });
  }, [allBoards, filter]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]} edges={['top']}>
        <Text style={[styles.loading, { color: C.textMuted }]}>로딩중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: C.textPrimary }]}>내역</Text>
          <Pressable onPress={() => setSheetOpen(true)}>
            <LinearGradient
              colors={[C.primary, C.primaryEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.newBtn, { shadowColor: C.primary }]}
            >
              <SymbolView name="plus" size={16} tintColor={C.white} />
              <Text style={[styles.newBtnText, { color: C.white }]}>새로 만들기</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* 필터 */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterPill,
                { backgroundColor: C.white, borderColor: C.border },
                filter === f && { backgroundColor: C.primary, borderColor: C.primary },
              ]}
            >
              <Text style={[
                styles.filterText,
                { color: C.textSecondary },
                filter === f && styles.filterTextActive,
              ]}>{f}</Text>
            </Pressable>
          ))}
        </View>

        {/* 리스트 */}
        {boards.length === 0 ? (
          <EmptyBoardsState onPress={() => setSheetOpen(true)} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyFilter}>
            <Text style={[styles.emptyFilterText, { color: C.textMuted }]}>해당하는 만다라트가 없어요</Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {filtered.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                pct={getBoardPct(board)}
                bingoCount={detectBingos(board).length}
                onPress={() => router.push(`/board/${board.id}`)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <CreateBoardSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, gap: Spacing.xl },
  loading: { textAlign: 'center', marginTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4 },
  newBtnText: { fontSize: 13, fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterPill: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1 },
  filterText: { fontSize: 13 },
  filterTextActive: { fontWeight: '600', color: '#FFFFFF' },
  cardList: { gap: 16 },
  emptyFilter: { paddingVertical: 60, alignItems: 'center' },
  emptyFilterText: { fontSize: 14 },
});
