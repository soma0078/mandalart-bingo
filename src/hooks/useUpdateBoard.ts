import { CACHE_KEYS } from "@/constants/cacheKeys";
import { updateBoard } from "@/lib/boards";
import type { UpdateBoardPayload } from "@/types/boards";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBoardPayload }) =>
      updateBoard(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [CACHE_KEYS.boards, id] });
      qc.invalidateQueries({ queryKey: [CACHE_KEYS.boards] });
    },
  });
}
