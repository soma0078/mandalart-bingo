import { CreateBoardSheet } from "@/components/CreateBoardSheet";
import { EmptyBoardsState } from "@/components/EmptyBoardsState";
import { FAB } from "@/components/FAB";
import { MandalaGrid3x3 } from "@/components/MandalaGrid3x3";
import { useGertBoards } from "@/hooks/useGetBoards";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { data: boards = [], isLoading } = useGertBoards();
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return <Text>로딩중...</Text>;
  }

  return (
    <View style={styles.container}>
      {boards.length === 0 ? (
        <EmptyBoardsState onPress={() => setSheetOpen(true)} />
      ) : (
        <>
          {/* TODO: 추후 사용자 설정 기능 추가 필요 */}
          <Pressable onPress={() => router.push(`/board/${boards[0].id}`)}>
            <MandalaGrid3x3 id={boards[0].id} />
          </Pressable>
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
