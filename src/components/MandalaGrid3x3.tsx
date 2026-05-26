import React from "react";
import { useGetBoardById } from "@/hooks/useGetBoardById";
import { boardToCells, isCenterCell } from "@/utils/gridMapper";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  id: string;
  onCellPress?: (gridIndex: number) => void;
}

export function MandalaGrid3x3({ id, onCellPress }: Props) {
  const { data: board } = useGetBoardById(id);
  const cells = boardToCells(board);

  return (
    <View style={styles.boardContainer}>
      <Text style={styles.boardTitle}>{board?.title}</Text>
      <View style={styles.grid}>
        {cells.map((text, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.cell,
              isCenterCell(index) && styles.centerCell,
              onCellPress && pressed && styles.cellPressed,
            ]}
            onPress={onCellPress ? () => onCellPress(index) : undefined}
          >
            <Text
              style={[styles.cellText, isCenterCell(index) && styles.centerCellText]}
              numberOfLines={3}
            >
              {text || ""}
            </Text>
          </Pressable>
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
  cellPressed: {
    opacity: 0.6,
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
