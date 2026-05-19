import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  onPress: () => void;
}

export function EmptyBoardsState({ onPress }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>아직 만들어진 만다라트가 없어요</Text>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>첫 만다라트 만들기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 15,
    color: "#888",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
