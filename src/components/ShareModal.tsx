import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/contexts/ThemeContext';
import { HomeGrid9x9 } from '@/components/home/HomeGrid9x9';
import type { FullGridCell } from '@/utils/gridMapper';
import type { BoardDetail } from '@/types/boards';

interface Props {
  visible: boolean;
  board: BoardDetail | undefined;
  fullGrid: FullGridCell[];
  completionPct: number;
  bingoCount: number;
  onClose: () => void;
}

export function ShareModal({ visible, board, fullGrid, completionPct, bingoCount, onClose }: Props) {
  const C = useThemeColors();
  const cardRef = useRef<View>(null);
  const [isBusy, setIsBusy] = useState(false);

  const capture = async (): Promise<string | null> => {
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      return uri;
    } catch {
      Alert.alert('오류', '이미지 캡처에 실패했어요.');
      return null;
    }
  };

  const handleSave = async () => {
    setIsBusy(true);
    try {
      const uri = await capture();
      if (!uri) return;

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진을 저장하려면 사진 라이브러리 접근 권한이 필요해요.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('저장 완료', '사진 앱에서 확인하세요 📸');
    } finally {
      setIsBusy(false);
    }
  };

  const handleShare = async () => {
    setIsBusy(true);
    try {
      const uri = await capture();
      if (!uri) return;

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('공유 불가', '이 기기에서는 공유 기능을 사용할 수 없어요.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: '만다라트 공유하기',
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
        {/* 헤더 */}
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <View style={styles.headerSpacer} />
          <Text style={[styles.headerTitle, { color: C.textPrimary }]}>공유하기</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <SymbolView name="xmark.circle.fill" size={28} tintColor={C.textMuted} />
          </Pressable>
        </View>

        {/* 공유 카드 미리보기 */}
        <View style={styles.previewWrapper}>
          <View
            ref={cardRef}
            collapsable={false}
            style={[styles.card, { backgroundColor: C.white }]}
          >
            {/* 카드 헤더 */}
            <LinearGradient
              colors={[C.primary, C.primaryEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardTop}
            >
              <View>
                <Text style={styles.cardAppName}>만다라트 빙고</Text>
                <Text style={styles.cardBoardTitle} numberOfLines={1}>
                  {board?.title ?? ''}
                </Text>
              </View>
              <View style={styles.cardStats}>
                <Text style={styles.cardStatValue}>{completionPct}%</Text>
                <Text style={styles.cardStatLabel}>달성률</Text>
              </View>
            </LinearGradient>

            {/* 9x9 그리드 */}
            <View style={styles.cardGrid}>
              <HomeGrid9x9 fullGrid={fullGrid} />
            </View>

            {/* 카드 푸터 */}
            <View style={[styles.cardFooter, { borderTopColor: C.border }]}>
              <View style={styles.cardFooterStat}>
                <SymbolView name="trophy.fill" size={14} tintColor="#8B5CF6" />
                <Text style={[styles.cardFooterText, { color: C.textSecondary }]}>
                  빙고 {bingoCount}개
                </Text>
              </View>
              <View style={[styles.cardFooterDot, { backgroundColor: C.border }]} />
              <View style={styles.cardFooterStat}>
                <SymbolView name="checkmark.circle.fill" size={14} tintColor={C.primary} />
                <Text style={[styles.cardFooterText, { color: C.textSecondary }]}>
                  {completionPct}% 완료
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleSave}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: C.white, borderColor: C.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <SymbolView name="square.and.arrow.down" size={20} tintColor={C.primary} />
            <Text style={[styles.actionBtnText, { color: C.textPrimary }]}>사진 저장</Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <LinearGradient
              colors={[C.primary, C.primaryEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionBtnGradient}
            >
              <SymbolView name="square.and.arrow.up" size={20} tintColor="#FFFFFF" />
              <Text style={styles.actionBtnTextWhite}>공유하기</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {isBusy && (
          <View style={styles.busyOverlay}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: { width: 28 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  previewWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  cardAppName: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginBottom: 4 },
  cardBoardTitle: { fontSize: 18, color: '#FFFFFF', fontWeight: '800', maxWidth: 200 },
  cardStats: { alignItems: 'center' },
  cardStatValue: { fontSize: 28, color: '#FFFFFF', fontWeight: '800' },
  cardStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  cardGrid: {
    padding: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cardFooterStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardFooterText: { fontSize: 12, fontWeight: '500' },
  cardFooterDot: { width: 4, height: 4, borderRadius: 2 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  actionBtnText: { fontSize: 15, fontWeight: '600' },
  actionBtnTextWhite: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
