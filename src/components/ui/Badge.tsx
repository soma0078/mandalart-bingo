import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontSize, Radius } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

type Variant = 'primary' | 'success' | 'warning' | 'purple' | 'neutral';

interface Props {
  label: string;
  variant?: Variant;
  style?: ViewStyle;
}

const staticConfig: Record<Exclude<Variant, 'primary'>, { bg: string; text: string }> = {
  success: { bg: '#F0FFF4', text: Colors.success },
  warning: { bg: '#FFFBEB', text: Colors.warning },
  purple: { bg: '#F5F3FF', text: Colors.purple },
  neutral: { bg: '#F3F4F6', text: Colors.textSecondary },
};

export function Badge({ label, variant = 'neutral', style }: Props) {
  const C = useThemeColors();

  const { bg, text } =
    variant === 'primary'
      ? { bg: C.accentLight, text: C.primary }
      : staticConfig[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.lg,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FontSize.label,
    fontWeight: '600',
  },
});
