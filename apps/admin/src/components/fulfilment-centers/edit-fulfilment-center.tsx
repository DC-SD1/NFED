"use client";

import { cn } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import PrimaryButton from "@/components/buttons/primary-button";
import FulfilmentCenterDetailsStep from "@/components/fulfilment-centers/add-new/fulfilment-center-details-step";
import ManagementTeamStep from "@/components/fulfilment-centers/add-new/management-team-step";
import ReviewAndConfirmCenterTab from "@/components/fulfilment-centers/add-new/review-and-confirm-center-step";
import AppDialog from "@/components/modals/app-dialog";
import AppDialogContent from "@/components/modals/app-dialog-content";
import { useApiClient } from "@/lib/api";
import type { CenterDetailData } from "@/lib/schemas/fulfilment-center-schema";
import {
  CenterDetailSchema,
  type ManagementTeamData,
  ManagementTeamSchema,
} from "@/lib/schemas/fulfilment-center-schema";
import useFulfilmentCenterStore from "@/lib/stores/fulfilment-center-store/fufilment-center-store";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { FulfilmentCenter } from "@/types/fulfilment-centers.types";
import { base64ArrayToFiles } from "@/utils/helpers/file-helper";

const EditFulfilmentCenter = () => {
  const t = useTranslations("fulfillmentCenters.addNewCenter");
  const tt = useTranslations("common.errors");
  const { isOpen, type, onClose, data } = useModal();
  const [step, setStep] = useState<number>(1);
  const { setFormData, cacheFormData } = useFulfilmentCenterStore();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const isModalOpen = isOpen && type === "EditFulfilmentCenter";
  const { center, isDetailRoute } = data;
  const fulfilmentCenter = center as FulfilmentCenter;
  const regionalManager = fulfilmentCenter?.managers?.find(
    (manager) => manager.role === "RegionalOperationsManager",
  );
  const operationsDirector = fulfilmentCenter?.managers?.find(
    (manager) => manager.role === "OperationsDirector",
  );
  const warehouseManager = fulfilmentCenter?.managers?.find(
    (manager) => manager.role === "WarehouseManager",
  );
  const fieldAgronomist = fulfilmentCenter?.managers?.find(
    (manager) => manager.role === "FieldAgronomist",
  );
  const fieldCoordinator = fulfilmentCenter?.managers?.find(
    (manager) => manager.role === "FieldCoordinator",
  );
  const formOne = useForm<CenterDetailData>({
    resolver: zodResolver(CenterDetailSchema),
    defaultValues: {
      name: "",
      country: "",
      locationAddress: "",
      googleMapLink: "",
      region: "",
      focusCrops: [],
      assignedDistricts: [],
    },
  });

  const formTwo = useForm<ManagementTeamData>({
    resolver: zodResolver(ManagementTeamSchema),
    defaultValues: {
      regionalManagerId: "",
    },
  });

  useEffect(() => {
    if (fulfilmentCenter) {
      setFormData({
        ...fulfilmentCenter,
        coordinate: {
          longitude: fulfilmentCenter?.coordinate?.coordinates?.[0] ?? 0,
          latitude: fulfilmentCenter?.coordinate?.coordinates?.[1] ?? 0,
        },
        photos: [],
        regionalManagerId: regionalManager?.userId ?? "",
        operationsDirectorId: operationsDirector?.userId ?? "",
        warehouseManagerId: warehouseManager?.userId ?? "",
        fieldAgronomistId: fieldAgronomist?.userId ?? "",
        fieldCoordinatorId: fieldCoordinator?.userId ?? "",
        selectedRom: {
          value: regionalManager?.userId ?? "",
          label: regionalManager?.fullName ?? "",
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fulfilmentCenter]);

  if (!isModalOpen) return null;

  const steps: Record<number, { content: React.ReactNode; title: string }> = {
    1: {
      content: <FulfilmentCenterDetailsStep className={"p-0"} form={formOne} />,
      title: "Step 1",
    },
    2: {
      content: <ManagementTeamStep className={"p-0"} form={formTwo} />,
      title: "Step 2",
    },
    3: {
      content: (
        <ReviewAndConfirmCenterTab
          className={"p-0"}
          onDetailEdit={() => setStep(1)}
          onManagerEdit={() => setStep(2)}
        />
      ),
      title: "Step 3",
    },
  };

  const handleSubmitStepOne = (data: CenterDetailData) => {
    setFormData(data);
    setStep(step + 1);
  };

  const handleSubmitStepTwo = (data: ManagementTeamData) => {
    setFormData(data);
    setStep(step + 1);
  };

  const { mutate, isPending } = api.useMutation(
    "patch",
    "/fulfillment-centers/{FulfillmentCenterId}",
    {
      onSuccess: async () => {
        await Promise.all([
          isDetailRoute
            ? null
            : queryClient.invalidateQueries({
                queryKey: ["get", "/fulfillment-centers"],
              }),

          isDetailRoute
            ? queryClient.invalidateQueries({
                queryKey: [
                  "get",
                  "/fulfillment-centers/{FulfillmentCenterId}",
                  {
                    path: { FulfillmentCenterId: fulfilmentCenter?.id ?? "" },
                  },
                ],
              })
            : null,
        ]);

        showSuccessToast(t("updateSuccessMessage"));
        onClose();
      },
      onError: (error: any) => {
        const errorMessage = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessage ?? tt("unknown_error"));
      },
    },
  );

  const handleSubmit = async () => {
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { selectedRom, ...payload } = cacheFormData;

    const photos = await base64ArrayToFiles(
      payload.photos.map((photo: any) => photo.url),
    );
    mutate({
      params: {
        path: { FulfillmentCenterId: fulfilmentCenter?.id ?? "" },
      },
      body: {
        ...payload,
        photos: photos,
      },
      bodySerializer(body) {
        const fd = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item: any, index: number) => {
              if (key === "photos") {
                fd.append(`photos[${index}]`, item); // use the index dynamically
              } else {
                fd.append(key, item);
              }
            });
          } else if (key === "coordinate") {
            fd.append(key, JSON.stringify(value));
          } else {
            if (value !== undefined && value !== null) {
              fd.append(key, String(value));
            }
          }
        });

        return fd;
      },
    });
  };

  const handleNext = () => {
    if (step >= 3) {
      void handleSubmit();
      return;
    }
    if (step === 1) {
      void formOne.handleSubmit(handleSubmitStepOne)();
      return;
    }
    if (step === 2) {
      void formTwo.handleSubmit(handleSubmitStepTwo)();
    }
  };

  const handleBack = () => {
    if (step <= 1) return;
    setStep(step - 1);
  };

  return (
    <AppDialog
      key={"edit-fulfilment-center-dialog"}
      isOpen={isOpen}
      size={"large"}
      title={t("updateTitle")}
      closeOnBackground={false}
      onOpenChange={(_) => {
        onClose();
      }}
      progressValue={step === 1 ? 30 : step === 2 ? 60 : 100}
      contentClassName={"pb-6 pt-2"}
      content={
        <>
          <AppDialogContent className={"flex flex-col gap-10 pb-4"}>
            {steps[step]?.content ?? <></>}
          </AppDialogContent>
        </>
      }
      footer={
        <div
          className={cn(
            "flex gap-2 px-4",
            step === 1 ? "justify-end" : "justify-between",
          )}
        >
          {step > 1 && (
            <PrimaryButton
              disabled={isPending}
              onClick={handleBack}
              size={"sm"}
              variant={"secondary"}
              className={"px-4 font-bold"}
              buttonContent={
                <>
                  <IconArrowLeft className={"size-6"} />
                  {t("back")}
                </>
              }
            />
          )}
          <PrimaryButton
            onClick={handleNext}
            isLoading={isPending}
            size={"sm"}
            className={"px-4 font-bold"}
            buttonContent={
              <>
                {step <= 2 ? t("next") : t("update")}
                {step <= 2 && <IconArrowRight className={"size-6"} />}
              </>
            }
          />
        </div>
      }
    />
  );
};

export default EditFulfilmentCenter;
