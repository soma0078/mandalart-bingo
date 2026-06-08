import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Colors, FontSize, Radius } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'destructive';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: Props) {
  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.primaryShadow, pressed && styles.pressed, style]}
      >
        <LinearGradient
          colors={disabled ? ['#CCCCCC', '#CCCCCC'] : [Colors.primary, Colors.primaryEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryGradient}
        >
          <Text style={styles.primaryLabel}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary' ? styles.secondary : styles.destructive,
        disabled && styles.disabledBase,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={variant === 'secondary' ? styles.secondaryLabel : styles.destructiveLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.75 },
  primaryShadow: {
    borderRadius: Radius.full,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryGradient: {
    borderRadius: Radius.full,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  primaryLabel: {
    fontSize: FontSize.body,
    fontWeight: '700',
    color: Colors.white,
  },
  base: {
    borderRadius: Radius.full,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  destructive: {
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  disabledBase: { opacity: 0.5 },
  secondaryLabel: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  destructiveLabel: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.primary,
  },
});
