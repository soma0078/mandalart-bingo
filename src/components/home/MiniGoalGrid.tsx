import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { SUB_GOAL_TO_GRID } from '@/utils/gridMapper';
import type { BoardDetail } from '@/types/boards';

interface MiniCellData {
  title: string;
  isMain: boolean;
  isActive: boolean;
  gridIndex: number;
  pct: number;
}

interface Props {
  board: BoardDetail | undefined;
  onCellPress?: (gridIndex: number) => void;
}

export function MiniGoalGrid({ board, onCellPress }: Props) {
  const C = useThemeColors();
  const cells: (MiniCellData | null)[] = Array(9).fill(null);

  if (board) {
    cells[4] = { title: board.main_goal, isMain: true, isActive: false, gridIndex: 4, pct: 0 };
    for (const sg of board.sub_goals) {
      const gi = SUB_GOAL_TO_GRID[sg.position];
      if (gi !== undefined) {
        const completed = sg.cells.filter((c) => c.is_completed).length;
        const total = sg.cells.length;
        cells[gi] = {
          title: sg.title || '',
          isMain: false,
          isActive: completed > 0,
          gridIndex: gi,
          pct: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      }
    }
  }

  return (
    <View style={styles.grid}>
      {[0, 1, 2].map((row) => (
        <View key={row} style={styles.row}>
          {[0, 1, 2].map((col) => {
            const idx = row * 3 + col;
            const cell = cells[idx];

            if (cell?.isMain) {
              return (
                <LinearGradient
                  key={idx}
                  colors={[C.primary, C.primaryEnd]}
                  style={[styles.cell, { shadowColor: C.primary }]}
                >
                  <Text style={styles.mainText} numberOfLines={2}>
                    {cell.title}
                  </Text>
                </LinearGradient>
              );
            }

            return (
              <Pressable
                key={idx}
                onPress={() => cell && onCellPress?.(cell.gridIndex)}
                style={({ pressed }) => [
                  styles.cell,
                  styles.cellDefault,
                  cell?.isActive && { borderWidth: 1.5, borderColor: C.primaryEnd },
                  pressed && { opacity: 0.75 },
                ]}
              >
                {cell ? (
                  <>
                    <Text style={[styles.cellText, cell.isActive && styles.cellTextActive]} numberOfLines={2}>
                      {cell.title}
                    </Text>
                    <View style={styles.progressBg}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${cell.pct}%` as any, backgroundColor: C.primaryEnd },
                        ]}
                      />
                    </View>
                  </>
                ) : (
                  <Text style={styles.emptyPlus}>+</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 6 },
  row: { flexDirection: 'row', gap: 6 },
  cell: {
    flex: 1,
    height: 64,
    borderRadius: 14,
    padding: 10,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cellDefault: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cellActive: {},
  cellText: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },
  cellTextActive: { color: Colors.textPrimary },
  mainText: { fontSize: 12, fontWeight: '700', color: Colors.white, textAlign: 'center' },
  emptyPlus: { fontSize: 18, fontWeight: '300', color: Colors.border, textAlign: 'center' },
  progressBg: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
