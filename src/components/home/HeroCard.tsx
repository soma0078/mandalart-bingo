import { View, Text, StyleSheet, type DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useThemeColors } from '@/contexts/ThemeContext';
import type { BoardDetail } from '@/types/boards';

function getSubGoalPct(subGoal: BoardDetail['sub_goals'][0]): number {
  if (subGoal.cells.length === 0) return 0;
  return Math.round((subGoal.cells.filter((c) => c.is_completed).length / subGoal.cells.length) * 100);
}

interface Props {
  subGoal: BoardDetail['sub_goals'][0] | undefined;
  boardTitle: string;
}

export function HeroCard({ subGoal, boardTitle }: Props) {
  const C = useThemeColors();
  if (!subGoal) return null;
  const pct = getSubGoalPct(subGoal);
  const sorted = [...subGoal.cells].sort((a, b) => a.position - b.position).slice(0, 4);

  return (
    <LinearGradient
      colors={[C.primary, C.primaryEnd, '#FFC347']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.9 }}
      style={[styles.card, { shadowColor: C.primary }]}
    >
      <View style={styles.chipRow}>
        <View style={styles.focusChip}>
          <Text style={[styles.focusChipText, { color: C.white }]}>{boardTitle}</Text>
        </View>
        <View style={styles.autoTag}>
          <Text style={styles.autoTagText}>집중 중</Text>
        </View>
      </View>

      <View style={{ height: 14 }} />

      <View style={styles.titleRow}>
        <View style={{ gap: 3 }}>
          <Text style={styles.titleSub}>세부 목표</Text>
          <Text style={[styles.title, { color: C.white }]}>{subGoal.title}</Text>
        </View>
        <View style={styles.ring}>
          <Text style={[styles.ringPct, { color: C.white }]}>{pct}%</Text>
        </View>
      </View>

      <View style={{ height: 16 }} />

      <View style={{ gap: 10 }}>
        {sorted.length > 0 ? (
          sorted.map((cell) => (
            <View key={cell.id} style={styles.actionItem}>
              <View style={[styles.checkbox, cell.is_completed && { backgroundColor: C.white, borderColor: C.white }]}>
                {cell.is_completed && (
                  <Text style={{ fontSize: 9, color: C.primary, fontWeight: '700' }}>✓</Text>
                )}
              </View>
              <Text
                style={[styles.actionText, cell.is_completed && styles.actionTextDone]}
                numberOfLines={1}
              >
                {cell.text || '(미입력)'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>액션 아이템을 추가하세요</Text>
        )}
      </View>

      <View style={{ height: 14 }} />

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct}%` as DimensionValue, backgroundColor: C.white }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 6,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  focusChip: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  focusChipText: { fontSize: 12, fontWeight: '500' },
  autoTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  autoTagText: { fontSize: 11, color: 'rgba(255,255,255,0.9)' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  titleSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  title: { fontSize: 24, fontWeight: '700' },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: { fontSize: 16, fontWeight: '800' },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {},
  actionText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', flex: 1 },
  actionTextDone: { color: 'rgba(255,255,255,0.55)' },
  emptyText: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' },
  progressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
});
