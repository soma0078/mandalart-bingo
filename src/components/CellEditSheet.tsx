import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, FontSize, Spacing } from '@/constants/theme';

interface Props {
  visible: boolean;
  label: string;
  initialText: string;
  showCompletionToggle?: boolean;
  initialCompleted?: boolean;
  isSaving?: boolean;
  onSave: (text: string, completed?: boolean) => void;
  onClose: () => void;
}

export function CellEditSheet({
  visible,
  label,
  initialText,
  showCompletionToggle = false,
  initialCompleted = false,
  isSaving = false,
  onSave,
  onClose,
}: Props) {
  const [text, setText] = useState(initialText);
  const [completed, setCompleted] = useState(initialCompleted);

  useEffect(() => {
    if (visible) {
      setText(initialText);
      setCompleted(initialCompleted);
    }
  }, [visible, initialText, initialCompleted]);

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

      {showCompletionToggle && (
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>완료</Text>
          <Switch
            value={completed}
            onValueChange={setCompleted}
            trackColor={{ true: Colors.primary, false: Colors.border }}
            thumbColor={Colors.white}
          />
        </View>
      )}

      <Button
        label={isSaving ? '저장 중...' : '저장'}
        onPress={() => onSave(text.trim(), showCompletionToggle ? completed : undefined)}
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
