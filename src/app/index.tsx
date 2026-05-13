import { CreateBoardSheet } from "@/components/CreateBoardSheet";
import { MandalaGrid3x3 } from "@/components/MandalaGrid3x3";
import { useGertBoards } from "@/hooks/useGetBoards";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { data: boards = [], isLoading } = useGertBoards();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isEmpty = boards.length === 0;

  if (isLoading) {
    return <Text>로딩중...</Text>;
  }

  return (
    <View style={styles.container}>
      {isEmpty ? (
        <>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>첫 만다라트를 만들어보세요</Text>
          </View>
          <Pressable
            style={styles.ctaButton}
            onPress={() => setSheetOpen(true)}
          >
            <Text style={styles.ctaButtonText}>첫 만다라트 만들기</Text>
          </Pressable>
        </>
      ) : (
        <>
          {/* // TODO: 추후 사용자 설정 기능 추가 필요 */}
          <MandalaGrid3x3 id={boards[0].id} />
          <Pressable style={styles.fab} onPress={() => setSheetOpen(true)}>
            <Text style={styles.fabText}>+</Text>
          </Pressable>
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
