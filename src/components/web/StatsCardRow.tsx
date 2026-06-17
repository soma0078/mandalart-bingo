import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';

interface Props {
  streak: number;
  completionPct: number;
  bingoCount: number;
  subGoalCount: number;
}

export function StatsCardRow({ streak, completionPct, bingoCount, subGoalCount }: Props) {
  const C = useThemeColors();

  const cards = [
    { icon: 'flame' as const, color: C.warning, value: `${streak}일`, label: '스트릭' },
    { icon: 'checkmark-circle' as const, color: C.primary, value: `${completionPct}%`, label: '전체 달성' },
    { icon: 'trophy' as const, color: C.purple, value: `${bingoCount}개`, label: '빙고' },
    { icon: 'grid-outline' as const, color: C.primary, value: `${subGoalCount}개`, label: '세부 목표' },
  ];

  return (
    <View style={styles.row}>
      {cards.map((card) => (
        <View key={card.label} style={[styles.card, { backgroundColor: C.white }]}>
          <Ionicons name={card.icon} size={20} color={card.color} />
          <Text style={[styles.value, { color: C.textPrimary }]}>{card.value}</Text>
          <Text style={[styles.label, { color: C.textMuted }]}>{card.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
  },
});
