"use client";

import { Button, Card, CardContent, CardHeader } from "@cf/ui";
import { CountrySelect } from "@cf/ui/components/country-select"; // Import the new component
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui/components/form";
import { Spinner } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Edit, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useApiClient } from "@/lib/api";
import type { AddressDetailsFormData } from "@/lib/schemas/farm-manager-details";
import { addressDetailsSchema } from "@/lib/schemas/farm-manager-details";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

interface AddressDetailsProps {
  village?: string;
  region?: string;
  country?: string;
  userId: string;
  onSave?: (data: AddressDetailsData) => void;
}

interface AddressDetailsData {
  village?: string | null;
  region?: string | null;
  country?: string | null;
}

export default function AddressDetailsCard({
  village = "",
  region = "",
  country = "",
  userId,
  onSave,
}: AddressDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const api = useApiClient();

  const form = useForm<AddressDetailsFormData>({
    resolver: zodResolver(addressDetailsSchema()),
    defaultValues: {
      village,
      region,
      country,
    },
    mode: "onChange",
  });

  const { control, handleSubmit, reset } = form;
  const updateUser = api.useMutation("put", "/users/{UserId}");

  const handleSave = (data: AddressDetailsFormData) => {
    setIsLoading(true);
    updateUser.mutate(
      {
        params: { path: { UserId: userId } },
        body: data,
      },
      {
        onSuccess: () => {
          showSuccessToast("Your profile was updated successfully!");
          setIsEditing(false);
          setIsLoading(false);
          onSave?.(data);
        },
        onError: () => {
          showErrorToast("Failed to update your profile. Please try again.");
          setIsLoading(false);
        },
      },
    );
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <Card className="w-full rounded-3xl border-none bg-white">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-md font-semibold leading-none">
            Address details
          </h2>
          {isEditing ? (
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
          <div className="space-y-4 p-1 md:grid md:grid-cols-3 md:gap-28 md:space-y-0">
            {[
              { label: "Village", value: village },
              { label: "Region", value: region },
              { label: "Country", value: country },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-end justify-between md:block"
              >
                <span className="text-gray-dark text-md">{label}</span>
                <p className="text-lg font-normal md:mt-2">{value || "N/A"}</p>
              </div>
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleSave)}
              className="w-full space-y-6"
            >
              <FormInput
                name="village"
                label="Village"
                placeholder="Enter village"
                className="border-input-border rounded-lg border border-solid"
              />
              <FormInput
                name="region"
                label="Region"
                placeholder="Enter region"
                className="border-input-border rounded-lg border border-solid"
              />

              <FormField
                control={control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <CountrySelect
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        placeholder="Select country..."
                        className="border-input-border bg-primary-light h-12 w-full rounded-lg border p-3 text-left text-sm"
                        showFlag={true}
                        showCallingCode={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
