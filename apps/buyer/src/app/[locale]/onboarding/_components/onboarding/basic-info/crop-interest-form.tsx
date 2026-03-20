"use client";

import { Button, Form, FormTextareaInput, Skeleton } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import z from "zod";

import { type Locale } from "@/config/i18n-config";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import { CropItem } from "./crop-item";

export function CropInterestForm() {
  // Use useTranslations without specifying namespace to get full access
  const t = useTranslations();
  const { cropInterest, setCropInterest } = useOnboardingStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;
  const authUser = useAuthUser();

  const api = useApiClient();
  const queryClient = useQueryClient();

  const formSchema = z.object({
    crops: z.array(z.string()),
    otherCrops: z.string().optional(),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const { data, isPending } = api.useQuery("get", "/crop/get_all");

  // Fetch user's saved crop preferences from API
  const { data: savedPreferences } = api.useQuery(
    "get",
    "/crop-preference/organisation/get",
    {
      params: {
        query: {
          OrganisationId: authUser?.userId ?? "",
        },
      },
    },
  );

  // Handle both response formats: {value: [...]} or direct array
  const rawList = useMemo(() => {
    if (!data) return [];

    // Check if data has a 'value' property that's an array
    if (
      typeof data === "object" &&
      "value" in data &&
      Array.isArray(data.value)
    ) {
      return data.value;
    }

    // Check if data itself is an array
    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }, [data]);

  const crops = useMemo(() => {
    return rawList
      .filter(
        (
          crop,
        ): crop is {
          id: unknown;
          name: string;
          imageUrl?: string;
          cropVariety?: { name?: string }[];
        } =>
          crop != null &&
          "id" in crop &&
          "name" in crop &&
          crop.id != null &&
          crop.name != null,
      )
      .map((crop) => ({
        value: String(crop.id), // Ensure it's a string
        label: crop.name || "Unknown Crop",
        image: crop.imageUrl || "/placeholder-crop.jpg",
        category: crop.cropVariety?.[0]?.name || "General",
      }));
  }, [rawList]);

  // Extract selected crop names from saved preferences
  const selectedCropNames = useMemo(() => {
    if (!savedPreferences || !crops.length) return [];

    // Handle both response formats: array or object with value property
    const prefsArray: unknown[] = Array.isArray(savedPreferences)
      ? savedPreferences
      : Array.isArray((savedPreferences as Record<string, unknown>)?.value)
        ? ((savedPreferences as Record<string, unknown>).value as unknown[])
        : [];

    // The preferences are already an array of crop ID strings
    // No need to extract - just use them directly
    const savedCropIds = prefsArray
      .map((pref: unknown) => {
        // If pref is already a string (the ID), use it directly
        if (typeof pref === "string") return pref;
        // Otherwise try to extract from object properties
        const prefObj = pref as Record<string, unknown>;
        return String(prefObj?.cropId || prefObj?.id || "");
      })
      .filter(Boolean);

    // Convert IDs to names for form
    const cropNames = savedCropIds
      .map((id: string) => {
        const crop = crops.find((c) => c.value === id);
        return crop?.label;
      })
      .filter(Boolean) as string[];

    return cropNames;
  }, [savedPreferences, crops]);

  const { mutateAsync: mutateAsyncUpdate, isPending: isPendingUpdate } =
    api.useMutation("put", "/crop-preference/organisation/update", {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["get", "/crop-preference/organisation/get"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["get", "/crop/get_all"],
          }),
        ]);
        showSuccessToast("Crop preference updated successfully.");
      },
      onError: (error: any) => {
        showErrorToast(error?.message ?? "");
      },
    });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crops: selectedCropNames,
      otherCrops: cropInterest?.otherCrops || "",
    },
  });

  // Reset form with selected crops when they load
  useEffect(() => {
    if (selectedCropNames.length > 0) {
      form.reset({
        crops: selectedCropNames,
        otherCrops: cropInterest?.otherCrops || "",
      });
    }
  }, [selectedCropNames, form, cropInterest?.otherCrops]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setCropInterest(value as FormSchema);
    });
    return () => subscription.unsubscribe();
  }, [form, setCropInterest]);

  const onSubmit: SubmitHandler<FormSchema> = async (data: FormSchema) => {
    setCropInterest(data);

    // Convert crop names back to IDs for API calls
    const cropIds = data.crops.map((cropName: string) => {
      const crop = crops.find((c) => c.label === cropName);
      return crop?.value || cropName; // Fallback to original value if not found
    });

    await mutateAsyncUpdate({
      body: {
        organisationId: authUser?.userId ?? "",
        cropId: cropIds,
        createdByUserId: authUser?.userId ?? "",
      },
    });
    router.push(`/${locale}/onboarding/company-documents/corporate-identity`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1">
          {isPending
            ? Array.from({ length: 6 }).map((_, index) => (
                <CropItemSkeleton key={`skeleton-${index}`} variation={index} />
              ))
            : crops.map((crop: any) => (
                <CropItem key={crop.value} name={crop.label} crop={crop} />
              ))}
        </div>
        <FormTextareaInput
          name="otherCrops"
          label={t("buyerOnboarding.cropInterest.otherCrops")}
          placeholder={t("buyerOnboarding.cropInterest.otherCropsPlaceholder")}
        />
        <div className="inset-x-0 bottom-0 z-50 flex flex-col-reverse justify-end gap-4 bg-white p-4 md:fixed md:flex-row lg:static lg:bg-transparent lg:p-0 lg:shadow-none">
          <Button
            type="button"
            variant="ghost"
            className="text-primary w-full bg-transparent px-12 font-bold hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] lg:w-auto lg:bg-[#F5F5F5] lg:text-[hsl(var(--text-dark))]"
            asChild
          >
            <Link href="/onboarding/basic-information/organisation-information">
              {" "}
              {t("buyerOnboarding.cropInterest.back")}
            </Link>
          </Button>
          <Button type="submit" className="w-full font-bold lg:w-48">
            {form.formState.isSubmitting || isPendingUpdate ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t("buyerOnboarding.cropInterest.saveAndContinue")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CropItemSkeleton({ variation = 0 }: { variation?: number }) {
  const titleWidths = ["w-28", "w-32", "w-36", "w-24", "w-30", "w-26"];
  const categoryWidths = ["w-16", "w-20", "w-18", "w-14", "w-22", "w-16"];

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 rounded-md bg-gray-200" />
        <div className="grid gap-1.5 font-normal">
          <Skeleton
            className={`h-5 ${titleWidths[variation] || "w-32"} bg-gray-200`}
          />
          <Skeleton
            className={`h-4 ${categoryWidths[variation] || "w-20"} bg-gray-200`}
          />
        </div>
      </div>
      <Skeleton className="size-4 rounded-sm bg-gray-200" />
    </div>
  );
}
