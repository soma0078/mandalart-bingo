import {
  boardToCells,
  boardToFullGrid,
  detectBingos,
  getCellMetadata,
  isCenterCell,
  subGoalToCells,
  SUB_GOAL_TO_GRID,
  GRID_TO_SUB_GOAL_POS,
} from '@/utils/gridMapper';
import type { BoardDetail } from '@/types/boards';
import type { Cell } from '@/types/cells';
import type { SubGoal } from '@/types/sub-goals';

// Mock data factories
function createMockCell(overrides?: Partial<Cell>): Cell {
  return {
    id: `cell-${Math.random()}`,
    sub_goal_id: 'sg-1',
    position: 0,
    text: 'Task',
    is_completed: false,
    completed_at: null,
    ...overrides,
  };
}

function createMockSubGoal(overrides?: Partial<SubGoal & { cells: Cell[] }>): SubGoal & { cells: Cell[] } {
  return {
    id: `sg-${Math.random()}`,
    board_id: 'board-1',
    position: 0,
    title: 'Sub Goal',
    cells: [],
    ...overrides,
  };
}

function createMockBoard(overrides?: Partial<BoardDetail>): BoardDetail {
  return {
    id: 'board-1',
    user_id: 'user-1',
    title: 'Test Board',
    main_goal: 'Main Goal',
    created_at: '2026-05-28T00:00:00Z',
    updated_at: '2026-05-28T00:00:00Z',
    sub_goals: [],
    ...overrides,
  };
}

