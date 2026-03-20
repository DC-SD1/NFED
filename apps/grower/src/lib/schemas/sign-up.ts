import {
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";
import { z } from "zod";

// Type for the translation function - we accept any function that takes a string and returns a string
// This allows for both typed translations and runtime translations
export type TranslationFunction = (key: string, values?: any) => string;

// Basic info schema factory
export const basicInfoSchema = (t?: TranslationFunction) => {
  // If no translation function provided, use default English messages
  if (!t) {
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
      email: z
        .string()
        .email("Please enter a valid email address")
        .toLowerCase(),
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
    });
  }

  // With translation function, use translated messages
  return z.object({
    firstName: z
      .string()
      .trim()
      .min(2, t("validation.firstName.min"))
      .max(50, t("validation.firstName.max"))
      .regex(/^[a-zA-Z\s-']+$/, t("validation.firstName.invalid")),
    lastName: z
      .string()
      .trim()
      .min(2, t("validation.lastName.min"))
      .max(50, t("validation.lastName.max"))
      .regex(/^[a-zA-Z\s-']+$/, t("validation.lastName.invalid")),
    email: z.string().email(t("validation.email.invalid")).toLowerCase(),
    phone: z
      .string()
      .min(1, t("validation.phone.required"))
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
      }, t("validation.phone.invalid")),
  });
};

export type BasicInfoFormData = z.infer<ReturnType<typeof basicInfoSchema>>;

// Password schema factory
export const passwordSchema = (t?: TranslationFunction) => {
  if (!t) {
    return z
      .object({
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[a-z]/, "Password must contain at least one lowercase letter")
          .regex(/[0-9]/, "Password must contain at least one number")
          .regex(
            /[!@#$%^&*(),.?":{}|<>]/,
            "Password must contain at least one special character",
          )
          .refine(
            (val) => !val.includes(" "),
            "Password cannot contain spaces",
          ),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
  }

  return z
    .object({
      password: z
        .string()
        .min(8, t("validation.password.min"))
        .regex(/[A-Z]/, t("validation.password.uppercase"))
        .regex(/[a-z]/, t("validation.password.lowercase"))
        .regex(/[0-9]/, t("validation.password.number"))
        .regex(/[!@#$%^&*(),.?":{}|<>]/, t("validation.password.special"))
        .refine((val) => !val.includes(" "), t("validation.password.noSpaces")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.password.mismatch"),
      path: ["confirmPassword"],
    });
};

export type PasswordFormData = z.infer<ReturnType<typeof passwordSchema>>;

export const changePasswordSchema = (
  t: (key: string, values?: any) => string,
) =>
  z
    .object({
      currentPassword: z.string().min(1, t("validation.required")),
      newPassword: z
        .string()
        .min(8, t("validation.password.min"))
        .regex(/[A-Z]/, t("validation.password.uppercase"))
        .regex(/[a-z]/, t("validation.password.lowercase"))
        .regex(/[0-9]/, t("validation.password.number"))
        .regex(/[^A-Za-z0-9]/, t("validation.password.special")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("validation.password.mismatch"),
      path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: t("validation.password.passwordsDifferent"),
      path: ["newPassword"],
    });

export type ChangePasswordFormData = z.infer<
  ReturnType<typeof changePasswordSchema>
>;

// OTP schema
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export type OtpFormData = z.infer<typeof otpSchema>;

// Marketing attribution schema
export const marketingAttributionSchema = z
  .object({
    channels: z
      .array(
        z.enum([
          "socialMedia",
          "searchEngine",
          "wordOfMouth",
          "advertisement",
          "newsMedia",
          "other",
        ]),
      )
      .min(1, "Please select at least one channel"),
    otherDetails: z.string().optional(),
  })
  .refine(
    (data) => {
      // If 'other' is selected, otherDetails is required
      if (data.channels.includes("other") && !data.otherDetails?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: 'Please specify details for "Other"',
      path: ["otherDetails"],
    },
  );

export type MarketingAttributionFormData = z.infer<
  typeof marketingAttributionSchema
>;

// Alias for components
export const marketingSchema = marketingAttributionSchema;
export type MarketingFormData = MarketingAttributionFormData;

// User segmentation schema
export const userSegmentationSchema = z.object({
  farmingExperience: z.enum(["newbie", "experienced"], {
    required_error: "Please select your farming experience level",
  }),
});

export type UserSegmentationFormData = z.infer<typeof userSegmentationSchema>;

// Alias for components
export const segmentationSchema = z.object({
  userType: z.enum(["newbie", "experienced"], {
    required_error: "Please select your user type",
  }),
});
export type SegmentationFormData = z.infer<typeof segmentationSchema>;

// Newbie flow schemas
export const workPreferenceSchema = z.object({
  workPreference: z.enum(["solo", "manager"], {
    required_error: "Please select your work preference",
  }),
});

export const landAvailabilitySchema = z.object({
  hasLand: z.boolean({
    required_error: "Please indicate if you have land available",
  }),
});

export const tutorialPreferenceSchema = z.object({
  wantsTutorial: z.boolean({
    required_error: "Please indicate if you want tutorials",
  }),
});

export const landInfoSchema = z.object({
  location: z
    .string()
    .min(3, "Location must be at least 3 characters")
    .max(100, "Location must not exceed 100 characters"),
  farmSize: z
    .number()
    .min(0.1, "Farm size must be at least 0.1")
    .max(10000, "Farm size must not exceed 10,000"),
});

export const farmingMethodSchema = z.object({
  farmingMethod: z.enum(["greenhouse", "openfield", "notSure"], {
    required_error: "Please select a farming method",
  }),
});

export const farmingGoalSchema = z.object({
  farmingGoal: z.enum(
    ["startGuidance", "betterYields", "export", "investment"],
    {
      required_error: "Please select your farming goal",
    },
  ),
});

// Experienced flow schemas
export const farmingLevelSchema = z.object({
  farmingLevel: z.enum(
    [
      "lessThanOneYear",
      "oneToThreeYears",
      "fourToSevenYears",
      "moreThanEightYears",
    ],
    {
      required_error: "Please select your farming experience level",
    },
  ),
});

export const cropsCultivatedSchema = z
  .object({
    crops: z.array(z.string()).min(1, "Please select at least one crop"),
    otherCrop: z.string().optional(),
  })
  .refine(
    (data) => {
      // If 'other' is in crops array, otherCrop is required
      if (data.crops.includes("other") && !data.otherCrop?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Please specify the other crop",
      path: ["otherCrop"],
    },
  );

export const farmingPreferenceOneSchema = z.object({
  preference: z.enum(["farmOnMyOwn", "farmWithManager"], {
    required_error: "Please select your farming preference",
  }),
});

export const farmingPreferenceTwoSchema = z.object({
  hasLand: z.enum(["yes", "no"], {
    required_error: "Please indicate if you have farmland",
  }),
});

export const farmingPreferenceThreeSchema = z.object({
  wantsSupport: z.enum(["yes", "notNow"], {
    required_error: "Please indicate if you want support",
  }),
});

// Additional experienced farmer schemas
export const farmDetailsSchema = z.object({
  farmName: z
    .string()
    .min(2, "Farm name must be at least 2 characters")
    .max(100, "Farm name must not exceed 100 characters"),
  farmSize: z
    .number()
    .min(0.1, "Farm size must be at least 0.1")
    .max(100000, "Farm size must not exceed 100,000"),
  sizeUnit: z.enum(["acres", "hectares"]),
  yearsInOperation: z
    .number()
    .min(0, "Years must be 0 or more")
    .max(100, "Years must not exceed 100"),
  registrationNumber: z.string().optional(),
});

export const locationClimateSchema = z.object({
  country: z.string().min(2, "Country is required"),
  region: z.string().min(2, "Region is required"),
  nearestCity: z.string().min(2, "Nearest city is required"),
  climateZone: z.string().min(2, "Climate zone is required"),
});

export const infrastructureSchema = z
  .object({
    irrigationType: z.enum(["drip", "sprinkler", "flood", "rain_fed"]),
    hasStorage: z.boolean(),
    storageCapacity: z.number().optional(),
    hasProcessing: z.boolean(),
    transportAccess: z.enum(["own", "hired", "public"]),
  })
  .refine(
    (data) => {
      // If hasStorage is true, storageCapacity is required
      if (
        data.hasStorage &&
        (!data.storageCapacity || data.storageCapacity <= 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please specify storage capacity",
      path: ["storageCapacity"],
    },
  );
