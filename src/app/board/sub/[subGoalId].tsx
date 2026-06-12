import { CellEditSheet } from "@/components/CellEditSheet";
import { useGetBoardById } from "@/hooks/useGetBoardById";
import { useUpdateCell } from "@/hooks/useUpdateCell";
import { useUpdateSubGoal } from "@/hooks/useUpdateSubGoal";
import type { Cell } from "@/types/cells";
import type { SubGoal } from "@/types/sub-goals";
import {
  detectBingos,
  isCenterCell,
  subGoalToCells,
  type BingoLine,
} from "@/utils/gridMapper";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EditTarget =
  | { type: "subGoal"; subGoal: SubGoal }
  | { type: "cell"; cell: Cell }
  | null;

export default function SubGoalViewer() {
  const { subGoalId, boardId } = useLocalSearchParams<{
    subGoalId: string;
    boardId: string;
  }>();
  const { data: board } = useGetBoardById(boardId);
  const { mutate: updateSubGoal, isPending: isSubGoalSaving } =
    useUpdateSubGoal(boardId);
  const { mutate: updateCell, isPending: isCellSaving } =
    useUpdateCell(boardId);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);

  const subGoal = board?.sub_goals.find((sg) => sg.id === subGoalId);
  const cells = subGoal ? subGoalToCells(subGoal) : [];

  const prevBingosRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!board) return;

    const currentBingos = detectBingos(board);
    const toKey = (b: BingoLine) => `${b.type}-${b.index}`;
    const currentKeys = new Set(currentBingos.map(toKey));

    // 첫 로드 시 기준값만 설정 — 이미 존재하는 빙고는 알림 제외
    if (prevBingosRef.current === null) {
      prevBingosRef.current = currentKeys;
      return;
    }

    const newBingos = currentBingos.filter((b) => !prevBingosRef.current!.has(toKey(b)));
    if (newBingos.length > 0) {
      showBingoToast(newBingos);
    }

    prevBingosRef.current = currentKeys;
  }, [board]);

  const showBingoToast = (bingos: ReturnType<typeof detectBingos>) => {
    if (bingos.length === 0) return;

    const messages = bingos.map((b) => {
      if (b.type === "diagonal") {
        return `대각선(${b.index === 0 ? "↘" : "↙"}) 한 줄을 완성했어요!`;
      }
      if (b.type === "row") {
        return `가로 ${b.index + 1}번째 줄을 완성했어요!`;
      }
      return `세로 ${b.index + 1}번째 줄을 완성했어요!`;
    });
    const message = messages.join("\n");

    if (Platform.OS === "android") {
      ToastAndroid.show(`🎉 ${message}`, ToastAndroid.LONG);
    } else {
      Alert.alert("🎉 빙고!", message);
    }
  };

  const handleCellTap = (gridIndex: number) => {
    if (!subGoal) return;

    if (isCenterCell(gridIndex)) {
      setEditTarget({ type: "subGoal", subGoal });
      return;
    }

    const cellData = cells[gridIndex];
    if (!cellData?.cellId) return;
    const cell = subGoal.cells.find((c) => c.id === cellData.cellId);
    if (!cell) return;
    updateCell({ id: cell.id, payload: { is_completed: !cell.is_completed } });
  };

  const handleCellLongPress = (gridIndex: number) => {
    if (!subGoal || isCenterCell(gridIndex)) return;

    const cellData = cells[gridIndex];
    if (!cellData?.cellId) return;
    const cell = subGoal.cells.find((c) => c.id === cellData.cellId);
    if (!cell) return;
    setEditTarget({ type: "cell", cell });
  };

  const handleSave = (text: string) => {
    if (!editTarget) return;

    if (editTarget.type === "subGoal") {
      updateSubGoal(
        { id: editTarget.subGoal.id, payload: { title: text } },
        { onSuccess: () => setEditTarget(null) }
      );
    } else {
      updateCell(
        { id: editTarget.cell.id, payload: { text } },
        { onSuccess: () => setEditTarget(null) }
      );
    }
  };

  const isSaving =
    editTarget?.type === "subGoal" ? isSubGoalSaving : isCellSaving;
  const editLabel =
    editTarget?.type === "subGoal" ? "세부 목표" : "실행 항목";
  const editInitialText =
    editTarget?.type === "subGoal"
      ? editTarget.subGoal.title
      : editTarget?.type === "cell"
        ? editTarget.cell.text
        : "";

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: subGoal?.title || "세부 목표",
          headerBackTitle: "",
        }}
      />

      <View style={styles.content}>
        <View style={styles.grid}>
          {cells.map((cellData, index) => {
            const isCenter = isCenterCell(index);
            return (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.cell,
                  isCenter && styles.centerCell,
                  cellData.isCompleted && !isCenter && styles.completedCell,
                  pressed && styles.cellPressed,
                ]}
                onPress={() => handleCellTap(index)}
                onLongPress={() => handleCellLongPress(index)}
                delayLongPress={400}
              >
                {cellData.isCompleted && !isCenter && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
                <Text
                  style={[
                    styles.cellText,
                    isCenter && styles.centerCellText,
                    cellData.isCompleted && !isCenter && styles.completedCellText,
                  ]}
                  numberOfLines={3}
                >
                  {cellData.text || ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>셀을 탭하면 완료 처리, 길게 누르면 텍스트를 수정할 수 있어요</Text>
      </View>

      <CellEditSheet
        visible={editTarget !== null}
        label={editLabel}
        initialText={editInitialText}
        isSaving={isSaving}
        onSave={handleSave}
        onClose={() => setEditTarget(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 300,
  },
  cell: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    gap: 2,
  },
  cellPressed: {
    opacity: 0.6,
  },
  centerCell: {
    backgroundColor: "#222",
  },
  completedCell: {
    backgroundColor: "#f0faf0",
    borderColor: "#b2dfb2",
  },
  cellText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  centerCellText: {
    color: "#fff",
    fontWeight: "600",
  },
  completedCellText: {
    color: "#2e7d32",
  },
  checkmark: {
    fontSize: 14,
    color: "#2e7d32",
    fontWeight: "700",
  },
  hint: {
    marginTop: 20,
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
  },
});
