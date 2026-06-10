import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { SUB_GOAL_TO_GRID } from '@/utils/gridMapper';
import type { BoardDetail } from '@/types/boards';

interface MiniCellData {
  title: string;
  isMain: boolean;
  isActive: boolean;
  gridIndex: number;
}

interface Props {
  board: BoardDetail | undefined;
  onCellPress?: (gridIndex: number) => void;
}

export function MiniGoalGrid({ board, onCellPress }: Props) {
  const cells: (MiniCellData | null)[] = Array(9).fill(null);

  if (board) {
    cells[4] = { title: board.main_goal, isMain: true, isActive: false, gridIndex: 4 };
    for (const sg of board.sub_goals) {
      const gi = SUB_GOAL_TO_GRID[sg.position];
      if (gi !== undefined) {
        cells[gi] = {
          title: sg.title || '',
          isMain: false,
          isActive: sg.cells.some((c) => c.is_completed),
          gridIndex: gi,
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
                  colors={[Colors.primary, Colors.primaryEnd]}
                  style={[styles.cell, { shadowColor: Colors.primary }]}
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
                  cell?.isActive && styles.cellActive,
                  pressed && { opacity: 0.75 },
                ]}
              >
                {cell ? (
                  <Text style={[styles.cellText, cell.isActive && styles.cellTextActive]} numberOfLines={2}>
                    {cell.title}
                  </Text>
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
  cellActive: {
    borderWidth: 1.5,
    borderColor: Colors.primaryEnd,
  },
  cellText: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },
  cellTextActive: { color: Colors.textPrimary },
  mainText: { fontSize: 12, fontWeight: '700', color: Colors.white, textAlign: 'center' },
  emptyPlus: { fontSize: 18, fontWeight: '300', color: Colors.border, textAlign: 'center' },
});
