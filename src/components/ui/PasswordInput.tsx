import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { FontSize, Radius } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

type Props = Omit<TextInputProps, 'secureTextEntry' | 'style'> & {
  style?: StyleProp<ViewStyle>;
};

export function PasswordInput({ style, onFocus, onBlur, value, ...rest }: Props) {
  const C = useThemeColors();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const isActive = focused || Boolean(value);

  return (
    <View
      style={[
        styles.wrapper,
        isActive
          ? { backgroundColor: C.white, borderWidth: 2, borderColor: C.primary }
          : { backgroundColor: C.inputBg, borderWidth: 1.5, borderColor: C.border },
        style,
      ]}
    >
      <TextInput
        value={value}
        secureTextEntry={!visible}
        placeholderTextColor={C.textMuted}
        textAlignVertical="center"
        {...rest}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={[styles.input, { color: C.textPrimary }]}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        hitSlop={8}
        style={styles.toggle}
      >
        <Ionicons
          name={visible ? 'eye-outline' : 'eye-off-outline'}
          size={20}
          color={C.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 52,
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    height: '100%',
  },
  toggle: {
    padding: 4,
  },
});
