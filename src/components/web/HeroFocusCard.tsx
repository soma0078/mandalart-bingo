import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import type { BoardDetail } from '@/types/boards';

interface Props {
  subGoal: BoardDetail['sub_goals'][0] | undefined;
  pct: number;
  boardTitle: string;
}

export function HeroFocusCard({ subGoal, pct, boardTitle }: Props) {
  const C = useThemeColors();

  if (!subGoal) {
    return (
      <LinearGradient colors={[C.primary, C.primaryEnd]} style={styles.card}>
        <Text style={styles.placeholderText}>세부 목표를 추가하세요</Text>
      </LinearGradient>
    );
  }

  const cells = subGoal.cells.slice(0, 4);

  return (
    <LinearGradient colors={[C.primary, C.primaryEnd]} style={styles.card}>
      {/* Top badges */}
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>진행중인 세부 목표</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AI 추천</Text>
        </View>
      </View>

      {/* Title + progress circle */}
      <View style={styles.middleRow}>
        <Text style={styles.title} numberOfLines={2}>{subGoal.title}</Text>
        <View style={[styles.progressCircle, { backgroundColor: C.white }]}>
          <Text style={[styles.progressPct, { color: C.primary }]}>{pct}%</Text>
          <Text style={[styles.progressLabel, { color: C.textMuted }]}>빙고</Text>
        </View>
      </View>

      {/* Task chips */}
      {cells.length > 0 && (
        <View style={styles.chipsRow}>
          {cells.map((cell, i) => (
            <View
              key={cell.id ?? i}
              style={[styles.chip, { backgroundColor: cell.is_completed ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)' }]}
            >
              {cell.is_completed && <Ionicons name="checkmark" size={11} color="#FFFFFF" />}
              <Text style={styles.chipText} numberOfLines={1}>{cell.text || '—'}</Text>
            </View>
          ))}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    minHeight: 200,
    gap: 16,
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    flex: 1,
    marginRight: 16,
  },
  progressCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPct: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressLabel: {
    fontSize: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
    maxWidth: 100,
  },
});
