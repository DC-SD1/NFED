"use client";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cf/ui";
import { useTranslations } from "next-intl";
import React from "react";

import { useApiClient } from "@/lib/api/client";
import { useSourcingStore } from "@/lib/stores/sourcing-store";
import { showErrorToast } from "@/lib/utils/toast";

interface SubmitForProcessingDialogProps {
  onSuccess: () => void;
}

export function SubmitForProcessingDialog({
  onSuccess,
}: SubmitForProcessingDialogProps) {
  const { canContinueCurrentStep, cropSpecification } = useSourcingStore();
  const t = useTranslations();

  const api = useApiClient();

  const { isPending } = api.useMutation(
    "post",
    "/order/create",
    {
      onSuccess,
      onError: (error: any) => {
        const errorMessages = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessages ?? "");
      },
    },
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="h-[56px] w-[220px] rounded-xl font-bold"
          disabled={!canContinueCurrentStep()}
        >
          {t("sourcing.sourcingReview.page.submitForProcessingButton")}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[480px]"
        closeClassName="p-2 !rounded-full bg-[#F5F5F5]"
      >
        <DialogHeader className="mb-6">
          <DialogTitle className="!not-sr-only text-center text-xl">
            {t("sourcing.sourcingReview.submitForProcessing.title")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("sourcing.sourcingReview.submitForProcessing.description")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row justify-between gap-x-6">
          <DialogClose asChild>
            <Button
              disabled={isPending}
              aria-disabled={isPending}
              size="lg"
              variant="outline"
              className="h-[56px] w-1/2 rounded-xl bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] focus:bg-[#F5F5F5] focus:text-[hsl(var(--text-dark))]"
            >
              {t("sourcing.sourcingReview.submitForProcessing.no")}
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              loading={isPending}
              disabled={isPending}
              aria-disabled={isPending}
              size="lg"
              className="h-[56px] w-1/2 rounded-xl font-bold"
              onClick={() => {
                if (!cropSpecification) {
                  showErrorToast("Crop specification is required");
                  return;
                }

                // TODO: Create order.

                onSuccess();
              }}
            >
              {!isPending && (
                <span>
                  {t("sourcing.sourcingReview.submitForProcessing.yes")}
                </span>
              )}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
