import {
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";
import { z } from "zod";

// Personal details schema factory
export const personalDetailsSchema = () => {
  return z.object({
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
    dateOfBirth: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine((value) => {
        // If value is null, undefined, or empty string, it's valid (optional field)
        if (!value || value === "") return true;

        // Check if it's a valid date format (DD/MM/YYYY or YYYY-MM-DD)
        const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
        if (!dateRegex.test(value)) return false;

        // Parse and validate actual date
        let date: Date;
        if (value.includes("/")) {
          const [day, month, year] = value.split("/");
          if (!day || !month || !year) return false; // Ensure all parts are present
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          date = new Date(value);
        }

        // Check if date is valid and not in the future
        const today = new Date();
        const minAge = new Date();
        minAge.setFullYear(today.getFullYear() - 120); // Maximum 120 years old

        return date <= today && date >= minAge && !isNaN(date.getTime());
      }, "Please enter a valid date of birth")
      .refine((value) => {
        // If value is null, undefined, or empty string, it's valid (optional field)
        if (!value || value === "") return true;

        // Check minimum age (e.g., 13 years old)
        let date: Date;
        if (value.includes("/")) {
          const [day, month, year] = value.split("/");
          if (!day || !month || !year) return false; // Ensure all parts are present
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          date = new Date(value);
        }

        const today = new Date();
        const minAgeDate = new Date();
        minAgeDate.setFullYear(today.getFullYear() - 13);

        return date <= minAgeDate;
      }, "You must be at least 13 years old"),
    idNumber: z
      .string()
      .trim()
      .regex(
        /^GHA-\d{9}-\d$/,
        "ID number must be in the format GHA-123456789-1",
      )
      .optional()
      .nullable(),
    gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
    levelOfEducation: z
      .enum([
        "noFormal",
        "basic",
        "secondary",
        "tertiary",
        "bachelors",
        "masters",
      ])
      .optional()
      .nullable(),
    yearsOfExperience: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().int().min(0),
    ),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .toLowerCase(),
    phoneNumber: z
      .string()
      .min(1, "Contact number is required")
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
  });
};
export const addressDetailsSchema = () => {
  return z.object({
    village: z
      .string()
      .trim()
      .max(100, "Village must not exceed 100 characters")
      .regex(
        /^[a-zA-Z0-9\s-]*$/,
        "Village can only contain letters, numbers, spaces, and hyphens",
      )
      .optional()
      .nullable(),
    region: z
      .string()
      .trim()
      .max(100, "Region must not exceed 100 characters")
      .regex(
        /^[a-zA-Z0-9\s-]*$/,
        "Region can only contain letters, numbers, spaces, and hyphens",
      )
      .optional()
      .nullable(),
    country: z
      .string()
      .trim()
      .max(100, "Country must not exceed 100 characters")
      .optional()
      .nullable(),
  });
};

export const idDocumentSchema = z.object({
  expirationDate: z
    .string()
    .min(1, "Expiration date is required")
    .refine((val) => {
      const [dd, mm, yyyy] = val.split("/");
      if (!dd || !mm || !yyyy) return false;
      const selected = new Date(`${yyyy}-${mm}-${dd}`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, "Expiration date must be today or later"),

  ghanaPostCode: z
    .string()
    .nullable()
    .refine((val) => val === null || /^[a-zA-Z0-9-]*$/.test(val), {
      message: "Ghana Post Code can only contain letters, numbers, and dashes",
    }),
});

export const internationalIdDocumentSchema = z.object({
  passportExpirationDate: z
    .string()
    .min(1, "Passport expiration date is required")
    .refine((value) => {
      // Check if it's a valid date format (DD/MM/YYYY or YYYY-MM-DD)
      const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
      if (!dateRegex.test(value)) return false;

      // Parse the date
      let date: Date;
      if (value.includes("/")) {
        const [day, month, year] = value.split("/");
        if (!day || !month || !year) return false;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(value);
      }

      // Ensure valid date and must be in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Ignore time portion
      return date > today && !isNaN(date.getTime());
    }, "Please enter a valid future expiration date"),
  visaExpirationDate: z
    .string()
    .min(1, "Visa expiration date is required")
    .refine((value) => {
      // Check if it's a valid date format (DD/MM/YYYY or YYYY-MM-DD)
      const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
      if (!dateRegex.test(value)) return false;

      // Parse the date
      let date: Date;
      if (value.includes("/")) {
        const [day, month, year] = value.split("/");
        if (!day || !month || !year) return false;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(value);
      }

      // Ensure valid date and must be in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Ignore time portion
      return date > today && !isNaN(date.getTime());
    }, "Please enter a valid future expiration date"),
  ghanaPostCode: z
    .string()
    .nullable()
    .refine((val) => val === null || /^[a-zA-Z0-9-]*$/.test(val), {
      message: "Ghana Post Code can only contain letters, numbers, and dashes",
    }),
});

export type AddressDetailsFormData = z.infer<
  ReturnType<typeof addressDetailsSchema>
>;

export type PersonalDetailsFormData = z.infer<
  ReturnType<typeof personalDetailsSchema>
>;

export type IdDocumentFormData = z.infer<typeof idDocumentSchema>;

export type InternationalIdDocumentFormData = z.infer<
  typeof internationalIdDocumentSchema
>;

// Gender options for dropdown
export const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

// Helper function to get translated gender options
export const getGenderOptions = (): typeof genderOptions => genderOptions;

// Date format helper functions
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";

  // If already in DD/MM/YYYY format, return as is
  if (dateString.includes("/")) return dateString;

  // Convert from YYYY-MM-DD to DD/MM/YYYY
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// Age calculation helper
export const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;

  let date: Date;
  if (dateOfBirth.includes("/")) {
    const [day, month, year] = dateOfBirth.split("/");
    if (!day || !month || !year) return 0; // Ensure all parts are present
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    date = new Date(dateOfBirth);
  }

  if (isNaN(date.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return age;
};
export const productionSchema = z.object({
  cropType: z.string().min(1, "Crop type is required"),
  cropVariety: z.string().min(1, "Crop variety is required"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Start date must be a valid date",
  }),
});
export type ProductionFormData = z.infer<typeof productionSchema>;
