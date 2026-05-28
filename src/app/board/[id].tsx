import { CellEditSheet } from "@/components/CellEditSheet";
import { MandalaGrid3x3 } from "@/components/MandalaGrid3x3";
import { MandalaGrid9x9 } from "@/components/MandalaGrid9x9";
import { useGetBoardById } from "@/hooks/useGetBoardById";
import { useUpdateBoard } from "@/hooks/useUpdateBoard";
import { boardToFullGrid } from "@/utils/gridMapper";
import { useCellNavigation } from "@/utils/cellNavigation";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EditTarget = { text: string } | null;

export default function BoardViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: board } = useGetBoardById(id);
  const { mutate: updateBoard, isPending } = useUpdateBoard();
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [viewMode, setViewMode] = useState<"3x3" | "9x9">("3x3");
  const { handleCellPress: navigateCell } = useCellNavigation(id);

  const allCells = board?.sub_goals.flatMap((sg) => sg.cells) ?? [];
  const completedCount = allCells.filter((c) => c.is_completed).length;
  const totalCells = allCells.length;
  const progress = totalCells > 0 ? completedCount / totalCells : 0;

  const handleCellPress = (gridIndex: number) => {
    if (!board) return;

    // 3×3 모드에서 중앙 셀: 편집 모드
    if (viewMode === "3x3" && gridIndex === 4) {
      setEditTarget({ text: board.main_goal });
      return;
    }

    // 9×9 모드에서 중앙 셀: 편집 모드
    if (viewMode === "9x9" && gridIndex === 40) {
      setEditTarget({ text: board.main_goal });
      return;
    }

    // 그 외: 네비게이션
    navigateCell(gridIndex, viewMode, board);
  };

  const handleSave = (text: string) => {
    if (!board || !editTarget) return;
    updateBoard(
      { id: board.id, payload: { main_goal: text } },
      { onSuccess: () => setEditTarget(null) }
    );
  };

  const fullGrid = boardToFullGrid(board);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: board?.title ?? "",
          headerBackTitle: "",
          headerRight: () => (
            <Pressable
              onPress={() =>
                setViewMode(viewMode === "3x3" ? "9x9" : "3x3")
              }
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>
                {viewMode === "3x3" ? "전체" : "간략히"}
              </Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.content}>
        {viewMode === "3x3" ? (
          <MandalaGrid3x3 id={id} onCellPress={handleCellPress} />
        ) : (
          <MandalaGrid9x9 fullGrid={fullGrid} onCellPress={handleCellPress} />
        )}
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
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerButtonText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
});
