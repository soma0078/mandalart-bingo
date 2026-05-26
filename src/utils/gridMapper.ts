import { BoardDetail } from "@/types/boards";
import type { Cell } from "@/types/cells";
import type { SubGoal } from "@/types/sub-goals";

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

export function isCenterCell(index: number): boolean {
  return index === 4;
}

// grid index → sub_goal position (SUB_GOAL_TO_GRID 역방향)
export const GRID_TO_SUB_GOAL_POS: Record<number, number> = Object.fromEntries(
  Object.entries(SUB_GOAL_TO_GRID).map(([pos, grid]) => [grid, Number(pos)])
);

export interface SubGoalCellData {
  text: string | null;
  isCompleted: boolean;
  cellId?: string;
}

// 서브 목표 + 셀 → 9개 그리드 배열 (center = 서브 목표 제목)
export function subGoalToCells(
  subGoal: SubGoal & { cells: Cell[] }
): SubGoalCellData[] {
  const grid: SubGoalCellData[] = Array(9)
    .fill(null)
    .map(() => ({ text: null, isCompleted: false }));

  grid[4] = { text: subGoal.title || "", isCompleted: false };

  subGoal.cells.forEach((cell) => {
    const gridIndex = SUB_GOAL_TO_GRID[cell.position];
    if (gridIndex !== undefined) {
      grid[gridIndex] = {
        text: cell.text || "",
        isCompleted: cell.is_completed,
        cellId: cell.id,
      };
    }
  });

  return grid;
}
