import { z } from "zod";

// Type for the translation function
export type TranslationFunction = (key: string, values?: any) => string;

// Additional details schema factory
export const additionalDetailsSchema = (t?: TranslationFunction) => {
  // If no translation function provided, use default English messages
  if (!t) {
    return z
      .object({
        farmName: z
          .string()
          .trim()
          .min(2, "Farm name must be at least 2 characters")
          .max(100, "Farm name must not exceed 100 characters")
          .regex(
            /^[a-zA-Z0-9\s-']+$/,
            "Farm name can only contain letters, numbers, spaces, hyphens, and apostrophes",
          ),
        region: z
          .string()
          .trim()
          .min(2, "Region must be at least 2 characters")
          .max(100, "Region must not exceed 100 characters"),
        village: z
          .string()
          .trim()
          .min(2, "Village/Location must be at least 2 characters")
          .max(100, "Village/Location must not exceed 100 characters"),
        landOwnershipType: z
          .enum(["LandTitle", "ContractualAgreements"])
          .nullable()
          .optional(),
        documentUrl: z
          .string()
          .url("Invalid document URL")
          .nullable()
          .optional(),
      })
      .refine(
        (data) => {
          // If land ownership type is selected, document URL is required
          if (data.landOwnershipType && !data.documentUrl) {
            return false;
          }
          return true;
        },
        {
          message:
            "Document upload is required when land ownership type is selected",
          path: ["documentUrl"],
        },
      );
  }

  // With translation function, use translated messages
  return z
    .object({
      farmName: z
        .string()
        .trim()
        .min(2, t("validation.farmName.min"))
        .max(100, t("validation.farmName.max"))
        .regex(/^[a-zA-Z0-9\s-']+$/, t("validation.farmName.invalid")),
      region: z
        .string()
        .trim()
        .min(2, t("validation.region.min"))
        .max(100, t("validation.region.max")),
      village: z
        .string()
        .trim()
        .min(2, t("validation.village.min"))
        .max(100, t("validation.village.max")),
      landOwnershipType: z
        .enum(["LandTitle", "ContractualAgreements"])
        .nullable()
        .optional(),
      documentUrl: z
        .string()
        .url(t("validation.documentUrl.invalid"))
        .nullable()
        .optional(),
    })
    .refine(
      (data) => {
        // If land ownership type is selected, document URL is required
        if (data.landOwnershipType && !data.documentUrl) {
          return false;
        }
        return true;
      },
      {
        message: t("validation.documentUrl.required"),
        path: ["documentUrl"],
      },
    );
};

export const createAdditionalDetailsSchema = additionalDetailsSchema;
export type AdditionalDetailsFormData = z.infer<
  ReturnType<typeof createAdditionalDetailsSchema>
>;
