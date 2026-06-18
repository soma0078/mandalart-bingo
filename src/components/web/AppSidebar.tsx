import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useWebApp } from '@/contexts/WebAppContext';
import { BOARD_TEMPLATES, type BoardTemplate } from '@/constants/templates';
import { useCreateBoard } from '@/hooks/useCreateBoard';
import { useGertBoards } from '@/hooks/useGetBoards';
import { useGetBoardById } from '@/hooks/useGetBoardById';
import type { Board } from '@/types/boards';

const NAV_ITEMS = [
  { label: '홈',  route: '/(tabs)/',        activeIcon: 'home' as const,       inactiveIcon: 'home-outline' as const },
  { label: '통계', route: '/(tabs)/stats',   activeIcon: 'bar-chart' as const,  inactiveIcon: 'bar-chart-outline' as const },
  { label: '내역', route: '/(tabs)/list',    activeIcon: 'list' as const,       inactiveIcon: 'list-outline' as const },
  { label: '설정', route: '/(tabs)/settings',activeIcon: 'settings' as const,   inactiveIcon: 'settings-outline' as const },
];

const normalizePathname = (p: string) => p.replace(/^\/\(tabs\)/, '') || '/';

function BoardListItem({ board, isActive }: { board: Board; isActive: boolean }) {
  const C = useThemeColors();
  const { setActiveBoardId } = useWebApp();
  const { data: detail } = useGetBoardById(board.id);

  const completed = detail?.sub_goals.reduce((acc, sg) => acc + sg.cells.filter((c) => c.is_completed).length, 0) ?? 0;
  const total = detail?.sub_goals.reduce((acc, sg) => acc + sg.cells.length, 0) ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Pressable
      onPress={() => setActiveBoardId(board.id)}
      style={[styles.boardItem, isActive && { backgroundColor: C.accentLight }]}
    >
      <View style={styles.boardItemRow}>
        <Ionicons name="ellipse" size={8} color={isActive ? C.primary : C.border} />
        <Text style={[styles.boardTitle, { color: isActive ? C.primary : C.textPrimary }]} numberOfLines={1}>
          {board.title}
        </Text>
        <Text style={[styles.boardPct, { color: isActive ? C.primary : C.textMuted }]}>{pct}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: C.border }]}>
        <View style={[styles.progressFill, { backgroundColor: C.primary, width: `${pct}%` as any }]} />
      </View>
    </Pressable>
  );
}

function NewBoardForm({ onDone }: { onDone: (newId?: string) => void }) {
  const C = useThemeColors();
  const [title, setTitle] = useState('');
  const [mainGoal, setMainGoal] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const { mutate, isPending } = useCreateBoard();

  const canSubmit = useMemo(
    () => title.trim().length > 0 && mainGoal.trim().length > 0,
    [title, mainGoal],
  );

  const handleSelectTemplate = (tmpl: BoardTemplate) => {
    setSelectedTemplate(tmpl);
    setTitle(tmpl.title);
    setMainGoal(tmpl.main_goal);
    setTemplateOpen(false);
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setTemplateOpen(false);
  };

  const handleCreate = () => {
    if (!canSubmit || isPending) return;
    setMutationError(null);
    mutate(
      {
        payload: { title: title.trim(), main_goal: mainGoal.trim() },
        templateSubGoals: selectedTemplate?.sub_goals,
      },
      {
        onSuccess: (board) => onDone(board?.id),
        onError: (err) => setMutationError(err instanceof Error ? err.message : '오류가 발생했습니다'),
      },
    );
  };

  return (
    <View style={[newForm.container, { borderColor: C.border, backgroundColor: C.bg }]}>
      <TextInput
        style={[newForm.input, { borderColor: C.border, color: C.textPrimary, backgroundColor: C.white }]}
        placeholder="제목"
        placeholderTextColor={C.textMuted}
        value={title}
        onChangeText={setTitle}
        maxLength={30}
        editable={!isPending}
      />
      <TextInput
        style={[newForm.input, { borderColor: C.border, color: C.textPrimary, backgroundColor: C.white }]}
        placeholder="핵심 목표"
        placeholderTextColor={C.textMuted}
        value={mainGoal}
        onChangeText={setMainGoal}
        maxLength={30}
        editable={!isPending}
      />

      {/* Template picker */}
      <Pressable
        onPress={() => setTemplateOpen((v) => !v)}
        style={[newForm.templateBtn, { borderColor: selectedTemplate ? C.accentBorder : C.border, backgroundColor: selectedTemplate ? C.accentLight : C.white }]}
      >
        <Text style={[newForm.templateBtnText, { color: selectedTemplate ? C.primary : C.textMuted }]}>
          {selectedTemplate ? `${selectedTemplate.emoji} ${selectedTemplate.name}` : '템플릿 선택 (선택)'}
        </Text>
        <Ionicons name={templateOpen ? 'chevron-up' : 'chevron-down'} size={12} color={selectedTemplate ? C.primary : C.textMuted} />
      </Pressable>

      {templateOpen && (
        <View style={[newForm.templateList, { borderColor: C.border, backgroundColor: C.white }]}>
          {BOARD_TEMPLATES.map((tmpl) => (
            <Pressable
              key={tmpl.id}
              onPress={() => handleSelectTemplate(tmpl)}
              style={[
                newForm.templateItem,
                selectedTemplate?.id === tmpl.id && { backgroundColor: C.accentLight },
              ]}
            >
              <Text style={newForm.templateEmoji}>{tmpl.emoji}</Text>
              <Text style={[newForm.templateName, { color: C.textPrimary }]}>{tmpl.name}</Text>
              {selectedTemplate?.id === tmpl.id && (
                <Ionicons name="checkmark" size={14} color={C.primary} />
              )}
            </Pressable>
          ))}
          {selectedTemplate && (
            <Pressable onPress={handleClearTemplate} style={newForm.templateItem}>
              <Ionicons name="close-circle-outline" size={14} color={C.textMuted} />
              <Text style={[newForm.templateName, { color: C.textMuted }]}>선택 안 함</Text>
            </Pressable>
          )}
        </View>
      )}

      {mutationError && (
        <Text style={[newForm.errorText, { color: C.primary }]}>{mutationError}</Text>
      )}

      <View style={newForm.actions}>
        <Pressable onPress={() => onDone()} style={[newForm.btn, { borderColor: C.border }]}>
          <Text style={[newForm.btnText, { color: C.textSecondary }]}>취소</Text>
        </Pressable>
        <Pressable
          onPress={handleCreate}
          style={[
            newForm.btnPrimary,
            { backgroundColor: canSubmit ? C.primary : C.border, opacity: isPending ? 0.6 : 1 },
          ]}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[newForm.btnPrimaryText, { color: C.white }]}>만들기</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const newForm = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginTop: 4,
  },
  input: {
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  templateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 34,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  templateBtnText: {
    fontSize: 12,
    flex: 1,
  },
  templateList: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  templateEmoji: {
    fontSize: 14,
  },
  templateName: {
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  btn: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  btnPrimary: {
    flex: 2,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 11,
    marginTop: -4,
  },
});

