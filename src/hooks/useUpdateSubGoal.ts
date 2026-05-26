import { CACHE_KEYS } from "@/constants/cacheKeys";
import { updateSubGoal } from "@/lib/sub-goals";
import type { UpdateSubGoalPayload } from "@/types/sub-goals";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateSubGoal(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubGoalPayload }) =>
      updateSubGoal(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CACHE_KEYS.boards, boardId] });
    },
  });
}
