"use client";

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
import { useTranslations } from "next-intl";
import type { Control } from "react-hook-form";
import type { UseFormHandleSubmit } from "react-hook-form";
import type { Country } from "react-phone-number-input";
import { parsePhoneNumber } from "react-phone-number-input";

import type { PersonalDetailsFormData } from "@/lib/schemas/farm-manager-details";

interface PersonalDetailsFormProps {
  form: any; // UseFormReturn type
  control: Control<PersonalDetailsFormData>;
  handleSubmit: UseFormHandleSubmit<PersonalDetailsFormData>;
  onSubmit: (data: PersonalDetailsFormData) => void;
  currentCountry: Country;
  onCountryChange: (country: Country) => void;
}

export function PersonalDetailsForm({
  form,
  control,
  handleSubmit,
  onSubmit,
  currentCountry,
  onCountryChange,
}: PersonalDetailsFormProps) {
  const t = useTranslations("dashboard.inviteManager");

  return (
    <Form {...form}>
      <form className="w-full space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                    onCountryChange(phoneNumber.country);
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
  );
}
