import { CACHE_KEYS } from "@/constants/cacheKeys";
import type { TemplateSubGoal } from "@/constants/templates";
import { createBoard } from "@/lib/boards";
import { CreateBoardPayload } from "@/types/boards";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateBoardInput {
  payload: CreateBoardPayload;
  templateSubGoals?: TemplateSubGoal[];
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, templateSubGoals }: CreateBoardInput) =>
      createBoard(payload, templateSubGoals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.boards] });
    },
  });
}
