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
import { HeroCard } from '@/components/home/HeroCard';
import { MiniGoalGrid } from '@/components/home/MiniGoalGrid';
import { HomeGrid9x9 } from '@/components/home/HomeGrid9x9';
import {
  boardToFullGrid,
  detectBingos,
} from '@/utils/gridMapper';
import { useCellNavigation } from '@/utils/cellNavigation';
import { BoardEditSheet } from '@/components/BoardEditSheet';
import { CreateBoardSheet } from '@/components/CreateBoardSheet';
import { EmptyBoardsState } from '@/components/EmptyBoardsState';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
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
  const C = useThemeColors();
  const isBrief = mode === 'brief';

  return (
    <View style={[seg.container, { backgroundColor: C.white }]}>
      {isBrief ? (
        <LinearGradient colors={[C.primary, C.primaryEnd]} style={seg.button}>
          <SymbolView name="square.grid.2x2.fill" size={14} tintColor={C.white} />
          <Text style={[seg.text, { color: C.textMuted }, seg.textActive, { color: C.white }]}>간략히</Text>
        </LinearGradient>
      ) : (
        <Pressable onPress={onToggle} style={seg.button}>
          <SymbolView name="square.grid.2x2.fill" size={14} tintColor={C.textMuted} />
          <Text style={[seg.text, { color: C.textMuted }]}>간략히</Text>
        </Pressable>
      )}
      {!isBrief ? (
        <LinearGradient colors={[C.primary, C.primaryEnd]} style={seg.button}>
          <SymbolView name="square.grid.3x3.fill" size={14} tintColor={C.white} />
          <Text style={[seg.text, { color: C.textMuted }, seg.textActive, { color: C.white }]}>전체</Text>
        </LinearGradient>
      ) : (
        <Pressable onPress={onToggle} style={seg.button}>
          <SymbolView name="square.grid.3x3.fill" size={14} tintColor={C.textMuted} />
          <Text style={[seg.text, { color: C.textMuted }]}>전체</Text>
        </Pressable>
      )}
    </View>
  );
}

