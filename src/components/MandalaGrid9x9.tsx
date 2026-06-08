import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FullGridCell } from '@/utils/gridMapper';
import { Colors } from '@/constants/theme';

const CELL_SIZE = 30;

interface Props {
  fullGrid: FullGridCell[];
  onCellPress?: (gridIndex: number) => void;
}

function getBlockBg(globalIndex: number): string {
  const blockRow = Math.floor(Math.floor(globalIndex / 9) / 3);
  const blockCol = Math.floor((globalIndex % 9) / 3);
  if (blockRow === 1 && blockCol === 1) return '#F8F9FC';
  return (blockRow + blockCol) % 2 === 0 ? '#FAFAFA' : Colors.white;
}

export function MandalaGrid9x9({ fullGrid, onCellPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {fullGrid.map((cellData, index) => {
          const isCenter = index === 40;
          const isCompleted = cellData.isCompleted && !isCenter;

          return (
            <Pressable
              key={index}
              onPress={onCellPress ? () => onCellPress(index) : undefined}
              style={({ pressed }) => [
                styles.cell,
                {
                  backgroundColor: isCenter
                    ? Colors.textPrimary
                    : isCompleted
                    ? Colors.accentLight
                    : getBlockBg(index),
                  borderColor: isCompleted ? Colors.accentBorder : Colors.border,
                },
                onCellPress && pressed && styles.cellPressed,
              ]}
            >
              {isCompleted && <Text style={styles.checkmark}>✓</Text>}
              <Text
                style={[
                  styles.cellText,
                  isCenter && styles.centerText,
                  isCompleted && styles.completedText,
                ]}
                numberOfLines={2}
              >
                {cellData.text ?? ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: CELL_SIZE * 9,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  cellPressed: { opacity: 0.6 },
  cellText: {
    fontSize: 8,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  centerText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 9,
  },
  completedText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  checkmark: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 8,
    fontWeight: '700',
    color: Colors.primary,
  },
});
