import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius } from '@/constants/theme';

export type CellVariant = 'default' | 'core' | 'completed' | 'empty';

interface Props {
  label?: string;
  variant?: CellVariant;
  onPress?: () => void;
  size?: number;
}

export function Cell({ label, variant = 'default', onPress, size = 100 }: Props) {
  const textWidth = Math.floor(size * 0.8);
  const cellStyle = { width: size, height: size };

  const inner =
    variant === 'core' ? (
      <LinearGradient
        colors={[Colors.primary, Colors.primaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, styles.coreShadow, cellStyle]}
      >
        <Text style={[styles.coreLabel, { width: textWidth }]} numberOfLines={3}>
          {label ?? ''}
        </Text>
      </LinearGradient>
    ) : (
      <View
        style={[
          styles.base,
          styles.defaultShadow,
          cellStyle,
          variant === 'completed' ? styles.completedBorder : styles.defaultBorder,
        ]}
      >
        {variant === 'completed' && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        )}
        {variant === 'empty' ? (
          <>
            <Text style={styles.emptyPlus}>+</Text>
            <Text style={styles.emptyHint}>탭해서 입력</Text>
          </>
        ) : (
          <Text
            style={[
              variant === 'completed' ? styles.completedLabel : styles.defaultLabel,
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
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  coreShadow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.21,
    shadowRadius: 7,
    elevation: 4,
  },
  defaultBorder: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  completedBorder: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  defaultLabel: {
    fontSize: FontSize.caption,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  coreLabel: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  completedLabel: {
    fontSize: FontSize.label,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  checkIcon: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyPlus: {
    fontSize: FontSize.title,
    fontWeight: '300',
    color: Colors.border,
  },
  emptyHint: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
