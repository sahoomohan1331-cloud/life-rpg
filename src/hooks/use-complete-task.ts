import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, CompleteTaskResponse, Task } from "@/types";

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
      });
      const json: ApiResponse<CompleteTaskResponse> = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to complete quest");
      return json.data!;
    },

    // Optimistic update
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueriesData<Task[]>(
        { queryKey: ["tasks"] },
        (old) =>
          old?.map((t) =>
            t.id === taskId ? { ...t, completedAt: new Date() } : t
          )
      );

      return { previousTasks };
    },

    onError: (_err, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueriesData<Task[]>(
          { queryKey: ["tasks"] },
          context.previousTasks
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      queryClient.invalidateQueries({ queryKey: ["streaks"] });
    },
  });
}
