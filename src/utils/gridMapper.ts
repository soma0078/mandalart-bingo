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

// 9×9 그리드용 셀 데이터 인터페이스 (위치 정보 추가)
export interface FullGridCell extends SubGoalCellData {
  subGoalPosition?: number;
  cellPosition?: number;
  isMainGoal?: boolean;
}

// 보드 데이터를 9×9 전체 그리드 배열로 변환
export function boardToFullGrid(
  board: BoardDetail | undefined
): FullGridCell[] {
  const fullGrid: FullGridCell[] = Array(81)
    .fill(null)
    .map(() => ({ text: null, isCompleted: false }));

  if (!board) return fullGrid;

  // 중앙 셀(40 = 4*9 + 4)에 핵심 목표 배치
  fullGrid[40] = {
    text: board.main_goal,
    isCompleted: false,
    isMainGoal: true,
  };

  board.sub_goals.forEach((subGoal) => {
    // 3×3 그리드에서의 block index
    const blockGridIndex = SUB_GOAL_TO_GRID[subGoal.position];
    if (blockGridIndex === undefined) return;

    // block의 행/열 좌표
    const blockRow = Math.floor(blockGridIndex / 3);
    const blockCol = blockGridIndex % 3;

    // 각 cell 처리
    subGoal.cells.forEach((cell) => {
      // cell의 3×3 그리드 내 위치
      const cellGridIndex = SUB_GOAL_TO_GRID[cell.position];
      if (cellGridIndex === undefined) return;

      // cell의 행/열 좌표 (3×3 그리드 내)
      const cellRow = Math.floor(cellGridIndex / 3);
      const cellCol = cellGridIndex % 3;

      // 9×9 전체 그리드에서의 절대 위치
      const fullRow = blockRow * 3 + cellRow;
      const fullCol = blockCol * 3 + cellCol;
      const fullIndex = fullRow * 9 + fullCol;

      fullGrid[fullIndex] = {
        text: cell.text || "",
        isCompleted: cell.is_completed,
        cellId: cell.id,
        subGoalPosition: subGoal.position,
        cellPosition: cell.position,
      };
    });
  });

  return fullGrid;
}

// 9×9 그리드 인덱스에서 SubGoal + Cell 메타데이터 추출
export interface CellMetadata {
  type: "mainGoal" | "subGoal" | "cell";
  subGoalPosition?: number;
  cellPosition?: number;
  subGoalId?: string;
  cellId?: string;
}

export function getCellMetadata(
  board: BoardDetail | undefined,
  gridIndex9x9: number
): CellMetadata | null {
  if (!board || gridIndex9x9 < 0 || gridIndex9x9 >= 81) return null;

  // 중앙 셀(40) → 핵심 목표
  if (gridIndex9x9 === 40) {
    return { type: "mainGoal" };
  }

  // 9×9 좌표로 변환
  const fullRow = Math.floor(gridIndex9x9 / 9);
  const fullCol = gridIndex9x9 % 9;

  // 3×3 블록 좌표
  const blockRow = Math.floor(fullRow / 3);
  const blockCol = Math.floor(fullCol / 3);
  const blockGridIndex = blockRow * 3 + blockCol;

  // block이 중앙 블록인지 확인 (1,1)
  if (blockRow === 1 && blockCol === 1) {
    // 중앙 블록 내 위치
    const cellRow = fullRow % 3;
    const cellCol = fullCol % 3;
    const cellGridIndex = cellRow * 3 + cellCol;

    // 정확한 중앙(4,4)인 경우 이미 위에서 처리됨, 나머지는 없음
    // (실제로 중앙 블록은 main_goal만 있고 나머지 8칸은 비어있음)
    return null;
  }

  // 일반 블록 → SubGoal 찾기
  const subGoalPosition = GRID_TO_SUB_GOAL_POS[blockGridIndex];
  if (subGoalPosition === undefined) return null;

  const subGoal = board.sub_goals.find(
    (sg) => sg.position === subGoalPosition
  );
  if (!subGoal) return null;

  // 블록 내 cell 위치
  const cellRow = fullRow % 3;
  const cellCol = fullCol % 3;
  const cellGridIndex = cellRow * 3 + cellCol;

  // cell의 position 찾기 (center는 없음, 0-7)
  const cellPosition = GRID_TO_SUB_GOAL_POS[cellGridIndex];
  if (cellPosition === undefined) return null;

  const cell = subGoal.cells.find((c) => c.position === cellPosition);
  if (!cell) return null;

  return {
    type: "cell",
    subGoalPosition,
    cellPosition,
    subGoalId: subGoal.id,
    cellId: cell.id,
  };
}

export interface BingoLine {
  type: "row" | "col" | "diagonal";
  index: number;
}

export function detectBingos(board: BoardDetail | undefined): BingoLine[] {
  if (!board) return [];

  const fullGrid = boardToFullGrid(board);
  const bingos: BingoLine[] = [];

  // 가로 라인 확인 (9개)
  for (let row = 0; row < 9; row++) {
    const startIdx = row * 9;
    const rowCells = fullGrid.slice(startIdx, startIdx + 9);
    if (rowCells.every((cell) => cell.isCompleted)) {
      bingos.push({ type: "row", index: row });
    }
  }

  // 세로 라인 확인 (9개)
  for (let col = 0; col < 9; col++) {
    let allCompleted = true;
    for (let row = 0; row < 9; row++) {
      if (!fullGrid[row * 9 + col].isCompleted) {
        allCompleted = false;
        break;
      }
    }
    if (allCompleted) {
      bingos.push({ type: "col", index: col });
    }
  }

  // 대각선 1 (\) 확인
  let diag1Completed = true;
  for (let i = 0; i < 9; i++) {
    if (!fullGrid[i * 9 + i].isCompleted) {
      diag1Completed = false;
      break;
    }
  }
  if (diag1Completed) {
    bingos.push({ type: "diagonal", index: 0 });
  }

  // 대각선 2 (/) 확인
  let diag2Completed = true;
  for (let i = 0; i < 9; i++) {
    if (!fullGrid[i * 9 + (8 - i)].isCompleted) {
      diag2Completed = false;
      break;
    }
  }
  if (diag2Completed) {
    bingos.push({ type: "diagonal", index: 1 });
  }

  return bingos;
}
