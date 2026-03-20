import {
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";
import z from "zod";

export const inviteManagerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z\s-']+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes",
    ),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z\s-']+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes",
    ),
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((value) => {
      if (!value || value.length === 0) {
        return false;
      }
      try {
        if (!isPossiblePhoneNumber(value)) {
          return false;
        }
        return isValidPhoneNumber(value);
      } catch {
        return false;
      }
    }, "Please enter a valid phone number"),
  yearsOfExperience: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().int().min(0),
  ),
});
