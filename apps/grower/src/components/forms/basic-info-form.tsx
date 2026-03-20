"use client";

import { cn } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui/components/form";
import { PhoneInput } from "@cf/ui/components/phone-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type Country, parsePhoneNumber } from "react-phone-number-input";

import { useApiClient } from "@/lib/api";
import { type BasicInfoFormData, basicInfoSchema } from "@/lib/schemas/sign-up";
import { useSignUpStore } from "@/lib/stores/sign-up-store";
import { showErrorToast } from "@/lib/utils/toast";

interface BasicInfoFormProps {
  onSubmit: (data: BasicInfoFormData) => void;
  isLoading?: boolean;
}

// Extract country from existing phone number or default to GH
const getCountryFromPhone = (phone: string): Country => {
  if (phone) {
    try {
      const phoneNumber = parsePhoneNumber(phone);
      return phoneNumber?.country || "GH";
    } catch {
      return "GH";
    }
  }
  return "GH";
};

export function BasicInfoForm({ onSubmit, isLoading }: BasicInfoFormProps) {
  const { basicInfo, resetFlow } = useSignUpStore();
  const t = useTranslations("auth");
  const tValidation = useTranslations();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const api = useApiClient();

  useEffect(() => {
    resetFlow();
  }, [resetFlow]);

  const [currentCountry, setCurrentCountry] = useState<Country>(
    getCountryFromPhone(basicInfo.phone || ""),
  );

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(
      basicInfoSchema((key, values) => tValidation(key as any, values)),
    ),
    defaultValues: {
      firstName: basicInfo.firstName || "",
      lastName: basicInfo.lastName || "",
      email: basicInfo.email || "",
      phone: basicInfo.phone || "",
    },
    mode: "onChange",
  });

  const { control, handleSubmit, formState, setError } = form;
  const [isValidating, setIsValidating] = useState(false);

  const handleFormSubmit = async (data: BasicInfoFormData) => {
    setIsValidating(true);

    try {
      // Check email exists
      const emailResponse = await api.client.GET("/users/check-email-exists", {
        params: {
          query: {
            Email: data.email,
          },
        },
      });

      if (emailResponse.error) {
        console.error("Email check error:", emailResponse.error);
        showErrorToast(t("errors.checkEmailFailed"));
        setIsValidating(false);
        return;
      }

      if (emailResponse.data?.exists) {
        setError("email", {
          type: "manual",
          message: t("errors.emailAlreadyExists"),
        });
        setIsValidating(false);
        return;
      }

      // Check phone exists
      const phoneResponse = await api.client.GET(
        "/users/check-phone-number-exists",
        {
          params: {
            query: {
              PhoneNumber: data.phone,
            },
          },
        },
      );

      if (phoneResponse.error) {
        showErrorToast(t("errors.checkPhoneFailed"));
        setIsValidating(false);
        return;
      }

      if (phoneResponse.data?.exists) {
        setError("phone", {
          type: "manual",
          message: t("errors.phoneAlreadyExists"),
        });
        setIsValidating(false);
        return;
      }

      // If both checks pass, submit the form
      onSubmit(data);
    } catch (error) {
      console.error("Validation error:", error);
      showErrorToast(t("somethingWentWrong"));
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormInput
          name="firstName"
          label={t("firstName")}
          placeholder={t("enterFirstName")}
          autoComplete="given-name"
        />

        <FormInput
          name="lastName"
          label={t("lastName")}
          placeholder={t("enterLastName")}
          autoComplete="family-name"
        />

        <FormInput
          name="email"
          type="email"
          label={t("email")}
          placeholder={t("enterEmail")}
          autoComplete="email"
        />

        <FormField
          control={control}
          name="phone"
          render={({ field }) => {
            // Handle onChange to track the country
            const handlePhoneChange = (value: string) => {
              field.onChange(value);

              // Update country when phone number changes
              if (value) {
                try {
                  const phoneNumber = parsePhoneNumber(value);
                  if (phoneNumber?.country) {
                    setCurrentCountry(phoneNumber.country);
                  }
                } catch {
                  // Keep current country if parsing fails
                }
              }
            };

            return (
              <FormItem className="space-y-2">
                <FormLabel>{t("phone")}</FormLabel>
                <FormControl>
                  <PhoneInput
                    {...field}
                    onChange={handlePhoneChange}
                    defaultCountry={currentCountry}
                    international={false}
                    className="bg-primary-light h-12 items-center rounded-md pr-12 placeholder:text-[#525C4E]"
                    countrySelectProps={{
                      className: "bg-primary-light rounded-s-md",
                    }}
                    key={currentCountry} // Force re-render when country changes
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex w-full justify-end">
          <Link
            href={`/${locale}/sign-in`}
            className="text-foreground inline-flex items-center gap-1 text-sm font-semibold"
          >
            {t("haveAccount")}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <Button
          type="submit"
          className={cn("mx-auto w-full", !formState.isValid && "opacity-50")}
          disabled={isLoading || isValidating || !formState.isValid}
        >
          {isLoading || isValidating ? t("creatingAccount") : t("continue")}
        </Button>
      </form>
    </Form>
  );
}
