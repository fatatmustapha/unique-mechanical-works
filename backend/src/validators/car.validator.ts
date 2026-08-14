import { z } from "zod";

const nullableString = (max: number) =>
  z.string().trim().max(max).nullable().optional();

const currentYear = new Date().getFullYear();

export const carSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Car slug is required.")
    .max(180, "Car slug must not exceed 180 characters."),
});

export const carIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Car ID must be a positive integer."),
});

export const publicCarsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(12),

    search: z.string().trim().max(100).optional(),

    branch_id: z.coerce.number().int().positive().optional(),

    make: z.string().trim().max(50).optional(),

    min_price: z.coerce.number().nonnegative().optional(),

    max_price: z.coerce.number().nonnegative().optional(),

    min_year: z.coerce
      .number()
      .int()
      .min(1900)
      .max(currentYear + 1)
      .optional(),

    max_year: z.coerce
      .number()
      .int()
      .min(1900)
      .max(currentYear + 1)
      .optional(),

    condition_type: z
      .enum(["New", "Nigerian Used", "Foreign Used"])
      .optional(),

    transmission: z
      .enum(["Automatic", "Manual"])
      .optional(),

    fuel_type: z
      .enum(["Petrol", "Diesel", "Hybrid", "Electric"])
      .optional(),

    body_type: z.string().trim().max(50).optional(),

    featured: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    sort: z
      .enum([
        "latest",
        "price_asc",
        "price_desc",
        "year_asc",
        "year_desc",
      ])
      .default("latest"),
  })
  .refine(
    (data) =>
      data.min_price === undefined ||
      data.max_price === undefined ||
      data.min_price <= data.max_price,
    {
      message: "Minimum price must not exceed maximum price.",
      path: ["max_price"],
    },
  )
  .refine(
    (data) =>
      data.min_year === undefined ||
      data.max_year === undefined ||
      data.min_year <= data.max_year,
    {
      message: "Minimum year must not exceed maximum year.",
      path: ["max_year"],
    },
  );

const carFieldsSchema = z.object({
  reference_number: z
    .string()
    .trim()
    .min(1, "Reference number is required.")
    .max(40),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(180)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must use lowercase letters, numbers, and hyphens only.",
    ),

  vin: nullableString(50),

  branch_id: z
    .number()
    .int()
    .positive("Branch ID must be a positive integer."),

  make: z.string().trim().min(1).max(50),

  model: z.string().trim().min(1).max(50),

  year: z
    .number()
    .int()
    .min(1900)
    .max(currentYear + 1)
    .nullable()
    .optional(),

  price: z.number().positive("Price must be greater than zero."),

  mileage: z.number().int().nonnegative().nullable().optional(),

  condition_type: z
    .enum(["New", "Nigerian Used", "Foreign Used"])
    .nullable()
    .optional(),

  transmission: z
    .enum(["Automatic", "Manual"])
    .nullable()
    .optional(),

  fuel_type: z
    .enum(["Petrol", "Diesel", "Hybrid", "Electric"])
    .nullable()
    .optional(),

  description: z.string().trim().nullable().optional(),

  color_exterior: nullableString(50),
  color_interior: nullableString(50),
  engine_size: nullableString(30),

  horsepower: z.number().int().positive().nullable().optional(),

  body_type: nullableString(50),

  num_doors: z.number().int().positive().max(20).nullable().optional(),

  num_seats: z.number().int().positive().max(100).nullable().optional(),

  drivetrain: z
    .enum(["FWD", "RWD", "AWD", "4WD"])
    .nullable()
    .optional(),

  registration_status: nullableString(100),

  num_previous_owners: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional(),

  import_status: nullableString(100),

  negotiable: z.boolean().optional().default(true),

  features: z.array(z.string().trim().min(1)).nullable().optional(),

  warranty_status: nullableString(150),
});

export const createCarSchema = carFieldsSchema;

export const updateCarSchema = carFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one car field must be supplied.",
  });

export type PublicCarsQuery = z.infer<
  typeof publicCarsQuerySchema
>;

export type CreateCarInput = z.infer<
  typeof createCarSchema
>;

export type UpdateCarInput = z.infer<
  typeof updateCarSchema
>;