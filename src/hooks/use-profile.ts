import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/types";

export interface ProfileData {
  user: {
    id: string;
    email: string;
    timezone: string;
    createdAt: string;
  };
  character: {
    id: string;
    level: number;
    xp: number;
    totalXp: number;
    gold: number;
    title: string;
    equippedTheme: string | null;
  };
  attributes: Array<{
    id: string;
    name: "WISDOM" | "VITALITY" | "CRAFT";
    level: number;
    xp: number;
  }>;
  stats: {
    totalCompletions: number;
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
  };
  inventory: Array<{
    id: string;
    itemId: string;
    name: string;
    category: string;
    assetUrl: string | null;
    equipped: boolean;
    acquiredAt: string;
  }>;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<ProfileData> => {
      const res = await fetch("/api/profile");
      const json: ApiResponse<ProfileData> = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error?.message || "Failed to load profile");
      }
      return json.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { timezone?: string }) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || "Failed to update profile");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
