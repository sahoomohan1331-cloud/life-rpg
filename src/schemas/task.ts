import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Quest title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional().nullable(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
    message: "Select a difficulty",
  }),
  attributeName: z.enum(["WISDOM", "VITALITY", "CRAFT"], {
    message: "Select an attribute",
  }),
  type: z.enum(["QUEST", "DAILY", "HABIT"], {
    message: "Select a quest type",
  }),
  dueAt: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
