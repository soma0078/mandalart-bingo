import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Colors, FontSize, Radius } from '@/constants/theme';
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
      placeholderTextColor={Colors.textMuted}
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
        isActive
          ? [styles.activeBase, { borderColor: C.primary }]
          : styles.default,
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
    color: Colors.textPrimary,
  },
  default: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  activeBase: {
    backgroundColor: Colors.white,
    borderWidth: 2,
  },
  multiline: {
    height: undefined,
    minHeight: 72,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
