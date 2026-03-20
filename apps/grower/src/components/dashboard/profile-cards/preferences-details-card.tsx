/* eslint-disable max-lines-per-function */
"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from "@cf/ui";
import { Form, FormField, FormLabel } from "@cf/ui/components/form";
import { Spinner } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Edit, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import {
  experienceLabelToValue,
  getCropDisplayName,
  getFarmingExperienceLabel,
  getFarmingMethodLabel,
} from "@/utils/mapping-helper";

import { AccountStatusCard } from "./account-status-card";

// Schema for preferences form
const preferencesSchema = z.object({
  farmingExperience: z.string().optional(),
  farmingLevel: z.string().optional(),
  farmingMethod: z.string().optional(),
  cropCultivated: z.array(z.string()).optional(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;
interface PreferencesProps {
  farmingExperience?: string;
  farmingLevel?: string;
  farmingMethod?: string;
  cropCultivated?: string[];
  accountStatus?:
    | "Fully Compliant"
    | "Partially Compliant"
    | "Non-Compliant"
    | "";
  userId: string;
  onSave?: (data: PreferencesFormData) => void;
}

export default function PreferencesCard({
  farmingExperience = "",
  farmingLevel = "",
  farmingMethod = "",
  cropCultivated = [],
  userId,
}: PreferencesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherCropValue, setOtherCropValue] = useState("");
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { userId: authUserId } = useAuthUser();
  const tCrops = useTranslations("onboarding.experienced.current-crops");
  const t = useTranslations("onboarding.experienced.farming-level");
  // const router = useRouter();
  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      farmingExperience,
      farmingLevel:
        farmingExperience === "newbie" ? "lessThanOneYear" : farmingLevel,
      farmingMethod,
      cropCultivated: cropCultivated?.map((c) => c.toLowerCase()) || [],
    },
    mode: "onChange",
  });

  const { control, handleSubmit, reset, watch } = form;
  const watchedFarmingExperience = watch("farmingExperience");
  const isFarmingLevelDisabled = watchedFarmingExperience === "newbie";

  const updatePreferencesMutation = api.useMutation(
    "put",
    "/onboarding/responses",
  );

  const startOnboardingMutation = api.useMutation("post", "/onboarding/start");

  const handleSave = async (data: PreferencesFormData) => {
    setIsLoading(true);

    const updatePayload = {
      body: {
        userId: authUserId ?? userId,
        responses: {
          data: {
            farmingMethod: data.farmingMethod || "",
            cropCultivated: data.cropCultivated || [],
            farmingLevel: data.farmingLevel || "",
          },
          farmingExperience: data.farmingExperience || "",
        },
      },
    };

    updatePreferencesMutation.mutate(updatePayload, {
      onSuccess: () => {
        showSuccessToast("Preferences updated successfully!");
        setIsEditing(false);
        setIsLoading(false);
        void queryClient.invalidateQueries({
          queryKey: ["get", "/onboarding/{userId}/responses"],
        });

        void queryClient.invalidateQueries({
          queryKey: ["get", "/users/get-by-id"],
        });
      },
      onError: (error: any) => {
        if (error?.errors?.[0]?.code === "USER_ONBOARDING_PROFILE_NOT_FOUND") {
          startOnboardingMutation.mutate(
            {
              body: {
                userId: authUserId ?? userId,
              },
            },
            {
              onSuccess: () => {
                updatePreferencesMutation.mutate(updatePayload, {
                  onSuccess: () => {
                    showSuccessToast("Preferences updated successfully!");
                    setIsEditing(false);
                    setIsLoading(false);
                    void queryClient.invalidateQueries({
                      queryKey: ["get", "/onboarding/{userId}/responses"],
                    });

                    void queryClient.invalidateQueries({
                      queryKey: ["get", "/users/get-by-id"],
                    });
                  },
                  onError: () => {
                    showErrorToast(
                      "Failed to update preferences. Please try again.",
                    );
                    setIsLoading(false);
                  },
                });
              },
              onError: () => {
                showErrorToast(
                  "Failed to initialize profile. Please try again.",
                );
                setIsLoading(false);
              },
            },
          );
        } else {
          showErrorToast("Failed to update preferences. Please try again.");
          setIsLoading(false);
        }
      },
    });
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };
  const crops = [
    { value: "ginger", label: tCrops("options.ginger") },
    { value: "cowpea", label: tCrops("options.cowpea") },
    { value: "chilli-pepper", label: tCrops("options.chilli-pepper") },
    { value: "maize", label: tCrops("options.maize") },
    { value: "soybean", label: tCrops("options.soybean") },
    { value: "pineapple", label: tCrops("options.pineapple") },
    { value: "mango", label: tCrops("options.mango") },
    { value: "cassava", label: tCrops("options.cassava") },
    { value: "sesame", label: tCrops("options.sesame") },
    { value: "groundnut", label: tCrops("options.groundnut") },
    { value: "sweet-potatoes", label: tCrops("options.sweet-potatoes") },
    { value: "other", label: tCrops("options.other") },
  ];

  const farmingOptions = [
    {
      label: "Green House",
      value: "greenhouse",
    },
    {
      label: "Open field farming",
      value: "openfield",
    },
    { label: "I'm not sure ", value: "notSure" },
  ];
  const farmingLevelOptions = [
    { value: "lessThanOneYear", label: t("options.less_than_1_year") },
    { value: "oneToThreeYears", label: t("options.1-3_years") },
    { value: "fourToSevenYears", label: t("options.4-7_years") },
    { value: "moreThanEightYears", label: t("options.8+_years") },
  ];

  return (
    <Card className="w-full rounded-3xl border-none bg-white p-2">
      {/* Preferences Card */}
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-md font-semibold leading-none">Preferences</h2>
          {isEditing ? (
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="unstyled"
                className="p-0 leading-none text-primary"
                onClick={handleSubmit(handleSave)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner className="size-4" />
                ) : (
                  <Check className="size-4" />
                )}
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="unstyled"
                className="text-destructive"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="size-4" />
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              <Edit className="mr-1 size-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!isEditing ? (
          <>
            <div className="space-y-4 sm:hidden">
              <div className="flex items-center justify-between">
                <p className="text-md shrink-0 text-gray-dark">
                  Farming experience
                </p>
                <p className=" text-md shrink-0">
                  {getFarmingExperienceLabel(farmingExperience) || "-"}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-md shrink-0 text-gray-dark">Farming level</p>
                <p className=" text-md shrink-0">
                  {experienceLabelToValue(farmingLevel) || "-"}
                </p>
              </div>

              <div className="flex items-start justify-between">
                <p className="text-md shrink-0 text-gray-dark">
                  Crops cultivated
                </p>
                <div className="flex flex-wrap justify-end gap-1">
                  {cropCultivated.map((crop, index) => (
                    <span
                      key={index}
                      className="border-gray rounded-full border border-dotted px-3 py-1 text-sm"
                    >
                      {getCropDisplayName(crop) || "-"}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-md shrink-0 text-gray-dark">
                  Farming method
                </p>
                <p className="text-md shrink-0">
                  {getFarmingMethodLabel(farmingMethod) || "-"}
                </p>
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-md shrink-0 text-gray-dark">
                        Farming experience
                      </p>
                      <p className=" text-md shrink-0">
                        {getFarmingExperienceLabel(farmingExperience) || "-"}
                      </p>
                    </div>

                    {/* Crops Section - directly under Farming experience */}
                    <div>
                      <p className="text-md mb-2 shrink-0 text-gray-dark">
                        Crops cultivated
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cropCultivated.map((crop, index) => (
                          <span
                            key={index}
                            className="border-gray rounded-full border border-dotted px-3 py-1 text-sm"
                          >
                            {getCropDisplayName(crop)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-md shrink-0 text-gray-dark">
                        Farming level
                      </p>
                      <p className="text-md shrink-0">
                        {" "}
                        {experienceLabelToValue(farmingLevel) || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-md shrink-0 text-gray-dark">
                        Farming method
                      </p>
                      <p className="text-md shrink-0">
                        {getFarmingMethodLabel(farmingMethod) || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleSave)}
              className="w-full space-y-6"
            >
              <FormField
                control={control}
                name="farmingExperience"
                render={({ field }) => (
                  <div>
                    <FormLabel>Farming experience</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-12 w-full items-center justify-between rounded-lg border border-input-border bg-userDropdown-background p-3 text-sm text-input-placeholder"
                        >
                          {field.value
                            ? field.value === "experienced"
                              ? "Experienced"
                              : "Newbie"
                            : "Select your experience"}
                          <ChevronDown className="ml-2 size-5 text-black" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto rounded-2xl border-none bg-white p-3 shadow-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            field.onChange("newbie");
                            form.setValue("farmingLevel", "lessThanOneYear");
                          }}
                          className="hover:none mb-2 cursor-pointer rounded-xl bg-userDropdown-background p-3 "
                        >
                          Newbie
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            field.onChange("experienced");
                            form.setValue("farmingLevel", farmingLevel);
                          }}
                          className="hover:none cursor-pointer rounded-xl bg-userDropdown-background p-3"
                        >
                          Experienced
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              />

              <FormField
                control={control}
                name="farmingLevel"
                render={({ field }) => (
                  <div>
                    <FormLabel
                      className={isFarmingLevelDisabled ? "opacity-50" : ""}
                    >
                      Farming level
                    </FormLabel>
                    {isFarmingLevelDisabled ? (
                      <button
                        type="button"
                        disabled
                        className="flex h-12 w-full items-center justify-between rounded-lg border border-input-border bg-userDropdown-background p-3 text-sm text-input-placeholder disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Less than 1 year
                        <ChevronDown className="ml-2 size-5 text-black" />
                      </button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-12 w-full items-center justify-between rounded-lg border border-input-border bg-userDropdown-background p-3 text-sm text-input-placeholder"
                          >
                            {field.value
                              ? farmingLevelOptions.find(
                                  (option) => option.value === field.value,
                                )?.label || field.value
                              : "Select number of years"}
                            <ChevronDown className="ml-2 size-5 text-black" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto rounded-2xl border-none bg-white p-3 shadow-xl"
                        >
                          {farmingLevelOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => field.onChange(option.value)}
                              className="hover:none mb-2 cursor-pointer rounded-xl bg-userDropdown-background p-3"
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )}
              />

              <FormField
                control={control}
                name="cropCultivated"
                render={({ field }) => {
                  const selectedCrops = field.value || [];
                  const displayedCrops = selectedCrops.slice(0, 2);
                  const remainingCount = selectedCrops.length - 2;

                  const getDisplayText = () => {
                    if (selectedCrops.length === 0) {
                      return "Select the crop";
                    }

                    const displayNames = displayedCrops.map(
                      (cropValue) =>
                        crops.find((crop) => crop.value === cropValue)?.label ||
                        cropValue,
                    );

                    if (remainingCount > 0) {
                      return `${displayNames.join(", ")} +${remainingCount} more`;
                    }

                    return displayNames.join(", ");
                  };

                  const handleOtherCheckboxChange = (checked: boolean) => {
                    setShowOtherInput(checked);
                    if (!checked) {
                      setOtherCropValue("");
                    }
                  };

                  const handleSaveOtherCrop = () => {
                    if (otherCropValue.trim()) {
                      const customCrop = otherCropValue.trim().toLowerCase();
                      if (!selectedCrops.includes(customCrop)) {
                        field.onChange([...selectedCrops, customCrop]);
                      }
                      setOtherCropValue("");
                      setShowOtherInput(false);
                    }
                  };

                  const handleCropToggle = (
                    cropValue: string,
                    checked: boolean,
                  ) => {
                    if (checked) {
                      if (!selectedCrops.includes(cropValue)) {
                        field.onChange([...selectedCrops, cropValue]);
                      }
                    } else {
                      const updatedCrops = selectedCrops.filter(
                        (crop) => crop !== cropValue,
                      );
                      field.onChange(updatedCrops);
                    }
                  };

                  return (
                    <div>
                      <FormLabel>Crops cultivated</FormLabel>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-lg border border-input-border bg-userDropdown-background p-3 text-sm text-input-placeholder"
                          >
                            <span className="text-input-placeholder">
                              {getDisplayText()}
                            </span>
                            <ChevronDown className="ml-2 size-5 shrink-0 text-black" />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="start"
                          className="max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto rounded-2xl border-none bg-white p-3 shadow-xl"
                        >
                          {crops
                            .filter((crop) => crop.value !== "other")
                            .map((crop) => (
                              <div
                                key={crop.value}
                                className="mb-2 cursor-pointer rounded-xl bg-userDropdown-background p-3"
                              >
                                <label className="flex cursor-pointer items-center">
                                  <Checkbox
                                    checked={selectedCrops.includes(crop.value)}
                                    onCheckedChange={(checked) =>
                                      handleCropToggle(crop.value, !!checked)
                                    }
                                    className="mr-3 size-4 rounded border-gray-300 bg-white text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
                                  />
                                  <span className="text-sm">{crop.label}</span>
                                </label>
                              </div>
                            ))}

                          {/* Display custom crops that have been added */}
                          {selectedCrops
                            .filter(
                              (crop) => !crops.some((c) => c.value === crop),
                            )
                            .map((customCrop) => (
                              <div
                                key={customCrop}
                                className="mb-2 cursor-pointer rounded-xl bg-userDropdown-background p-3"
                              >
                                <label className="flex cursor-pointer items-center">
                                  <Checkbox
                                    checked={true}
                                    onCheckedChange={(checked) =>
                                      handleCropToggle(customCrop, !!checked)
                                    }
                                    className="mr-3 size-4 rounded border-gray-300 text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
                                  />
                                  <span className="text-sm capitalize">
                                    {customCrop}
                                  </span>
                                </label>
                              </div>
                            ))}

                          {/* Other option */}
                          <div className="mb-2 cursor-pointer rounded-xl bg-userDropdown-background p-3">
                            <label
                              htmlFor="other-crop-checkbox"
                              className="flex cursor-pointer items-center"
                            >
                              <Checkbox
                                id="other-crop-checkbox"
                                checked={showOtherInput}
                                onCheckedChange={handleOtherCheckboxChange}
                                className="mr-3 size-4 rounded border-gray-300 bg-white text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
                              />
                              <span className="text-sm">Other</span>
                            </label>
                          </div>

                          {/* Other input field */}
                          {showOtherInput && (
                            <div className=" mb-2 rounded-xl p-3">
                              <h3 className="mb-2 text-sm font-semibold">
                                Other
                              </h3>
                              <Input
                                type="text"
                                value={otherCropValue}
                                onChange={(e) =>
                                  setOtherCropValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveOtherCrop();
                                  }
                                }}
                                placeholder="Enter other option"
                                className="h-10 w-full rounded-lg border border-input-border bg-userDropdown-background p-2 text-sm text-input-placeholder focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                              <div className="mt-2 flex justify-end gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={handleSaveOtherCrop}
                                  disabled={!otherCropValue.trim()}
                                  className="rounded-lg bg-primary px-4 py-1 text-sm text-white  disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                }}
              />
              <FormField
                control={control}
                name="farmingMethod"
                render={({ field }) => (
                  <div>
                    <FormLabel>Farming method</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-12 w-full items-center justify-between rounded-lg border border-input-border bg-userDropdown-background p-3 text-sm text-input-placeholder"
                        >
                          {field.value
                            ? farmingOptions.find(
                                (option) => option.value === field.value,
                              )?.label
                            : "Select farming method"}
                          <ChevronDown className="ml-2 size-5 text-black" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto rounded-2xl border-none bg-white p-3 shadow-xl"
                      >
                        {farmingOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => {
                              if (option.value !== "greenhouse") {
                                field.onChange(option.value);
                              }
                            }}
                            className={`${
                              option.value === "greenhouse"
                                ? "cursor-not-allowed bg-userDropdown-background opacity-60"
                                : "cursor-pointer bg-userDropdown-background"
                            } relative mb-2 rounded-xl p-4`}
                            disabled={option.value === "greenhouse"}
                          >
                            {option.value === "greenhouse" && (
                              <span className="absolute right-1 top-1 rounded-full bg-blue-semi px-2 py-1 text-xs font-medium text-white">
                                Coming Soon
                              </span>
                            )}
                            <span className="greenhouse text-sm">
                              {option.label}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              />
            </form>
          </Form>
        )}
      </CardContent>
      {/* Account Status Card */}
      <div className="p-4">
        <AccountStatusCard />
      </div>
    </Card>
  );
}
