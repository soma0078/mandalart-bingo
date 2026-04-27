import { useGertBoards } from "@/hooks/useGetBoards";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { data: boards } = useGertBoards();

  return (
    <View style={styles.container}>
      {boards?.length === 0 ? (
        <Text>No boards found.</Text>
      ) : (
        boards?.map((board) => (
          <View key={board.id} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {board.title}
            </Text>
          </View>
        ))
      )}
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
