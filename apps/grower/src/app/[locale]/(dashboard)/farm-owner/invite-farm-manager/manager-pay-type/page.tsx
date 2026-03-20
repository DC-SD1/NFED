"use client";

import { logger } from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import { ManagerWorkPayForm } from "@/components/forms/manager-pay-type-form";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useInviteUserStore } from "@/lib/stores/invite-user";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { showErrorToast } from "@/lib/utils/toast";

export default function FarmManagerPayTypePage() {
  const t = useTranslations("dashboard.inviteManager");
  const router = useRouter();
  const e = useTranslations("auth.errors");
  const [loadingType, setLoadingType] = useState<"draft" | "submit" | null>(
    null,
  );

  const api = useApiClient();
  const { handleError, handleApiError } = useLocalizedErrorHandler();
  const { userId: authUserId } = useAuthUser();

  const {
    inviteData,
    workType,
    workPayType,
    draftContract,
    resetInviteData,
    resetDraftContract,
    resetFarmContract,
    setWorkType,
    setWorkPayType,
  } = useInviteUserStore();

  const handleInvite = async (
    formData?: { workPayType: string },
    isDraft = false,
  ) => {
    if (loadingType) return;

    setLoadingType(isDraft ? "draft" : "submit");
    try {
      if (!inviteData?.firstName || !inviteData.emailAddress) {
        handleError("complete invite", e("completeInvite"));
        return;
      }

      const currentWorkPayType = formData?.workPayType || workPayType;

      if (!workType || !currentWorkPayType) {
        handleError("complete contract", e("completeContract"));
        return;
      }
      let userId: string;
      if (isDraft) {
        const { error: draftError, data: draftRes } = await api.client.POST(
          "/users/invite/draft",
          {
            userId: authUserId,
            body: inviteData,
          },
        );

        const draftUserId = draftRes?.userId;
        if (!draftUserId || draftError) {
          showErrorToast(draftError?.errors?.[0]?.message || "Draft failed");
          return;
        }
        userId = draftUserId;
      } else {
        const { error: inviteError, data: inviteRes } = await api.client.POST(
          "/users/invite",
          {
            userId: authUserId,
            body: inviteData,
          },
        );
        const inviteUserId = inviteRes?.userId;
        if (!inviteUserId || inviteError) {
          showErrorToast(
            inviteError?.errors?.[0]?.message ||
              "Failed to invite farm manager",
          );

          return;
        }
        userId = inviteUserId;
      }

      const contractBase = {
        farmManagerId: userId,
        contractType: workType,
        paymentType: currentWorkPayType,
        startDate: draftContract.startDate || "",
        endDate: draftContract.endDate || null,
        comments: draftContract.comments || null,
        contractStatus: isDraft ? "Draft" : "Unassigned",
      };
      const { error: postError } = await api.client.POST("/contracts/no-farm", {
        userId: authUserId,
        body: contractBase,
      });

      if (postError && userId) {
        await api.client.DELETE("/users/delete-user/{UserId}", {
          params: {
            path: {
              UserId: userId,
            },
          },
        });

        if (!isDraft) {
          handleError("contract fail", e("createContractFail"));
          return;
        }
        if (isDraft) {
          handleError("draft failed", e("draftFail"));
          return;
        }
      }
      if (isDraft) {
        resetInviteData();
        resetDraftContract();
        resetFarmContract();
        setWorkType(null);
        setWorkPayType(null);

        router.push("/farm-owner/invite-farm-manager/draft-complete");
        return;
      }
      resetInviteData();
      resetDraftContract();
      resetFarmContract();
      setWorkType(null);
      setWorkPayType(null);
      router.push("/farm-owner/invite-farm-manager/invite-complete");
    } catch (err) {
      logger.error("Failed to submit contract:", { error: err });
      handleApiError(err);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <TopLeftHeaderLayout>
      <div className="px-4 py-6 md:items-center md:justify-center md:px-6 md:pt-0 lg:px-8">
        <div className="mx-auto w-full max-w-lg md:max-w-4xl lg:max-w-2xl">
          <h1 className="mb-4 text-start text-3xl font-bold tracking-tight lg:text-center ">
            {t("title")}
          </h1>

          <ManagerWorkPayForm
            onSubmit={async (data, isDraft) => {
              await handleInvite(data, isDraft);
            }}
            loadingType={loadingType} // Pass the loading state
          />
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
