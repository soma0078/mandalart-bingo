import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { FullGridCell } from "@/utils/gridMapper";

interface Props {
  fullGrid: FullGridCell[];
  onCellPress?: (gridIndex: number) => void;
}

export function MandalaGrid9x9({ fullGrid, onCellPress }: Props) {
  const getBlockBackgroundColor = (globalIndex: number) => {
    const row = Math.floor(globalIndex / 9);
    const col = globalIndex % 9;
    const blockRow = Math.floor(row / 3);
    const blockCol = Math.floor(col / 3);

    // 3×3 블록별 배경색 (중앙 블록만 다르게)
    if (blockRow === 1 && blockCol === 1) {
      return "#f5f5f5";
    }

    return (blockRow + blockCol) % 2 === 0 ? "#fafafa" : "#fff";
  };

  const getCellStyle = (cellData: FullGridCell, globalIndex: number) => {
    const isCenter = globalIndex === 40;
    const isCompleted = cellData.isCompleted && !isCenter;

    return [
      styles.cell,
      {
        backgroundColor: isCenter ? "#222" : getBlockBackgroundColor(globalIndex),
      },
      isCompleted && styles.completedCell,
    ];
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {fullGrid.map((cellData, index) => {
          const isCenter = index === 40;
          const isCompleted = cellData.isCompleted && !isCenter;

          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                getCellStyle(cellData, index),
                onCellPress && pressed && styles.cellPressed,
              ]}
              onPress={onCellPress ? () => onCellPress(index) : undefined}
            >
              {isCompleted && (
                <Text style={styles.checkmark}>✓</Text>
              )}
              <Text
                style={[
                  styles.cellText,
                  isCenter && styles.centerCellText,
                  isCompleted && styles.completedCellText,
                ]}
                numberOfLines={2}
              >
                {cellData.text || ""}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = 30;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: CELL_SIZE * 9,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  cellPressed: {
    opacity: 0.6,
  },
  completedCell: {
    backgroundColor: "#f0faf0",
    borderColor: "#b2dfb2",
  },
  cellText: {
    fontSize: 8,
    color: "#333",
    textAlign: "center",
  },
  centerCellText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 9,
  },
  completedCellText: {
    color: "#2e7d32",
    fontWeight: "500",
  },
  checkmark: {
    fontSize: 10,
    color: "#2e7d32",
    fontWeight: "700",
    position: "absolute",
    top: 2,
    right: 2,
  },
});
