import { useCreateBoard } from "@/hooks/useCreateBoard";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

const createBoardSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  main_goal: z.string().min(1, "핵심 목표를 입력해주세요"),
});

type CreateBoardFormValues = z.infer<typeof createBoardSchema>;

const SHEET_HEIGHT = 320;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CreateBoardSheet({ visible, onClose }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const { mutate: create, isPending } = useCreateBoard();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    mode: "onChange",
    defaultValues: { title: "", main_goal: "" },
  });

  useEffect(() => {
    if (visible) {
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
  }, [visible, translateY]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: CreateBoardFormValues) => {
    create(values, {
      onSuccess: handleClose,
      onError: (e) => alert(e.message),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />

          <Text style={styles.label}>만다라트 이름</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="예) 2026 목표"
                placeholderTextColor="#aaa"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Text style={styles.label}>핵심 목표</Text>
          <Controller
            control={control}
            name="main_goal"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="예) 건강한 몸 만들기"
                placeholderTextColor="#aaa"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Pressable
            style={[
              styles.submitButton,
              (!isValid || isPending) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isPending}
          >
            <Text style={styles.submitButtonText}>
              {isPending ? "생성 중..." : "만들기"}
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
    height: SHEET_HEIGHT,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
