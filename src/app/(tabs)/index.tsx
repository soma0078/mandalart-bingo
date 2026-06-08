import { CreateBoardSheet } from "@/components/CreateBoardSheet";
import { EmptyBoardsState } from "@/components/EmptyBoardsState";
import { FAB } from "@/components/FAB";
import { MandalaGrid3x3 } from "@/components/MandalaGrid3x3";
import { MandalaGrid9x9 } from "@/components/MandalaGrid9x9";
import { useGertBoards } from "@/hooks/useGetBoards";
import { useGetBoardById } from "@/hooks/useGetBoardById";
import { boardToFullGrid } from "@/utils/gridMapper";
import { useCellNavigation } from "@/utils/cellNavigation";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { data: boards = [], isLoading } = useGertBoards();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"3x3" | "9x9">("3x3");

  const firstBoardId = boards[0]?.id;
  const { data: board } = useGetBoardById(firstBoardId);
  const { handleCellPress } = useCellNavigation(firstBoardId);

  if (isLoading) {
    return <Text>로딩중...</Text>;
  }

  const onCellPress = (gridIndex: number) => {
    handleCellPress(gridIndex, viewMode, board);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {boards.length === 0 ? (
        <EmptyBoardsState onPress={() => setSheetOpen(true)} />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>{board?.title}</Text>
            <Pressable
              onPress={() =>
                setViewMode(viewMode === "3x3" ? "9x9" : "3x3")
              }
              style={styles.modeButton}
            >
              <Text style={styles.modeButtonText}>
                {viewMode === "3x3" ? "전체" : "간략히"}
              </Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.gridContainer} contentInsetAdjustmentBehavior="never">
            {viewMode === "3x3" ? (
              <MandalaGrid3x3 id={firstBoardId} onCellPress={onCellPress} />
            ) : (
              <MandalaGrid9x9
                fullGrid={boardToFullGrid(board)}
                onCellPress={onCellPress}
              />
            )}
          </ScrollView>

          <FAB onPress={() => setSheetOpen(true)} />
        </>
      )}

      <CreateBoardSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  gridContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingBottom: 100,
  },
});
