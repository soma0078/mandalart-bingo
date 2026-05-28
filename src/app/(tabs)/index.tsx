import { CreateBoardSheet } from "@/components/CreateBoardSheet";
import { EmptyBoardsState } from "@/components/EmptyBoardsState";
import { FAB } from "@/components/FAB";
import { MandalaGrid3x3 } from "@/components/MandalaGrid3x3";
import { useGertBoards } from "@/hooks/useGetBoards";
import { useGetBoardById } from "@/hooks/useGetBoardById";
import { GRID_TO_SUB_GOAL_POS, isCenterCell } from "@/utils/gridMapper";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { data: boards = [], isLoading } = useGertBoards();
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();

  const firstBoardId = boards[0]?.id;
  const { data: board } = useGetBoardById(firstBoardId);

  if (isLoading) {
    return <Text>로딩중...</Text>;
  }

  const handleCellPress = (gridIndex: number) => {
    if (!board || !firstBoardId) return;

    if (isCenterCell(gridIndex)) {
      router.push(`/board/${firstBoardId}`);
      return;
    }

    const subGoalPos = GRID_TO_SUB_GOAL_POS[gridIndex];
    const subGoal = board.sub_goals.find((sg) => sg.position === subGoalPos);
    if (!subGoal) return;

    router.push(`/board/sub/${subGoal.id}?boardId=${firstBoardId}`);
  };

  return (
    <View style={styles.container}>
      {boards.length === 0 ? (
        <EmptyBoardsState onPress={() => setSheetOpen(true)} />
      ) : (
        <>
          <MandalaGrid3x3 id={firstBoardId} onCellPress={handleCellPress} />
          <FAB onPress={() => setSheetOpen(true)} />
        </>
      )}

      <CreateBoardSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
