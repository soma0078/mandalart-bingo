import { CACHE_KEYS } from "@/constants/cacheKeys";
import { getBoards } from "@/lib/boards";
import { useQuery } from "@tanstack/react-query";

export function useGertBoards() {
  return useQuery({
    queryKey: [CACHE_KEYS.boards],
    queryFn: getBoards,
  });
}
