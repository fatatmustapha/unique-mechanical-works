import { z } from "zod";

export const serviceIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Service ID must be a positive integer."),
});