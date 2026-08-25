import { z } from "zod";

export const favoriteCarIdParamSchema = z.object({
  carId: z.coerce
    .number()
    .int()
    .positive("Car ID must be a positive integer."),
});