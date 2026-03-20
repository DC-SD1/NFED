/* eslint-disable max-lines-per-function */
"use client";

import type { paths } from "@cf/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cf/ui";
import { Form, FormField, FormInput, FormLabel } from "@cf/ui/components/form";
import { FormDateInput } from "@cf/ui/components/form-date-time";
import { Spinner } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Edit, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useApiClient } from "@/lib/api";
import { logger } from "@/lib/logger";
import type { PersonalDetailsFormData } from "@/lib/schemas/farm-manager-details";
import { personalDetailsSchema } from "@/lib/schemas/farm-manager-details";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useModal } from "@/lib/stores/use-modal";
import { formatDateShort, formatPhoneToE164 } from "@/lib/utils/string-helpers";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import { educationLevelMap } from "@/utils/mapping-helper";

interface ProfileCardProps {
  farmOwner: paths["/users/get-by-id"]["get"]["responses"]["200"]["content"]["application/json"];
  educationLevel: string;
  onSuccess?: () => void;
}

// Create a modified schema that makes phoneNumber optional
const createModifiedSchema = () => {
  const baseSchema = personalDetailsSchema();

  return baseSchema.extend({
    phoneNumber: z.string().optional(),
  });
};

export default function PersonalDetailsCard({
  farmOwner,
  educationLevel,
}: ProfileCardProps) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { userId } = useAuthUser();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { onOpen } = useModal();

  const form = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(createModifiedSchema()),
    defaultValues: {
      email: farmOwner?.emailAddress || "",
      firstName: farmOwner?.firstName || "",
      lastName: farmOwner?.lastName || "",
      yearsOfExperience: farmOwner?.yearsOfExperience || 0,
      dateOfBirth: formatDateShort(farmOwner?.dateOfBirth || ""),
      idNumber: farmOwner?.idNumber || "",
      gender: farmOwner?.gender
        ? ((farmOwner.gender.charAt(0).toUpperCase() +
            farmOwner.gender.slice(1).toLowerCase()) as
            | "Male"
            | "Female"
            | "Other")
        : undefined,
      phoneNumber: formatPhoneToE164(farmOwner?.phoneNumber) || "",
      levelOfEducation: educationLevel as
        | "noFormal"
        | "basic"
        | "secondary"
        | "tertiary"
        | "bachelors"
        | "masters"
        | null
        | undefined,
    },
    mode: "onChange",
  });

  const { control } = form;

  const updateFarmManager = api.useMutation("put", "/users/{UserId}");
  const updateEducationLevel = api.useMutation("put", "/onboarding/responses");

  const handleSave = (data: PersonalDetailsFormData) => {
    setIsLoading(true);

    if (!userId) {
      showErrorToast("Unable to update profile: Farm manager ID not found.");
      setIsLoading(false);
      return;
    }

    const currentEducationLevel = educationLevel;
    const newEducationLevel = data.levelOfEducation;
    const hasEducationLevelChanged =
      currentEducationLevel !== newEducationLevel;

    updateFarmManager.mutate(
      {
        params: { path: { UserId: userId } },
        body: {
          country: farmOwner?.country,
          region: farmOwner?.region,
          village: farmOwner?.village,
          dateOfBirth: data.dateOfBirth?.trim() || undefined,
          firstName: data.firstName?.trim(),
          gender: data.gender || undefined,
          idNumber: data.idNumber?.trim() || undefined,
          lastName: data.lastName?.trim(),
          phoneNumber: formatPhoneToE164(data.phoneNumber) || undefined,
          yearsOfExperience: data.yearsOfExperience,
        },
      },
      {
        onSuccess: () => {
          showSuccessToast("Farm manager profile updated successfully!");
          setIsEditing(false);
          setIsLoading(false);
          void queryClient.invalidateQueries({
            queryKey: ["get", "/users/get-by-id"],
          });
          if (hasEducationLevelChanged && newEducationLevel) {
            updateEducationLevel.mutate(
              {
                body: {
                  userId: userId,
                  responses: {
                    educationLevel: newEducationLevel,
                  },
                },
              },
              {
                onSuccess: () => {
                  void queryClient.invalidateQueries({
                    queryKey: ["get", "/onboarding/{userId}/responses"],
                  });
                },
                onError: () => {
                  showErrorToast(
                    "Profile updated, but failed to update education level preferences.",
                  );
                },
              },
            );
          }
        },
        onError: (error) => {
          logger.error("Failed to update farm manager profile:", error);
          showErrorToast("Failed to update profile. Please try again.");
          setIsLoading(false);
        },
      },
    );
  };

  const handleUpdateContactNumber = () => {
    setIsEditing(false);
    onOpen("UpdatePhoneNumber", {
      phoneNumber: farmOwner?.phoneNumber || "",
      numberChangeReason: "",
      emailAddress: farmOwner?.emailAddress || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  const genderOptions = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  const educationOptions = [
    { label: "No Formal", value: "noFormal" },
    { label: "Basic", value: "basic" },
    { label: "Secondary", value: "secondary" },
    { label: "Tertiary", value: "tertiary" },
    { label: "Bachelors", value: "bachelors" },
    { label: "Masters", value: "masters" },
  ];

  return (
    <Card className="w-full rounded-3xl border-none bg-white p-2">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-md font-semibold leading-none">
            Personal details
          </h2>
          {!isEditing ? (
            <Button
              variant="unstyled"
              size="sm"
              className="text-primary p-0 leading-none"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-1 size-4" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="unstyled"
                className="text-primary p-0 leading-none"
                onClick={(e) => {
                  e.preventDefault();
                  const formData = form.getValues();
                  handleSave(formData);
                }}
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
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!isEditing ? (
          <div className="space-y-1 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
            {[
              { label: "First name", value: farmOwner?.firstName || "" },
              { label: "Last name", value: farmOwner?.lastName || "" },
              {
                label: "Date of birth",
                value: formatDateShort(farmOwner?.dateOfBirth || ""),
                placeholder: "DD/MM/YYYY",
              },
              { label: "ID number", value: farmOwner?.idNumber },
              { label: "Gender", value: farmOwner?.gender },
              {
                label: "Level of education",
                value: educationLevelMap[educationLevel] ?? "N/A",
              },
              {
                label: "Email",
                value: farmOwner?.emailAddress,
                isEmail: true,
              },
              { label: "Contact number", value: farmOwner?.phoneNumber },
            ].map(({ label, value, placeholder, isEmail }) => (
              <div
                key={label}
                className="flex items-start justify-between md:block"
              >
                <label className="text-gray-dark text-md shrink-0">
                  {label}
                </label>

                <p
                  className={cn(
                    "mt-0.5 font-thin md:mt-1",
                    isEmail && [
                      "max-w-[220px]",
                      "break-all",
                      "text-md",
                      "md:max-w-none",
                    ],
                  )}
                >
                  {value || placeholder || "N/A"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <Form {...form}>
            <div className="w-full space-y-6">
              <FormInput
                name="firstName"
                label="First name"
                className="bg-userDropdown-background  border-input-border rounded-lg border border-solid"
              />
              <FormInput
                name="lastName"
                label="Last name"
                className="border-input-border bg-userDropdown-background rounded-lg border border-solid "
              />
              <FormDateInput
                name="dateOfBirth"
                control={control}
                label="Date of birth"
                className="border-none"
                bgColor="bg-userDropdown-background "
              />
              <FormInput
                name="idNumber"
                label="ID number"
                className=" bg-userDropdown-background border-input-border rounded-lg border border-solid"
              />

              <FormField
                control={control}
                name="gender"
                render={({ field }) => (
                  <div>
                    <FormLabel>Gender</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="border-input-border bg-userDropdown-background text-input-placeholder flex h-12 w-full items-center justify-between rounded-lg border p-3 text-sm"
                        >
                          <span
                            className={
                              field.value
                                ? "text-black"
                                : "text-input-placeholder"
                            }
                          >
                            {field.value || "Add gender"}
                          </span>
                          <ChevronDown className="ml-2 size-5 shrink-0 text-black" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto rounded-2xl border-none bg-white p-3 shadow-xl"
                      >
                        {genderOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => field.onChange(option.value)}
                            className="bg-userDropdown-background hover:none mb-2 cursor-pointer rounded-xl p-3 "
                          >
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              />

              <FormField
                control={control}
                name="levelOfEducation"
                render={({ field }) => (
                  <div>
                    <FormLabel>Level of education</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="border-input-border bg-userDropdown-background text-input-placeholder flex h-12 w-full items-center justify-between rounded-lg border p-3 text-sm"
                        >
                          <span
                            className={
                              field.value
                                ? "text-black"
                                : "text-input-placeholder"
                            }
                          >
                            {field.value
                              ? educationOptions.find(
                                  (option) => option.value === field.value,
                                )?.label
                              : "Select the level of education"}
                          </span>
                          <ChevronDown className="ml-2 size-5 shrink-0 text-black" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto rounded-2xl border-none bg-white p-3 shadow-xl"
                      >
                        {educationOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => field.onChange(option.value)}
                            className="bg-userDropdown-background hover:none mb-2 cursor-pointer rounded-xl p-3 "
                          >
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              />
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex flex-col items-start md:block">
                <span className="text-gray-dark text-md shrink-0">Email</span>
                <p
                  className={cn(
                    "mt-0.5 font-thin md:mt-1",
                    "text-md max-w-[220px] break-all md:max-w-none",
                  )}
                >
                  {farmOwner?.emailAddress || "N/A"}
                </p>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-gray-dark text-md shrink-0">
                    Contact number
                  </span>
                  <p className="mt-0.5 font-thin md:mt-1">
                    {farmOwner?.phoneNumber || "N/A"}
                  </p>
                </div>
                <Button
                  variant="unstyled"
                  size="sm"
                  className="text-primary p-0 text-sm leading-none"
                  onClick={() => handleUpdateContactNumber()}
                >
                  <Edit className="mr-1 size-4" />
                  Request to update
                </Button>
              </div>
            </div>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
