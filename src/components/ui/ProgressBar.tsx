import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { FontSize } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

interface Props {
  progress: number;
  label?: string;
  value?: string;
  style?: ViewStyle;
}

export function ProgressBar({ progress, label, value, style }: Props) {
  const C = useThemeColors();
  const pct: `${number}%` = `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%`;
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { backgroundColor: C.border }]}>
        <LinearGradient
          colors={[C.primary, C.primaryEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: pct }]}
        />
      </View>
      {(label != null || value != null) && (
        <View style={styles.meta}>
          {label != null && <Text style={[styles.metaLabel, { color: C.textMuted }]}>{label}</Text>}
          {value != null && <Text style={[styles.metaValue, { color: C.primary }]}>{value}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  track: {
    height: 6,
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
  },
  metaValue: {
    fontSize: FontSize.label,
    fontWeight: '600',
  },
});
