import { useState } from 'react';
import { useCreateBoard } from '@/hooks/useCreateBoard';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TemplatePickerSheet } from '@/components/TemplatePickerSheet';
import { FontSize, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import type { BoardTemplate, TemplateSubGoal } from '@/constants/templates';
import { SymbolView } from 'expo-symbols';

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
  const C = useThemeColors();
  const { mutate: create, isPending } = useCreateBoard();
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid },
  } = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    mode: 'onChange',
    defaultValues: { title: '', main_goal: '' },
  });

  const handleClose = () => {
    reset();
    setSelectedTemplate(null);
    onClose();
  };

  const handleTemplateSelect = (template: BoardTemplate) => {
    setSelectedTemplate(template);
    setTemplatePickerOpen(false);
    setValue('title', template.title, { shouldValidate: true });
    setValue('main_goal', template.main_goal, { shouldValidate: true });
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setValue('title', '', { shouldValidate: true });
    setValue('main_goal', '', { shouldValidate: true });
  };

  const onSubmit = (values: CreateBoardFormValues) => {
    create(
      {
        payload: values,
        templateSubGoals: selectedTemplate?.sub_goals,
      },
      { onSuccess: handleClose, onError: (e) => alert(e.message) },
    );
  };

  return (
    <>
      <BottomSheet visible={visible} onClose={handleClose}>
        {/* 템플릿 선택 배너 */}
        {selectedTemplate ? (
          <View style={[styles.templateBanner, { backgroundColor: C.accentLight, borderColor: C.accentBorder }]}>
            <Text style={styles.templateEmoji}>{selectedTemplate.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.templateBannerLabel, { color: C.textMuted }]}>템플릿 적용됨</Text>
              <Text style={[styles.templateBannerName, { color: C.primary }]}>{selectedTemplate.name}</Text>
            </View>
            <Pressable onPress={handleClearTemplate} hitSlop={10}>
              <SymbolView name="xmark.circle.fill" size={20} tintColor={C.textMuted} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setTemplatePickerOpen(true)}
            style={({ pressed }) => [
              styles.templateButton,
              { backgroundColor: C.white, borderColor: C.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <SymbolView name="square.grid.3x3.fill" size={16} tintColor={C.primary} />
            <Text style={[styles.templateButtonText, { color: C.primary }]}>템플릿에서 시작하기</Text>
            <SymbolView name="chevron.right" size={13} tintColor={C.primary} />
          </Pressable>
        )}

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>만다라트 이름</Text>
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
          <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>핵심 목표</Text>
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

      <TemplatePickerSheet
        visible={templatePickerOpen}
        onSelect={handleTemplateSelect}
        onClose={() => setTemplatePickerOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontSize: FontSize.label,
    fontWeight: '600',
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  templateButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  templateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  templateEmoji: { fontSize: 22 },
  templateBannerLabel: { fontSize: 11 },
  templateBannerName: { fontSize: 14, fontWeight: '700' },
});
