"use client";

import { Button, cn, Progress } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";
import React from "react";
import { useForm } from "react-hook-form";

import PrimaryButton from "@/components/buttons/primary-button";
import FulfilmentCenterDetailsStep from "@/components/fulfilment-centers/add-new/fulfilment-center-details-step";
import ManagementTeamStep from "@/components/fulfilment-centers/add-new/management-team-step";
import ReviewAndConfirmCenterTab from "@/components/fulfilment-centers/add-new/review-and-confirm-center-step";
import AppReviewLayout from "@/components/layout/review/app-review-layout";
import { useApiClient } from "@/lib/api";
import type {
  CenterDetailData,
  ManagementTeamData,
} from "@/lib/schemas/fulfilment-center-schema";
import {
  CenterDetailSchema,
  ManagementTeamSchema,
} from "@/lib/schemas/fulfilment-center-schema";
import useFulfilmentCenterStore from "@/lib/stores/fulfilment-center-store/fufilment-center-store";
import { showSuccessToast } from "@/lib/utils/toast";

export default function AddCenterContent() {
  const t = useTranslations("fulfillmentCenters.addNewCenter");

  const router = useRouter();
  const { setFormData, reset, cacheFormData } = useFulfilmentCenterStore();
  const [step, setStep] = useQueryState(
    "step",
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: false }),
  );
  const api = useApiClient();

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

  const steps: Record<number, { content: React.ReactNode; title: string }> = {
    1: {
      content: <FulfilmentCenterDetailsStep form={formOne} />,
      title: "Step 1",
    },
    2: {
      content: <ManagementTeamStep form={formTwo} />,
      title: "Step 2",
    },
    3: {
      content: (
        <ReviewAndConfirmCenterTab
          onDetailEdit={() => void setStep(1)}
          onManagerEdit={() => void setStep(2)}
        />
      ),
      title: "Step 3",
    },
  };

  const handleSubmitStepOne = (data: CenterDetailData) => {
    setFormData(data);
    void setStep(step + 1);
  };

  const handleSubmitStepTwo = (data: ManagementTeamData) => {
    setFormData(data);
    void setStep(step + 1);
  };

  const { isPending } = api.useMutation("post", "/fulfillment-centers", {
    onSuccess: async () => {
      // ... kept for structure, but not used now
    },
  });

  const addCustomFulfilmentCenter =
    useFulfilmentCenterStore.use.addCustomFulfilmentCenter();

  const handleSubmit = async () => {
    const {
      selectedRom,
      selectedOd: _selectedOd,
      selectedWm: _selectedWm,
      selectedFa: _selectedFa,
      selectedFc: _selectedFc,
      ...payload
    } = cacheFormData;

    // Construct the manager list from selected IDs and Labels
    const managers = [];
    if (selectedRom)
      managers.push({
        fullName: selectedRom.label,
        role: "RegionalOperationsManager",
      });
    if (cacheFormData.selectedOd)
      managers.push({
        fullName: cacheFormData.selectedOd.label,
        role: "OperationsDirector",
      });
    if (cacheFormData.selectedWm)
      managers.push({
        fullName: cacheFormData.selectedWm.label,
        role: "WarehouseManager",
      });
    if (cacheFormData.selectedFa)
      managers.push({
        fullName: cacheFormData.selectedFa.label,
        role: "FieldAgronomist",
      });
    if (cacheFormData.selectedFc)
      managers.push({
        fullName: cacheFormData.selectedFc.label,
        role: "FieldCoordinator",
      });

    // Create the new center object (SimpleFulfilmentCenter compatible)
    const newCenter = {
      id: Math.random().toString(36).substr(2, 9),
      name: payload.name,
      country:
        payload.country === "GH"
          ? "Ghana"
          : payload.country === "TG"
            ? "Togo"
            : payload.country, // Simple mapping
      locationAddress: payload.locationAddress,
      phoneNumber: payload.phoneNumber,
      managers: managers,
      status: "active",
      region: payload.region,
      focusCrops: payload.focusCrops,
      assignedDistricts: payload.assignedDistricts,
      googleMapLink: payload.googleMapLink,
      photos: payload.photos.map((p: any) => p.url as string).filter(Boolean),
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    addCustomFulfilmentCenter(newCenter);
    showSuccessToast(t("successMessage"));
    reset(); // Clear form
    router.push("/fulfilment-centers");
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
    if (step <= 1) {
      router.back();
      return;
    }
    void setStep(step - 1);
  };

  return (
    <AppReviewLayout>
      <AppReviewLayout.Header title={t("pageTitle")} onBackClick={reset} />

      <AppReviewLayout.Main
        className={"flex"}
        mainClassName={
          "w-full h-[76vh] lg:h-[82vh] overflow-auto container sm:px-80"
        }
      >
        {steps[step]?.content ?? <></>}
      </AppReviewLayout.Main>

      <AppReviewLayout.Footer className={"flex-col"}>
        <Progress
          className={"h-2 rounded-none"}
          value={step === 1 ? 25 : step === 2 ? 50 : 100}
        />
        <div
          className={cn(
            "flex items-center justify-between gap-4 pb-[28px] pt-5 lg:px-16",
            step === 1 ? "justify-end" : "justify-between",
          )}
        >
          {step !== 1 && (
            <Button
              onClick={handleBack}
              disabled={isPending}
              size={"sm"}
              variant={"secondary"}
              className={"px-8 text-base font-bold text-[#1A5514]"}
            >
              <IconArrowLeft className={"size-6"} />
              {t("back")}
            </Button>
          )}
          <PrimaryButton
            onClick={handleNext}
            isLoading={isPending}
            size={"sm"}
            className={"px-4 text-base font-bold"}
            buttonContent={
              <>
                {step < 3 ? t("next") : t("createCenter")}
                {step < 3 && <IconArrowRight className={"size-6"} />}
              </>
            }
          />
        </div>
      </AppReviewLayout.Footer>
    </AppReviewLayout>
  );
}
