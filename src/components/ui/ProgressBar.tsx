import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontSize } from '@/constants/theme';

interface Props {
  progress: number;
  label?: string;
  value?: string;
  style?: ViewStyle;
}

export function ProgressBar({ progress, label, value, style }: Props) {
  const pct: `${number}%` = `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%`;
  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: pct }]}
        />
      </View>
      {(label != null || value != null) && (
        <View style={styles.meta}>
          {label != null && <Text style={styles.metaLabel}>{label}</Text>}
          {value != null && <Text style={styles.metaValue}>{value}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: FontSize.label,
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: FontSize.label,
    fontWeight: '600',
    color: Colors.primary,
  },
});
