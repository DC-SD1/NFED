import { parsePhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const AgentInvitationSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required." })
    .trim()
    .min(2, { message: "First name must be at least 2 characters." })
    .refine((data) => data !== "", {
      message: "First name field cannot be empty",
    }),
  lastName: z
    .string({ required_error: "Last name is required." })
    .trim()
    .min(2, { message: "Last name must be at least 2 characters." })
    .refine((data) => data.trim() !== "", {
      message: "Last name field cannot be empty",
    }),
  email: z
    .string({ required_error: "Email is required." })
    .email({
      message: "Invalid email address",
    })
    .refine((data) => data.trim() !== "", {
      message: "Email field cannot be empty",
    }),
  phoneNumber: z
    .string({ required_error: "Phone number is required." })
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

export type AgentInvitationData = z.infer<typeof AgentInvitationSchema>;

export const BuyerInvitationSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required." })
    .trim()
    .min(2, { message: "First name must be at least 2 characters." })
    .refine((data) => data !== "", {
      message: "First name field cannot be empty",
    }),
  lastName: z
    .string({ required_error: "Last name is required." })
    .trim()
    .min(2, { message: "Last name must be at least 2 characters." })
    .refine((data) => data.trim() !== "", {
      message: "Last name field cannot be empty",
    }),
  email: z
    .string({ required_error: "Email is required." })
    .email({
      message: "Invalid email address",
    })
    .refine((data) => data.trim() !== "", {
      message: "Email field cannot be empty",
    }),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (data) => {
        if (!data || data.trim() === "") return true;
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

export type BuyerInvitationData = z.infer<typeof BuyerInvitationSchema>;
