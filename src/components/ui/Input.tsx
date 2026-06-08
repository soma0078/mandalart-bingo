import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Colors, FontSize, Radius } from '@/constants/theme';

type Props = TextInputProps;

export function Input({ style, onFocus, onBlur, value, multiline, ...rest }: Props) {
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
        isActive ? styles.active : styles.default,
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
  active: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  multiline: {
    height: undefined,
    minHeight: 72,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
