import React from 'react';
import { useGetBoardById } from '@/hooks/useGetBoardById';
import { boardToCells, isCenterCell } from '@/utils/gridMapper';
import { StyleSheet, Text, View } from 'react-native';
import { Cell } from '@/components/ui/Cell';
import type { CellVariant } from '@/components/ui/Cell';
import { FontSize, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

const CELL_SIZE = 100;
const CELL_GAP = 6;

interface Props {
  id: string;
  onCellPress?: (gridIndex: number) => void;
}

function getCellVariant(text: string | null, isCenter: boolean): CellVariant {
  if (isCenter) return 'core';
  if (!text) return 'empty';
  return 'default';
}

export function MandalaGrid3x3({ id, onCellPress }: Props) {
  const C = useThemeColors();
  const { data: board } = useGetBoardById(id);
  const cells = boardToCells(board);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: C.textPrimary }]}>{board?.title}</Text>
      <View style={styles.grid}>
        {cells.map((text, index) => (
          <Cell
            key={index}
            label={text ?? undefined}
            variant={getCellVariant(text, isCenterCell(index))}
            size={CELL_SIZE}
            onPress={onCellPress ? () => onCellPress(index) : undefined}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  title: {
    fontSize: FontSize.heading,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: CELL_SIZE * 3 + CELL_GAP * 2,
    gap: CELL_GAP,
  },
});
