"use client";

import { Button, Card, CardContent, CardHeader } from "@cf/ui";
import { Form, FormInput } from "@cf/ui/components/form";
import { Spinner } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Edit, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useApiClient } from "@/lib/api";
import { FARM_LAND_DETAILS_QUERY_KEY_ROOT } from "@/lib/queries/farm-land-query";
import type { AddressDetailsFormData } from "@/lib/schemas/farm-manager-details";
import { addressDetailsSchema } from "@/lib/schemas/farm-manager-details";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

interface LocationDetailsProps {
  village?: string;
  region?: string;
  userId: string;
  farmName: string;
  onSave?: (data: AddressDetailsData) => void;
}

interface AddressDetailsData {
  village?: string | null;
  region?: string | null;
}

export default function AddressDetailsCard({
  village = "",
  region = "",
  farmName,
}: LocationDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("FarmLands.farmDetails");
  const params = useParams();
  const api = useApiClient();
  const farmId = params.id as string;
  const queryClient = useQueryClient();

  const updateLocationDetails = api.useMutation(
    "put",
    "/farm-management/farm-details",
  );

  const form = useForm<AddressDetailsFormData>({
    resolver: zodResolver(addressDetailsSchema()),
    defaultValues: {
      village,
      region,
    },
    mode: "onChange",
  });

  const { handleSubmit, reset } = form;
  const handleSave = (data: AddressDetailsFormData) => {
    setIsLoading(true);
    updateLocationDetails.mutate(
      {
        body: {
          farmId: farmId,
          village: data.village ?? "",
          region: data.region ?? "",
          farmName: farmName,
        },
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: [FARM_LAND_DETAILS_QUERY_KEY_ROOT],
          });
          setIsLoading(false);
          setIsEditing(false);
          showSuccessToast("Location details updated successfully!");
        },
        onError: (error) => {
          console.error("Location update failed:", error);
          setIsLoading(false);
          showErrorToast(
            "Failed to update location details. Please try again.",
          );
        },
      },
    );
  };

  const handleCancel = () => {
    reset({
      village,
      region,
    });
    setIsEditing(false);
  };

  return (
    <Card className="w-full rounded-lg border-none bg-white p-0">
      <CardHeader className="pb-0 pt-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-md font-semibold leading-none">
            {t("locationTitle")}
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
              variant="unstyled"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-primary"
            >
              <Edit className="mr-1 size-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="grid grid-cols-3 gap-20 space-y-0">
            {[
              { label: t("villageTitle"), value: village },
              { label: t("regionTitle"), value: region },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-y-1">
                <p className="text-gray-dark text-sm font-thin">{label}</p>
                <p className="text-md font-normal leading-tight">
                  {value || "N/A"}
                </p>
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
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
