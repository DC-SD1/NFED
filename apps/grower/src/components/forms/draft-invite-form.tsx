"use client";

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
import { RadioGroup, RadioGroupItem } from "@cf/ui/components/radio-group";
import { ChevronRight } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { logger } from "@sentry/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { type Country, parsePhoneNumber } from "react-phone-number-input";
import z from "zod";

import { useApiClient } from "@/lib/api";
import { inviteManagerSchema } from "@/lib/schemas/invite-farm-manager";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { formatPhoneToE164 } from "@/lib/utils/string-helpers";
import { showSuccessToast } from "@/lib/utils/toast";

import { DraftInviteManagerFormSkeleton } from "../dashboard/skeletons/draft-form-skeleton";

const CompleteInviteManagerSchema = inviteManagerSchema.extend({
  workType: z.string(),
  workPayType: z.string(),
});

type CompleteInviteManagerFormData = z.infer<
  typeof CompleteInviteManagerSchema
>;

function PersonalInformationSection({ isDisabled }: { isDisabled: boolean }) {
  const t = useTranslations("dashboard.inviteManager");
  const { control, watch } = useFormContext<CompleteInviteManagerFormData>();
  const phoneValue = watch("phone");

  const [currentCountry, setCurrentCountry] = useState<Country>(() => {
    return getCountryFromPhone(phoneValue || "");
  });

  function getCountryFromPhone(phone: string): Country {
    if (phone) {
      try {
        const phoneNumber = parsePhoneNumber(phone);
        return phoneNumber?.country || "GH";
      } catch {
        return "GH";
      }
    }
    return "GH";
  }

  useEffect(() => {
    if (phoneValue) {
      const detectedCountry = getCountryFromPhone(phoneValue);
      setCurrentCountry(detectedCountry);
    }
  }, [phoneValue]);

  return (
    <div className="space-y-4">
      <FormInput
        name="firstName"
        disabled={isDisabled}
        label={t("firstName")}
        placeholder={t("enterFirstName")}
        className="border-input-border rounded-lg border border-solid"
      />
      <FormInput
        name="lastName"
        disabled={isDisabled}
        label={t("lastName")}
        placeholder={t("enterLastName")}
        className="border-input-border rounded-lg border border-solid"
      />

      <FormInput
        name="email"
        disabled
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
            if (!isDisabled) {
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
            }
          };

          return (
            <FormItem className="space-y-2">
              <FormLabel>{t("phoneNumber")}</FormLabel>
              <FormControl>
                <PhoneInput
                  {...field}
                  onChange={handlePhoneChange}
                  disabled={isDisabled}
                  defaultCountry={currentCountry}
                  international={false}
                  className="bg-primary-light border-input-border h-12 items-center rounded-lg border border-solid  placeholder:text-[#525C4E]"
                  countrySelectProps={{
                    className:
                      "bg-primary-light border border-solid border-input-border rounded-s-md",
                    disabled: isDisabled,
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
        disabled={isDisabled}
        type="number"
        label={t("yearsOfExperience")}
        className="border-input-border rounded-lg border border-solid"
        min={0}
      />
    </div>
  );
}

function WorkTypeSection({ isDisabled }: { isDisabled: boolean }) {
  const t = useTranslations("dashboard.inviteManager");
  const { control, watch, setValue } =
    useFormContext<CompleteInviteManagerFormData>();
  const selectedWorkType = watch("workType");

  const workTypeOptions = [
    { value: "FullTime", label: t("fullTime") },
    { value: "Contractor", label: t("contractor") },
  ];

  const handleWorkTypeSelect = (value: string) => {
    if (!isDisabled) {
      setValue("workType", value, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Working type
      </p>
      <p className="text-muted-foreground text-md text-start">
        {t("workType")}
      </p>
      <FormField
        control={control}
        name="workType"
        render={() => (
          <FormItem>
            <RadioGroup
              value={selectedWorkType}
              onValueChange={handleWorkTypeSelect}
              disabled={isDisabled}
            >
              {workTypeOptions.map((option) => (
                <RadioGroupItem
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  selected={selectedWorkType === option.value}
                  disabled={isDisabled}
                  onClick={() => handleWorkTypeSelect(option.value)}
                  itemClassName="bg-transparent border border-solid border-input-border"
                  unselectedRadioClass="border-gray-300"
                />
              ))}
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function WorkPayTypeSection({ isDisabled }: { isDisabled: boolean }) {
  const t = useTranslations("dashboard.inviteManager");
  const { control, watch, setValue } =
    useFormContext<CompleteInviteManagerFormData>();
  const selectedWorkPayType = watch("workPayType");

  const workPayOptions = [
    { value: "Payroll", label: t("payroll") },
    { value: "EquityYield", label: t("equityYield") },
    { value: "Hybrid", label: t("hybrid") },
  ];

  const handleWorkPaySelect = (value: string) => {
    if (!isDisabled) {
      setValue("workPayType", value, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Payment type
      </p>
      <p className="text-muted-foreground text-md text-start ">
        {t("workPayType")}
      </p>
      <FormField
        control={control}
        name="workPayType"
        render={() => (
          <FormItem>
            <RadioGroup
              value={selectedWorkPayType}
              onValueChange={handleWorkPaySelect}
              disabled={isDisabled}
            >
              {workPayOptions.map((option) => (
                <RadioGroupItem
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  selected={selectedWorkPayType === option.value}
                  disabled={isDisabled}
                  onClick={() => handleWorkPaySelect(option.value)}
                  itemClassName="bg-transparent border border-solid border-input-border"
                  unselectedRadioClass="border-gray-300"
                />
              ))}
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// Form Action Buttons Component
function FormActionButtons({
  isSubmitting,
  isLoading,
  formState,
  isDraft,
  setIsDraft,
}: {
  isSubmitting: boolean;
  isLoading?: boolean;
  formState: any;
  isDraft: boolean;
  setIsDraft: (value: boolean) => void;
}) {
  const tCommon = useTranslations("common");
  const isDisabled = isSubmitting || isLoading || !formState.isValid;

  return (
    <div className="mt-8 space-y-4">
      <Button
        type="submit"
        className="w-full rounded-xl"
        disabled={isDisabled}
        onClick={() => setIsDraft(false)}
      >
        {isSubmitting && !isDraft ? tCommon("processing") : "Send"}
        <ChevronRight className="ml-2 size-4" />
      </Button>

      <Button
        type="submit"
        onClick={() => setIsDraft(true)}
        disabled={isDisabled}
        className="bg-input text-primary-darkest hover:bg-muted w-full rounded-xl"
      >
        {isSubmitting && isDraft ? tCommon("processing") : "Save and Close"}
        <ChevronRight className="ml-2 size-4" />
      </Button>
    </div>
  );
}

export function DraftInviteManagerForm() {
  const { handleError } = useLocalizedErrorHandler();
  const { userId: authUserId } = useAuthUser();
  const api = useApiClient();
  const e = useTranslations("auth.errors");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const farmManagerId = searchParams.get("id");
  const queryClient = useQueryClient();

  const { data: farmManager, isLoading } = api.useQuery(
    "get",
    "/users/farm-manager",
    {
      params: {
        query: { FarmManagerId: farmManagerId ?? "", FarmOwnerId: authUserId! },
      },
    },
    {
      enabled: !!farmManagerId && !!authUserId,
      refetchOnMount: "always",
      staleTime: 0,
    },
  );

  const getDefaultValues = () => {
    if (!farmManager?.farmManagerDetails) {
      return {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        yearsOfExperience: 0,
        workType: "",
        workPayType: "",
      };
    }

    const manager = farmManager.farmManagerDetails.farmManager;
    const contract = farmManager.farmManagerDetails.contract;

    return {
      firstName: manager?.firstName || "",
      lastName: manager?.lastName || "",
      email: manager?.emailAddress || "",
      phone: formatPhoneToE164(manager?.phoneNumber) || "",
      yearsOfExperience: manager?.experienceYears || 0,
      workType: contract?.contractType || "",
      workPayType: contract?.paymentType || "",
    };
  };

  const methods = useForm<CompleteInviteManagerFormData>({
    resolver: zodResolver(CompleteInviteManagerSchema),
    defaultValues: getDefaultValues(),
    mode: "onChange",
    values: farmManager ? getDefaultValues() : undefined,
  });

  const { handleSubmit, formState } = methods;

  const persistContractAndUserInfo = async (
    data: CompleteInviteManagerFormData,
  ) => {
    const contractId = farmManager?.farmManagerDetails?.contract?.id;
    const managerId = farmManager?.farmManagerDetails?.farmManager?.id;

    const { error: contractUpdateError } = await api.client.PUT(
      "/farm-management/contracts/draft",
      {
        body: {
          contractId: contractId ?? "",
          rawContractType: data.workType,
          rawPaymentType: data.workPayType,
        },
      },
    );

    if (contractUpdateError) {
      handleError("update contract fail", e("failedToUpdateContract"));
      return false;
    }

    if (managerId) {
      const { error: userUpdateError } = await api.client.PUT(
        "/users/{UserId}",
        {
          params: { path: { UserId: managerId } },
          body: {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phone,
            yearsOfExperience: data.yearsOfExperience,
          },
        },
      );

      if (userUpdateError) {
        handleError("fail to update manager", e("failToUpdateManagerDetails"));
        return false;
      }
    }

    return true;
  };

  const handleFormSubmit = async (data: CompleteInviteManagerFormData) => {
    setIsSubmitting(true);
    const contractId = farmManager?.farmManagerDetails?.contract?.id;
    const currentPhone =
      farmManager?.farmManagerDetails?.farmManager?.phoneNumber;

    try {
      const { data: phoneData, error: phoneError } = await api.client.GET(
        "/users/check-phone-number-exists",
        { params: { query: { PhoneNumber: data.phone } } },
      );

      if (
        (phoneError || phoneData.exists) &&
        data.phone !== formatPhoneToE164(currentPhone)
      ) {
        handleError(
          "phone number already exists",
          e("invitation_number_exists"),
        );
        return;
      }

      const persisted = await persistContractAndUserInfo(data);
      if (!persisted) return;

      if (isDraft) {
        showSuccessToast("Draft saved successfully!");
        await queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/users/farm-manager",
            {
              params: {
                query: {
                  FarmManagerId: farmManagerId ?? "",
                  FarmOwnerId: authUserId!,
                },
              },
            },
          ],
        });
        await queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/users/farm-managers/{FarmOwnerId}",
            {
              params: {
                path: { FarmOwnerId: authUserId! },
              },
            },
          ],
        });
        router.push("/farm-owner/farm-managers");
      } else {
        const { error: activateError } = await api.client.POST(
          "/farm-management/contracts/activate",
          { body: { contractId: contractId ?? "" } },
        );

        if (activateError) {
          handleError("invite fail", e("inviteFail"));
          return;
        }

        showSuccessToast("Manager invited successfully!");
        router.push("/farm-owner/invite-farm-manager/invite-complete");
      }
    } catch (error) {
      logger.error("Failed to invite manager", { error });
      handleError("Unexpected error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || isLoading;

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:items-center md:justify-center md:px-6 md:pt-0 lg:px-8">
        <div className="mx-auto w-full max-w-sm md:max-w-lg lg:max-w-2xl">
          <DraftInviteManagerFormSkeleton />
        </div>
      </div>
    );
  }
  return (
    <div className="mb-16 space-y-6 rounded-2xl bg-white p-6 xl:mb-0">
      <FormProvider {...methods}>
        <Form {...methods}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <h1 className="text-start text-lg font-semibold">
              Personal details
            </h1>
            <PersonalInformationSection isDisabled={isFormDisabled} />
            <WorkTypeSection isDisabled={isFormDisabled} />
            <WorkPayTypeSection isDisabled={isFormDisabled} />
            <FormActionButtons
              isSubmitting={isSubmitting}
              isLoading={isLoading}
              formState={formState}
              isDraft={isDraft}
              setIsDraft={setIsDraft}
            />
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
