import { Pressable, StyleSheet, Text, View } from "react-native";

interface Board {
  id: string;
  title: string;
  main_goal: string;
  created_at: string;
}

interface Props {
  board: Board;
  onPress?: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function BoardListItem({ board, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {board.title}
        </Text>
        <Text style={styles.goal} numberOfLines={1}>
          {board.main_goal}
        </Text>
        <Text style={styles.date}>{formatDate(board.created_at)}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  goal: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
    color: "#aaa",
  },
  chevron: {
    fontSize: 22,
    color: "#ccc",
    marginLeft: 8,
  },
});
