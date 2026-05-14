import React from "react";
import { useGetBoardById } from "@/hooks/useGetBoardById";
import { boardToCells, isCenterCell } from "@/utils/gridMapper";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  id: string;
}

export function MandalaGrid3x3({ id }: Props) {
  const { data: board } = useGetBoardById(id);
  const cells = boardToCells(board);

  return (
    <View style={styles.boardContainer}>
      <Text style={styles.boardTitle}>{board?.title}</Text>
      <View style={styles.grid}>
        {cells.map((text, index) => (
          <View
            key={index}
            style={[styles.cell, isCenterCell(index) && styles.centerCell]}
          >
            <Text
              style={[styles.cellText, isCenterCell(index) && styles.centerCellText]}
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
