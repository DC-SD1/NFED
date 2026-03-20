import { z } from "zod";

export const SuspendFormalGrowerSchema = z.object({
  reason: z
    .string({ required_error: "Write a reason for the suspension" })
    .refine((data) => data.trim() !== "", {
      message: "Reason field cannot be empty",
    }),
});

export type SuspendFormalGrowerData = z.infer<typeof SuspendFormalGrowerSchema>;
