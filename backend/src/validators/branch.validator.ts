import { z } from "zod";

export const branchIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("Branch ID must be a positive integer."),
});