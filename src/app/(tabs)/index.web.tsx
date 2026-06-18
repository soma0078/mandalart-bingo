import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useWebApp } from '@/contexts/WebAppContext';
import { useGertBoards } from '@/hooks/useGetBoards';
import { useGetBoardById } from '@/hooks/useGetBoardById';
import { HomeGrid9x9 } from '@/components/home/HomeGrid9x9';
import { HeroFocusCard } from '@/components/web/HeroFocusCard';
import { StatsCardRow } from '@/components/web/StatsCardRow';
import { SubGoalDetailPanel } from '@/components/web/SubGoalDetailPanel';
import { SubGoalGridPanel } from '@/components/web/SubGoalGridPanel';
import { boardToFullGrid, detectBingos } from '@/utils/gridMapper';
import type { BoardDetail } from '@/types/boards';

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

function getFocusedSubGoal(board: BoardDetail | undefined) {
  if (!board?.sub_goals?.length) return undefined;
  const withPct = board.sub_goals.map((sg) => ({
    sg,
    pct: sg.cells.length > 0 ? sg.cells.filter((c) => c.is_completed).length / sg.cells.length : 0,
  }));
  const inProgress = withPct.filter(({ pct }) => pct > 0 && pct < 1);
  const sorted = inProgress.sort((a, b) => b.pct - a.pct);
  return sorted[0]?.sg ?? withPct[0].sg;
}

function ViewToggle() {
  const C = useThemeColors();
  const { viewTab, setViewTab } = useWebApp();
  return (
    <View style={[toggleStyles.wrap, { backgroundColor: C.bg }]}>
      {(['brief', 'full'] as const).map((tab) => {
        const label = tab === 'brief' ? '간략히' : '전체';
        if (viewTab === tab) {
          return (
            <LinearGradient key={tab} colors={[C.primary, C.primaryEnd]} style={toggleStyles.pill}>
              <Text style={[toggleStyles.text, { color: C.white, fontWeight: '700' }]}>{label}</Text>
            </LinearGradient>
          );
        }
        return (
          <Pressable key={tab} onPress={() => setViewTab(tab)} style={toggleStyles.pill}>
            <Text style={[toggleStyles.text, { color: C.textSecondary }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: 20, padding: 3, gap: 2 },
  pill: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 13 },
});

export default function WebHomeScreen() {
  const C = useThemeColors();
  const { activeBoardId, setActiveBoardId, viewTab, setSelectedSubGoalPos, selectedSubGoalPos } = useWebApp();
  const { data: boards = [] } = useGertBoards();

  const effectiveBoardId = activeBoardId ?? boards[0]?.id;

  // Sync activeBoardId with first board on initial load
  useMemo(() => {
    if (!activeBoardId && boards[0]?.id) {
      setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId, setActiveBoardId]);

  const { data: board } = useGetBoardById(effectiveBoardId ?? '');
  const fullGrid = useMemo(() => boardToFullGrid(board), [board]);
  const bingoCount = useMemo(() => detectBingos(board).length, [board]);
  const statsData = useMemo(() => getCompletionStats(board), [board]);
  const focusedSubGoal = useMemo(() => getFocusedSubGoal(board), [board]);
  const focusedPct = useMemo(() => {
    if (!focusedSubGoal) return 0;
    const total = focusedSubGoal.cells.length;
    const done = focusedSubGoal.cells.filter((c) => c.is_completed).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [focusedSubGoal]);

  const subGoalCount = board?.sub_goals.length ?? 0;

  const handleGridCellPress = (gridIndex: number) => {
    const cell = fullGrid[gridIndex];
    if (cell?.subGoalPosition !== undefined) {
      setSelectedSubGoalPos(cell.subGoalPosition);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* 페이지 툴바: 뷰 토글 */}
      <View style={styles.toolbar}>
        <ViewToggle />
      </View>

      <View style={styles.layout}>
        {viewTab === 'brief' ? (
          <>
            <View style={styles.main}>
              <StatsCardRow
                streak={7}
                completionPct={statsData.pct}
                bingoCount={bingoCount}
                subGoalCount={subGoalCount}
              />
              <HeroFocusCard
                subGoal={focusedSubGoal}
                pct={focusedPct}
                boardTitle={board?.title ?? ''}
              />
            </View>
            <View style={styles.rightPanel}>
              <SubGoalGridPanel board={board} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.main}>
              {board && (
                <View style={styles.briefHeader}>
                  <Text style={[styles.briefTitle, { color: C.textPrimary }]}>{board.title}</Text>
                  <View style={styles.briefBadges}>
                    <Text style={[styles.briefPct, { color: C.textSecondary }]}>{statsData.pct}% 달성</Text>
                    <Text style={[styles.briefBingo, { color: C.primary }]}>빙고 {bingoCount}개</Text>
                  </View>
                </View>
              )}
              <HomeGrid9x9 fullGrid={fullGrid} onCellPress={handleGridCellPress} />
            </View>
            <View style={styles.rightPanel}>
              <SubGoalDetailPanel board={board} selectedPos={selectedSubGoalPos} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
  main: {
    flex: 1,
    gap: 16,
  },
  rightPanel: {
    width: 280,
  },
  briefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  briefTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  briefBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  briefPct: {
    fontSize: 14,
  },
  briefBingo: {
    fontSize: 14,
    fontWeight: '600',
  },
  fullLayout: {
    flex: 1,
    alignItems: 'center',
  },
});
