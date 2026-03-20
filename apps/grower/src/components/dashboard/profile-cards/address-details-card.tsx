"use client";

import type { paths } from "@cf/api";
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
import { useQueryClient } from "@tanstack/react-query";
import { Check, Edit, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useApiClient } from "@/lib/api";
import type { AddressDetailsFormData } from "@/lib/schemas/farm-manager-details";
import { addressDetailsSchema } from "@/lib/schemas/farm-manager-details";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

interface ProfileCardProps {
  farmOwner: paths["/users/get-by-id"]["get"]["responses"]["200"]["content"]["application/json"];
}
export default function AddressDetailsCard({ farmOwner }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const api = useApiClient();
  const { userId } = useAuthUser();
  const queryClient = useQueryClient();
  const form = useForm<AddressDetailsFormData>({
    resolver: zodResolver(addressDetailsSchema()),
    defaultValues: {
      country: farmOwner.country || "Ghana",
      region: farmOwner.region || "-",
      village: farmOwner.village || "-",
    },
    mode: "onChange",
  });

  const { control, handleSubmit, reset } = form;
  const updateUser = api.useMutation("put", "/users/{UserId}");

  const handleSave = (data: AddressDetailsFormData) => {
    setIsLoading(true);
    updateUser.mutate(
      {
        params: { path: { UserId: userId || "" } },
        body: data,
      },
      {
        onSuccess: () => {
          showSuccessToast("Your profile was updated successfully!");
          setIsEditing(false);
          setIsLoading(false);
          void queryClient.invalidateQueries({
            queryKey: ["get", "/users/get-by-id"],
          });
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
    <Card className="w-full rounded-3xl border-none bg-white p-2">
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
                {isLoading ? "Saving.." : "Save"}
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
              {
                label: "Village",
                value: farmOwner.village,
              },
              {
                label: "Region",
                value: farmOwner.region,
              },
              {
                label: "Country",
                value: farmOwner.country,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-end justify-between md:block"
              >
                <span className="text-gray-dark text-md">{label}</span>
                <p className="text-md shrink-0 md:mt-2">{value || "N/A"}</p>
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
                className="border-input-border bg-userDropdown-background rounded-lg border border-solid "
              />
              <FormInput
                name="region"
                label="Region"
                placeholder="Enter region"
                className="border-input-border bg-userDropdown-background rounded-lg border border-solid "
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
                        placeholder="Select country.."
                        className="border-input-border bg-userDropdown-background  h-12 w-full rounded-lg border p-3 text-left text-sm"
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
