"use client";

import { cn } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import { Form, FormInput } from "@cf/ui/components/form";
import { FormSelectInput } from "@cf/ui/components/form-select-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useApiClient } from "@/lib/api";
import countries from "@/lib/constants/country.json";
import { type BasicInfoFormData, basicInfoSchema } from "@/lib/schemas/sign-up";
import { useSignUpStore } from "@/lib/stores/sign-up-store";
import { showErrorToast } from "@/lib/utils/toast";

interface BasicInfoFormProps {
  onSubmit: (data: BasicInfoFormData) => void;
  isLoading?: boolean;
}

export function BasicInfoForm({ onSubmit, isLoading }: BasicInfoFormProps) {
  const { basicInfo, resetFlow } = useSignUpStore();
  const t = useTranslations("auth");
  const tValidation = useTranslations();
  const api = useApiClient();

  useEffect(() => {
    resetFlow();
  }, [resetFlow]);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(
      basicInfoSchema((key, values) => tValidation(key as any, values)),
    ),
    defaultValues: {
      firstName: basicInfo.firstName || "",
      lastName: basicInfo.lastName || "",
      email: basicInfo.email || "",
      country: basicInfo.country || "",
      phoneNumber: "",
    },
    mode: "onChange",
  });

  const { handleSubmit, formState, setError } = form;
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
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-7">
        <div className="space-y-4">
          <FormInput
            name="firstName"
            label={t("firstName")}
            placeholder={t("enterFirstName")}
            autoComplete="given-name"
            className="placeholder:text-placeholder-text"
          />

          <FormInput
            name="lastName"
            label={t("lastName")}
            placeholder={t("enterLastName")}
            autoComplete="family-name"
            className="placeholder:text-placeholder-text"
          />

          <FormInput
            name="email"
            type="email"
            label={t("email")}
            placeholder={t("enterEmail")}
            autoComplete="email"
            className="placeholder:text-placeholder-text"
          />

          <FormSelectInput
            name="country"
            label={t("country")}
            options={countries.countries.map((country) => ({
              label: country.name,
              value: country.code,
            }))}
            placeholder={t("selectCountry")}
            className="placeholder:text-placeholder-text"
          />
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
