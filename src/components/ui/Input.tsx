import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { FontSize, Radius } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

type Props = TextInputProps;

export function Input({ style, onFocus, onBlur, value, multiline, ...rest }: Props) {
  const C = useThemeColors();
  const [focused, setFocused] = useState(false);
  const isActive = focused || Boolean(value);

  return (
    <TextInput
      value={value}
      multiline={multiline}
      placeholderTextColor={C.textMuted}
      textAlignVertical={multiline ? 'top' : 'center'}
      {...rest}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        styles.input,
        { color: C.textPrimary },
        isActive
          ? { backgroundColor: C.white, borderWidth: 2, borderColor: C.primary }
          : { backgroundColor: C.inputBg, borderWidth: 1.5, borderColor: C.border },
        multiline && styles.multiline,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 0,
    height: 52,
    fontSize: FontSize.body,
  },
  multiline: {
    height: undefined,
    minHeight: 72,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
