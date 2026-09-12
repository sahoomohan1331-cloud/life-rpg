import { z } from "zod";

export const purchaseSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;
