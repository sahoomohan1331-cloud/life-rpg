import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, MarketItem } from "@/types";

export function useMarketItems(category?: string) {
  return useQuery({
    queryKey: ["market", "items", category],
    queryFn: async (): Promise<MarketItem[]> => {
      const params = category ? `?category=${category}` : "";
      const res = await fetch(`/api/market/items${params}`);
      const json: ApiResponse<MarketItem[]> = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to fetch items");
      return json.data!;
    },
  });
}

export function usePurchaseItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch("/api/market/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const json: ApiResponse = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to purchase item");
      return json.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["market"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
    },
  });
}

export function useEquipItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch("/api/market/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const json: ApiResponse = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to equip item");
      return json.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["market"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
