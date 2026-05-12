import { CreateBoardSheet } from "@/components/CreateBoardSheet";
import { useGertBoards } from "@/hooks/useGetBoards";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { data: boards } = useGertBoards();
  const [sheetOpen, setSheetOpen] = useState(false);
  const isEmpty = boards?.length === 0;

  return (
    <View style={styles.container}>
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>첫 만다라트를 만들어보세요</Text>
        </View>
      ) : (
        boards?.map((board) => (
          <View key={board.id} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {board.title}
            </Text>
          </View>
        ))
      )}

      {isEmpty ? (
        <Pressable style={styles.ctaButton} onPress={() => setSheetOpen(true)}>
          <Text style={styles.ctaButtonText}>첫 만다라트 만들기</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.fab} onPress={() => setSheetOpen(true)}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
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
  emptyContainer: {
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  ctaButton: {
    position: "absolute",
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 32,
  },
});
