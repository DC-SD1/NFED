import { Button } from "@cf/ui";
import { useTranslations } from "next-intl";
import React from "react";

import ActionDialog from "@/components/dialogs/action-dialog";

export default function GenerateContractDialog() {
  const t = useTranslations();

  // TODO: Generate contract.
  const isPending = false;

  return (
    <ActionDialog
      config={{
        header: {
          title: t("sourcing.offerReview.generateContract.title"),
          description: t("sourcing.offerReview.generateContract.description"),
        },
        form: {
          cancelLabel: t("sourcing.offerReview.generateContract.cancel"),
          confirmLabel: t("sourcing.offerReview.generateContract.continue"),
        },
        styles: { contentClassName: "sm=max-w-[440px]" },
      }}
      trigger={
        <Button size="lg" className="h-[56px] w-[220px] rounded-xl font-bold">
          {t("sourcing.offerReview.footer.accept")}
        </Button>
      }
      isPending={isPending}
      onConfirm={() => {
        // TODO: Generate contract.
        // TODO: Go to contract signing page.
      }}
    />
  );
}
