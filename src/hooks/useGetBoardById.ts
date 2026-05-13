import { CACHE_KEYS } from "@/constants/cacheKeys";
import { getBoardById } from "@/lib/boards";
import { useQuery } from "@tanstack/react-query";

export function useGetBoardById(id: string) {
  return useQuery({
    queryKey: [CACHE_KEYS.boards, id],
    queryFn: () => getBoardById(id),
    enabled: !!id,
  });
}
