import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FontSize, Spacing } from '@/constants/theme';
import { Colors } from '@/constants/theme';

interface Props {
  visible: boolean;
  label: string;
  initialText: string;
  isSaving?: boolean;
  onSave: (text: string) => void;
  onClose: () => void;
}

export function CellEditSheet({
  visible,
  label,
  initialText,
  isSaving = false,
  onSave,
  onClose,
}: Props) {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (visible) setText(initialText);
  }, [visible, initialText]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Input
          value={text}
          onChangeText={setText}
          multiline
          autoFocus
          placeholder="내용을 입력하세요"
        />
      </View>

      <Button
        label={isSaving ? '저장 중...' : '저장'}
        onPress={() => onSave(text.trim())}
        disabled={isSaving}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontSize: FontSize.label,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
});
