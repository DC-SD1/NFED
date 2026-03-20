"use client";

import { FormCheckbox } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import { Form } from "@cf/ui/components/form";
import { FormSelectInput } from "@cf/ui/components/form-select-input";
import { cn } from "@cf/ui/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useApiClient } from "@/lib/api";
import countries from "@/lib/constants/country.json";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { APIErrorResponse } from "@/types/auth";

const CountryFormSchema = z.object({
  country: z.string().min(2, "Country is required"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type CountryFormData = z.infer<typeof CountryFormSchema>;

export function CountryForm() {
  const t = useTranslations("auth");
  const form = useForm<CountryFormData>({
    resolver: zodResolver(CountryFormSchema),
    mode: "onChange",
    defaultValues: {
      country: "",
      terms: false,
    },
  });
  const { handleSubmit } = form;

  const router = useRouter();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { locale } = useParams();
  const localeStr = Array.isArray(locale) ? locale[0] : String(locale ?? "");
  const { userId } = useAuthUser();

  const { mutateAsync, isPending } = api.useMutation(
    "patch",
    "/users/{UserId}/country",
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/users/{UserId}",
            {
              params: {
                path: { UserId: userId ?? "" },
              },
            },
          ],
        });

        showSuccessToast("Country updated successfully!");
        router.push(`/${localeStr}/home`);
      },
      onError: (error: APIErrorResponse) => {
        const errorMessage = error?.errors
          ?.map((err) => err.message)
          .join(", ");
        showErrorToast(
          errorMessage ?? "Failed to update country. Please try again.",
        );
      },
    },
  );

  const handleFormSubmit = async (data: CountryFormData) => {
    // Only send country field to the API, exclude terms
    if (!userId) {
      showErrorToast("User ID not found. Please try logging in again.");
      return;
    }

    await mutateAsync({
      body: { country: data.country },
      params: {
        path: { UserId: userId },
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-7">
        <FormSelectInput
          name="country"
          label={t("country")}
          options={countries.countries.map((country) => ({
            label: country.name,
            value: country.name,
          }))}
          placeholder={t("selectCountry")}
          className="placeholder:text-placeholder-text"
        />

        {/* CAPTCHA Widget */}
        <div id="clerk-captcha"></div>

        <FormCheckbox
          name="terms"
          label={
            <p className="-mt-2 text-sm text-gray-600">
              {t("agreeTo")}{" "}
              <Link href="#" className="font-semibold text-[#4B908B]">
                {t("termsAndConditions")}
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-semibold text-[#4B908B]">
                {t("privacyPolicy")}
              </Link>
            </p>
          }
          className="data-[state=checked]:border-[#4B908B] data-[state=checked]:bg-[#4B908B]"
        />

        <Button
          type="submit"
          className={cn(
            "mx-auto w-full",
            !form.formState.isValid && "opacity-50",
          )}
          disabled={isPending || !form.formState.isValid}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            t("continue")
          )}
        </Button>
      </form>
    </Form>
  );
}
