import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import type { BingoLine } from '@/utils/gridMapper';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PARTICLE_COUNT = 70;
const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6FC8', '#C77DFF', '#FF9F43', '#54A0FF'];

interface ParticleDef {
  x: number;
  color: string;
  size: number;
  isRect: boolean;
  rotDir: number;
  delay: number;
  duration: number;
  xOffset: number;
}

function bingoLineLabel(b: BingoLine): string {
  if (b.type === 'diagonal') return b.index === 0 ? '대각선 ↘' : '대각선 ↙';
  if (b.type === 'row') return `가로 ${b.index + 1}줄`;
  return `세로 ${b.index + 1}줄`;
}

// ─── ConfettiParticle ──────────────────────────────────────

function ConfettiParticle({ def, active }: { def: ParticleDef; active: boolean }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      translateY.setValue(0);
      translateX.setValue(0);
      opacity.setValue(0);
      rotate.setValue(0);
      return;
    }

    translateY.setValue(0);
    translateX.setValue(0);
    opacity.setValue(1);
    rotate.setValue(0);

    const anim = Animated.sequence([
      Animated.delay(def.delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_H * 1.1,
          duration: def.duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: def.xOffset,
          duration: def.duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: def.duration,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: def.rotDir,
          duration: def.duration,
          useNativeDriver: true,
        }),
      ]),
    ]);

    anim.start();
    return () => anim.stop();
  }, [active]);

  const rotateInterp = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${def.rotDir * 540}deg`],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: def.x,
        top: -20,
        width: def.size,
        height: def.isRect ? def.size * 1.6 : def.size,
        borderRadius: def.isRect ? 2 : def.size / 2,
        backgroundColor: def.color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: rotateInterp }],
      }}
    />
  );
}

// ─── BingoCelebrationModal ──────────────────────────────────

interface Props {
  visible: boolean;
  newBingos: BingoLine[];
  onClose: () => void;
}

export function BingoCelebrationModal({ visible, newBingos, onClose }: Props) {
  const C = useThemeColors();

  const particles = useRef<ParticleDef[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * SCREEN_W,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 9 + 5,
      isRect: Math.random() > 0.5,
      rotDir: Math.random() > 0.5 ? 1 : -1,
      delay: Math.random() * 500,
      duration: 1800 + Math.random() * 1400,
      xOffset: (Math.random() - 0.5) * 120,
    })),
  ).current;

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const isSingle = newBingos.length === 1;
  const title = isSingle ? '빙고!' : `빙고 ${newBingos.length}개!`;
  const subtitle = newBingos.map(bingoLineLabel).join(', ') + ' 완성!';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* confetti 레이어 */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {particles.map((def, i) => (
          <ConfettiParticle key={i} def={def} active={visible} />
        ))}
      </View>

      {/* 딤 배경 */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: C.white },
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <Text style={styles.emoji}>🎉</Text>
          <Text style={[styles.title, { color: C.textPrimary }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: C.textMuted }]}>{subtitle}</Text>
          <Text style={[styles.desc, { color: C.textSecondary }]}>
            {isSingle ? '한 줄을 완성했어요. 계속 달려봐요!' : '여러 줄을 한 번에 완성했어요!'}
          </Text>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: C.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.btnText}>계속하기</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  emoji: { fontSize: 56, marginBottom: 4 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  desc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  btn: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
