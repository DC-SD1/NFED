import { parsePhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const EditProfileSchema = z.object({
  phone: z
    .string({ required_error: "Enter a phone number." })
    .refine((data) => data.trim() !== "", {
      message: "Phone number field cannot be empty",
    })
    .refine(
      (data) => {
        try {
          const phoneNumber = parsePhoneNumber(data);
          return (phoneNumber?.nationalNumber?.length ?? 0) >= 9;
        } catch {
          return false;
        }
      },
      { message: "Phone number must be valid" },
    ),
});

export type EditProfileData = z.infer<typeof EditProfileSchema>;
