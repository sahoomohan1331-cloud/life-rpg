import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, CharacterWithProgress } from "@/types";

export function useCharacter() {
  return useQuery({
    queryKey: ["character"],
    queryFn: async (): Promise<CharacterWithProgress> => {
      const res = await fetch("/api/character");
      const json: ApiResponse<CharacterWithProgress> = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to fetch character");
      return json.data!;
    },
  });
}
