import { useRouter } from "expo-router";
import { GRID_TO_SUB_GOAL_POS, getCellMetadata, isCenterCell } from "./gridMapper";
import type { BoardDetail } from "@/types/boards";

export function useCellNavigation(boardId?: string) {
  const router = useRouter();

  const handleCellPress = (
    gridIndex: number,
    viewMode: "3x3" | "9x9",
    board: BoardDetail | undefined
  ) => {
    if (!board || !boardId) return;

    if (viewMode === "3x3") {
      handleCellPress3x3(gridIndex, board, boardId, router);
    } else {
      handleCellPress9x9(gridIndex, board, boardId, router);
    }
  };

  return { handleCellPress };
}

function handleCellPress3x3(
  gridIndex: number,
  board: BoardDetail,
  boardId: string,
  router: ReturnType<typeof useRouter>
) {
  if (isCenterCell(gridIndex)) {
    router.push(`/board/${boardId}`);
    return;
  }

  const subGoalPos = GRID_TO_SUB_GOAL_POS[gridIndex];
  const subGoal = board.sub_goals.find((sg) => sg.position === subGoalPos);
  if (!subGoal) return;

  router.push(`/board/sub/${subGoal.id}?boardId=${boardId}`);
}

function handleCellPress9x9(
  gridIndex: number,
  board: BoardDetail,
  boardId: string,
  router: ReturnType<typeof useRouter>
) {
  if (gridIndex === 40) {
    router.push(`/board/${boardId}`);
    return;
  }

  const metadata = getCellMetadata(board, gridIndex);
  if (!metadata) return;

  if (metadata.type === "mainGoal") {
    router.push(`/board/${boardId}`);
  } else if (metadata.subGoalId && metadata.type === "cell") {
    router.push(`/board/sub/${metadata.subGoalId}?boardId=${boardId}`);
  }
}
