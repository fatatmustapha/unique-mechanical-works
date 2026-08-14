import { z } from "zod";

export const carSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Car slug is required."),
});

export const publicCarsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .default(12),

  search: z.string().trim().optional(),

  branch_id: z.coerce.number().int().positive().optional(),

  min_price: z.coerce.number().nonnegative().optional(),

  max_price: z.coerce.number().nonnegative().optional(),

  year: z.coerce.number().int().optional(),

  transmission: z.string().trim().optional(),

  fuel_type: z.string().trim().optional(),

  body_type: z.string().trim().optional(),

  sort: z
    .enum([
      "latest",
      "price_asc",
      "price_desc",
      "year_desc",
      "year_asc",
    ])
    .optional()
    .default("latest"),
});

export type PublicCarsQuery = z.infer<
  typeof publicCarsQuerySchema
>;