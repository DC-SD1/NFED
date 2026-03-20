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
import { farmDetailsSchema } from "@/lib/schemas/sign-up";
import { showErrorToast } from "@/lib/utils/toast";

interface FarmNameProps {
  name: string;
  village?: string;
  region?: string;
  onSave?: (data: FarmNameData) => void;
}

interface FarmNameData {
  farmName: string;
}

export default function FarmNameCard({ name, village, region }: FarmNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("FarmLands.farmDetails");
  const params = useParams();
  const api = useApiClient();
  const farmId = params.id as string;
  const queryClient = useQueryClient();

  const updateFarmName = api.useMutation(
    "put",
    "/farm-management/farm-details",
  );
  const form = useForm<FarmNameData>({
    resolver: zodResolver(farmDetailsSchema.pick({ farmName: true })),
    defaultValues: {
      farmName: name || "",
    },
    mode: "onChange",
  });

  const { handleSubmit, reset } = form;

  const handleSave = (data: FarmNameData) => {
    if (!data?.farmName) {
      showErrorToast("Please enter a farm name");
      return;
    }

    setIsLoading(true);
    updateFarmName.mutate(
      {
        body: {
          farmId: farmId,
          farmName: data.farmName,
          village: village,
          region: region,
        },
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: [FARM_LAND_DETAILS_QUERY_KEY_ROOT],
          });
          setIsLoading(false);
          setIsEditing(false);
        },
        onError: (error) => {
          console.error("Update failed:", error);
          setIsLoading(false);
          showErrorToast("Failed to update farm name. Please try again.");
        },
      },
    );
  };

  const handleCancel = () => {
    reset({
      farmName: name || "",
    });
    setIsEditing(false);
  };

  return (
    <Card className="w-full rounded-lg border-none bg-white p-0">
      <CardHeader className="pb-0 pt-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-gray-dark text-xs font-thin">{t("nameTitle")}</p>
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
      <CardContent className="pt-0">
        {!isEditing ? (
          <div>
            {[{ label: "Farm name", value: name }].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-end justify-between md:block"
              >
                <p className="text-md font-normal leading-tight">{value}</p>
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
                name="farmName"
                label="Name"
                placeholder="Enter farm name"
                className="border-input-border rounded-lg border border-solid"
              />
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
