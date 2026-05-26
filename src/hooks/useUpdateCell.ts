import { CACHE_KEYS } from "@/constants/cacheKeys";
import { updateCell } from "@/lib/cells";
import type { UpdateCellPayload } from "@/types/cells";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateCell(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCellPayload }) =>
      updateCell(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CACHE_KEYS.boards, boardId] });
    },
  });
}
