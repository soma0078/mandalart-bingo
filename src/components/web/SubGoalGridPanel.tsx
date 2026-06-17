import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useGertBoards } from '@/hooks/useGetBoards';
import { useGetBoardById } from '@/hooks/useGetBoardById';
import { SUB_GOAL_TO_GRID } from '@/utils/gridMapper';
import type { Board, BoardDetail } from '@/types/boards';

interface Props {
  board: BoardDetail | undefined;
}

function getBoardPct(detail: BoardDetail | undefined): number {
  if (!detail) return 0;
  const total = detail.sub_goals.reduce((acc, sg) => acc + sg.cells.length, 0);
  const completed = detail.sub_goals.reduce((acc, sg) => acc + sg.cells.filter((c) => c.is_completed).length, 0);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function SubGoalGrid({ board }: { board: BoardDetail | undefined }) {
  const C = useThemeColors();

  // Build 3×3 cell array using SUB_GOAL_TO_GRID mapping
  type GridItem = { title: string; pct: number; isMain: boolean; hasProgress: boolean };
  const cells: (GridItem | null)[] = Array(9).fill(null);

  if (board) {
    cells[4] = { title: board.main_goal, pct: 0, isMain: true, hasProgress: false };
    for (const sg of board.sub_goals) {
      const gi = SUB_GOAL_TO_GRID[sg.position];
      if (gi !== undefined) {
        const total = sg.cells.length;
        const completed = sg.cells.filter((c) => c.is_completed).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        cells[gi] = { title: sg.title, pct, isMain: false, hasProgress: completed > 0 };
      }
    }
  }

  const totalPct = getBoardPct(board);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>세부 목표 현황</Text>
        <Text style={[styles.pctBadge, { color: C.primary }]}>{totalPct}%</Text>
      </View>
      <View style={styles.grid}>
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.gridRow}>
            {[0, 1, 2].map((col) => {
              const idx = row * 3 + col;
              const cell = cells[idx];

              if (cell?.isMain) {
                return (
                  <LinearGradient
                    key={idx}
                    colors={[C.primary, C.primaryEnd]}
                    style={[styles.tile, styles.tileMain]}
                  >
                    <Text style={[styles.tileText, { color: C.white }]} numberOfLines={2}>
                      {cell.title}
                    </Text>
                  </LinearGradient>
                );
              }

              return (
                <View
                  key={idx}
                  style={[
                    styles.tile,
                    {
                      backgroundColor: cell?.hasProgress ? C.accentLight : C.white,
                      borderColor: cell?.hasProgress ? C.accentBorder : C.border,
                    },
                  ]}
                >
                  {cell ? (
                    <Text style={[styles.tileText, { color: C.textPrimary }]} numberOfLines={2}>
                      {cell.title}
                    </Text>
                  ) : (
                    <Text style={[styles.tilePlus, { color: C.border }]}>+</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

function BoardStatusList({ activeBoardId }: { activeBoardId: string | undefined }) {
  const C = useThemeColors();
  const { data: boards = [] } = useGertBoards();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>만다라트 현황</Text>
      <View style={styles.boardList}>
        {boards.map((b: Board) => (
          <BoardStatusRow key={b.id} board={b} isActive={b.id === activeBoardId} />
        ))}
      </View>
    </View>
  );
}

function BoardStatusRow({ board, isActive }: { board: Board; isActive: boolean }) {
  const C = useThemeColors();
  const { data: detail } = useGetBoardById(board.id);
  const pct = getBoardPct(detail);

  return (
    <View style={styles.boardRow}>
      <View style={styles.boardRowTop}>
        <Ionicons name="ellipse" size={8} color={isActive ? C.primary : C.border} />
        <Text style={[styles.boardRowTitle, { color: C.textPrimary }]} numberOfLines={1}>{board.title}</Text>
        <Text style={[styles.boardRowPct, { color: isActive ? C.primary : C.textMuted }]}>{pct}%</Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: C.border }]}>
        <View style={[styles.barFill, { backgroundColor: C.primary, width: `${pct}%` as any }]} />
      </View>
    </View>
  );
}

export function SubGoalGridPanel({ board }: Props) {
  const C = useThemeColors();
  const activeBoardId = board?.id;

  return (
    <View style={[styles.panel, { backgroundColor: C.white }]}>
      <SubGoalGrid board={board} />
      <View style={[styles.divider, { backgroundColor: C.border }]} />
      <BoardStatusList activeBoardId={activeBoardId} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  pctBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    gap: 5,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 5,
  },
  tile: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  tileMain: {
    borderWidth: 0,
  },
  tileText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  tilePlus: {
    fontSize: 16,
    fontWeight: '300',
  },
  divider: {
    height: 1,
  },
  boardList: {
    gap: 10,
  },
  boardRow: {
    gap: 5,
  },
  boardRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boardRowTitle: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  boardRowPct: {
    fontSize: 12,
    fontWeight: '700',
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginLeft: 14,
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
