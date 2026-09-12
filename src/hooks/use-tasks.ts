import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskFilters, ApiResponse, CreateTaskInput } from "@/types";

const TASKS_KEY = ["tasks"];

async function fetchTasks(filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.attributeName) params.set("attributeName", filters.attributeName);
  if (filters?.completed !== undefined) params.set("completed", String(filters.completed));

  const res = await fetch(`/api/tasks?${params.toString()}`);
  const json: ApiResponse<Task[]> = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Failed to fetch quests");
  return json.data!;
}

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: [...TASKS_KEY, filters],
    queryFn: () => fetchTasks(filters),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: ApiResponse<Task> = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to create quest");
      return json.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateTaskInput> & { id: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: ApiResponse<Task> = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to update quest");
      return json.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      const json: ApiResponse = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to delete quest");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}
