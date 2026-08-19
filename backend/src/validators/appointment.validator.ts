import { z } from "zod";

const currentYear = new Date().getFullYear();

export const appointmentIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Appointment ID must be a positive integer."),
});

export const createAppointmentSchema = z.object({
  service_id: z
    .number()
    .int()
    .positive("Service ID must be a positive integer."),

  branch_id: z
    .number()
    .int()
    .positive("Branch ID must be a positive integer."),

  scheduled_at: z
    .string()
    .datetime({
      message:
        "scheduled_at must be a valid ISO date and time.",
    })
    .refine(
      (value) => new Date(value).getTime() > Date.now(),
      {
        message:
          "The appointment must be scheduled in the future.",
      },
    ),

  vehicle_make: z
    .string()
    .trim()
    .max(
      50,
      "Vehicle make must not exceed 50 characters.",
    )
    .nullable()
    .optional(),

  vehicle_model: z
    .string()
    .trim()
    .max(
      50,
      "Vehicle model must not exceed 50 characters.",
    )
    .nullable()
    .optional(),

  vehicle_year: z
    .number()
    .int()
    .min(1900)
    .max(currentYear + 1)
    .nullable()
    .optional(),

  vehicle_plate_number: z
    .string()
    .trim()
    .max(
      30,
      "Vehicle plate number must not exceed 30 characters.",
    )
    .nullable()
    .optional(),

  customer_notes: z
    .string()
    .trim()
    .nullable()
    .optional(),
});

export type CreateAppointmentInput = z.infer<
  typeof createAppointmentSchema
>;

export const adminAppointmentsQuerySchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "completed",
      "cancelled",
    ])
    .optional(),

  branch_id: z.coerce
    .number()
    .int()
    .positive("Branch ID must be a positive integer.")
    .optional(),

  service_id: z.coerce
    .number()
    .int()
    .positive("Service ID must be a positive integer.")
    .optional(),

  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export const updateAppointmentAdminSchema = z
  .object({
    service_id: z
      .number()
      .int()
      .positive()
      .optional(),

    branch_id: z
      .number()
      .int()
      .positive()
      .optional(),

    scheduled_at: z
      .string()
      .datetime({
        message:
          "scheduled_at must be a valid ISO date and time.",
      })
      .optional(),

    vehicle_make: z
      .string()
      .trim()
      .max(50)
      .nullable()
      .optional(),

    vehicle_model: z
      .string()
      .trim()
      .max(50)
      .nullable()
      .optional(),

    vehicle_year: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .nullable()
      .optional(),

    vehicle_plate_number: z
      .string()
      .trim()
      .max(30)
      .nullable()
      .optional(),

    customer_notes: z
      .string()
      .trim()
      .nullable()
      .optional(),

    admin_notes: z
      .string()
      .trim()
      .nullable()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message:
        "At least one appointment field must be supplied.",
    },
  );

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ]),

  admin_notes: z
    .string()
    .trim()
    .nullable()
    .optional(),
});

export type AdminAppointmentsQuery = z.infer<
  typeof adminAppointmentsQuerySchema
>;

export type UpdateAppointmentAdminInput = z.infer<
  typeof updateAppointmentAdminSchema
>;

export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;