export function AppSidebar() {
  const C = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
  const { activeBoardId, setActiveBoardId } = useWebApp();
  const { data: boards = [] } = useGertBoards();
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const effectiveBoardId = activeBoardId ?? boards[0]?.id;
  const activeBoard = boards.find((b: Board) => b.id === effectiveBoardId);

  const handleSelectBoard = (id: string) => {
    setActiveBoardId(id);
    setSelectorOpen(false);
  };

  const handleNewBoardDone = (newId?: string) => {
    setShowNewForm(false);
    if (newId) setActiveBoardId(newId);
  };

  return (
    <View style={[styles.sidebar, { backgroundColor: C.white, borderRightColor: C.border }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.inner}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={[styles.logoBox, { backgroundColor: C.primary }]} />
          <Text style={[styles.logoText, { color: C.textPrimary }]}>만다라트 빙고</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        {/* Board selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.textMuted }]}>현재 만다라트</Text>
          <Pressable
            style={[
              styles.boardSelector,
              { borderColor: selectorOpen ? C.primary : C.border },
            ]}
            onPress={() => setSelectorOpen((v) => !v)}
          >
            <View style={[styles.boardSelectorDot, { backgroundColor: C.primary }]} />
            <Text style={[styles.boardSelectorText, { color: C.textPrimary }]} numberOfLines={1}>
              {activeBoard?.title ?? '보드 선택'}
            </Text>
            <Ionicons
              name={selectorOpen ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={C.textMuted}
            />
          </Pressable>
          {selectorOpen && (
            <View style={[styles.selectorDropdown, { borderColor: C.border, backgroundColor: C.white }]}>
              {boards.map((b: Board) => {
                const isActive = b.id === effectiveBoardId;
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => handleSelectBoard(b.id)}
                    style={[
                      styles.selectorItem,
                      isActive && { backgroundColor: C.accentLight },
                    ]}
                  >
                    <View style={[styles.selectorDot, { backgroundColor: isActive ? C.primary : C.border }]} />
                    <Text
                      style={[styles.selectorItemText, { color: isActive ? C.primary : C.textPrimary }]}
                      numberOfLines={1}
                    >
                      {b.title}
                    </Text>
                    {isActive && <Ionicons name="checkmark" size={14} color={C.primary} />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Navigation */}
        <View style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = normalizePathname(pathname ?? '') === normalizePathname(item.route);
            return (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.route as any)}
                style={[styles.navItem, isActive && { backgroundColor: C.accentLight }]}
              >
                <Ionicons
                  name={isActive ? item.activeIcon : item.inactiveIcon}
                  size={18}
                  color={isActive ? C.primary : C.textSecondary}
                />
                <Text style={[styles.navLabel, { color: isActive ? C.primary : C.textSecondary }, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        {/* Board list */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.textMuted }]}>내 만다라트</Text>
          {boards.map((board: Board) => (
            <BoardListItem key={board.id} board={board} isActive={board.id === effectiveBoardId} />
          ))}
        </View>

        {/* New board */}
        {showNewForm ? (
          <NewBoardForm onDone={handleNewBoardDone} />
        ) : (
          <Pressable onPress={() => setShowNewForm(true)} style={styles.newBoardBtn}>
            <Ionicons name="add" size={16} color={C.primary} />
            <Text style={[styles.newBoardText, { color: C.primary }]}>새 만다라트</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    height: '100%' as any,
    borderRightWidth: 1,
  },
  inner: {
    padding: 16,
    gap: 4,
    paddingBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  logoBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  section: {
    gap: 4,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginLeft: 4,
  },
  boardSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  boardSelectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  boardSelectorText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  selectorDropdown: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  selectorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  selectorItemText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  nav: {
    gap: 2,
    marginVertical: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navLabel: {
    fontSize: 14,
  },
  navLabelActive: {
    fontWeight: '600',
  },
  boardItem: {
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    gap: 5,
  },
  boardItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boardTitle: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  boardPct: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginLeft: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  newBoardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  newBoardText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
