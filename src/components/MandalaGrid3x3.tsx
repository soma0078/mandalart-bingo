import { useGetBoardById } from "@/hooks/useGetBoardById";
import { StyleSheet, Text, View } from "react-native";

// sub_goal position(0~7) → 3×3 그리드 인덱스 매핑
// 0 1 2
// 3 C 4   (C = 중앙 핵심 목표)
// 5 6 7
const SUB_GOAL_TO_GRID: Record<number, number> = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 5,
  5: 6,
  6: 7,
  7: 8,
};

interface Props {
  id: string;
}

export function MandalaGrid3x3({ id }: Props) {
  const { data: board } = useGetBoardById(id);

  const cells: (string | null)[] = Array(9).fill(null);

  if (board) {
    // 중앙 셀에 메인 목표 배치
    cells[4] = board.main_goal;
    // 서브 목표는 position에 따라 3x3 그리드의 해당 인덱스에 배치
    board.sub_goals.forEach((sg) => {
      const gridIndex = SUB_GOAL_TO_GRID[sg.position];
      if (gridIndex !== undefined) cells[gridIndex] = sg.title;
    });
  }

  return (
    <View style={styles.boardContainer}>
      <Text style={styles.boardTitle}>{board?.title}</Text>
      <View style={styles.grid}>
        {cells.map((text, index) => (
          <View
            key={index}
            style={[styles.cell, index === 4 && styles.centerCell]}
          >
            <Text
              style={[styles.cellText, index === 4 && styles.centerCellText]}
              numberOfLines={3}
            >
              {text || ""}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    alignItems: "center",
    gap: 16,
  },
  boardTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
  },
  centerCell: {
    backgroundColor: "#222",
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
});
