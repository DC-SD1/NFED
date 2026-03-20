"use client";

import { Button, Card, CardContent, CardHeader } from "@cf/ui";
import { Form, FormInput } from "@cf/ui/components/form";
import { Spinner } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Edit, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useApiClient } from "@/lib/api";
import { logger } from "@/lib/logger";
import { FARM_LAND_DETAILS_QUERY_KEY_ROOT } from "@/lib/queries/farm-land-query";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

interface LocationDetailsProps {
  village?: string;
  region?: string;
  userId: string;
  farmName: string;
  onSave?: (data: AddressDetailsData) => void;
}

interface AddressDetailsData {
  village?: string;
  region?: string;
}

const residentialAddressSchema = z.object({
  village: z.string().optional(),
  region: z.string().optional(),
});

type ResidentialAddressFormData = z.infer<typeof residentialAddressSchema>;

export default function ResidentialAddressReviewCard({
  village = "",
  region = "",
  farmName,
}: LocationDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const api = useApiClient();
  const farmId = params.id as string;
  const queryClient = useQueryClient();

  const updateLocationDetails = api.useMutation(
    "put",
    "/farm-management/farm-details",
  );

  const form = useForm<ResidentialAddressFormData>({
    resolver: zodResolver(residentialAddressSchema),
    defaultValues: {
      village,
      region,
    },
    mode: "onChange",
  });

  const { handleSubmit, reset } = form;
  const handleSave = (data: ResidentialAddressFormData) => {
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
          showSuccessToast("Residential address updated successfully!");
        },
        onError: (error) => {
          logger.error("Residential address update failed", {
            error,
            context: "residential-address-update",
          });
          setIsLoading(false);
          showErrorToast(
            "Failed to update residential address. Please try again.",
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
    <Card className="w-[630px] rounded-[24px] border-none bg-white p-6">
      <CardHeader className="p-0 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Residential Address
          </h2>
          {isEditing ? (
            <div className="flex items-center gap-6">
              <Button
                variant="unstyled"
                size="sm"
                onClick={handleSubmit(handleSave)}
                disabled={isLoading}
                className="flex items-center gap-2 p-0 text-base font-medium text-[#22C55E] hover:text-[#22C55E]/80"
              >
                {isLoading ? (
                  <Spinner className="size-5" />
                ) : (
                  <Check className="size-5" />
                )}
                Save
              </Button>
              <Button
                variant="unstyled"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 p-0 text-base font-medium text-[#22C55E] hover:text-[#22C55E]/80"
              >
                <X className="size-5" />
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="unstyled"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 p-0 text-base font-medium text-[#22C55E] hover:text-[#22C55E]/80"
            >
              <Edit className="size-5" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!isEditing ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-thin text-gray-600">Ghana post gps</p>
              <p className="text-base leading-relaxed text-gray-900">
                {village || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-thin text-gray-600">
                Residential Address
              </p>
              <p className="text-base leading-relaxed text-gray-900">
                {region || "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleSave)}
              className="w-full space-y-6"
            >
              <FormInput
                name="village"
                label="Ghana post gps"
                placeholder="Enter Ghana post"
                className="h-14 rounded-xl border border-gray-300 bg-white"
              />
              <FormInput
                name="residentialAddress"
                label="Residential Address"
                placeholder="Enter region"
                className="h-14 rounded-xl border border-gray-300 bg-white"
              />
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
