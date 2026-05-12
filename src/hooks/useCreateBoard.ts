import { CACHE_KEYS } from "@/constants/cacheKeys";
import { createBoard } from "@/lib/boards";
import { CreateBoardPayload } from "@/types/boards";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBoardPayload) => createBoard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.boards] });
    },
  });
}
