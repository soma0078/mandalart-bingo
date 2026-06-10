import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';

import { useGertBoards } from '@/hooks/useGetBoards';
import { useGetBoardById } from '@/hooks/useGetBoardById';
import { FAB } from '@/components/FAB';
import { HeroCard } from '@/components/home/HeroCard';
import { MiniGoalGrid } from '@/components/home/MiniGoalGrid';
import { HomeGrid9x9 } from '@/components/home/HomeGrid9x9';
import {
  boardToFullGrid,
  detectBingos,
} from '@/utils/gridMapper';
import { useCellNavigation } from '@/utils/cellNavigation';
import { CreateBoardSheet } from '@/components/CreateBoardSheet';
import { EmptyBoardsState } from '@/components/EmptyBoardsState';
import { Colors, Spacing, Radius } from '@/constants/theme';
import type { Board, BoardDetail } from '@/types/boards';

// ─── Helpers ──────────────────────────────────────────────

function getCompletionStats(board: BoardDetail | undefined) {
  if (!board) return { completed: 0, total: 0, pct: 0 };
  let total = 0;
  let completed = 0;
  for (const sg of board.sub_goals) {
    total += sg.cells.length;
    completed += sg.cells.filter((c) => c.is_completed).length;
  }
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

function formatDate(): string {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${m}월 ${d}일 ${days[now.getDay()]}요일`;
}

// ─── ViewSegment ──────────────────────────────────────────

function ViewSegment({ mode, onToggle }: { mode: 'brief' | 'full'; onToggle: () => void }) {
  const isBrief = mode === 'brief';

  return (
    <View style={seg.container}>
      {isBrief ? (
        <LinearGradient colors={[Colors.primary, Colors.primaryEnd]} style={seg.button}>
          <SymbolView name="square.grid.2x2.fill" size={14} tintColor={Colors.white} />
          <Text style={[seg.text, seg.textActive]}>간략히</Text>
        </LinearGradient>
      ) : (
        <Pressable onPress={onToggle} style={seg.button}>
          <SymbolView name="square.grid.2x2.fill" size={14} tintColor={Colors.textMuted} />
          <Text style={seg.text}>간략히</Text>
        </Pressable>
      )}
      {!isBrief ? (
        <LinearGradient colors={[Colors.primary, Colors.primaryEnd]} style={seg.button}>
          <SymbolView name="square.grid.3x3.fill" size={14} tintColor={Colors.white} />
          <Text style={[seg.text, seg.textActive]}>전체</Text>
        </LinearGradient>
      ) : (
        <Pressable onPress={onToggle} style={seg.button}>
          <SymbolView name="square.grid.3x3.fill" size={14} tintColor={Colors.textMuted} />
          <Text style={seg.text}>전체</Text>
        </Pressable>
      )}
    </View>
  );
}

const seg = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 22,
    height: 44,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 18,
  },
  text: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  textActive: {
    fontWeight: '700',
    color: Colors.white,
  },
});


// ─── StatsRow ─────────────────────────────────────────────

function StatsRow({
  streak,
  completionPct,
  bingoCount,
}: {
  streak: number;
  completionPct: number;
  bingoCount: number;
}) {
  const items = [
    { sym: 'flame.fill' as const, value: `${streak}일 연속`, label: '스트릭', color: '#F97316' },
    { sym: 'checkmark.circle.fill' as const, value: `${completionPct}%`, label: '전체 달성', color: Colors.primary },
    { sym: 'trophy.fill' as const, value: `빙고 ${bingoCount}개`, label: '이번 달', color: '#8B5CF6' },
  ];

  return (
    <View style={stats.row}>
      {items.map((item) => (
        <View key={item.label} style={stats.card}>
          <View style={stats.iconRow}>
            <SymbolView name={item.sym} size={16} tintColor={item.color} />
          </View>
          <Text style={stats.value}>{item.value}</Text>
          <Text style={stats.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const stats = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  label: { fontSize: 11, color: Colors.textMuted },
});

// ─── CollapsedSummary ─────────────────────────────────────

function CollapsedSummary({
  board,
  completionPct,
}: {
  board: BoardDetail | undefined;
  completionPct: number;
}) {
  return (
    <View style={collapse.container}>
      <View style={collapse.left}>
        <View style={collapse.dotBg}>
          <SymbolView name="flame.fill" size={16} tintColor={Colors.primary} />
        </View>
        <View style={{ gap: 2 }}>
          <Text style={collapse.title} numberOfLines={1}>
            {board?.main_goal || '핵심 목표'}
          </Text>
          <Text style={collapse.sub}>{board?.title || ''}</Text>
        </View>
      </View>
      <View style={collapse.right}>
        <View style={collapse.progressBg}>
          <View style={[collapse.progressFill, { width: `${completionPct}%` as any }]} />
        </View>
        <SymbolView name="chevron.up" size={16} tintColor={Colors.textMuted} />
      </View>
    </View>
  );
}

const collapse = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dotBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  sub: { fontSize: 11, color: Colors.textMuted },
  right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  progressBg: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.primaryEnd },
});


// ─── ProgressFooter ───────────────────────────────────────

function ProgressFooter({
  bingoCount,
  completionPct,
  completedCells,
  totalCells,
}: {
  bingoCount: number;
  completionPct: number;
  completedCells: number;
  totalCells: number;
}) {
  return (
    <View style={footer.container}>
      <View style={footer.left}>
        <View style={footer.badge}>
          <Text style={footer.badgeText}>{completedCells}/{totalCells} 완료</Text>
        </View>
        <Text style={footer.sub}>빙고 {bingoCount}개 달성</Text>
      </View>
      <Text style={footer.pct}>{completionPct}%</Text>
    </View>
  );
}

const footer = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    backgroundColor: Colors.accentLight,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.primaryEnd,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  sub: { fontSize: 12, color: Colors.textMuted },
  pct: { fontSize: 20, fontWeight: '800', color: Colors.primary },
});

// ─── Main Screen ──────────────────────────────────────────

export default function HomeScreen() {
  const { data: boards = [], isLoading } = useGertBoards();
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'brief' | 'full'>('brief');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (selectedBoardId && boards.length > 0 && !boards.find((b) => b.id === selectedBoardId)) {
      setSelectedBoardId(undefined);
    }
  }, [boards, selectedBoardId]);

  const effectiveBoardId = selectedBoardId ?? boards[0]?.id;
  const { data: board } = useGetBoardById(effectiveBoardId ?? '');
  const { handleCellPress } = useCellNavigation(effectiveBoardId);

  const fullGrid = useMemo(() => boardToFullGrid(board), [board]);
  const bingoCount = useMemo(() => detectBingos(board).length, [board]);
  const statsData = useMemo(() => getCompletionStats(board), [board]);

  const focusedSubGoal = useMemo(
    () => board?.sub_goals?.find((sg) => sg.cells.some((c) => c.is_completed)) ?? board?.sub_goals?.[0],
    [board]
  );

  const onCellPress = (gridIndex: number) => {
    handleCellPress(gridIndex, viewMode === 'brief' ? '3x3' : '9x9', board);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <Text style={styles.loadingText}>로딩중...</Text>
      </SafeAreaView>
    );
  }

  if (boards.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyBoardsState onPress={() => setSheetOpen(true)} />
        <CreateBoardSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
      </SafeAreaView>
    );
  }

  const insets = useSafeAreaInsets();
  const today = formatDate();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>{today}</Text>
            <View style={styles.boardSelector}>
              <Text style={styles.boardSelectorName} numberOfLines={1}>
                {board?.title ?? '보드 선택'}
              </Text>
              <SymbolView name="chevron.down" size={14} tintColor={Colors.textPrimary} />
            </View>
          </View>
          <View style={styles.notifBtn}>
            <SymbolView name="bell" size={20} tintColor={Colors.textPrimary} />
          </View>
        </View>

        {/* Board Switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.boardSwitcher}
        >
          {boards.map((b: Board) => {
            const isActive = b.id === effectiveBoardId;
            if (isActive) {
              return (
                <LinearGradient
                  key={b.id}
                  colors={[Colors.primary, Colors.primaryEnd]}
                  style={styles.boardChipActive}
                >
                  <Text style={styles.boardChipActiveText} numberOfLines={1}>{b.title}</Text>
                </LinearGradient>
              );
            }
            return (
              <Pressable
                key={b.id}
                onPress={() => setSelectedBoardId(b.id)}
                style={styles.boardChipInactive}
              >
                <Text style={styles.boardChipInactiveText} numberOfLines={1}>{b.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* View Segment */}
        <ViewSegment mode={viewMode} onToggle={() => setViewMode((v) => (v === 'brief' ? 'full' : 'brief'))} />

        {viewMode === 'brief' ? (
          <>
            {/* Hero Card */}
            <HeroCard subGoal={focusedSubGoal} boardTitle={board?.title ?? ''} />

            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>세부 목표 현황</Text>
              <Pressable
                onPress={() => setViewMode('full')}
                style={styles.sectionBtn}
              >
                <Text style={styles.sectionBtnText}>전체 보기</Text>
              </Pressable>
            </View>

            {/* Mini 3×3 Goal Grid */}
            <MiniGoalGrid board={board} onCellPress={onCellPress} />

            {/* Stats Row */}
            <StatsRow
              streak={7}
              completionPct={statsData.pct}
              bingoCount={bingoCount}
            />
          </>
        ) : (
          <>
            {/* Collapsed Summary */}
            <CollapsedSummary board={board} completionPct={statsData.pct} />

            {/* 9×9 Full Grid */}
            <HomeGrid9x9 fullGrid={fullGrid} onCellPress={onCellPress} />

            {/* Progress Footer */}
            <ProgressFooter
              bingoCount={bingoCount}
              completionPct={statsData.pct}
              completedCells={statsData.completed}
              totalCells={statsData.total}
            />
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <FAB onPress={() => setSheetOpen(true)} />
      <CreateBoardSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  boardSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boardSelectorName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    maxWidth: 220,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  boardSwitcher: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  boardChipActive: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  boardChipActiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  boardChipInactive: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  boardChipInactiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionBtn: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionBtnText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
