import { useThemeColors } from '@/contexts/ThemeContext';
import { BOARD_TEMPLATES, type BoardTemplate } from '@/constants/templates';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

interface Props {
  visible: boolean;
  onSelect: (template: BoardTemplate) => void;
  onClose: () => void;
}

export function TemplatePickerSheet({ visible, onSelect, onClose }: Props) {
  const C = useThemeColors();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
        {/* 헤더 */}
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <View style={styles.headerLeft} />
          <Text style={[styles.headerTitle, { color: C.textPrimary }]}>템플릿 선택</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
            <SymbolView name="xmark.circle.fill" size={28} tintColor={C.textMuted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={[styles.subtitle, { color: C.textMuted }]}>
            템플릿을 선택하면 세부 목표와 실행 항목이 자동으로 채워져요.{'\n'}선택 후 수정할 수 있어요.
          </Text>

          {BOARD_TEMPLATES.map((template) => (
            <Pressable
              key={template.id}
              onPress={() => onSelect(template)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: C.white, borderColor: C.border },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={[styles.emojiBox, { backgroundColor: C.accentLight }]}>
                <Text style={styles.emoji}>{template.emoji}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardName, { color: C.textPrimary }]}>{template.name}</Text>
                <Text style={[styles.cardDesc, { color: C.textMuted }]} numberOfLines={2}>
                  {template.description}
                </Text>
                <View style={styles.cardMeta}>
                  <Text style={[styles.cardMetaText, { color: C.primary }]}>
                    세부 목표 8개 · 실행 항목 64개
                  </Text>
                </View>
              </View>
              <SymbolView name="chevron.right" size={16} tintColor={C.border} />
            </Pressable>
          ))}

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { width: 28 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  closeBtn: { padding: 2 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26 },
  cardContent: { flex: 1, gap: 4 },
  cardName: { fontSize: 15, fontWeight: '700' },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  cardMeta: { marginTop: 2 },
  cardMetaText: { fontSize: 12, fontWeight: '500' },
});
