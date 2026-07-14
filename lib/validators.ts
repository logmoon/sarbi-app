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

// --- Menu CRUD ---

const localeJsonSchema = z.object({
  en: z.string().min(1).max(200),
  fr: z.string().min(1).max(200),
  ar: z.string().min(1).max(200),
});

export const createCategorySchema = z.object({
  name: localeJsonSchema,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: localeJsonSchema.optional(),
  sort_order: z.number().int().min(0).optional(),
  is_available: z.boolean().optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const createItemSchema = z.object({
  category_id: z.string().uuid(),
  name: localeJsonSchema,
  description: z
    .object({
      en: z.string().max(1000).optional().default(""),
      fr: z.string().max(1000).optional().default(""),
      ar: z.string().max(1000).optional().default(""),
    })
    .optional()
    .default({ en: "", fr: "", ar: "" }),
  price: z.number().positive().max(99999.999),
  image_url: z.string().max(500).optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const updateItemSchema = z.object({
  category_id: z.string().uuid().optional(),
  name: localeJsonSchema.optional(),
  description: z
    .object({
      en: z.string().max(1000).optional(),
      fr: z.string().max(1000).optional(),
      ar: z.string().max(1000).optional(),
    })
    .optional(),
  price: z.number().positive().max(99999.999).optional(),
  image_url: z.string().max(500).optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
  is_available: z.boolean().optional(),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const reorderCategoriesSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), sort_order: z.number().int().min(0) })),
});

export const reorderItemsSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), sort_order: z.number().int().min(0) })),
});

// --- Table CRUD ---

export const createTableSchema = z.object({
  label: z.string().min(1).max(100),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;

export const updateTableSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateTableInput = z.infer<typeof updateTableSchema>;

// --- Customer Menu ---

export const createSessionSchema = z.object({
  public_code: z.string().length(8),
  customer_name: z.string().min(1).max(100),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const createTableEventSchema = z.object({
  session_id: z.string().uuid(),
  type: z.enum(["waiter_called", "bill_requested", "check_needed"]),
});

export type CreateTableEventInput = z.infer<typeof createTableEventSchema>;

export const cancelOrderSchema = z.object({
  session_id: z.string().uuid(),
  reason: z.string().max(200).optional(),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
