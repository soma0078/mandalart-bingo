import { useCreateBoard } from '@/hooks/useCreateBoard';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, FontSize, Spacing } from '@/constants/theme';

const createBoardSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  main_goal: z.string().min(1, '핵심 목표를 입력해주세요'),
});

type CreateBoardFormValues = z.infer<typeof createBoardSchema>;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CreateBoardSheet({ visible, onClose }: Props) {
  const { mutate: create, isPending } = useCreateBoard();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    mode: 'onChange',
    defaultValues: { title: '', main_goal: '' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: CreateBoardFormValues) => {
    create(values, { onSuccess: handleClose, onError: (e) => alert(e.message) });
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>만다라트 이름</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              placeholder="예) 2026 목표"
            />
          )}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>핵심 목표</Text>
        <Controller
          control={control}
          name="main_goal"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              placeholder="예) 건강한 몸 만들기"
            />
          )}
        />
      </View>

      <Button
        label={isPending ? '생성 중...' : '만들기'}
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid || isPending}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontSize: FontSize.label,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
