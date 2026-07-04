import { z } from "zod";

export const createOrderSchema = z.object({
  session_id: z.string().uuid(),
  items: z
    .array(
      z.object({
        item_id: z.string().uuid(),
        quantity: z.number().int().positive().max(99),
        notes: z.string().max(500).optional(),
      })
    )
    .min(1)
    .max(50),
  notes: z.string().max(1000).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
