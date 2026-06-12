import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontSize, Radius } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

export type CellVariant = 'default' | 'core' | 'completed' | 'empty';

interface Props {
  label?: string;
  variant?: CellVariant;
  onPress?: () => void;
  size?: number;
}

export function Cell({ label, variant = 'default', onPress, size = 100 }: Props) {
  const C = useThemeColors();
  const textWidth = Math.floor(size * 0.8);
  const cellStyle = { width: size, height: size };

  const inner =
    variant === 'core' ? (
      <LinearGradient
        colors={[C.primary, C.primaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, styles.coreShadow, { shadowColor: C.primary }, cellStyle]}
      >
        <Text style={[styles.coreLabel, { color: C.white, width: textWidth }]} numberOfLines={3}>
          {label ?? ''}
        </Text>
      </LinearGradient>
    ) : (
      <View
        style={[
          styles.base,
          styles.defaultShadow,
          { backgroundColor: C.white },
          cellStyle,
          variant === 'completed'
            ? { borderWidth: 1.5, borderColor: C.primary }
            : { borderWidth: 1, borderColor: C.border },
        ]}
      >
        {variant === 'completed' && (
          <View style={[styles.checkBadge, { backgroundColor: C.accentLight }]}>
            <Text style={[styles.checkIcon, { color: C.primary }]}>✓</Text>
          </View>
        )}
        {variant === 'empty' ? (
          <>
            <Text style={[styles.emptyPlus, { color: C.border }]}>+</Text>
            <Text style={[styles.emptyHint, { color: C.textMuted }]}>탭해서 입력</Text>
          </>
        ) : (
          <Text
            style={[
              variant === 'completed'
                ? [styles.completedLabel, { color: C.textSecondary }]
                : [styles.defaultLabel, { color: C.textPrimary }],
              { width: textWidth },
            ]}
            numberOfLines={3}
          >
            {label ?? ''}
          </Text>
        )}
      </View>
    );

  if (!onPress) return inner;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  coreShadow: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.21,
    shadowRadius: 7,
    elevation: 4,
  },
  defaultLabel: {
    fontSize: FontSize.caption,
    fontWeight: '500',
    textAlign: 'center',
  },
  coreLabel: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    textAlign: 'center',
  },
  completedLabel: {
    fontSize: FontSize.label,
    fontWeight: '500',
    textAlign: 'center',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  checkIcon: {
    fontSize: FontSize.caption,
    fontWeight: '700',
  },
  emptyPlus: {
    fontSize: FontSize.title,
    fontWeight: '300',
  },
  emptyHint: {
    fontSize: 10,
  },
});
