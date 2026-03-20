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
import { ChevronRight } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { logger } from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type Country, parsePhoneNumber } from "react-phone-number-input";
import type { z } from "zod";

import { useApiClient } from "@/lib/api";
import { ROLES } from "@/lib/schemas/auth";
import { inviteManagerSchema } from "@/lib/schemas/invite-farm-manager";
import { useInviteUserStore } from "@/lib/stores/invite-user";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";

type InviteManagerFormData = z.infer<typeof inviteManagerSchema>;

interface InviteManagerFormProps {
  isLoading?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InviteMangerForm({
  isLoading,
  onSuccess,
}: InviteManagerFormProps) {
  const t = useTranslations("dashboard.inviteManager");
  const tCommon = useTranslations("common");
  const { inviteData, setInviteData } = useInviteUserStore();
  const e = useTranslations("auth.errors");
  const { handleError } = useLocalizedErrorHandler();
  const api = useApiClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [currentCountry, setCurrentCountry] = useState<Country>(
    getCountryFromPhone(inviteData.phoneNumber || ""),
  );
  const form = useForm<InviteManagerFormData>({
    resolver: zodResolver(inviteManagerSchema),
    defaultValues: {
      firstName: inviteData.firstName || "",
      lastName: inviteData.lastName || "",
      email: inviteData.emailAddress || "",
      phone: inviteData.phoneNumber || "",
      yearsOfExperience: inviteData.experienceYears || 0,
    },
    mode: "onChange",
  });

  const { control, handleSubmit, formState } = form;

  const handleFormSubmit = async (data: InviteManagerFormData) => {
    setIsSubmitting(true);
    await setInviteData({
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: data.email,
      phoneNumber: data.phone,
      experienceYears: data.yearsOfExperience,
      role: ROLES.FARM_MANAGER,
    });

    try {
      const { error: emailError, data: emailResponse } = await api.client.GET(
        "/users/check-email-exists",
        {
          params: {
            query: {
              Email: data.email,
            },
          },
        },
      );

      if (emailError) {
        handleError("something wrong", e("submit_error"));
        return;
      }

      if (emailResponse.exists == true) {
        handleError(
          "email address already exists",
          e("invitation_email_exists"),
        );
        return;
      }

      const { error: phoneNumberError, data: phoneNumberResponse } =
        await api.client.GET("/users/check-phone-number-exists", {
          params: {
            query: {
              PhoneNumber: data.phone,
            },
          },
        });

      if (phoneNumberError) {
        handleError("something wrong", e("submit_error"));
        return;
      }

      if (phoneNumberResponse.exists == true) {
        handleError(
          "phone number already exists",
          e("invitation_number_exists"),
        );
        return;
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      logger.error("Failed to invite manager", { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <p className="text-muted-foreground text-md text-start lg:text-center">
          {t("description")}
        </p>
        <FormInput
          name="firstName"
          label={t("firstName")}
          placeholder={t("enterFirstName")}
          className="border-input-border rounded-lg border border-solid"
        />
        <FormInput
          name="lastName"
          label={t("lastName")}
          placeholder={t("enterLastName")}
          className="border-input-border rounded-lg border border-solid"
        />

        <FormInput
          name="email"
          type="email"
          label={t("email")}
          placeholder={t("enterEmail")}
          autoComplete="email"
          className="border-input-border rounded-lg border border-solid"
        />

        <FormField
          control={control}
          name="phone"
          render={({ field }) => {
            const handlePhoneChange = (value: string) => {
              field.onChange(value);
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
                <FormLabel>{t("phoneNumber")}</FormLabel>
                <FormControl>
                  <PhoneInput
                    {...field}
                    onChange={handlePhoneChange}
                    defaultCountry={currentCountry}
                    international={false}
                    className="bg-primary-light border-input-border h-12 items-center rounded-lg border border-solid  placeholder:text-[#525C4E]"
                    countrySelectProps={{
                      className:
                        "bg-primary-light border border-solid border-input-border rounded-s-md",
                    }}
                    key={currentCountry}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormInput
          name="yearsOfExperience"
          type="number"
          label={t("yearsOfExperience")}
          placeholder={"0"}
          className="border-input-border-border rounded-lg border border-solid"
          min={0}
        />

        <Button
          type="submit"
          className={cn(
            "mx-auto w-full rounded-md",
            !formState.isValid && "opacity-50",
          )}
          disabled={isSubmitting || isLoading || !formState.isValid}
        >
          {isSubmitting ? tCommon("processing") : tCommon("next")}
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </form>
    </Form>
  );
}
