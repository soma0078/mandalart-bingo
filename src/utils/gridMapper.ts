/**
 * MandalaGrid3x3 로직 추출
 * - sub_goal position → grid index 매핑
 * - 보드 데이터 → 셀 배열 변환
 */

import { BoardDetail } from "@/types/boards";

// sub_goal position(0~7) → 3×3 그리드 인덱스 매핑
// 0 1 2
// 3 C 4   (C = 중앙 핵심 목표)
// 5 6 7
export const SUB_GOAL_TO_GRID: Record<number, number> = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 5,
  5: 6,
  6: 7,
  7: 8,
};

/**
 * 보드 데이터를 3×3 그리드 셀 배열로 변환
 * @param board 보드 데이터 (main_goal, sub_goals)
 * @returns 9개 요소의 셀 배열 (중앙은 main_goal, 나머지는 sub_goal title)
 */
export function boardToCells(board: BoardDetail | undefined): (string | null)[] {
  const cells: (string | null)[] = Array(9).fill(null);

  if (!board) return cells;

  // 중앙 셀(index 4)에 핵심 목표 배치
  cells[4] = board.main_goal;

  // sub_goal을 position에 따라 적절한 grid index에 배치
  board.sub_goals.forEach((subGoal) => {
    const gridIndex = SUB_GOAL_TO_GRID[subGoal.position];
    if (gridIndex !== undefined) {
      cells[gridIndex] = subGoal.title || "";
    }
  });

  return cells;
}

/**
 * 특정 grid index가 중앙 셀인지 확인
 */
export function isCenterCell(index: number): boolean {
  return index === 4;
}
