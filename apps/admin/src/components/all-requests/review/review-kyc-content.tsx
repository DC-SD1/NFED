"use client";

import { Button, cn, Progress } from "@cf/ui";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";
import React, { useEffect } from "react";

import AuthorizedRepresentativeStep from "@/components/all-requests/review/authorized-representative-step";
import CertificateView from "@/components/all-requests/review/certificate-view";
import CorporateIdentityStep from "@/components/all-requests/review/corporate-identity-step";
import FinancialStandingStep from "@/components/all-requests/review/financial-standing-step";
import ResidenceAndDocuments from "@/components/all-requests/review/residence-and-documents";
import ReviewAndConfirm from "@/components/all-requests/review/review-and-confirm";
import ReviewAndConfirmBuyer from "@/components/all-requests/review/review-and-confirm-buyer";
import ReviewRightContent from "@/components/all-requests/review/review-right-content";
import ReviewStepper from "@/components/all-requests/review/review-stepper";
import PrimaryButton from "@/components/buttons/primary-button";
import AppReviewLayout from "@/components/layout/review/app-review-layout";
import KycReviewLoader from "@/components/skeleton/kyc-review-loader";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import useRequestStore from "@/lib/stores/requests-store/requests-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { KycResponse } from "@/types/all-request.types";
import {
  areAllDocumentsAndDetailsAccepted,
  getStepPercentage,
  showNextStepButton,
} from "@/utils/helpers/kyc-helpers";

export default function ReviewKycContent() {
  const t = useTranslations("allRequests.reviewKyc");
  const tt = useTranslations("common.errors");
  const router = useRouter();
  const { requestData, setKycResponse, kycResponse } = useRequestStore();
  const api = useApiClient();
  const auth = useAuthUser();

  const [step, setStep] = useQueryState(
    "step",
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: false }),
  );
  const { id: requestId } = useParams<{ id: string }>();

  const { data: response, isPending } = api.useQuery(
    "get",
    "/kyc/get-kyc",
    {
      params: {
        query: {
          KycId: requestId,
        },
      },
    },
    {
      throwOnError: true,
    },
  );

  useEffect(() => {
    if (response?.isSuccess) {
      setKycResponse(response);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, response?.isSuccess]);

  const handleNext = () => {
    if (step >= (kycData.value?.kycType === "Buyer" ? 4 : 3)) return;
    void setStep(step + 1);
  };

  const handleBack = () => {
    if (step <= 1) {
      router.back();
      return;
    }
    void setStep(step - 1);
  };

  const steps: Record<number, { content: React.ReactNode; title: string }> = {
    1: {
      content: <ResidenceAndDocuments />,
      title: t("tabs.typeOfResidenceAndDocuments"),
    },
    2: {
      content: <CertificateView />,
      title: t("tabs.certificates"),
    },
    3: {
      content: (
        <ReviewAndConfirm
          onCertificateUpdate={() => void setStep(2)}
          onResidentUpdate={() => void setStep(1)}
        />
      ),
      title: t("tabs.reviewAndConfirm"),
    },
  };

  const buyerSteps: Record<
    number,
    { content: React.ReactNode; title: string }
  > = {
    1: {
      content: <CorporateIdentityStep />,
      title: t("tabs.corporateIdentity"),
    },
    2: {
      content: <AuthorizedRepresentativeStep />,
      title: t("tabs.authorizedRepresentative"),
    },
    3: {
      content: <FinancialStandingStep />,
      title: t("tabs.financialStandingAndLiquidity"),
    },
    4: {
      content: (
        <ReviewAndConfirmBuyer
          onCorporateUpdate={() => void setStep(1)}
          onAuthUpdate={() => void setStep(2)}
          onFinance={() => void setStep(3)}
        />
      ),
      title: t("tabs.reviewAndConfirm"),
    },
  };

  const kycData = kycResponse as KycResponse;
  const isKycPending = kycData.value?.kycStatus === "Submitted";
  const isAllAccepted = areAllDocumentsAndDetailsAccepted(
    kycData,
    kycData.value?.kycType ?? "",
  );

  const { mutate, isPending: isUpdating } = api.useMutation(
    "put",
    "/kyc/update-status",
    {
      onSuccess: async (_, variables) => {
        showSuccessToast(
          `${variables.body.status === "Accepted" ? "Review is approved" : "Review is declined"}`,
        );
        if (variables.body.status === "Accepted") {
          router.replace("/all-requests/completed");
        } else {
          router.replace("/all-requests/rejected");
        }
      },
      onError: (error: any) => {
        const errorMessage = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessage ?? tt("unknown_error"));
      },
    },
  );

  const handleApprove = (status: string) => {
    mutate({
      body: {
        userId: requestData?.userId,
        status,
        adminId: auth?.userId ?? undefined,
        reviewComments: status === "Rejected" ? "Rejected by admin" : status,
      },
    });
  };

  if (isPending) return <KycReviewLoader />;

  return (
    <AppReviewLayout>
      <AppReviewLayout.Header title={`Review ${requestData?.type ?? ""} KYC`} />

      <AppReviewLayout.Main
        className={"flex"}
        mainClassName={"w-full lg:w-[62%] h-[76vh] lg:h-[82vh] overflow-auto"}
        leftContent={
          <ReviewStepper
            step={step}
            steps={kycData.value?.kycType === "Buyer" ? buyerSteps : steps}
          />
        }
        rightContent={<ReviewRightContent />}
      >
        {kycData.value?.kycType === "Buyer"
          ? buyerSteps[step]?.content
          : steps[step]?.content ?? <></>}
      </AppReviewLayout.Main>

      <AppReviewLayout.Footer className={"flex-col"}>
        {isKycPending && (
          <Progress
            className={"h-2 rounded-none"}
            value={getStepPercentage(step, kycData.value?.kycType ?? "")}
          />
        )}
        <div
          className={cn(
            "flex items-center justify-between gap-4 px-10 pb-[28px] pt-5 lg:px-16",
            !isKycPending && "border-t",
          )}
        >
          <Button
            onClick={handleBack}
            size={"sm"}
            variant={"secondary"}
            className={"text-success-secondary px-8 text-base font-bold"}
          >
            <IconArrowLeft className={"size-6"} />
            {t("back")}
          </Button>
          {showNextStepButton(step, kycData.value?.kycType ?? "") ? (
            <Button
              onClick={handleNext}
              variant={isKycPending ? "default" : "secondary"}
              size={"sm"}
              className={cn(
                "px-4 text-base font-bold",
                !isKycPending && "text-success-secondary",
              )}
            >
              {t("next")}
              <IconArrowRight className={"size-6"} />
            </Button>
          ) : (
            <div className={"flex items-center gap-6"}>
              {isKycPending && (
                <>
                  <PrimaryButton
                    isLoading={isUpdating}
                    onClick={() => handleApprove("Rejected")}
                    size={"sm"}
                    variant={"destructive"}
                    className={
                      "bg-[#FFDAD6] px-4 text-base font-bold text-[#8F0004] hover:bg-[#FFDAD6] hover:text-[#8F0004]"
                    }
                    disabled={isAllAccepted}
                    buttonContent={t("declineRequest")}
                  />
                  <PrimaryButton
                    isLoading={isUpdating}
                    onClick={() => handleApprove("Accepted")}
                    size={"sm"}
                    className={"px-4 text-base font-bold"}
                    disabled={!isAllAccepted}
                    buttonContent={t("submitRequest")}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </AppReviewLayout.Footer>
    </AppReviewLayout>
  );
}
