import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

interface Props {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
  style?: ViewStyle;
}

export function Card({ title, action, onAction, children, style }: Props) {
  const C = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: C.white, borderColor: C.border }, style]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: C.textPrimary }]}>{title}</Text>
        {action != null && (
          <Pressable onPress={onAction}>
            <Text style={[styles.action, { color: C.textMuted }]}>{action}</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.heading,
    fontWeight: '700',
  },
  action: {
    fontSize: FontSize.caption,
  },
});
