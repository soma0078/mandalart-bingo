import { BoardListItem } from "@/components/BoardListItem";
import { CreateBoardSheet } from "@/components/CreateBoardSheet";
import { EmptyBoardsState } from "@/components/EmptyBoardsState";
import { FAB } from "@/components/FAB";
import { useGertBoards } from "@/hooks/useGetBoards";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ListScreen() {
  const { data: boards = [], isLoading } = useGertBoards();
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>로딩중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 만다라트</Text>
      </View>

      {boards.length === 0 ? (
        <EmptyBoardsState onPress={() => setSheetOpen(true)} />
      ) : (
        <>
          <FlatList
            data={boards}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BoardListItem
                board={item}
                onPress={() => router.push(`/board/${item.id}`)}
              />
            )}
            contentContainerStyle={styles.list}
          />
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
  loading: {
    textAlign: "center",
    marginTop: 40,
    color: "#aaa",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 100,
  },
});
