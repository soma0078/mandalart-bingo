import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

const SHEET_HEIGHT = 280;

interface Props {
  visible: boolean;
  label: string;
  initialText: string;
  showCompletionToggle?: boolean;
  initialCompleted?: boolean;
  isSaving?: boolean;
  onSave: (text: string, completed?: boolean) => void;
  onClose: () => void;
}

export function CellEditSheet({
  visible,
  label,
  initialText,
  showCompletionToggle = false,
  initialCompleted = false,
  isSaving = false,
  onSave,
  onClose,
}: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [text, setText] = useState(initialText);
  const [completed, setCompleted] = useState(initialCompleted);

  useEffect(() => {
    if (visible) {
      setText(initialText);
      setCompleted(initialCompleted);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, initialText, initialCompleted]);

  const handleSave = () => {
    onSave(text.trim(), showCompletionToggle ? completed : undefined);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />
          <Text style={styles.label}>{label}</Text>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            placeholder="내용을 입력하세요"
            placeholderTextColor="#aaa"
          />

          {showCompletionToggle && (
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>완료</Text>
              <Switch
                value={completed}
                onValueChange={setCompleted}
                trackColor={{ true: "#000", false: "#ddd" }}
                thumbColor="#fff"
              />
            </View>
          )}

          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "저장 중..." : "저장"}
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    minHeight: SHEET_HEIGHT,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
    minHeight: 72,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 15,
    color: "#111",
  },
  saveButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
