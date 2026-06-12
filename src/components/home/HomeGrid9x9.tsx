import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import type { FullGridCell } from '@/utils/gridMapper';

const BLOCK_BG = '#FFFFFF';

interface Props {
  fullGrid: FullGridCell[];
  onCellPress?: (index: number) => void;
}

export function HomeGrid9x9({ fullGrid, onCellPress }: Props) {
  const C = useThemeColors();

  return (
    <View style={{ gap: 3 }}>
      {[0, 1, 2].map((br) => (
        <View key={br} style={{ flexDirection: 'row', gap: 3 }}>
          {[0, 1, 2].map((bc) => {
            const bi = br * 3 + bc;
            return (
              <View key={bc} style={[styles.block, { backgroundColor: BLOCK_BG }]}>
                {[0, 1, 2].map((cr) => (
                  <View key={cr} style={styles.blockRow}>
                    {[0, 1, 2].map((cc) => {
                      const gi = (br * 3 + cr) * 9 + (bc * 3 + cc);
                      const cell = fullGrid[gi];
                      const ciBlock = cr * 3 + cc;
                      const isSubGoalCenter = ciBlock === 4 && bi !== 4;
                      const isMainGoal = bi === 4 && ciBlock === 4;
                      const isCompleted = cell?.isCompleted && !isSubGoalCenter && !isMainGoal;

                      return (
                        <Pressable
                          key={cc}
                          onPress={() => onCellPress?.(gi)}
                          style={({ pressed }) => [
                            styles.cell,
                            isCompleted && { backgroundColor: C.primaryEnd },
                            isSubGoalCenter && styles.cellSubGoal,
                            isMainGoal && { backgroundColor: C.primary },
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.cellText,
                              { color: C.textSecondary },
                              isCompleted && [styles.cellCompletedText, { color: C.white }],
                              isSubGoalCenter && [styles.cellSubGoalText, { color: C.textPrimary }],
                              isMainGoal && [styles.cellMainText, { color: C.white }],
                            ]}
                            numberOfLines={2}
                          >
                            {cell?.text ?? ''}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
    borderRadius: 10,
    padding: 5,
    gap: 2,
  },
  blockRow: { flexDirection: 'row', gap: 2 },
  cell: {
    flex: 1,
    height: 34,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  cellSubGoal: { backgroundColor: 'rgba(0,0,0,0.06)' },
  cellText: { fontSize: 7, textAlign: 'center' },
  cellCompletedText: { fontWeight: '500' },
  cellSubGoalText: { fontSize: 7, fontWeight: '600' },
  cellMainText: { fontSize: 7, fontWeight: '700' },
});
