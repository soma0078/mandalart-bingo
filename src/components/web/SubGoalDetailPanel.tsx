import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useUpdateCell } from '@/hooks/useUpdateCell';
import { useUpdateSubGoal } from '@/hooks/useUpdateSubGoal';
import type { BoardDetail } from '@/types/boards';

interface Props {
  board: BoardDetail | undefined;
  selectedPos: number | null;
}

function getDefaultSubGoal(board: BoardDetail | undefined) {
  if (!board?.sub_goals.length) return undefined;
  const withPct = board.sub_goals.map((sg) => ({
    sg,
    pct: sg.cells.length > 0 ? sg.cells.filter((c) => c.is_completed).length / sg.cells.length : 0,
  }));
  const inProgress = withPct.filter(({ pct }) => pct > 0 && pct < 1).sort((a, b) => b.pct - a.pct);
  return (inProgress[0] ?? withPct[0])?.sg;
}

export function SubGoalDetailPanel({ board, selectedPos }: Props) {
  const C = useThemeColors();

  const defaultSubGoal = useMemo(() => getDefaultSubGoal(board), [board]);
  const subGoal = selectedPos !== null
    ? board?.sub_goals.find((sg) => sg.position === selectedPos)
    : defaultSubGoal;

  const { mutate: updateCell } = useUpdateCell(board?.id ?? '');
  const { mutate: updateSubGoal } = useUpdateSubGoal(board?.id ?? '');

  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const startEditCell = (cellId: string, currentText: string) => {
    setEditingCellId(cellId);
    setEditingText(currentText);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const commitCell = (cellId: string) => {
    const trimmed = editingText.trim();
    if (trimmed !== (subGoal?.cells.find((c) => c.id === cellId)?.text ?? '')) {
      updateCell({ id: cellId, payload: { text: trimmed } });
    }
    setEditingCellId(null);
  };

  const startEditTitle = () => {
    setTitleText(subGoal?.title ?? '');
    setEditingTitle(true);
  };

  const commitTitle = () => {
    const trimmed = titleText.trim();
    if (trimmed && subGoal && trimmed !== subGoal.title) {
      updateSubGoal({ id: subGoal.id, payload: { title: trimmed } });
    }
    setEditingTitle(false);
  };

  if (!board || !subGoal) {
    return (
      <View style={[styles.panel, styles.empty, { backgroundColor: C.white }]}>
        <Text style={[styles.emptyText, { color: C.textMuted }]}>세부 목표를 선택하세요</Text>
      </View>
    );
  }

  const total = subGoal.cells.length;
  const completed = subGoal.cells.filter((c) => c.is_completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleToggle = (cellId: string, current: boolean) => {
    updateCell({ id: cellId, payload: { is_completed: !current } });
  };

  return (
    <View style={[styles.panel, { backgroundColor: C.white }]}>
      {/* Header */}
      <View style={styles.header}>
        {editingTitle ? (
          <TextInput
            style={[styles.titleInput, { color: C.textPrimary, borderColor: C.primary, backgroundColor: C.bg }]}
            value={titleText}
            onChangeText={setTitleText}
            onBlur={commitTitle}
            onSubmitEditing={commitTitle}
            autoFocus
            returnKeyType="done"
          />
        ) : (
          <Pressable onPress={startEditTitle} style={styles.titlePressable}>
            <Text style={[styles.title, { color: C.textPrimary }]} numberOfLines={2}>
              {subGoal.title}
            </Text>
            <Text style={[styles.editHint, { color: C.textMuted }]}>탭해서 수정</Text>
          </Pressable>
        )}
        <View style={styles.progressRow}>
          <Text style={[styles.progressCount, { color: C.textSecondary }]}>{completed}/{total} 완료</Text>
          <Text style={[styles.progressPct, { color: C.primary }]}>{pct}%</Text>
        </View>
        <View style={[styles.barTrack, { backgroundColor: C.border }]}>
          <View style={[styles.barFill, { backgroundColor: C.primary, width: `${pct}%` as any }]} />
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: C.border }]} />

      {/* Tasks */}
      <View style={styles.tasksSection}>
        <Text style={[styles.tasksLabel, { color: C.textSecondary }]}>실행 항목</Text>
        <View style={styles.taskList}>
          {subGoal.cells.map((cell) => (
            <View key={cell.id} style={styles.taskRow}>
              <Pressable
                onPress={() => handleToggle(cell.id, cell.is_completed)}
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: cell.is_completed ? C.primary : 'transparent',
                    borderColor: cell.is_completed ? C.primary : C.border,
                  },
                ]}
              >
                {cell.is_completed && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
              {editingCellId === cell.id ? (
                <TextInput
                  ref={inputRef}
                  style={[styles.cellInput, { color: C.textPrimary, borderColor: C.primary, backgroundColor: C.bg }]}
                  value={editingText}
                  onChangeText={setEditingText}
                  onBlur={() => commitCell(cell.id)}
                  onSubmitEditing={() => commitCell(cell.id)}
                  returnKeyType="done"
                  maxLength={40}
                />
              ) : (
                <Pressable onPress={() => startEditCell(cell.id, cell.text)} style={styles.taskTextWrap}>
                  <Text
                    style={[
                      styles.taskText,
                      { color: cell.is_completed ? C.textMuted : C.textPrimary },
                      cell.is_completed && styles.taskTextDone,
                    ]}
                    numberOfLines={2}
                  >
                    {cell.text || '탭해서 입력'}
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
          {subGoal.cells.length === 0 && (
            <Text style={[styles.emptyTasks, { color: C.textMuted }]}>실행 항목이 없습니다</Text>
          )}
        </View>
      </View>
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
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyText: {
    fontSize: 13,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressCount: {
    fontSize: 13,
  },
  progressPct: {
    fontSize: 18,
    fontWeight: '800',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  divider: {
    height: 1,
  },
  tasksSection: {
    gap: 10,
  },
  tasksLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskList: {
    gap: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  taskTextWrap: {
    flex: 1,
  },
  cellInput: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  titlePressable: {
    gap: 2,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editHint: {
    fontSize: 11,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  taskText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
  },
  emptyTasks: {
    fontSize: 12,
  },
});
