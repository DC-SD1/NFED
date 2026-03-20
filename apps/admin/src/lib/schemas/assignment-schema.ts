import { z } from "zod";

export const AssignFarmlandSchema = z.object({
  farmlandId: z
    .string({ required_error: "Farmland is required." })
    .refine((data) => data.trim() !== "", {
      message: "Farmland field cannot be empty",
    }),
});

export type AssignFarmlandData = z.infer<typeof AssignFarmlandSchema>;
