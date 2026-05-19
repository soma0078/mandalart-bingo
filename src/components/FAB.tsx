import { Pressable, StyleSheet, Text } from "react-native";

interface Props {
  onPress: () => void;
}

export function FAB({ onPress }: Props) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Text style={styles.label}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 32,
  },
});