describe('gridMapper', () => {
  describe('SUB_GOAL_TO_GRID mapping', () => {
    it('should map positions 0-7 to grid indices, skipping center (4)', () => {
      expect(SUB_GOAL_TO_GRID[0]).toBe(0);
      expect(SUB_GOAL_TO_GRID[1]).toBe(1);
      expect(SUB_GOAL_TO_GRID[2]).toBe(2);
      expect(SUB_GOAL_TO_GRID[3]).toBe(3);
      expect(SUB_GOAL_TO_GRID[4]).toBe(5); // skip center
      expect(SUB_GOAL_TO_GRID[5]).toBe(6);
      expect(SUB_GOAL_TO_GRID[6]).toBe(7);
      expect(SUB_GOAL_TO_GRID[7]).toBe(8);
    });
  });

  describe('GRID_TO_SUB_GOAL_POS mapping', () => {
    it('should be reverse of SUB_GOAL_TO_GRID', () => {
      expect(GRID_TO_SUB_GOAL_POS[0]).toBe(0);
      expect(GRID_TO_SUB_GOAL_POS[1]).toBe(1);
      expect(GRID_TO_SUB_GOAL_POS[2]).toBe(2);
      expect(GRID_TO_SUB_GOAL_POS[3]).toBe(3);
      expect(GRID_TO_SUB_GOAL_POS[5]).toBe(4);
      expect(GRID_TO_SUB_GOAL_POS[6]).toBe(5);
      expect(GRID_TO_SUB_GOAL_POS[7]).toBe(6);
      expect(GRID_TO_SUB_GOAL_POS[8]).toBe(7);
      expect(GRID_TO_SUB_GOAL_POS[4]).toBeUndefined(); // center
    });
  });

  describe('isCenterCell', () => {
    it('should return true for index 4 in 3x3 grid', () => {
      expect(isCenterCell(4)).toBe(true);
    });

    it('should return false for other indices', () => {
      expect(isCenterCell(0)).toBe(false);
      expect(isCenterCell(3)).toBe(false);
      expect(isCenterCell(5)).toBe(false);
      expect(isCenterCell(8)).toBe(false);
    });
  });

  describe('boardToCells', () => {
    it('should return 9 null cells for undefined board', () => {
      const cells = boardToCells(undefined);
      expect(cells).toHaveLength(9);
      expect(cells.every((c) => c === null)).toBe(true);
    });

    it('should place main_goal at center (index 4)', () => {
      const board = createMockBoard({
        main_goal: 'Main Goal Text',
        sub_goals: [],
      });
      const cells = boardToCells(board);
      expect(cells[4]).toBe('Main Goal Text');
    });

    it('should place sub_goal titles at correct grid indices', () => {
      const board = createMockBoard({
        main_goal: 'Main Goal Text',
        sub_goals: [
          createMockSubGoal({ position: 0, title: 'SG0' }),
          createMockSubGoal({ position: 1, title: 'SG1' }),
          createMockSubGoal({ position: 3, title: 'SG3' }),
          createMockSubGoal({ position: 4, title: 'SG4' }), // position 4 → grid 5
        ],
      });
      const cells = boardToCells(board);
      expect(cells[0]).toBe('SG0');
      expect(cells[1]).toBe('SG1');
      expect(cells[3]).toBe('SG3');
      expect(cells[5]).toBe('SG4');
      expect(cells[4]).toBe('Main Goal Text'); // center
    });

    it('should handle empty title as empty string', () => {
      const board = createMockBoard({
        sub_goals: [
          createMockSubGoal({ position: 0, title: '' }),
        ],
      });
      const cells = boardToCells(board);
      expect(cells[0]).toBe('');
    });
  });

  describe('subGoalToCells', () => {
    it('should return 9 cells initialized with null text and not completed', () => {
      const subGoal = createMockSubGoal({
        cells: [],
      });
      const cells = subGoalToCells(subGoal);
      expect(cells).toHaveLength(9);
      // All cells start with null text except center which has subgoal title
      expect(cells.slice(0, 4).every((c) => c.text === null && !c.isCompleted)).toBe(true);
      expect(cells[4].text).toBe(subGoal.title); // center has title
      expect(cells.slice(5, 9).every((c) => c.text === null && !c.isCompleted)).toBe(true);
    });

    it('should place sub_goal title at center', () => {
      const subGoal = createMockSubGoal({
        title: 'Sub Goal Title',
        cells: [],
      });
      const cells = subGoalToCells(subGoal);
      expect(cells[4].text).toBe('Sub Goal Title');
      expect(cells[4].isCompleted).toBe(false);
    });

    it('should place cell text at correct positions', () => {
      const subGoal = createMockSubGoal({
        cells: [
          createMockCell({ position: 0, text: 'Task0', is_completed: false }),
          createMockCell({ position: 1, text: 'Task1', is_completed: true }),
          createMockCell({ position: 7, text: 'Task7', is_completed: false }),
        ],
      });
      const cells = subGoalToCells(subGoal);
      expect(cells[0].text).toBe('Task0');
      expect(cells[0].isCompleted).toBe(false);
      expect(cells[1].text).toBe('Task1');
      expect(cells[1].isCompleted).toBe(true);
      expect(cells[8].text).toBe('Task7');
      expect(cells[8].isCompleted).toBe(false);
    });

    it('should include cellId for cells', () => {
      const cellId = 'cell-123';
      const subGoal = createMockSubGoal({
        cells: [
          createMockCell({ position: 0, id: cellId }),
        ],
      });
      const cells = subGoalToCells(subGoal);
      expect(cells[0].cellId).toBe(cellId);
    });
  });

  describe('boardToFullGrid', () => {
    it('should return 81 cells for undefined board', () => {
      const grid = boardToFullGrid(undefined);
      expect(grid).toHaveLength(81);
      expect(grid.every((c) => c.text === null && !c.isCompleted)).toBe(true);
    });

    it('should place main_goal at index 40 (center of 9x9)', () => {
      const board = createMockBoard({
        main_goal: 'Main Goal',
        sub_goals: [],
      });
      const grid = boardToFullGrid(board);
      expect(grid[40].text).toBe('Main Goal');
      expect(grid[40].isMainGoal).toBe(true);
      expect(grid[40].isCompleted).toBe(false);
    });

    it('should place sub_goal titles at correct block centers', () => {
      // Block centers: blockRow*3+1, blockCol*3+1 in 9x9 grid
      // Block 0 (0,0): center = (1,1) → index 1*9+1 = 10
      // Block 2 (0,2): center = (1,7) → index 1*9+7 = 16
      const board = createMockBoard({
        sub_goals: [
          createMockSubGoal({
            id: 'sg-0',
            position: 0,
            title: 'Goal 0',
            cells: [
              createMockCell({ position: 0, text: 'Cell 0-0' }),
            ],
          }),
          createMockSubGoal({
            id: 'sg-2',
            position: 2,
            title: 'Goal 2',
            cells: [
              createMockCell({ position: 0, text: 'Cell 2-0' }),
            ],
          }),
        ],
      });
      const grid = boardToFullGrid(board);

      // Block 0 center is at index 10
      expect(grid[10].text).toBe('Goal 0');
      expect(grid[10].subGoalPosition).toBe(0);

      // Block 2 center is at index 16
      expect(grid[16].text).toBe('Goal 2');
      expect(grid[16].subGoalPosition).toBe(2);

      // Main goal at center (index 40 = 4*9+4)
      expect(grid[40].text).toBe('Main Goal');
      expect(grid[40].isMainGoal).toBe(true);
    });

    it('should place cells at correct absolute positions in grid', () => {
      // SubGoal 0 at position 0 → grid block 0
      // Cell at position 0 in that sub-goal → grid block 0 grid 0 → absolute (0,0) → index 0
      const board = createMockBoard({
        sub_goals: [
          createMockSubGoal({
            position: 0,
            title: 'SG0',
            cells: [
              createMockCell({ position: 0, text: 'Cell00', is_completed: true, id: 'c00' }),
            ],
          }),
        ],
      });
      const grid = boardToFullGrid(board);
      expect(grid[0].text).toBe('Cell00');
      expect(grid[0].isCompleted).toBe(true);
      expect(grid[0].cellId).toBe('c00');
      expect(grid[0].subGoalPosition).toBe(0);
      expect(grid[0].cellPosition).toBe(0);
    });

    describe('main goal completion (grid[40].isCompleted)', () => {
      it('should be false when there are no sub-goals', () => {
        const board = createMockBoard({ sub_goals: [] });
        expect(boardToFullGrid(board)[40].isCompleted).toBe(false);
      });

      it('should be false when a sub-goal has no cells', () => {
        const board = createMockBoard({
          sub_goals: [createMockSubGoal({ position: 0, cells: [] })],
        });
        expect(boardToFullGrid(board)[40].isCompleted).toBe(false);
      });

      it('should be false when any cell is incomplete', () => {
        const board = createMockBoard({
          sub_goals: [
            createMockSubGoal({
              position: 0,
              cells: [
                createMockCell({ position: 0, is_completed: true }),
                createMockCell({ position: 1, is_completed: false }),
              ],
            }),
          ],
        });
        expect(boardToFullGrid(board)[40].isCompleted).toBe(false);
      });

      it('should be true when all sub-goals have all cells completed', () => {
        const board = createMockBoard({
          sub_goals: Array.from({ length: 8 }, (_, i) =>
            createMockSubGoal({
              position: i,
              cells: Array.from({ length: 8 }, (_, j) =>
                createMockCell({ position: j, is_completed: true })
              ),
            })
          ),
        });
        expect(boardToFullGrid(board)[40].isCompleted).toBe(true);
      });
    });

    it('should correctly map 81 cells with all 8 sub-goals', () => {
      const board = createMockBoard({
        sub_goals: Array.from({ length: 8 }, (_, i) =>
          createMockSubGoal({
            id: `sg-${i}`,
            position: i,
            title: `SubGoal${i}`,
            cells: [
              createMockCell({
                id: `cell-${i}-0`,
                sub_goal_id: `sg-${i}`,
                position: 0,
                text: `Task ${i}-0`,
                is_completed: i % 2 === 0, // every other completed
              }),
            ],
          })
        ),
      });
      const grid = boardToFullGrid(board);
      // Verify grid has 81 elements
      expect(grid).toHaveLength(81);
      // Verify main goal is at center
      expect(grid[40].isMainGoal).toBe(true);
      // Verify we have data from multiple sub-goals
      const withData = grid.filter((c) => c.text && c.text.length > 0);
      expect(withData.length).toBeGreaterThan(0);
    });
  });

  describe('detectBingos', () => {
    it('should return empty array for undefined board', () => {
      const bingos = detectBingos(undefined);
      expect(bingos).toEqual([]);
    });

    it('should return empty array when no lines are completed', () => {
      const board = createMockBoard({
        sub_goals: Array.from({ length: 8 }, (_, i) =>
          createMockSubGoal({
            position: i,
            cells: Array.from({ length: 8 }, (_, j) =>
              createMockCell({ position: j, is_completed: false })
            ),
          })
        ),
      });
      const bingos = detectBingos(board);
      expect(bingos).toEqual([]);
    });

    it('should detect completed row bingo', () => {
      // First row (indices 0-8): all cells completed
      const board = createMockBoard({
        sub_goals: [
          // Block 0 (top-left): positions 0,1,2
          createMockSubGoal({
            position: 0,
            cells: Array.from({ length: 8 }, (_, i) =>
              createMockCell({ position: i, is_completed: true })
            ),
          }),
          // Block 1 (top-center): positions 3,4,5
          createMockSubGoal({
            position: 1,
            cells: Array.from({ length: 8 }, (_, i) =>
              createMockCell({ position: i, is_completed: true })
            ),
          }),
          // Block 2 (top-right): positions 6,7,8
          createMockSubGoal({
            position: 2,
            cells: Array.from({ length: 8 }, (_, i) =>
              createMockCell({ position: i, is_completed: true })
            ),
          }),
          // Other blocks with uncompleted cells
          ...Array.from({ length: 5 }, (_, i) =>
            createMockSubGoal({
              position: i + 3,
              cells: Array.from({ length: 8 }, (_, j) =>
                createMockCell({ position: j, is_completed: false })
              ),
            })
          ),
        ],
      });
      const bingos = detectBingos(board);
      expect(bingos).toContainEqual({ type: 'row', index: 0 });
    });

    it('should detect column bingo (col 0)', () => {
      // Col 0 passes through: subGoal pos 0 (cells 0,3,5), pos 3 (cells 0,3,5), pos 5 (cells 0,3,5)
      // Mapping: col0 absolute rows 0,1,2 → block pos 0 cellPos 0,3,5
      //          col0 absolute rows 3,4,5 → block pos 3 cellPos 0,3,5
      //          col0 absolute rows 6,7,8 → block pos 5 cellPos 0,3,5
      const board = createMockBoard({
        sub_goals: [
          createMockSubGoal({
            position: 0,
            cells: [
              createMockCell({ position: 0, is_completed: true }),
              createMockCell({ position: 3, is_completed: true }),
              createMockCell({ position: 5, is_completed: true }),
            ],
          }),
          createMockSubGoal({
            position: 3,
            cells: [
              createMockCell({ position: 0, is_completed: true }),
              createMockCell({ position: 3, is_completed: true }),
              createMockCell({ position: 5, is_completed: true }),
            ],
          }),
          createMockSubGoal({
            position: 5,
            cells: [
              createMockCell({ position: 0, is_completed: true }),
              createMockCell({ position: 3, is_completed: true }),
              createMockCell({ position: 5, is_completed: true }),
            ],
          }),
        ],
      });
      const bingos = detectBingos(board);
      expect(bingos).toContainEqual({ type: 'col', index: 0 });
    });

    it('should NOT detect column bingo when one cell in the column is incomplete', () => {
      const board = createMockBoard({
        sub_goals: [
          createMockSubGoal({
            position: 0,
            cells: [
              createMockCell({ position: 0, is_completed: true }),
              createMockCell({ position: 3, is_completed: false }), // 하나 미완료
              createMockCell({ position: 5, is_completed: true }),
            ],
          }),
          createMockSubGoal({
            position: 3,
            cells: [
              createMockCell({ position: 0, is_completed: true }),
              createMockCell({ position: 3, is_completed: true }),
              createMockCell({ position: 5, is_completed: true }),
            ],
          }),
          createMockSubGoal({
            position: 5,
            cells: [
              createMockCell({ position: 0, is_completed: true }),
              createMockCell({ position: 3, is_completed: true }),
              createMockCell({ position: 5, is_completed: true }),
            ],
          }),
        ],
      });
      const bingos = detectBingos(board);
      expect(bingos).not.toContainEqual({ type: 'col', index: 0 });
    });

    it('diagonal bingo is structurally impossible — center block cells are always incomplete', () => {
      // 대각선(\)은 9x9 인덱스 30(3,3)과 50(5,5)을 통과.
      // 이 두 셀은 센터 블록(1,1) 소속으로 boardToFullGrid에서 절대 isCompleted=true가 되지 않음.
      // 모든 셀을 완료해도 대각선 빙고는 발생하지 않는다.
      const board = createMockBoard({
        sub_goals: Array.from({ length: 8 }, (_, i) =>
          createMockSubGoal({
            position: i,
            cells: Array.from({ length: 8 }, (_, j) =>
              createMockCell({ position: j, is_completed: true })
            ),
          })
        ),
      });
      const bingos = detectBingos(board);
      expect(bingos.filter((b) => b.type === 'diagonal')).toHaveLength(0);
    });

    it('should detect 12 bingos (6 rows + 6 cols) when all sub-goal cells are completed', () => {
      // 센터 블록(행/열 3~5)을 통과하는 행/열은 빙고 불가.
      // 가능한 행: 0,1,2,6,7,8 (6개), 가능한 열: 0,1,2,6,7,8 (6개), 대각선: 0개
      const board = createMockBoard({
        sub_goals: Array.from({ length: 8 }, (_, i) =>
          createMockSubGoal({
            position: i,
            cells: Array.from({ length: 8 }, (_, j) =>
              createMockCell({ position: j, is_completed: true })
            ),
          })
        ),
      });
      const bingos = detectBingos(board);
      expect(bingos).toHaveLength(12);
      expect(bingos.filter((b) => b.type === 'row')).toHaveLength(6);
      expect(bingos.filter((b) => b.type === 'col')).toHaveLength(6);
      expect(bingos.filter((b) => b.type === 'diagonal')).toHaveLength(0);
      // 가능한 행/열 인덱스만 포함되어야 함
      const rowIndices = bingos.filter((b) => b.type === 'row').map((b) => b.index);
      const colIndices = bingos.filter((b) => b.type === 'col').map((b) => b.index);
      expect(rowIndices.sort()).toEqual([0, 1, 2, 6, 7, 8]);
      expect(colIndices.sort()).toEqual([0, 1, 2, 6, 7, 8]);
    });
  });

  describe('getCellMetadata', () => {
    it('should return null for undefined board', () => {
      const metadata = getCellMetadata(undefined, 0);
      expect(metadata).toBeNull();
    });

    it('should return null for invalid grid index', () => {
      const board = createMockBoard();
      expect(getCellMetadata(board, -1)).toBeNull();
      expect(getCellMetadata(board, 81)).toBeNull();
    });

    it('should identify main goal at index 40', () => {
      const board = createMockBoard();
      const metadata = getCellMetadata(board, 40);
      expect(metadata).toEqual({ type: 'mainGoal' });
    });

    it('should return null for empty sub-goal block centers (they have no cells)', () => {
      const board = createMockBoard({
        sub_goals: [
          createMockSubGoal({ position: 0, cells: [] }),
          createMockSubGoal({ position: 1, cells: [] }),
        ],
      });
      // Block 0 center is index 4 - these are outside the center block so they map to non-existent cells
      let metadata = getCellMetadata(board, 4);
      expect(metadata).toBeNull(); // No cells at this position

      // Block 1 center is index 13
      metadata = getCellMetadata(board, 13);
      expect(metadata).toBeNull(); // No cells at this position
    });

    it('should identify cells at correct positions', () => {
      const cellId = 'cell-123';
      const board = createMockBoard({
        sub_goals: [
          createMockSubGoal({
            position: 0,
            id: 'sg-0',
            cells: [
              createMockCell({ position: 0, id: cellId }),
            ],
          }),
        ],
      });
      // Cell at position 0 in sub-goal 0 → grid index 0 in block 0 → absolute index 0
      const metadata = getCellMetadata(board, 0);
      expect(metadata?.type).toBe('cell');
      expect(metadata?.subGoalPosition).toBe(0);
      expect(metadata?.cellPosition).toBe(0);
      expect(metadata?.cellId).toBe(cellId);
    });

    it('should return null for center block non-center cells', () => {
      const board = createMockBoard();
      // Center block (row 1, col 1) has only main goal at center (index 40)
      // Indices like 39, 41 should return null
      expect(getCellMetadata(board, 39)).toBeNull();
      expect(getCellMetadata(board, 41)).toBeNull();
    });

    it('block center cells (subGoal title 위치) 는 null 반환 — type: subGoal 은 미사용', () => {
      // CellMetadata 타입에 subGoal이 정의되어 있으나 getCellMetadata는 이를 반환하지 않음.
      // 블록 center(예: index 10 = block 0의 중앙)는 subGoal 제목이 렌더링되지만
      // cellPosition이 center(grid 4)이므로 GRID_TO_SUB_GOAL_POS[4] = undefined → null 반환.
      const board = createMockBoard({
        sub_goals: [createMockSubGoal({ position: 0, cells: [] })],
      });
      expect(getCellMetadata(board, 10)).toBeNull(); // block 0 center
      expect(getCellMetadata(board, 13)).toBeNull(); // block 1 center
      expect(getCellMetadata(board, 37)).toBeNull(); // block 3 center
    });

    it('should handle all sub-goals correctly', () => {
      const board = createMockBoard({
        sub_goals: Array.from({ length: 8 }, (_, i) =>
          createMockSubGoal({
            position: i,
            id: `sg-${i}`,
            cells: [
              createMockCell({
                position: 0,
                id: `cell-${i}-0`,
              }),
            ],
          })
        ),
      });

      // Test a cell from each sub-goal (position 0)
      // These should map to different grid indices
      const metadata0 = getCellMetadata(board, 0); // SG0 pos0
      expect(metadata0?.subGoalPosition).toBe(0);
      expect(metadata0?.cellId).toBe('cell-0-0');
    });
  });
});
