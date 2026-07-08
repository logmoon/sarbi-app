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

export const createInviteSchema = z.object({
  tenant_id: z.string().uuid(),
  location_id: z.string().uuid().nullable().optional(),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  role: z.enum(["owner", "location_manager", "kitchen", "floor"]),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;

export const setupAccountSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1).max(200),
  password: z.string().min(6).max(128),
});

export type SetupAccountInput = z.infer<typeof setupAccountSchema>;
