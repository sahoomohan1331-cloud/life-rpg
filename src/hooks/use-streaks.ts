import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, StreakData } from "@/types";

export function useStreaks() {
  return useQuery({
    queryKey: ["streaks"],
    queryFn: async (): Promise<StreakData> => {
      const res = await fetch("/api/streaks");
      const json: ApiResponse<StreakData> = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to fetch streaks");
      return json.data!;
    },
  });
}
