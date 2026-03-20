import { useRouter } from "@bprogress/next/app";
import { Button } from "@cf/ui";
import { useTranslations } from "next-intl";
import React from "react";

import ReasonDialog from "@/components/dialogs/reason-dialog";
import { useSourcingStore } from "@/lib/stores/sourcing-store";

export default function RenegotiateOfferDialog() {
  const t = useTranslations();
  const router = useRouter();
  const { goToStep, resetStep } = useSourcingStore();

  const isPending = false; // Is sending reason for renegotiation.

  return (
    <ReasonDialog
      config={{
        header: {
          title: t("sourcing.offerReview.renegotiateOffer.title"),
          description: t("sourcing.offerReview.renegotiateOffer.description"),
        },
        form: {
          label: t(
            "sourcing.offerReview.renegotiateOffer.form.renegotiateTerms",
          ),
          placeholder: t(
            "sourcing.offerReview.renegotiateOffer.form.renegotiateTermsPlaceholder",
          ),
          minLength: 3,
        },
        actions: {
          cancel: t("sourcing.offerReview.declineOffer.form.cancel"),
          confirm: t("sourcing.offerReview.declineOffer.form.confirm"),
        },
        styles: { contentClassName: "sm:max-w-[440px]" },
      }}
      trigger={
        <Button
          size="lg"
          className="h-[56px] w-[220px] rounded-xl bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] focus:bg-[#F5F5F5] focus:text-[hsl(var(--text-dark))]"
        >
          {t("sourcing.offerReview.footer.renegotiate")}
        </Button>
      }
      isPending={isPending}
      onSubmit={() => {
        // TODO: Send negotiation terms.
        resetStep("offer-review");
        goToStep("document-processing", router);
      }}
    />
  );
}
