"use client";

import { Button, Form, FormInput } from "@cf/ui";
import { FormSelectInput } from "@cf/ui/components/form-select-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { type Locale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { APIErrorResponse } from "@/types/auth";

export function OrganisationInfoForm() {
  const t = useTranslations("buyerOnboarding.basicInfo.organisationInfo");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;

  const authUser = useAuthUser();
  const queryClient = useQueryClient();
  const api = useApiClient();

  const [isGhana, setIsGhana] = useState(false);

  // Fetch user profile to get their saved country
  const { data: userProfile } = api.useQuery("get", "/users/get-by-id", {});

  const { mutateAsync: mutateAsyncUpdate, isPending: isPendingUpdate } =
    api.useMutation("post", "/organisations/create", {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["post", "/organisations/create"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["post", "/organisations/create"],
          }),
        ]);
        showSuccessToast("Organisation information created successfully.");
      },
      onError: (error: APIErrorResponse) => {
        const errorMessage =
          error?.errors?.[0]?.message ?? "Failed to create organisation";
        showErrorToast(errorMessage);
      },
    });

  // Set isGhana based on user's saved country
  useEffect(() => {
    if (userProfile) {
      const profileData = userProfile as Record<string, unknown>;
      const country = profileData?.country;
      if (country === "GH" || country === "Ghana") {
        setIsGhana(true);
      } else {
        setIsGhana(false);
      }
    }
  }, [userProfile]);

  const { organisationInformation, setOrganisationInformation } =
    useOnboardingStore();

  const formSchema = z.object({
    organizationName: z
      .string()
      .min(1, tValidation("organizationName.required")),
    companySize: z.string().min(1, tValidation("companySize.required")),
    revenueRange: z.string().min(1, tValidation("revenueRange.required")),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: organisationInformation,
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      setOrganisationInformation(value as FormSchema);
    });
    return () => subscription.unsubscribe();
  }, [form, setOrganisationInformation]);

  const onSubmit: SubmitHandler<FormSchema> = async (data: FormSchema) => {
    setOrganisationInformation(data);

    await mutateAsyncUpdate({
      body: {
        userId: authUser?.userId ?? "",
        name: data.organizationName,
        companySize: data.companySize,
        companyRevenue: data.revenueRange,
      },
    });

    router.push(`/${locale}/onboarding/basic-information/crop-interest`);
  };

  const isSubmitting = form.formState.isSubmitting || isPendingUpdate;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative space-y-5 pb-24 lg:pb-0"
      >
        <FormInput
          name="organizationName"
          label={t("organizationName")}
          placeholder={t("organizationNamePlaceholder")}
        />
        <FormSelectInput
          name="companySize"
          label={t("companySize")}
          options={[
            { label: t("companySizeOptions.0-49"), value: "0-49" },
            { label: t("companySizeOptions.50-249"), value: "50-249" },
            { label: t("companySizeOptions.250-999"), value: "250-999" },
            { label: t("companySizeOptions.1000+"), value: "1000+" },
          ]}
          placeholder={t("companySizePlaceholder")}
        />
        <FormSelectInput
          name="revenueRange"
          label={t("revenueRange")}
          options={
            isGhana
              ? [
                  {
                    label: t("revenueRangeOptions.< GHS 9,999"),
                    value: "< GHS 9,999",
                  },
                  {
                    label: t("revenueRangeOptions.GHS 10,000 - GHS 99,999"),
                    value: "GHS 10,000 - GHS 99,999",
                  },
                  {
                    label: t("revenueRangeOptions.GHS 100,000 - GHS 999,999"),
                    value: "GHS 100,000 - GHS 999,999",
                  },
                  {
                    label: t("revenueRangeOptions.> GHS 1,000,000"),
                    value: "> GHS 1,000,000",
                  },
                ]
              : [
                  { label: t("revenueRangeOptions.< $999"), value: "< $999" },
                  {
                    label: t("revenueRangeOptions.$1,000 - $9,999"),
                    value: "$1,000 - $9,999",
                  },
                  {
                    label: t("revenueRangeOptions.$10,000 - $99,999"),
                    value: "$10,000 - $99,999",
                  },
                  {
                    label: t("revenueRangeOptions.> $100,000"),
                    value: "> $100,000",
                  },
                ]
          }
          placeholder={t("revenueRangePlaceholder")}
        />
        <div className="inset-x-0 bottom-0 z-50 flex flex-col-reverse justify-end bg-white p-4 md:fixed md:flex-row lg:static lg:bg-transparent lg:p-0 lg:shadow-none">
          <Button
            type="submit"
            disabled={!form.formState.isValid}
            className="w-full font-bold lg:w-48"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t("saveAndContinue")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
