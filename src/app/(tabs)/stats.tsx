import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueries } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';

import { useGertBoards } from '@/hooks/useGetBoards';
import { getBoardById } from '@/lib/boards';
import { detectBingos } from '@/utils/gridMapper';
import { CACHE_KEYS } from '@/constants/cacheKeys';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import type { BoardDetail } from '@/types/boards';

// ─── 상수 ─────────────────────────────────────────────────

const WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

// ─── 유틸 ─────────────────────────────────────────────────

function getWeekDates(): Date[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getMonthWeeks(): { label: string; start: Date; end: Date }[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: { label: string; start: Date; end: Date }[] = [];
  let weekStart = new Date(firstDay);
  let weekNum = 1;
  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weeks.push({
      label: `${weekNum}주`,
      start: new Date(weekStart),
      end: weekEnd > lastDay ? new Date(lastDay) : new Date(weekEnd),
    });
    weekStart.setDate(weekStart.getDate() + 7);
    weekNum++;
  }
  return weeks;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function getBoardPct(board: BoardDetail): number {
  const allCells = board.sub_goals.flatMap((sg) => sg.cells);
  if (allCells.length === 0) return 0;
  return Math.round((allCells.filter((c) => c.is_completed).length / allCells.length) * 100);
}

// ─── 서브 컴포넌트 ─────────────────────────────────────────

function HeroCard({ pct, bingoCount, totalCompleted, totalCells }: {
  pct: number;
  bingoCount: number;
  totalCompleted: number;
  totalCells: number;
}) {
  const C = useThemeColors();

  return (
    <LinearGradient
      colors={[C.primary, C.primaryEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[hero.card, { shadowColor: C.primary }]}
    >
      <Text style={hero.label}>전체 달성률</Text>
      <View style={hero.row}>
        <View style={hero.left}>
          <Text style={hero.pct}>{pct}%</Text>
          <Text style={hero.sub}>{totalCompleted}개 달성 중 / 전체 {totalCells}개</Text>
        </View>
        <View style={hero.badge}>
          <Text style={hero.badgeNum}>{bingoCount}</Text>
          <Text style={hero.badgeLabel}>빙고</Text>
        </View>
      </View>
      <View style={hero.pbBg}>
        <View style={[hero.pbFill, { width: `${pct}%` as any }]} />
      </View>
    </LinearGradient>
  );
}

const hero = StyleSheet.create({
  card: { borderRadius: 24, padding: 24, gap: 16, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 6 },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  left: { gap: 4 },
  pct: { fontSize: 48, fontWeight: '800', color: '#FFFFFF', lineHeight: 52 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 16, alignItems: 'center', gap: 4 },
  badgeNum: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  badgeLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  pbBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  pbFill: { height: '100%', borderRadius: 4, backgroundColor: '#FFFFFF' },
});

function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const C = useThemeColors();
  const maxVal = Math.max(...data, 1);
  const today = new Date().getDay();
  const todayIdx = (today + 6) % 7;

  return (
    <View style={chart.bars}>
      {data.map((val, i) => {
        const barHeight = Math.max((val / maxVal) * 80, val > 0 ? 6 : 0);
        const isToday = labels.length === 7 && i === todayIdx;
        return (
          <View key={i} style={chart.col}>
            <View style={chart.barBg}>
              <View style={[
                chart.bar,
                { height: barHeight, backgroundColor: C.border },
                isToday && { backgroundColor: C.primary },
              ]} />
            </View>
            <Text style={[chart.label, { color: C.textMuted }, isToday && { color: C.primary, fontWeight: '700' }]}>{labels[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

const chart = StyleSheet.create({
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 8 },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  barBg: { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '60%', borderRadius: 4 },
  label: { fontSize: 11 },
});

function BoardRow({ title, pct, color }: { title: string; pct: number; color: string }) {
  const C = useThemeColors();
  return (
    <View style={[boardRow.card, { backgroundColor: C.white }]}>
      <View style={boardRow.top}>
        <Text style={[boardRow.name, { color: C.textPrimary }]}>{title}</Text>
        <Text style={[boardRow.pct, { color }]}>{pct}%</Text>
      </View>
      <View style={[boardRow.pbBg, { backgroundColor: C.border }]}>
        <View style={[boardRow.pbFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const boardRow = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '600' },
  pct: { fontSize: 14, fontWeight: '700' },
  pbBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  pbFill: { height: '100%', borderRadius: 3 },
});

// ─── 메인 ─────────────────────────────────────────────────

export default function StatsScreen() {
  const C = useThemeColors();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const { data: boards = [] } = useGertBoards();

  const BOARD_COLORS = [C.primary, C.purple, C.warning, C.success, '#06B6D4', '#EC4899'];

  const boardDetails = useQueries({
    queries: boards.map((b) => ({
      queryKey: [CACHE_KEYS.boards, b.id],
      queryFn: () => getBoardById(b.id),
      enabled: !!b.id,
    })),
  });

  const allBoards = useMemo(
    () => boardDetails.map((q) => q.data).filter(Boolean) as BoardDetail[],
    [boardDetails],
  );

  const allCells = useMemo(
    () => allBoards.flatMap((b) => b.sub_goals.flatMap((sg) => sg.cells)),
    [allBoards],
  );

  const totalCells = allCells.length;
  const totalCompleted = allCells.filter((c) => c.is_completed).length;
  const overallPct = totalCells > 0 ? Math.round((totalCompleted / totalCells) * 100) : 0;
  const bingoCount = useMemo(() => allBoards.reduce((acc, b) => acc + detectBingos(b).length, 0), [allBoards]);

  // 바 차트 데이터
  const chartData = useMemo(() => {
    const completedCells = allCells.filter((c) => c.is_completed && c.completed_at);

    if (period === 'weekly') {
      const weekDates = getWeekDates();
      const counts = weekDates.map((d) =>
        completedCells.filter((c) => isSameDay(new Date(c.completed_at!), d)).length,
      );
      return { counts, labels: WEEK_LABELS };
    } else {
      const weeks = getMonthWeeks();
      const counts = weeks.map(({ start, end }) =>
        completedCells.filter((c) => {
          const d = new Date(c.completed_at!);
          return d >= start && d <= end;
        }).length,
      );
      return { counts, labels: weeks.map((w) => w.label) };
    }
  }, [allCells, period]);

  const boardStats = useMemo(
    () => allBoards.map((b, i) => ({
      title: b.title,
      pct: getBoardPct(b),
      color: BOARD_COLORS[i % BOARD_COLORS.length],
    })),
    [allBoards, BOARD_COLORS],
  );

  const chartSubLabel = period === 'weekly' ? '이번 주 달성 현황' : '이번 달 주차별 달성 현황';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: C.textPrimary }]}>통계</Text>

        <HeroCard
          pct={overallPct}
          bingoCount={bingoCount}
          totalCompleted={totalCompleted}
          totalCells={totalCells}
        />

        {/* 기간별 달성 */}
        <View style={[styles.card, { backgroundColor: C.white }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: C.textPrimary }]}>기간별 달성</Text>
            <View style={[styles.toggle, { backgroundColor: C.border }]}>
              <Pressable
                onPress={() => setPeriod('weekly')}
                style={[styles.togglePill, period === 'weekly' && { backgroundColor: C.primary }]}
              >
                <Text style={[styles.toggleText, { color: period === 'weekly' ? '#FFFFFF' : C.textMuted }, period === 'weekly' && styles.toggleTextActive]}>주간</Text>
              </Pressable>
              <Pressable
                onPress={() => setPeriod('monthly')}
                style={[styles.togglePill, period === 'monthly' && { backgroundColor: C.primary }]}
              >
                <Text style={[styles.toggleText, { color: period === 'monthly' ? '#FFFFFF' : C.textMuted }, period === 'monthly' && styles.toggleTextActive]}>월간</Text>
              </Pressable>
            </View>
          </View>
          <Text style={[styles.chartLabel, { color: C.textMuted }]}>{chartSubLabel}</Text>
          <BarChart data={chartData.counts} labels={chartData.labels} />
        </View>

        {/* 만다라트별 진행률 */}
        {boardStats.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>만다라트별 진행률</Text>
            {boardStats.map((b) => (
              <BoardRow key={b.title} title={b.title} pct={b.pct} color={b.color} />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, gap: Spacing.xl },
  title: { fontSize: 24, fontWeight: '700' },
  card: { borderRadius: 20, padding: 20, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  toggle: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 12, padding: 3, gap: 2 },
  togglePill: { borderRadius: 9, paddingVertical: 5, paddingHorizontal: 14 },
  togglePillActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 13 },
  toggleTextActive: { fontWeight: '600' },
  chartLabel: { fontSize: 13 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
});
