import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useThemeColors } from '@/contexts/ThemeContext';
import { FontSize, Spacing } from '@/constants/theme';
import type { Board } from '@/types/boards';

interface Props {
  visible: boolean;
  boards: Board[];
  selectedBoardId: string | undefined;
  onSelect: (boardId: string) => void;
  onClose: () => void;
}

export function BoardEditSheet({ visible, boards, selectedBoardId, onSelect, onClose }: Props) {
  const C = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.modal, { backgroundColor: C.white }]} onPress={() => {}}>
          <Text style={[styles.title, { color: C.textPrimary }]}>만다라트 선택</Text>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {boards.map((board) => {
              const isSelected = board.id === selectedBoardId;
              return (
                <Pressable
                  key={board.id}
                  onPress={() => { onSelect(board.id); onClose(); }}
                  style={({ pressed }) => [
                    styles.row,
                    { borderBottomColor: C.border },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Text style={[styles.rowTitle, { color: C.textPrimary }, isSelected && { color: C.primary }]} numberOfLines={1}>
                      {board.title}
                    </Text>
                    <Text style={[styles.rowSub, { color: C.textMuted }]} numberOfLines={1}>
                      {board.main_goal}
                    </Text>
                  </View>
                  {isSelected && (
                    <SymbolView name="checkmark" size={16} tintColor={C.primary} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  modal: {
    width: '100%',
    borderRadius: 24,
    padding: Spacing['2xl'],
    gap: Spacing.lg,
    maxHeight: '70%',
  },
  title: {
    fontSize: FontSize.heading,
    fontWeight: '700',
  },
  list: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: { flex: 1, gap: 3, marginRight: 12 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 12 },
});