const seg = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
  },
  textActive: {
    fontWeight: '700',
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
  const C = useThemeColors();

  const items = [
    { sym: 'flame.fill' as const, value: `${streak}일 연속`, label: '스트릭', color: '#F97316' },
    { sym: 'checkmark.circle.fill' as const, value: `${completionPct}%`, label: '전체 달성', color: C.primary },
    { sym: 'trophy.fill' as const, value: `빙고 ${bingoCount}개`, label: '이번 달', color: '#8B5CF6' },
  ];

  return (
    <View style={statsRow.row}>
      {items.map((item) => (
        <View key={item.label} style={[statsRow.card, { backgroundColor: C.white }]}>
          <View style={statsRow.iconRow}>
            <SymbolView name={item.sym} size={16} tintColor={item.color} />
          </View>
          <Text style={[statsRow.value, { color: C.textPrimary }]}>{item.value}</Text>
          <Text style={[statsRow.label, { color: C.textMuted }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const statsRow = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
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
  value: { fontSize: 16, fontWeight: '800' },
  label: { fontSize: 11 },
});

// ─── CollapsedSummary ─────────────────────────────────────

function CollapsedSummary({
  subGoal,
  completionPct,
}: {
  subGoal: BoardDetail['sub_goals'][0] | undefined;
  completionPct: number;
}) {
  const C = useThemeColors();

  return (
    <View style={[collapse.container, { backgroundColor: C.white }]}>
      <View style={collapse.left}>
        <View style={[collapse.dotBg, { backgroundColor: C.accentLight }]}>
          <SymbolView name="flame.fill" size={16} tintColor={C.primary} />
        </View>
        <Text style={[collapse.title, { color: C.textPrimary }]} numberOfLines={1}>
          {subGoal?.title || '세부 목표'}
        </Text>
      </View>
      <View style={collapse.right}>
        <View style={[collapse.progressBg, { backgroundColor: C.border }]}>
          <View style={[collapse.progressFill, { width: `${completionPct}%` as any, backgroundColor: C.primaryEnd }]} />
        </View>
        <Text style={[collapse.pct, { color: C.primary }]}>{completionPct}%</Text>
        <SymbolView name="chevron.up" size={16} tintColor={C.textMuted} />
      </View>
    </View>
  );
}

const collapse = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: '600' },
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
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  pct: { fontSize: 13, fontWeight: '700' },
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
  const C = useThemeColors();

  return (
    <View style={footer.container}>
      <View style={footer.left}>
        <View style={[footer.badge, { backgroundColor: C.accentLight, borderColor: C.primaryEnd }]}>
          <Text style={[footer.badgeText, { color: C.primary }]}>{completedCells}/{totalCells} 완료</Text>
        </View>
        <Text style={[footer.sub, { color: C.textMuted }]}>빙고 {bingoCount}개 달성</Text>
      </View>
      <Text style={[footer.pct, { color: C.primary }]}>{completionPct}%</Text>
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
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  sub: { fontSize: 12 },
  pct: { fontSize: 20, fontWeight: '800' },
});

// ─── Main Screen ──────────────────────────────────────────

export default function HomeScreen() {
  const C = useThemeColors();
  const { data: boards = [], isLoading } = useGertBoards();
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'brief' | 'full'>('brief');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [boardEditOpen, setBoardEditOpen] = useState(false);

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

  const focusedSubGoal = useMemo(() => {
    if (!board?.sub_goals?.length) return undefined;
    const withPct = board.sub_goals.map((sg) => ({
      sg,
      pct: sg.cells.length > 0
        ? sg.cells.filter((c) => c.is_completed).length / sg.cells.length
        : 0,
    }));
    // 100% 완료 제외, 진행률 높은 순 → 없으면 미시작 포함 전체에서 첫 번째
    const inProgress = withPct.filter(({ pct }) => pct > 0 && pct < 1);
    const sorted = inProgress.sort((a, b) => b.pct - a.pct);
    return sorted[0]?.sg ?? withPct[0].sg;
  }, [board]);

  const onCellPress = (gridIndex: number) => {
    handleCellPress(gridIndex, viewMode === 'brief' ? '3x3' : '9x9', board);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: C.bg }]} edges={['top']}>
        <Text style={[styles.loadingText, { color: C.textMuted }]}>로딩중...</Text>
      </SafeAreaView>
    );
  }

  if (boards.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]} edges={['top']}>
        <EmptyBoardsState onPress={() => setSheetOpen(true)} />
        <CreateBoardSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
      </SafeAreaView>
    );
  }

  const insets = useSafeAreaInsets();
  const today = formatDate();

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerDate, { color: C.textSecondary }]}>{today}</Text>
            <Pressable style={styles.boardSelector} onPress={() => setBoardEditOpen(true)}>
              <Text style={[styles.boardSelectorName, { color: C.textPrimary }]} numberOfLines={1}>
                {board?.title ?? '보드 선택'}
              </Text>
              <SymbolView name="arrow.up.arrow.down" size={14} tintColor={C.textPrimary} />
            </Pressable>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => setSheetOpen(true)}
              style={[styles.headerBtn, { backgroundColor: C.white }]}
            >
              <SymbolView name="plus" size={20} tintColor={C.textPrimary} />
            </Pressable>
            <View style={[styles.headerBtn, { backgroundColor: C.white }]}>
              <SymbolView name="bell" size={20} tintColor={C.textPrimary} />
            </View>
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
                  colors={[C.primary, C.primaryEnd]}
                  style={[styles.boardChipActive, { shadowColor: C.primary }]}
                >
                  <Text style={[styles.boardChipActiveText, { color: C.white }]} numberOfLines={1}>{b.title}</Text>
                </LinearGradient>
              );
            }
            return (
              <Pressable
                key={b.id}
                onPress={() => setSelectedBoardId(b.id)}
                style={[styles.boardChipInactive, { backgroundColor: C.white, borderColor: C.border }]}
              >
                <Text style={[styles.boardChipInactiveText, { color: C.textPrimary }]} numberOfLines={1}>{b.title}</Text>
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
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>세부 목표 현황</Text>
              <Pressable
                onPress={() => setViewMode('full')}
                style={[styles.sectionBtn, { backgroundColor: C.white }]}
              >
                <Text style={[styles.sectionBtnText, { color: C.textSecondary }]}>전체 보기</Text>
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
            <CollapsedSummary
              subGoal={focusedSubGoal}
              completionPct={
                focusedSubGoal
                  ? Math.round(
                      (focusedSubGoal.cells.filter((c) => c.is_completed).length /
                        focusedSubGoal.cells.length) *
                        100,
                    )
                  : 0
              }
            />

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

      <CreateBoardSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
      <BoardEditSheet
        visible={boardEditOpen}
        boards={boards}
        selectedBoardId={effectiveBoardId}
        onSelect={(id) => setSelectedBoardId(id)}
        onClose={() => setBoardEditOpen(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
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
    maxWidth: 220,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  boardChipActiveText: {
    fontSize: 12,
    fontWeight: '600',
  },
  boardChipInactive: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  boardChipInactiveText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionBtn: {
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
  },
});
