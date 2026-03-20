"use client";

import { Button, Card, CardContent, CardHeader, cn } from "@cf/ui";
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui/components/form";
import { FormDateInput } from "@cf/ui/components/form-date-time";
import { FormSelectInput } from "@cf/ui/components/form-select-input";
import { PhoneInput } from "@cf/ui/components/phone-input";
import { Spinner } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Edit, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Country } from "react-phone-number-input";
import { parsePhoneNumber } from "react-phone-number-input";

import { useApiClient } from "@/lib/api";
import type { PersonalDetailsFormData } from "@/lib/schemas/farm-manager-details";
import { personalDetailsSchema } from "@/lib/schemas/farm-manager-details";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

interface PersonalDetailsData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  idNumber: string;
  gender: string;
  yearsOfExperience: number;
  email: string;
  contactNumber: string;
  userId: string;
  onSuccess?: () => void;
}

export default function PersonalDetailsCard(props: PersonalDetailsData) {
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

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("dashboard.inviteManager");
  const api = useApiClient();
  const [currentCountry, setCurrentCountry] = useState<Country>(
    getCountryFromPhone(props.contactNumber),
  );

  const form = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema()),
    defaultValues: {
      email: props.email,
      firstName: props.firstName,
      lastName: props.lastName,
      yearsOfExperience: props.yearsOfExperience,
      dateOfBirth: props.dateOfBirth || "",
      idNumber: props.idNumber || "",
      gender:
        props.gender && props.gender !== ""
          ? ((props.gender.charAt(0).toUpperCase() +
              props.gender.slice(1).toLowerCase()) as
              | "Male"
              | "Female"
              | "Other")
          : undefined,
      phoneNumber: props.contactNumber || "",
    },
    mode: "onChange",
  });

  const { control, handleSubmit } = form;

  const updateUser = api.useMutation("put", "/users/{UserId}");

  const handleSave = (data: PersonalDetailsFormData) => {
    setIsLoading(true);

    // Clean up the data before sending
    const cleanedData = {
      ...data,
      dateOfBirth: data.dateOfBirth?.trim() || undefined,
      idNumber: data.idNumber?.trim() || undefined,
      contactNumber: data.phoneNumber?.trim() || undefined,
      gender: data.gender || undefined,
    };

    updateUser.mutate(
      { params: { path: { UserId: props.userId } }, body: cleanedData },
      {
        onSuccess: () => {
          showSuccessToast("Your profile was updated successfully!");
          setIsEditing(false);
          setIsLoading(false);
          props.onSuccess?.();
        },
        onError: () => {
          showErrorToast("Failed to update your profile. Please try again.");
          setIsLoading(false);
        },
      },
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  return (
    <Card className="w-full rounded-3xl border-none bg-white p-3">
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
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!isEditing ? (
          <div className="space-y-1 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
            {[
              { label: "First name", value: props.firstName },
              { label: "Last name", value: props.lastName },
              {
                label: "Date of birth",
                value: props.dateOfBirth,
                placeholder: "DD/MM/YYYY",
              },
              { label: "ID number", value: props.idNumber },
              { label: "Gender", value: props.gender },
              { label: "Years of experience", value: props.yearsOfExperience },
              { label: "Email", value: props.email, isEmail: true },
              { label: "Contact number", value: props.contactNumber },
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
                      "break-all", // Only break-all, no contradicting break-words
                      "text-sm",
                      "text-gray-800",
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
            <form
              className="w-full space-y-6"
              onSubmit={handleSubmit(handleSave)}
            >
              <FormInput
                name="firstName"
                label="First name"
                className="border-input-border rounded-lg border border-solid"
              />
              <FormInput
                name="lastName"
                label="Last name"
                className="border-input-border rounded-lg border border-solid"
              />
              <FormDateInput
                name="dateOfBirth"
                control={control}
                label="Date of birth"
                className="border-none"
              />
              <FormInput
                name="idNumber"
                label="ID number"
                className="border-input-border rounded-lg border border-solid"
              />
              <FormSelectInput
                name="gender"
                className="border-input-border bg-primary-light h-12 w-full rounded-lg border p-3 text-left text-sm"
                border
                label="Gender"
                placeholder="Add gender"
                options={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                  { label: "Other", value: "Other" },
                ]}
              />
              <FormInput
                name="yearsOfExperience"
                type="number"
                label="Years of experience"
                className="border-input-border rounded-lg border border-solid"
              />
              <FormInput
                name="email"
                disabled
                type="email"
                label="Email"
                className="border-input-border rounded-lg border border-solid"
              />
              <FormField
                control={control}
                name="phoneNumber"
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
                        //
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
                          className="bg-primary-light border-input-border h-12 items-center rounded-lg border border-solid placeholder:text-[#525C4E]"
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
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
