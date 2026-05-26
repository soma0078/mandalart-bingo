import { CellEditSheet } from "@/components/CellEditSheet";
import { MandalaGrid3x3 } from "@/components/MandalaGrid3x3";
import { useGetBoardById } from "@/hooks/useGetBoardById";
import { useUpdateBoard } from "@/hooks/useUpdateBoard";
import { GRID_TO_SUB_GOAL_POS, isCenterCell } from "@/utils/gridMapper";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EditTarget = { text: string } | null;

export default function BoardViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: board } = useGetBoardById(id);
  const { mutate: updateBoard, isPending } = useUpdateBoard();
  const [editTarget, setEditTarget] = useState<EditTarget>(null);

  const allCells = board?.sub_goals.flatMap((sg) => sg.cells) ?? [];
  const completedCount = allCells.filter((c) => c.is_completed).length;
  const totalCells = allCells.length;
  const progress = totalCells > 0 ? completedCount / totalCells : 0;

  const handleCellPress = (gridIndex: number) => {
    if (!board) return;

    if (isCenterCell(gridIndex)) {
      setEditTarget({ text: board.main_goal });
      return;
    }

    const subGoalPos = GRID_TO_SUB_GOAL_POS[gridIndex];
    const subGoal = board.sub_goals.find((sg) => sg.position === subGoalPos);
    if (!subGoal) return;

    router.push(`/board/sub/${subGoal.id}?boardId=${id}`);
  };

  const handleSave = (text: string) => {
    if (!board || !editTarget) return;
    updateBoard(
      { id: board.id, payload: { main_goal: text } },
      { onSuccess: () => setEditTarget(null) }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: board?.title ?? "",
          headerBackTitle: "",
        }}
      />

      <View style={styles.content}>
        <MandalaGrid3x3 id={id} onCellPress={handleCellPress} />
      </View>

      <View style={styles.progressBar}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedCount} / {totalCells} 완료
        </Text>
      </View>

      <CellEditSheet
        visible={editTarget !== null}
        label="핵심 목표"
        initialText={editTarget?.text ?? ""}
        isSaving={isPending}
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
  progressBar: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 6,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
  },
});
