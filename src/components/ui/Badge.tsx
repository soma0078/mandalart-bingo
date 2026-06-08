import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontSize, Radius } from '@/constants/theme';

type Variant = 'primary' | 'success' | 'warning' | 'purple' | 'neutral';

interface Props {
  label: string;
  variant?: Variant;
  style?: ViewStyle;
}

const config: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: Colors.accentLight, text: Colors.primary },
  success: { bg: '#F0FFF4', text: Colors.success },
  warning: { bg: '#FFFBEB', text: Colors.warning },
  purple: { bg: '#F5F3FF', text: Colors.purple },
  neutral: { bg: '#F3F4F6', text: Colors.textSecondary },
};

export function Badge({ label, variant = 'neutral', style }: Props) {
  const { bg, text } = config[variant];
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
