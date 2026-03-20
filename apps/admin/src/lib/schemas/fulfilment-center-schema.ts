import { parsePhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const CenterDetailSchema = z.object({
  name: z
    .string({ required_error: "Fulfilment center name is required." })
    .refine((data) => data.trim() !== "", {
      message: "Fulfilment center name field cannot be empty",
    }),
  country: z
    .string({ required_error: "Country field is required." })
    .refine((data) => data.trim() !== "", {
      message: "Country field cannot be empty",
    }),
  region: z
    .string({ required_error: "Region field is required." })
    .refine((data) => data.trim() !== "", {
      message: "Region field cannot be empty",
    }),
  phoneNumber: z
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
  locationAddress: z
    .string({ required_error: "Location address is required." })
    .refine((data) => data.trim() !== "", {
      message: "Location address field cannot be empty",
    }),

  googleMapLink: z
    .string({ required_error: "Map link is required." })
    .refine((data) => data.trim() !== "", {
      message: "Google map link field cannot be empty",
    }),
  focusCrops: z
    .array(z.string())
    .default([])
    .refine((data) => data.length > 0, {
      message: "At least one crop must be selected",
    }),
  assignedDistricts: z
    .array(z.string())
    .default([])
    .refine((data) => data.length > 0, {
      message: "At least one district must be selected",
    }),
});

export type CenterDetailData = z.infer<typeof CenterDetailSchema>;

export const ManagementTeamSchema = z.object({
  regionalManagerId: z
    .string({ required_error: "Regional manager is required." })
    .refine((data) => data.trim() !== "", {
      message: "Regional manager field cannot be empty",
    }),
  operationsDirectorId: z.string().optional(),
  warehouseManagerId: z.string().optional(),
  fieldAgronomistId: z.string().optional(),
  fieldCoordinatorId: z.string().optional(),
});

export type ManagementTeamData = z.infer<typeof ManagementTeamSchema>;
